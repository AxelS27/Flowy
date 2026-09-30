import { BrowserWindow, screen } from "electron";
import path from "path";
import {
  getIslandWindow,
  setIslandWindow,
  getMainWindow,
  safeSend,
  isDev,
  restrictRendererNavigation,
} from "./windowManager";

let isIslandBusy = false;
let busyWatchdogTimer: NodeJS.Timeout | null = null;

export function releaseIslandLock() {
  isIslandBusy = false;
  if (busyWatchdogTimer) {
    clearTimeout(busyWatchdogTimer);
    busyWatchdogTimer = null;
  }
  safeSend(getMainWindow(), "island:status", { isBusy: false });
}

export function acquireIslandLock() {
  isIslandBusy = true;
  if (busyWatchdogTimer) {
    clearTimeout(busyWatchdogTimer);
  }
  // Safeguard: auto-release lock after 15 seconds so system never deadlocks
  busyWatchdogTimer = setTimeout(() => {
    isIslandBusy = false;
    busyWatchdogTimer = null;
  }, 15000);
}

export function getIsIslandBusy(): boolean {
  return isIslandBusy;
}

export function createIslandWindow(): BrowserWindow {
  const existing = getIslandWindow();
  if (existing && !existing.isDestroyed()) {
    return existing;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width } = primaryDisplay.workAreaSize;

  const islandWidth = 500;
  const islandHeight = 320;

  const win = new BrowserWindow({
    width: islandWidth,
    height: islandHeight,
    x: Math.round((width - islandWidth) / 2),
    y: 5, // Natural floating notch position (5px from top bezel)
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    resizable: false,
    focusable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "../preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  setIslandWindow(win);
  restrictRendererNavigation(win);

  win.setAlwaysOnTop(true, "screen-saver");

  if (isDev) {
    win.loadURL(`${process.env.VITE_DEV_SERVER_URL!}#/island`);
  } else {
    win.loadFile(path.join(__dirname, "../../dist/index.html"), {
      hash: "island",
    });
  }

  win.on("closed", () => {
    setIslandWindow(null);
    releaseIslandLock();
  });

  return win;
}
