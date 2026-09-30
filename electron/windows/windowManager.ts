import { BrowserWindow } from "electron";
import path from "node:path";
import { pathToFileURL } from "node:url";

let mainWindow: BrowserWindow | null = null;
let islandWindow: BrowserWindow | null = null;

export const isDev = process.env.VITE_DEV_SERVER_URL !== undefined;

export function isTrustedRendererUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const expected = new URL(isDev
      ? process.env.VITE_DEV_SERVER_URL!
      : pathToFileURL(path.join(__dirname, "../../dist/index.html")).href);
    // Hash routes are allowed; remote pages and other local files are not.
    return url.protocol === expected.protocol && url.host === expected.host &&
      url.pathname === expected.pathname && url.search === expected.search;
  } catch { return false; }
}

export function restrictRendererNavigation(win: BrowserWindow) {
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  win.webContents.on("will-navigate", (event, url) => {
    if (!isTrustedRendererUrl(url)) event.preventDefault();
  });
}


export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export function setMainWindow(win: BrowserWindow | null) {
  mainWindow = win;
}

export function getIslandWindow(): BrowserWindow | null {
  return islandWindow;
}

export function setIslandWindow(win: BrowserWindow | null) {
  islandWindow = win;
}

export function safeSend(win: BrowserWindow | null, channel: string, ...args: any[]) {
  if (win && !win.isDestroyed() && win.webContents && !win.webContents.isDestroyed()) {
    try {
      win.webContents.send(channel, ...args);
    } catch (err) {
      console.warn(`[Flowy] Failed to dispatch IPC ${channel}:`, err);
    }
  }
}

export function broadcast(channel: string, ...args: any[]) {
  safeSend(mainWindow, channel, ...args);
  safeSend(islandWindow, channel, ...args);
}
