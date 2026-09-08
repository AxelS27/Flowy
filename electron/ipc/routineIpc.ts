import { ipcMain } from "electron";
import { broadcast } from "../windows/windowManager";

export function registerRoutineIpc() {
  ipcMain.on("routine:run", async (_event, routineId: string) => {
    // Notify listeners that routine started
    broadcast("routine:started", { routineId });
  });

  ipcMain.on("routine:cancel", () => {
    broadcast("routine:cancelled");
  });
}
