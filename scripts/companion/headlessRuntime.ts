import { bootOS } from "../../src/os/boot";
import { createHeadlessPlatform } from "../../src/platform/headless";
export async function create(options: Partial<import("../../src/platform/types").Platform> = {}) {
  const platform = createHeadlessPlatform({
    width: 640,
    height: 480
  });
  const os = await bootOS({...platform, ...options});
  return {
    os,
    platform
  };
}
