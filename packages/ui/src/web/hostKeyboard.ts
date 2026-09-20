import type { Modifiers } from "../nodes";

export type HostKeyStroke = "keydown" | "keypress";

/**
 * Matches `src/os/boot.ts` `onKey`: every key is a keydown; printable
 * characters also fire `keypress`. TextInput / TextEditor insert only there.
 */
export function hostKeyStrokes(key: string, mods: Modifiers): readonly HostKeyStroke[] {
  const command = !!(mods.ctrl || mods.meta);
  if (key.length === 1 && !command) return ["keydown", "keypress"];
  return ["keydown"];
}
