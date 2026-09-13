import {compile} from "./compiler";
import {buildRequest} from "../../../shared/buildContract";
import {parse} from "../../../shared/schema";
self.onmessage = async (event: MessageEvent<unknown>) => {
  try { self.postMessage(await compile(parse(buildRequest, event.data))); }
  catch (error) { self.postMessage({toolchain: "browser", diagnostics: [{message: String(error)}]}); }
};
