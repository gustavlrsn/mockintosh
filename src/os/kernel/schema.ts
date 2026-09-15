export * from "../../shared/schema";
import { string, boolean, number, integer, array, object, bytes } from "../../shared/schema";
export const frame = object({ width: integer, height: integer, rowBytes: integer, bytes });
export const inspection = array(object({
  id: integer, name: string, role: string, text: string, value: string,
  enabled: boolean, focused: boolean, windowId: string,
  bounds: object({ x: number, y: number, width: number, height: number }), actions: array(string),
}, ["id", "role", "text", "enabled", "focused", "bounds", "actions"]));
const menuOption = object({ label: string, value: string, disabled: boolean }, ["label", "value"]);
const menuItem = {
  anyOf: [
    object({ type: { enum: ["separator"] } }),
    object({ type: { enum: ["radiogroup"] }, value: string, items: array(menuOption) }),
    object({ type: { enum: ["action"] }, label: string, shortcut: string, disabled: boolean }, ["label"]),
  ]
} as const;
export const menuResult = { anyOf: [array(object({ label: string, items: array(menuItem) })), object({ menu: string, item: string })] } as const;
export const shellOutcome = object({
  id: string, session: string, cwd: string, stdout: string, stderr: string,
  stdoutBytes: bytes, stderrBytes: bytes, exitCode: integer, truncated: object({ stdout: boolean, stderr: boolean })
});
