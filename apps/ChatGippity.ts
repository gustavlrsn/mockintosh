import { SystemApp, WindowSize } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { AppContext } from "../lib/canvas/AppContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { OSEvent } from "../lib/canvas/EventManager";
import {
  TextInputState,
  createTextInputState,
  handleTextInputKey,
} from "../lib/canvas/ui/TextInput";
import { measureText, getLineHeight } from "../lib/canvas/fontAdapter";
import { MenubarDefinition } from "../lib/canvas/ui/drawMenubar";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const FONT = "Geneva9";
const TITLE_FONT = "ChiKareGo";
const LINE_HEIGHT = getLineHeight(FONT);
const INPUT_HEIGHT = 18;
const INPUT_PADDING = 4;
const BAR_HEIGHT = INPUT_HEIGHT + INPUT_PADDING * 2 + 1;

const API_URL = "/api/chat";

async function sendMessage(messages: ChatMessage[]): Promise<string> {
  try {
    const resp = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: messages[messages.length - 1].content,
        conversationHistory: messages.slice(0, -1),
      }),
    });
    if (!resp.ok) return "Sorry, I couldn't reach the server.";
    const data = await resp.json();
    return data.message ?? data.error ?? "No response.";
  } catch {
    return "Network error. Please try again.";
  }
}

function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (measureText(test, FONT) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  if (lines.length === 0) lines.push("");
  return lines;
}

function doSend(
  messages: ChatMessage[],
  inputState: TextInputState,
  setMessages: (
    v: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])
  ) => void,
  setLoading: (v: boolean) => void,
  setScrollOffset: (v: number | ((prev: number) => number)) => void,
  chatAreaHeight: number,
  totalContentHeight: number
) {
  const text = inputState.value.trim();
  if (!text) return;
  const userMsg: ChatMessage = { role: "user", content: text };
  const newMessages = [...messages, userMsg];
  setMessages(newMessages);
  inputState.value = "";
  inputState.cursorPos = 0;
  inputState.selectionStart = 0;
  inputState.selectionEnd = 0;
  setLoading(true);

  const newTotalHeight = totalContentHeight + LINE_HEIGHT + 4;
  setScrollOffset(Math.max(0, newTotalHeight - chatAreaHeight));

  sendMessage(newMessages).then((response) => {
    const assistantMsg: ChatMessage = {
      role: "assistant",
      content: response,
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setLoading(false);
  });
}

export const ChatGippityApp: SystemApp = {
  id: "chatgippity",
  title: "ChatGippity",
  icon: "icon/computer",
  defaultSize: { width: 280, height: 300 },
  scrollable: false,
  resizable: true,
  minSize: { width: 200, height: 160 },

  // Hook order: messages, inputState, loading, scrollOffset
  render(app: AppBuilder, ctx: AppContext, props: any) {
    const [messages, setMessages] = app.useState<ChatMessage[]>([]);
    const [inputState] = app.useState<TextInputState>(createTextInputState(""));
    // Ensure the input stays focused (it's the only input in this app)
    if (!inputState.focused) inputState.focused = true;
    const [loading, setLoading] = app.useState(false);
    const [scrollOffset, setScrollOffset] = app.useState(0);

    ctx.clear(WHITE);

    const contentWidth = ctx.width - 8;
    const chatAreaHeight = ctx.height - BAR_HEIGHT;

    let totalContentHeight = 4;
    const messageLayouts: Array<{
      role: string;
      lines: string[];
      y: number;
    }> = [];

    for (const msg of messages) {
      const prefix = msg.role === "user" ? "You: " : "Gippity: ";
      const wrapped = wrapText(prefix + msg.content, contentWidth);
      messageLayouts.push({
        role: msg.role,
        lines: wrapped,
        y: totalContentHeight,
      });
      totalContentHeight += wrapped.length * LINE_HEIGHT + 4;
    }

    if (loading) {
      const wrapped = wrapText("Gippity: ...", contentWidth);
      messageLayouts.push({
        role: "assistant",
        lines: wrapped,
        y: totalContentHeight,
      });
      totalContentHeight += wrapped.length * LINE_HEIGHT + 4;
    }

    const maxScroll = Math.max(0, totalContentHeight - chatAreaHeight);
    const clampedScroll = Math.min(scrollOffset, maxScroll);

    ctx.pushClip(0, 0, ctx.width, chatAreaHeight);
    for (const layout of messageLayouts) {
      for (let i = 0; i < layout.lines.length; i++) {
        const ly = layout.y + i * LINE_HEIGHT - clampedScroll;
        if (ly + LINE_HEIGHT < 0 || ly > chatAreaHeight) continue;
        ctx.drawText(layout.lines[i], 4, ly, { font: FONT, color: BLACK });
      }
    }
    ctx.popClip();

    ctx.drawHLine(0, chatAreaHeight, ctx.width, BLACK);

    const inputY = chatAreaHeight + INPUT_PADDING;
    const sendBtnWidth = 40;
    const inputWidth = ctx.width - sendBtnWidth - 12;

    ctx.drawTextInput(inputState, 4, inputY, inputWidth, INPUT_HEIGHT, {
      id: "chat-input",
      onChange: () => app.scheduleRender(),
    });

    ctx.drawButton({
      x: ctx.width - sendBtnWidth - 4,
      y: inputY - 1,
      label: "Send",
      id: "chat-send-btn",
      onClick: () => {
        if (loading) return;
        doSend(
          messages,
          inputState,
          setMessages,
          setLoading,
          setScrollOffset,
          chatAreaHeight,
          totalContentHeight
        );
      },
    });

    if (messages.length === 0 && !loading) {
      const welcomeY = chatAreaHeight / 2 - 20;
      ctx.drawText("Welcome to ChatGippity!", ctx.width / 2 - 60, welcomeY, {
        font: TITLE_FONT,
        color: BLACK,
      });
      ctx.drawText(
        "Type a message below to start chatting.",
        20,
        welcomeY + 18,
        { font: FONT, color: BLACK }
      );
    }
  },

  // Hook order must match render: messages, inputState, loading, scrollOffset
  onEvent(app: AppBuilder, event: OSEvent, props: any, size: WindowSize) {
    const [messages, setMessages] = app.useState<ChatMessage[]>([]);
    const [inputState] = app.useState<TextInputState>(createTextInputState(""));
    const [loading, setLoading] = app.useState(false);
    const [scrollOffset, setScrollOffset] = app.useState(0);

    if (event.type === "keyDown") {
      if (event.key === "Enter") {
        if (!loading && inputState?.value?.trim()) {
          const chatAreaHeight = size.height - BAR_HEIGHT;
          const contentWidth = size.width - 8;
          let totalH = 4;
          for (const msg of messages) {
            const prefix = msg.role === "user" ? "You: " : "Gippity: ";
            totalH +=
              wrapText(prefix + msg.content, contentWidth).length *
                LINE_HEIGHT +
              4;
          }
          doSend(
            messages,
            inputState,
            setMessages,
            setLoading,
            setScrollOffset,
            chatAreaHeight,
            totalH
          );
        }
        return;
      }

      if (
        handleTextInputKey(
          inputState,
          event.key!,
          event.code!,
          event.shiftKey,
          event.metaKey,
          event.ctrlKey
        )
      ) {
        app.scheduleRender();
      }
    }

    if (event.type === "scroll") {
      const delta = (event as any).deltaY ?? 0;
      setScrollOffset((prev: number) => Math.max(0, prev + delta));
    }
  },

  getMenubar(app: AppBuilder, props: any): MenubarDefinition[] {
    // Hook order must match: messages, inputState, loading, scrollOffset
    const [, setMessages] = app.useState<ChatMessage[]>([]);
    app.useState<TextInputState>(createTextInputState(""));
    app.useState(false);
    const [, setScrollOffset] = app.useState(0);

    return [
      {
        label: "File",
        items: [
          {
            label: "Clear Chat",
            onClick: () => {
              setMessages([]);
              setScrollOffset(0);
            },
          },
        ],
      },
    ];
  },
};
