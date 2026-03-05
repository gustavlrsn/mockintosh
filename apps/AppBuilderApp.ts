import { NativeApp, WindowSize } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { AppContext } from "../lib/canvas/AppContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import {
  createTextInputState,
  handleTextInputKey,
  TextInputState,
} from "../lib/canvas/ui/TextInput";
import { getWrappedLines } from "../lib/canvas/ui/TextBlock";
import { OSEvent } from "../lib/canvas/EventManager";
import { saveApp } from "./AppStore";
import { MockFS } from "../lib/canvas/fs/MockFS";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

const INPUT_HEIGHT = 20;
const TOOLBAR_HEIGHT = 24;
const LINE_H = 12;

export const AppBuilderApp: NativeApp = {
  id: "appbuilder",
  title: "App Builder",
  icon: "icon/computer",
  defaultSize: { width: 350, height: 280 },
  scrollable: false,

  render(app: AppBuilder, ctx: AppContext, props: any) {
    const [messages] = app.useState<ChatMessage[]>([
      { role: "assistant", text: "Hi! Describe the app you want to build." },
    ]);
    const [input] = app.useState<TextInputState>(createTextInputState(""));
    const [generatedCode] = app.useState<string | null>(null);
    const [isLoading] = app.useState(false);
    app.useState("My App"); // appTitle

    ctx.clear(WHITE);

    ctx.drawText("App Builder", 4, 2, {
      font: "ChiKareGo",
      color: BLACK,
    });
    ctx.drawHLine(0, 16, ctx.width, BLACK);

    // Chat area
    const chatTop = 17;
    const chatBottom = ctx.height - INPUT_HEIGHT - TOOLBAR_HEIGHT - 2;
    const chatH = chatBottom - chatTop;

    ctx.pushClip(0, chatTop, ctx.width, chatH);

    let y = chatTop + 4;
    for (const msg of messages) {
      const prefix = msg.role === "user" ? "> " : "";
      const lines = getWrappedLines(
        prefix + msg.text,
        ctx.width - 16,
        "Geneva9"
      );

      for (const line of lines) {
        if (y >= chatTop && y < chatBottom) {
          ctx.drawText(line, 8, y, {
            font: "Geneva9",
            color: BLACK,
          });
        }
        y += LINE_H;
      }
      y += 4;
    }

    if (isLoading) {
      ctx.drawText("Generating...", 8, y, {
        font: "Geneva9",
        color: BLACK,
      });
    }

    ctx.popClip();

    ctx.drawHLine(0, chatBottom, ctx.width, BLACK);

    // Input area
    const inputY = chatBottom + 2;
    input.focused = true;
    ctx.drawTextInput(input, 4, inputY, ctx.width - 8, 16);

    // Toolbar
    const toolY = ctx.height - TOOLBAR_HEIGHT;
    ctx.drawHLine(0, toolY, ctx.width, BLACK);
    ctx.fillRect(0, toolY + 1, ctx.width, TOOLBAR_HEIGHT - 1, WHITE);

    ctx.drawButton({
      x: 4,
      y: toolY + 2,
      label: "Send",
      disabled: isLoading,
      id: "send-btn",
    });

    if (generatedCode) {
      ctx.drawButton({
        x: 56,
        y: toolY + 2,
        label: "Preview",
        id: "preview-btn",
        onClick: () => {
          const openSandboxed = props._openSandboxedApp;
          if (openSandboxed) {
            openSandboxed({
              id: "preview-" + Date.now(),
              title: "Preview",
              code: generatedCode,
              description: "Preview app",
            });
          }
        },
      });

      ctx.drawButton({
        x: 120,
        y: toolY + 2,
        label: "Publish",
        id: "publish-btn",
        onClick: () => {
          const id = "userapp-" + Date.now();
          const fs: MockFS | undefined = props._fs;
          if (fs) {
            saveApp(
              {
                id,
                title: "My App",
                description: "Created with App Builder",
                code: generatedCode,
              },
              fs
            );
          }
        },
      });

      ctx.drawText("Code ready", 192, toolY + 6, {
        font: "Geneva9",
        color: BLACK,
      });
    }
  },

  onEvent(app: AppBuilder, event: OSEvent, props: any, size: WindowSize) {
    const [messages, setMessages] = app.useState<ChatMessage[]>([
      { role: "assistant", text: "Hi! Describe the app you want to build." },
    ]);
    const [input, setInput] = app.useState<TextInputState>(
      createTextInputState("")
    );
    const [generatedCode, setGeneratedCode] = app.useState<string | null>(null);
    const [, setIsLoading] = app.useState(false);
    app.useState("My App"); // appTitle

    if (event.type === "keyDown") {
      if (event.key === "Enter" && input.value.trim()) {
        const userMessage = input.value.trim();
        setMessages([...messages, { role: "user", text: userMessage }]);
        setInput(createTextInputState(""));
        setIsLoading(true);

        generateApp(userMessage, messages, (partial) => {
          setMessages((prev: ChatMessage[]) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (
              last &&
              last.role === "assistant" &&
              last.text.startsWith("```\n")
            ) {
              copy[copy.length - 1] = {
                role: "assistant",
                text: "```\n" + partial + "\n```",
              };
            } else {
              copy.push({
                role: "assistant",
                text: "```\n" + partial + "\n```",
              });
            }
            return copy;
          });
        }).then((result) => {
          setIsLoading(false);
          if (result.code) {
            setGeneratedCode(result.code);
            setMessages((prev: ChatMessage[]) => {
              const copy = prev.filter(
                (m) => !(m.role === "assistant" && m.text.startsWith("```\n"))
              );
              return [
                ...copy,
                {
                  role: "assistant",
                  text:
                    result.explanation ||
                    "Here's your app! Click Preview to try it.",
                },
              ];
            });
          } else {
            setMessages((prev: ChatMessage[]) => [
              ...prev,
              {
                role: "assistant",
                text: "Sorry, something went wrong. Try again?",
              },
            ]);
          }
        });
        return;
      }

      if (
        handleTextInputKey(
          input,
          event.key!,
          event.code!,
          event.shiftKey,
          event.metaKey,
          event.ctrlKey
        )
      ) {
        setInput({ ...input });
      }
    }
  },
};

async function generateApp(
  prompt: string,
  history: ChatMessage[],
  onToken?: (partial: string) => void
): Promise<{ code: string | null; explanation: string | null }> {
  try {
    const useStream = !!onToken;
    const response = await fetch("/api/generate-app", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        stream: useStream,
        conversationHistory: history.map((m) => ({
          role: m.role,
          content: m.text,
        })),
      }),
    });

    if (!response.ok) {
      return { code: null, explanation: null };
    }

    if (
      useStream &&
      response.headers.get("content-type")?.includes("text/event-stream")
    ) {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop()!;

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const payload = trimmed.slice(6);
          if (payload === "[DONE]") break;
          try {
            const { token } = JSON.parse(payload);
            if (token) {
              accumulated += token;
              onToken(accumulated);
            }
          } catch {
            // skip
          }
        }
      }

      let code = accumulated.trim();
      if (code.startsWith("```")) {
        code = code.replace(/^```\w*\n?/, "").replace(/\n?```$/, "");
      }
      return { code, explanation: "App generated! Click Preview to try it." };
    }

    const data = await response.json();
    return {
      code: data.code ?? null,
      explanation: data.explanation ?? null,
    };
  } catch {
    return { code: null, explanation: null };
  }
}
