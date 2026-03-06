import { SystemApp } from "../lib/canvas/AppRegistry";
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

function computeContentHeight(
  messages: ChatMessage[],
  loading: boolean,
  contentWidth: number
): number {
  let h = 4;
  for (const msg of messages) {
    const prefix = msg.role === "user" ? "You: " : "Gippity: ";
    h += wrapText(prefix + msg.content, contentWidth).length * LINE_HEIGHT + 4;
  }
  if (loading) {
    h += wrapText("Gippity: ...", contentWidth).length * LINE_HEIGHT + 4;
  }
  return h;
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
  resizable: false,
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

    // The scrollbar takes 15px from the right of the scroll area
    const scrollBarWidth = 15;
    const chatAreaHeight = ctx.height - BAR_HEIGHT;
    const contentWidth = ctx.width - scrollBarWidth - 8;

    const totalContentHeight = computeContentHeight(
      messages,
      loading,
      contentWidth
    );

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

    ctx.scrollArea(
      "chat-messages",
      { x: 0, y: 0, w: ctx.width, h: chatAreaHeight },
      {
        contentHeight: totalContentHeight,
        scrollOffset,
        onScroll: setScrollOffset,
        resize: "both",
      },
      (scrollCtx) => {
        let y = 4;
        const allMessages = loading
          ? [...messages, { role: "assistant" as const, content: "..." }]
          : messages;

        for (const msg of allMessages) {
          const prefix = msg.role === "user" ? "You: " : "Gippity: ";
          const wrapped = wrapText(prefix + msg.content, contentWidth);
          for (let i = 0; i < wrapped.length; i++) {
            scrollCtx.drawText(wrapped[i], 4, y + i * LINE_HEIGHT, {
              font: FONT,
              color: BLACK,
            });
          }
          y += wrapped.length * LINE_HEIGHT + 4;
        }
      }
    );

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
  },

  // Hook order must match render: messages, inputState, loading, scrollOffset
  onEvent(app: AppBuilder, event: OSEvent, props: any, size: any) {
    const [messages, setMessages] = app.useState<ChatMessage[]>([]);
    const [inputState] = app.useState<TextInputState>(createTextInputState(""));
    const [loading, setLoading] = app.useState(false);
    const [scrollOffset, setScrollOffset] = app.useState(0);

    if (event.type === "keyDown") {
      if (event.key === "Enter") {
        if (!loading && inputState?.value?.trim()) {
          const scrollBarWidth = 15;
          const contentWidth = size.width - scrollBarWidth - 8;
          const chatAreaHeight = size.height - BAR_HEIGHT;
          const totalH = computeContentHeight(messages, loading, contentWidth);
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
