import { ipcMain, screen } from "electron";
import { createIslandWindow, releaseIslandLock } from "../windows/islandWindow";
import { getIslandWindow, getMainWindow, safeSend } from "../windows/windowManager";
import { Routine } from "../types";

export function registerIslandIpc() {
  ipcMain.on("island:show", (_event, routineData?: Routine) => {
    const win = createIslandWindow();

    if (win && !win.isDestroyed()) {
      win.show();
      if (win.webContents.isLoading()) {
        win.webContents.once("did-finish-load", () => {
          safeSend(win, "island:activate", routineData);
        });
      } else {
        safeSend(win, "island:activate", routineData);
      }
    }

    safeSend(getMainWindow(), "island:status", { isBusy: true, routine: routineData });
  });

  ipcMain.on("island:hide", () => {
    const win = getIslandWindow();
    if (win && !win.isDestroyed()) {
      win.hide();
    }
    releaseIslandLock();
  });

  ipcMain.on("island:resize", (_event, { width, height }: { width: number; height: number }) => {
    const win = getIslandWindow();
    if (!win || win.isDestroyed()) return;

    const primaryDisplay = screen.getPrimaryDisplay();
    const screenWidth = primaryDisplay.workAreaSize.width;
    win.setBounds({
      x: Math.round((screenWidth - width) / 2),
      y: 5,
      width,
      height,
    });
  });

  ipcMain.on("voice:simulate-wake", (_event, routineData?: Routine) => {
    const win = createIslandWindow();

    if (win && !win.isDestroyed()) {
      win.show();
      if (win.webContents.isLoading()) {
        win.webContents.once("did-finish-load", () => {
          safeSend(win, "island:activate", routineData);
        });
      } else {
        safeSend(win, "island:activate", routineData);
      }
    }
  });
}
