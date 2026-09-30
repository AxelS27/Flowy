import { app, ipcMain } from "electron";
import { isTrustedSender } from "./trust";
import { isTrustedRendererUrl } from "../windows/windowManager";
import { closeCelebrationWindow, getCelebrationWindow, showCelebrationWindow, startCelebration } from "../windows/celebrationWindow";

export function registerCelebrationIpc() {
  ipcMain.on("celebration:show", (event) => {
    if (isTrustedSender(event)) showCelebrationWindow();
  });
  ipcMain.on("celebration:ready", (event) => {
    const window = getCelebrationWindow();
    if (!window || window.isDestroyed() || window.webContents.id !== event.sender.id ||
      event.senderFrame !== event.sender.mainFrame || !isTrustedRendererUrl(event.sender.getURL())) return;
    startCelebration();
  });
  app.on("before-quit", closeCelebrationWindow);
}
