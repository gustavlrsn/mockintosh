export class ShellSyntaxError extends Error {}
/** Parse everything before execution. Quoted metacharacters remain literal. */
export function parseShell(source: string): string[][] {
  const commands: string[][] = [];
  let command: string[] = [],
    word = "",
    started = false,
    quote = "";
  const finishWord = () => {
    if (started) command.push(word);
    word = "";
    started = false;
  };
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (ch === "\\" && quote !== "'") {
      if (++i === source.length) throw new ShellSyntaxError("Trailing escape");
      word += source[i];
      started = true;
      continue;
    }
    if (quote) {
      if (ch === quote) quote = "";else word += ch;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      started = true;
      continue;
    }
    if (/[|&<>$`]/.test(ch)) throw new ShellSyntaxError(`Unsupported shell operator: ${ch}`);
    if (ch === ";") {
      finishWord();
      if (command.length) commands.push(command);
      command = [];
      continue;
    }
    if (/\s/.test(ch)) {
      finishWord();
      continue;
    }
    word += ch;
    started = true;
  }
  if (quote) throw new ShellSyntaxError("Unterminated quote");
  finishWord();
  if (command.length) commands.push(command);
  return commands;
}
