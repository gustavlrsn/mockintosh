import { SystemApp } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { WindowContext } from "../lib/toolbox/WindowContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { OSEvent } from "../lib/toolbox/EventManager";
import {
  TextInputState,
  createTextInputState,
  handleTextInputKey,
} from "../lib/toolbox/TextEdit";
import { measureText, getLineHeight } from "../lib/canvas/fontAdapter";
import { MenubarDefinition } from "../lib/toolbox/MenuManager";
import { ditherBlobToPixels } from "../lib/canvas/dither";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatImage {
  /** Original full-resolution blob kept in memory for re-dithering. */
  blob: Blob;
  /** Currently dithered pixels (Atkinson, 0=white 1=black). */
  pixels: Uint8Array;
  /** Width at which pixels were dithered. */
  width: number;
  /** Height at which pixels were dithered. */
  height: number;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  /** Present when the message contains a generated image. */
  image?: ChatImage;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FONT = "Geneva9";
const TITLE_FONT = "ChiKareGo";
const LINE_HEIGHT = getLineHeight(FONT);
const INPUT_HEIGHT = 18;
const INPUT_PADDING = 4;
const BAR_HEIGHT = INPUT_HEIGHT + INPUT_PADDING * 2 + 1;
/** Maximum width an inline image will occupy (pixels, within content area). */
const MAX_IMAGE_WIDTH = 200;
/** Aspect ratio for generated images is 1:1 from the API. */
const IMAGE_ASPECT = 1;
/** Vertical gap below an image block. */
const IMAGE_GAP = 4;

const CHAT_API_URL = "/api/chat";
const IMAGE_API_URL = "/api/generate-image";

// ---------------------------------------------------------------------------
// Image detection
// ---------------------------------------------------------------------------

/** Commands the user can type to trigger image generation. */
const IMAGE_TRIGGERS = ["/imagine ", "/img ", "/image "];

function parseImageRequest(text: string): string | null {
  const lower = text.toLowerCase();
  for (const trigger of IMAGE_TRIGGERS) {
    if (lower.startsWith(trigger)) {
      return text.slice(trigger.length).trim();
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Image helpers
// ---------------------------------------------------------------------------

function imageDisplaySize(contentWidth: number): { w: number; h: number } {
  const w = Math.min(contentWidth, MAX_IMAGE_WIDTH);
  const h = Math.round(w / IMAGE_ASPECT);
  return { w, h };
}

async function generateAndDither(
  prompt: string,
  displayW: number,
  displayH: number
): Promise<ChatImage | null> {
  try {
    const resp = await fetch(IMAGE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (!data.b64) return null;

    // Decode base64 → blob (original, kept for re-dithering).
    const binary = atob(data.b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: "image/png" });

    const pixels = await ditherBlobToPixels(blob, displayW, displayH);
    if (!pixels) return null;

    return { blob, pixels, width: displayW, height: displayH };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Text chat helper
// ---------------------------------------------------------------------------

interface ChatResponse {
  message: string;
  /** Set when the LLM decided to generate an image via tool call. */
  b64?: string;
  imagePrompt?: string;
}

async function sendMessage(messages: ChatMessage[]): Promise<ChatResponse> {
  try {
    const resp = await fetch(CHAT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: messages[messages.length - 1].content,
        conversationHistory: messages.slice(0, -1),
      }),
    });
    if (!resp.ok) return { message: "Sorry, I couldn't reach the server." };
    const data = await resp.json();
    return {
      message: data.message ?? data.error ?? "No response.",
      b64: data.b64,
      imagePrompt: data.imagePrompt,
    };
  } catch {
    return { message: "Network error. Please try again." };
  }
}

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

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

function messageHeight(msg: ChatMessage, contentWidth: number): number {
  let h = 0;
  if (msg.image) {
    // Use stored dimensions — these match the pixel buffer's actual row stride.
    const imgH = msg.image.height || imageDisplaySize(contentWidth).h;
    h += imgH + IMAGE_GAP;
  }
  if (msg.content) {
    const prefix = msg.role === "user" ? "You: " : "Gippity: ";
    h += wrapText(prefix + msg.content, contentWidth).length * LINE_HEIGHT;
  }
  h += 4; // bottom gap between messages
  return h;
}

function computeContentHeight(
  messages: ChatMessage[],
  loading: boolean,
  contentWidth: number
): number {
  let h = 4;
  for (const msg of messages) {
    h += messageHeight(msg, contentWidth);
  }
  if (loading) {
    h += wrapText("Gippity: ...", contentWidth).length * LINE_HEIGHT + 4;
  }
  return h;
}

// ---------------------------------------------------------------------------
// Send action
// ---------------------------------------------------------------------------

function doSend(
  messages: ChatMessage[],
  inputState: TextInputState,
  setMessages: (
    v: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])
  ) => void,
  setLoading: (v: boolean) => void,
  setScrollOffset: (v: number | ((prev: number) => number)) => void,
  scheduleRender: () => void,
  chatAreaHeight: number,
  totalContentHeight: number,
  contentWidth: number
) {
  const text = inputState.value.trim();
  if (!text) return;

  const imagePrompt = parseImageRequest(text);

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

  if (imagePrompt !== null) {
    const { w, h } = imageDisplaySize(contentWidth);
    generateAndDither(imagePrompt, w, h).then((img) => {
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: img
          ? `Here's "${imagePrompt}":`
          : "Sorry, I couldn't generate that image.",
        image: img ?? undefined,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setLoading(false);
      scheduleRender();
    });
  } else {
    sendMessage(newMessages).then(async (response) => {
      // If the LLM triggered image generation via tool call, dither the result.
      if (response.b64 && response.imagePrompt) {
        const { w, h } = imageDisplaySize(contentWidth);
        const binary = atob(response.b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: "image/png" });
        const pixels = await ditherBlobToPixels(blob, w, h);
        const img: ChatImage | undefined = pixels
          ? { blob, pixels, width: w, height: h }
          : undefined;
        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: response.message,
          image: img,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: response.message,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
      setLoading(false);
      scheduleRender();
    });
  }
}

// ---------------------------------------------------------------------------
// App definition
// ---------------------------------------------------------------------------

export const ChatGippityApp: SystemApp = {
  id: "chatgippity",
  title: "ChatGippity",
  icon: "icon/computer",
  defaultSize: { width: 280, height: 300 },
  scrollable: false,
  resizable: false,
  minSize: { width: 200, height: 160 },

  // Hook order: messages, inputState, loading, scrollOffset
  render(app: AppBuilder, ctx: WindowContext, props: any) {
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
      ctx.drawText("Tip: ask me to generate an image!", 20, welcomeY + 30, {
        font: FONT,
        color: BLACK,
      });
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
          // Draw image block if present
          if (msg.image) {
            const { w: imgW, h: imgH } = imageDisplaySize(contentWidth);
            // Re-dither if display size changed (e.g. window resize)
            if (msg.image.width !== imgW || msg.image.height !== imgH) {
              ditherBlobToPixels(msg.image.blob, imgW, imgH).then((px) => {
                if (px) {
                  msg.image!.pixels = px;
                  msg.image!.width = imgW;
                  msg.image!.height = imgH;
                  app.scheduleRender();
                }
              });
            }
            // Use blitImageData via a temporary offscreen expansion so the
            // image respects the scroll context's clip and scroll-offset
            // transform identically to other drawing primitives.
            const iw = msg.image.width;
            const ih = msg.image.height;
            const src = msg.image.pixels;
            const rgba = new Uint8ClampedArray(iw * ih * 4);
            for (let i = 0; i < iw * ih; i++) {
              const v = src[i] ? 0 : 255; // 1=black→0, 0=white→255
              rgba[i * 4] = v;
              rgba[i * 4 + 1] = v;
              rgba[i * 4 + 2] = v;
              rgba[i * 4 + 3] = 255;
            }
            const imageData = new ImageData(rgba, iw, ih);
            scrollCtx.blitImageData(imageData, 4, y);
            y += ih + IMAGE_GAP;
          }

          // Draw text content
          if (msg.content) {
            const prefix = msg.role === "user" ? "You: " : "Gippity: ";
            const wrapped = wrapText(prefix + msg.content, contentWidth);
            for (let i = 0; i < wrapped.length; i++) {
              scrollCtx.drawText(wrapped[i], 4, y + i * LINE_HEIGHT, {
                font: FONT,
                color: BLACK,
              });
            }
            y += wrapped.length * LINE_HEIGHT;
          }

          y += 4; // gap between messages
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
          () => app.scheduleRender(),
          chatAreaHeight,
          totalContentHeight,
          contentWidth
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
            () => app.scheduleRender(),
            chatAreaHeight,
            totalH,
            contentWidth
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
