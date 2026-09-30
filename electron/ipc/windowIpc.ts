import { ipcMain } from "electron";
import { getMainWindow } from "../windows/windowManager";
import { isTrustedSender } from "./trust";

export function registerWindowIpc() {
  ipcMain.on("window:minimize", (event) => {
    if (!isTrustedSender(event)) return;
    getMainWindow()?.minimize();
  });

  ipcMain.on("window:maximize", (event) => {
    if (!isTrustedSender(event)) return;
    const win = getMainWindow();
    if (win?.isMaximized()) {
      win.unmaximize();
    } else {
      win?.maximize();
    }
  });

  ipcMain.on("window:close", (event) => {
    if (!isTrustedSender(event)) return;
    getMainWindow()?.close();
  });
}
