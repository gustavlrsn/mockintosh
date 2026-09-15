/**
 * The apps bundled with the web build. Each module exports its app(s) as
 * `defineApp` results, exactly as a third-party bundle would; the entry point
 * registers them with the OS. The Finder registers itself: it is part of the
 * shell and the boot sequence depends on it.
 */
import { registerApp } from "./os/apps";
import Testing from "@/apps/Testing";
import FileViewer from "@/apps/FileViewer";
import Picture from "@/apps/Picture";
import VideoPlayer from "@/apps/VideoPlayer";
import PhotoBooth from "@/apps/PhotoBooth";
import AppStore from "@/apps/AppStore";
import ChatGippity from "@/apps/ChatGippity";
import Safari, { SafariStream, SafariTextweb } from "@/apps/Safari";
import SpotifyPlayer from "@/apps/SpotifyPlayer";
import IconGallery from "@/apps/IconGallery";
import MacPaint from "@/apps/MacPaint";

for (const app of [
  Testing,
  FileViewer,
  Picture,
  VideoPlayer,
  PhotoBooth,
  AppStore,
  ChatGippity,
  Safari,
  SafariStream,
  SafariTextweb,
  SpotifyPlayer,
  IconGallery,
  MacPaint,
]) {
  registerApp(app);
}
