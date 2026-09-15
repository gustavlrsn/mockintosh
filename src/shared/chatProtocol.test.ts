import { describe, expect, it } from "vitest";
import {
  completeFromLLMChoice,
  parseChatRequest,
  parseClientTools,
} from "./chatProtocol";

describe("chat protocol", () => {
  it("round-trips user, assistant tool_calls, and tool results", () => {
    const messages = parseChatRequest({
      messages: [
        { role: "user", content: "Make a counter" },
        {
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: "call-1",
              type: "function",
              function: { name: "project_create", arguments: '{"path":"/disk/Applications/C.app"}' },
            },
          ],
        },
        { role: "tool", tool_call_id: "call-1", content: '{"id":"c"}' },
      ],
    });
    expect(messages).toHaveLength(3);
    expect(messages![0]).toMatchObject({ role: "user", content: "Make a counter" });
    expect(messages![1].tool_calls?.[0].function.name).toBe("project_create");
    expect(messages![2]).toMatchObject({ role: "tool", tool_call_id: "call-1", content: '{"id":"c"}' });
  });

  it("accepts legacy prompt + conversationHistory", () => {
    const messages = parseChatRequest({
      prompt: "Hi",
      conversationHistory: [{ role: "assistant", content: "Hello" }],
    });
    expect(messages).toEqual([
      { role: "assistant", content: "Hello" },
      { role: "user", content: "Hi" },
    ]);
  });

  it("rejects a body with no user turn", () => {
    expect(parseChatRequest({ messages: [{ role: "assistant", content: "x" }] })).toBeNull();
    expect(parseChatRequest({})).toBeNull();
  });

  it("maps an LLM tool_calls choice without executing anything", () => {
    const result = completeFromLLMChoice({
      finish_reason: "tool_calls",
      message: {
        tool_calls: [
          {
            id: "1",
            function: { name: "inspect", arguments: '{"window":"w"}' },
          },
        ],
      },
    });
    expect(result).toEqual({
      tool_calls: [{ id: "1", name: "inspect", arguments: { window: "w" } }],
    });
    expect(result.message).toBeUndefined();
  });

  it("maps a text choice", () => {
    expect(completeFromLLMChoice({ message: { content: "  done  " } })).toEqual({ message: "done" });
  });

  it("reads client-supplied OpenAI tools", () => {
    const tools = parseClientTools({
      tools: [
        {
          type: "function",
          function: {
            name: "open",
            description: "Open an app",
            parameters: { type: "object", properties: { app: { type: "string" } }, required: ["app"] },
          },
        },
      ],
    });
    expect(tools?.[0].function.name).toBe("open");
  });
});
