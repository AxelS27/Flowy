import { BrowserWindow } from "electron";

let mainWindow: BrowserWindow | null = null;
let islandWindow: BrowserWindow | null = null;

export const isDev = process.env.VITE_DEV_SERVER_URL !== undefined;

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
