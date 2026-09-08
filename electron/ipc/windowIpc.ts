import { ipcMain } from "electron";
import { getMainWindow } from "../windows/windowManager";

export function registerWindowIpc() {
  ipcMain.on("window:minimize", () => {
    getMainWindow()?.minimize();
  });

  ipcMain.on("window:maximize", () => {
    const win = getMainWindow();
    if (win?.isMaximized()) {
      win.unmaximize();
    } else {
      win?.maximize();
    }
  });

  ipcMain.on("window:close", () => {
    getMainWindow()?.close();
  });
}
