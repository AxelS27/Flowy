import { BrowserWindow } from "electron";
import path from "path";
import { closeCelebrationWindow } from "./celebrationWindow";
import { getMainWindow, setMainWindow, getIslandWindow, isDev, restrictRendererNavigation } from "./windowManager";

export function createMainWindow(): BrowserWindow {
  const existing = getMainWindow();
  if (existing && !existing.isDestroyed()) {
    return existing;
  }

  const win = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 1100,
    minHeight: 760,
    frame: false,
    backgroundColor: "#FAF8F5",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "../preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  setMainWindow(win);
  restrictRendererNavigation(win);

  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL!);
  } else {
    win.loadFile(path.join(__dirname, "../../dist/index.html"));
  }

  win.once("ready-to-show", () => {
    win.show();
  });

  win.on("closed", () => {
    closeCelebrationWindow();
    setMainWindow(null);
    const island = getIslandWindow();
    if (island && !island.isDestroyed()) {
      island.close();
    }
  });

  return win;
}
