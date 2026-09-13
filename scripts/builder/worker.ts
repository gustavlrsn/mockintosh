import {compile} from "./compiler";
import {buildRequest} from "../../src/shared/buildContract";
import {parse} from "../../src/shared/schema";
process.once("message", async (message: {request: unknown; directory: string}) => {
  try { process.send?.(await compile(parse(buildRequest, message.request), message.directory)); }
  catch (error) { process.send?.({toolchain: "compiler", diagnostics: [{message: String(error)}]}); }
  finally { process.disconnect(); }
});
