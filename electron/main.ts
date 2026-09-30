import { app, BrowserWindow } from "electron";
import { createMainWindow } from "./windows/mainWindow";
import { createIslandWindow } from "./windows/islandWindow";
import { registerAllIpc } from "./ipc";

// Windows toast notifications need a stable application identity.
if (process.platform === "win32") app.setAppUserModelId("com.flowy.desktop");

// App lifecycle
app.whenReady().then(() => {
  // Register all IPC communication modules
  registerAllIpc();

  // Initialize windows
  createMainWindow();
  createIslandWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
