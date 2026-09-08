import { BrowserWindow } from "electron";
import path from "path";
import { getMainWindow, setMainWindow, getIslandWindow, isDev } from "./windowManager";

export function createMainWindow(): BrowserWindow {
  const existing = getMainWindow();
  if (existing && !existing.isDestroyed()) {
    return existing;
  }

  const win = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 960,
    minHeight: 640,
    frame: false,
    backgroundColor: "#FFFDF9",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "../preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  setMainWindow(win);

  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL!);
  } else {
    win.loadFile(path.join(__dirname, "../../dist/index.html"));
  }

  win.once("ready-to-show", () => {
    win.show();
  });

  win.on("closed", () => {
    setMainWindow(null);
    const island = getIslandWindow();
    if (island && !island.isDestroyed()) {
      island.close();
    }
  });

  return win;
}
