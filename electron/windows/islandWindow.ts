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

export function positionIslandWindow(win: BrowserWindow, width: number, height: number) {
  // Full display bounds, not workArea: a notch belongs to the physical top edge,
  // even with a top/side taskbar or non-zero/negative monitor coordinates.
  const { bounds } = screen.getPrimaryDisplay();
  win.setBounds({
    x: bounds.x + Math.round((bounds.width - width) / 2),
    y: bounds.y,
    width: Math.round(width),
    height: Math.round(height),
  });
}

export function createIslandWindow(): BrowserWindow {
  const existing = getIslandWindow();
  if (existing && !existing.isDestroyed()) {
    return existing;
  }

  const { bounds } = screen.getPrimaryDisplay();

  const islandWidth = 500;
  const islandHeight = 320;

  const win = new BrowserWindow({
    width: islandWidth,
    height: islandHeight,
    x: bounds.x + Math.round((bounds.width - islandWidth) / 2),
    y: bounds.y,
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
  // Transparent margins must not block clicks in the application underneath.
  win.setIgnoreMouseEvents(true, { forward: true });
  win.on("hide", () => win.setIgnoreMouseEvents(true, { forward: true }));
  const reposition = () => {
    if (!win.isDestroyed()) {
      const current = win.getBounds();
      positionIslandWindow(win, current.width, current.height);
    }
  };
  screen.on("display-metrics-changed", reposition);
  screen.on("display-added", reposition);
  screen.on("display-removed", reposition);

  if (isDev) {
    win.loadURL(`${process.env.VITE_DEV_SERVER_URL!}#/island`);
  } else {
    win.loadFile(path.join(__dirname, "../../dist/index.html"), {
      hash: "island",
    });
  }

  win.on("closed", () => {
    screen.removeListener("display-metrics-changed", reposition);
    screen.removeListener("display-added", reposition);
    screen.removeListener("display-removed", reposition);
    setIslandWindow(null);
    releaseIslandLock();
  });

  return win;
}
