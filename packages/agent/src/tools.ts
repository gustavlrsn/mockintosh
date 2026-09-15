import { HTTP_TOOLS, type OpenAITool, type OpenAIToolParameter } from "@mockintosh/protocol";

export const AGENT_TRAPS = [
  "project_create",
  "read",
  "write",
  "stat",
  "list",
  "build_submit",
  "build_status",
  "build_cancel",
  "app_install",
  "app_restart",
  "open",
  "inspect",
  "click",
  "type",
  "windows",
  "apps",
] as const;

export type AgentTrap = (typeof AGENT_TRAPS)[number];
export const AGENT_TRAP_SET = new Set<string>(AGENT_TRAPS);
export const HTTP_TOOL_NAMES = new Set(HTTP_TOOLS.map((tool) => tool.function.name));

export interface ToolContract {
  name: string;
  description: string;
  inputSchema: unknown;
}

export function openaiToolsFromContracts(contracts: readonly ToolContract[]): OpenAITool[] {
  const byName = new Map(contracts.map((c) => [c.name, c]));
  return AGENT_TRAPS.map((name) => {
    const operation = byName.get(name);
    if (!operation) throw new Error(`Unknown operation: ${name}`);
    return {
      type: "function" as const,
      function: {
        name: operation.name,
        description: operation.description,
        parameters: operation.inputSchema as OpenAIToolParameter,
      },
    };
  });
}

export function allAgentTools(contracts: readonly ToolContract[]): OpenAITool[] {
  return [...openaiToolsFromContracts(contracts), ...HTTP_TOOLS];
}

export const ACTIVITY_LABEL: Record<string, string> = {
  project_create: "Writing source",
  write: "Writing source",
  read: "Reading source",
  stat: "Reading source",
  list: "Reading source",
  build_submit: "Building",
  build_status: "Building",
  build_cancel: "Building",
  app_install: "Trying the app",
  app_restart: "Trying the app",
  open: "Trying the app",
  inspect: "Trying the app",
  click: "Trying the app",
  type: "Trying the app",
  windows: "Trying the app",
  apps: "Trying the app",
  generate_image: "Generating image",
  get_mockintosh_repo_file: "Reading docs",
};

export function activityLabel(name: string): string {
  return ACTIVITY_LABEL[name] ?? name;
}
