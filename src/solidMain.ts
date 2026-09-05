/**
 * Browser entry point: build the web platform, register the apps bundled with
 * the web build, and boot the OS on it.
 */
import "./systemApps";
import { DEFAULT_SCREEN, createWebPlatform } from "./platform/web";
import { bootOS } from "./os/boot";

bootOS(
  createWebPlatform({
    root: document.getElementById("root")!,
    width: DEFAULT_SCREEN.width,
    height: DEFAULT_SCREEN.height,
  })
).catch(console.error);
