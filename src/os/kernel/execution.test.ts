import { describe, expect, expectTypeOf, it } from "vitest";
import { FileSystem, InMemoryBackend, ROOT_ID } from "@mockintosh/fs";
import { Kernel, defineOperation } from "./index";
import { registerFileOperations } from "./files";
import * as s from "./schema";

describe("operation definitions and execution", () => {
  it("connects required/optional inputs and results to their published schemas", async () => {
    const kernel = new Kernel();
    kernel.register(defineOperation("length", "fixture", { text: s.string, suffix: s.string }, ["text"], s.integer, async args => {
      expectTypeOf(args.text).toEqualTypeOf<string>();
      expectTypeOf(args.suffix).toEqualTypeOf<string | undefined>();
      return (args.text + (args.suffix ?? "")).length;
    }));
    const caller = kernel.createSession();
    expect(await kernel.invoke(caller, "length", { text: "hello" })).toBe(5);
    await expect(kernel.invoke(caller, "length", { text: 1 })).rejects.toMatchObject({ code: "invalid-argument" });
    await expect(kernel.invoke(caller, "length", {})).rejects.toMatchObject({ code: "invalid-argument" });
    expect(kernel.requireOperation("length").resultSchema).toEqual(s.integer);
    // @ts-expect-error A handler cannot return text when its result schema promises a number.
    defineOperation("bad", "fixture", {}, [], s.integer, async () => "wrong");
    kernel.shutdown();
  });

  it("lets nested invoke use the same caller and disk", async () => {
    const fs = await FileSystem.open({ backend: new InMemoryBackend() });
    fs.mkdir(ROOT_ID, "Macintosh HD", { role: "volume" });
    const kernel = new Kernel();
    registerFileOperations(kernel, fs);
    kernel.register(defineOperation("save", "fixture", { filename: s.string }, ["filename"], s.resource,
      (args, execution) => execution.disk.write(args.filename, new TextEncoder().encode("saved"))));
    kernel.register(defineOperation("nested", "fixture", {}, [], s.resource, async (_, execution) => {
      return s.parse(s.resource, await execution.invoke("stat", { path: "/disk/file" }));
    }));
    const caller = kernel.createSession();
    expect(await kernel.invoke(caller, "save", { filename: "/disk/file" })).toMatchObject({ path: "/disk/file" });
    expect(await kernel.invoke(caller, "nested", {})).toMatchObject({ path: "/disk/file" });
    await fs.flush();
    kernel.shutdown();
  });
});
