import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { resolution } from "./config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getZoomLevel({ width, height }) {
  if (!width || !height) return 1;

  const widthRatio = Math.floor(width / resolution.width);
  const heightRatio = Math.floor(height / resolution.height);

  return Math.min(widthRatio, heightRatio);
}
