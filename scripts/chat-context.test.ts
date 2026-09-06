/**
 * The committed `api/mockintosh-context.generated.ts` must match the guide it
 * is generated from; otherwise ChatGippity teaches a stale SDK.
 */
import fs from "fs";
import { describe, expect, it } from "vitest";
import { buildChatContext, OUTPUT_PATH } from "./build-chat-context";

describe("ChatGippity SDK context", () => {
  it("is generated from the current App Developer Guide", () => {
    const committed = fs.readFileSync(OUTPUT_PATH, "utf8");
    expect(committed, "run `npm run build:content` and commit the result").toBe(buildChatContext());
  });
});
