import { bootOS } from "../../src/os/boot";
import { createHeadlessPlatform } from "../../src/platform/headless";
import { registerApp } from "../../src/os/apps";
import ControlPanel from "../../apps/ControlPanel";
export async function create(options: Partial<import("../../src/platform/types").Platform> = {}) {
  registerApp(ControlPanel);
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
