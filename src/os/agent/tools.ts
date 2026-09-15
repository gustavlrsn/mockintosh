import type { Kernel } from "../kernel";
import { allAgentTools as fromContracts, openaiToolsFromContracts } from "@mockintosh/agent";
import type { OpenAITool } from "@mockintosh/protocol";

export { AGENT_TRAPS, AGENT_TRAP_SET, HTTP_TOOL_NAMES, ACTIVITY_LABEL, activityLabel } from "@mockintosh/agent";

export function openaiToolsFromKernel(kernel: Kernel): OpenAITool[] {
  return openaiToolsFromContracts(kernel.describe());
}

export function allAgentTools(kernel: Kernel): OpenAITool[] {
  return fromContracts(kernel.describe());
}
