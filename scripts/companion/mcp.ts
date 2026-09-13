import { randomUUID } from "node:crypto";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { CompanionClient, type LiveSession } from "./client";
async function main() {
  const token = process.env.MOCKINTOSH_TOKEN;
  if (!token) throw new Error("MOCKINTOSH_TOKEN is required");
  const client = await CompanionClient.connect(process.env.MOCKINTOSH_URL ?? "ws://127.0.0.1:4318", token);
  let selected: LiveSession | undefined;
  if (process.env.MOCKINTOSH_SESSION) selected = await client.select(process.env.MOCKINTOSH_SESSION);
  const server = new Server({
    name: "mockintosh",
    version: "0.4.0"
  }, {
    capabilities: {
      tools: {
        listChanged: true
      }
    }
  });
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [{
      name: "sessions",
      description: "Discover connected visible browser boots",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false
      }
    }, {
      name: "select_session",
      description: "Explicitly select a live boot; reload requires selecting again",
      inputSchema: {
        type: "object",
        properties: {
          session: {
            type: "string"
          }
        },
        required: ["session"],
        additionalProperties: false
      }
    }, {
      name: "action_outcome",
      description: "Reconcile an action without replaying it",
      inputSchema: {
        type: "object",
        properties: {
          action: {
            type: "string"
          }
        },
        required: ["action"],
        additionalProperties: false
      }
    }, ...(selected?.operations ?? []).map(operation => ({
      name: operation.name,
      description: operation.description,
      inputSchema: operation.inputSchema,
      outputSchema: {
        type: "object" as const,
        properties: {
          action: {
            type: "string"
          },
          result: operation.name === "screenshot" ? {type: "object", properties: {width: {type: "integer"}, height: {type: "integer"}}, required: ["width", "height"], additionalProperties: false} : operation.resultSchema ?? {}
        },
        required: ["action", "result"]
      }
    }))]
  }));
  server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
    const args = request.params.arguments ?? {},
      name = request.params.name;
    try {
      let result: any;
      if (name === "sessions") result = await client.list();else if (name === "select_session") {
        if (typeof args.session !== "string") throw new Error("session is required");
        selected = await client.select(args.session);
        result = {
          session: selected.session
        };
        await server.sendToolListChanged();
      } else if (name === "action_outcome") result = await client.request("outcome", {
        action: args.action
      });else {
        if (!selected) throw new Error("Select a live session first");
        const action = randomUUID();
        const cancel = () => {
          void client.cancel(action).catch(() => {});
        };
        extra.signal.addEventListener("abort", cancel, {
          once: true
        });
        try {
          result = await client.invoke(selected, name, args, action, typeof args.timeout === "number" ? args.timeout + 5000 : 65000);
        } finally {
          extra.signal.removeEventListener("abort", cancel);
        }
        if (name === "screenshot" && result.png) return {
          content: [{
            type: "image",
            mimeType: "image/png",
            data: result.png
          }],
          structuredContent: {
            action,
            result: {
              width: result.width,
              height: result.height
            }
          }
        };
        result = {
          action,
          result
        };
      }
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result)
        }],
        structuredContent: typeof result === "object" && !Array.isArray(result) ? result : {
          result
        }
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: JSON.stringify({
            code: error.code ?? "invalid-argument",
            message: error.message,
            action: error.action
          })
        }]
      };
    }
  });
  process.stdin.on("end", () => {
    client.close();
  });
  await server.connect(new StdioServerTransport());
}
main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
