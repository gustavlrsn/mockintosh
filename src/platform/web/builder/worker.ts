import {compile} from "./compiler";
import {typecheck} from "./typecheck";
import {buildRequest} from "../../../shared/buildContract";
import {parse} from "../../../shared/schema";
self.onmessage = async (event: MessageEvent<unknown>) => {
  try {
    const data = event.data;
    if (data && typeof data === "object" && "kind" in data && (data as {kind?: string}).kind === "typecheck") {
      self.postMessage({ diagnostics: typecheck(parse(buildRequest, (data as unknown as {request: unknown}).request)) });
      return;
    }
    self.postMessage(await compile(parse(buildRequest, data)));
  }
  catch (error) { self.postMessage({toolchain: "browser", diagnostics: [{message: String(error)}]}); }
};
