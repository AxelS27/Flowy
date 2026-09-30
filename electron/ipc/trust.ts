import { getMainWindow, getIslandWindow, isTrustedRendererUrl } from "../windows/windowManager";

export function isTrustedSender(event: Electron.IpcMainInvokeEvent | Electron.IpcMainEvent): boolean {
  return event.senderFrame === event.sender.mainFrame &&
    [getMainWindow(), getIslandWindow()].some((window) =>
      window && !window.isDestroyed() && window.webContents.id === event.sender.id &&
      isTrustedRendererUrl(window.webContents.getURL()));
}
