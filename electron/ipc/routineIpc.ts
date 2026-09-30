import { app, ipcMain } from "electron";
import { executionEngine } from "../backend/engine";
import { getMainWindow } from "../windows/windowManager";
import { isTrustedSender } from "./trust";

export function registerRoutineIpc() {
  ipcMain.handle("routine:execute", async (event, input: unknown) => {
    if (!isTrustedSender(event)) throw new Error("Untrusted action request.");
    return executionEngine.execute(input, event.sender, getMainWindow() || undefined);
  });

  ipcMain.on("routine:cancel", (event, runId?: unknown) => {
    if (!isTrustedSender(event)) return;
    if (runId !== undefined && (typeof runId !== "string" || runId.length > 128)) return;
    executionEngine.cancel(event.sender.id, runId as string | undefined);
  });

  app.on("before-quit", () => executionEngine.shutdown());
}
