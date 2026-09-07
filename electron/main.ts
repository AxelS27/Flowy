import { app, BrowserWindow, ipcMain, screen } from "electron";
import path from "path";

let mainWindow: BrowserWindow | null = null;
let islandWindow: BrowserWindow | null = null;
let isIslandBusy = false;
let busyWatchdogTimer: NodeJS.Timeout | null = null;

const isDev = process.env.VITE_DEV_SERVER_URL !== undefined;

function safeSend(win: BrowserWindow | null, channel: string, ...args: any[]) {
  if (win && !win.isDestroyed() && win.webContents && !win.webContents.isDestroyed()) {
    try {
      win.webContents.send(channel, ...args);
    } catch (err) {
      console.warn(`[Flowy] Failed to dispatch IPC ${channel}:`, err);
    }
  }
}

function releaseIslandLock() {
  isIslandBusy = false;
  if (busyWatchdogTimer) {
    clearTimeout(busyWatchdogTimer);
    busyWatchdogTimer = null;
  }
  // Notify mainWindow that island is now free
  safeSend(mainWindow, "island:status", { isBusy: false });
}

function acquireIslandLock() {
  isIslandBusy = true;
  if (busyWatchdogTimer) {
    clearTimeout(busyWatchdogTimer);
  }
  // Safeguard: auto-release lock after 15 seconds so system never deadlocks
  busyWatchdogTimer = setTimeout(() => {
    isIslandBusy = false;
    busyWatchdogTimer = null;
  }, 15000);
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 960,
    minHeight: 640,
    frame: false,
    backgroundColor: "#FFFDF9",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL!);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
    if (islandWindow) {
      islandWindow.close();
    }
  });
}

function createIslandWindow(): BrowserWindow {
  // SINGLETON GUARD: If island window already exists and is active, never create a duplicate!
  if (islandWindow && !islandWindow.isDestroyed()) {
    return islandWindow;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width } = primaryDisplay.workAreaSize;

  const islandWidth = 500;
  const islandHeight = 260;

  islandWindow = new BrowserWindow({
    width: islandWidth,
    height: islandHeight,
    x: Math.round((width - islandWidth) / 2),
    y: 5, // Natural floating notch position (5px from top bezel)
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    resizable: false,
    focusable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  islandWindow.setAlwaysOnTop(true, "screen-saver");

  if (isDev) {
    islandWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL!}#/island`);
  } else {
    islandWindow.loadFile(path.join(__dirname, "../dist/index.html"), {
      hash: "island",
    });
  }

  islandWindow.on("closed", () => {
    islandWindow = null;
    releaseIslandLock();
  });

  return islandWindow;
}

// App lifecycle
app.whenReady().then(() => {
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

// IPC Handlers: Window Controls
ipcMain.on("window:minimize", () => {
  mainWindow?.minimize();
});

ipcMain.on("window:maximize", () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on("window:close", () => {
  mainWindow?.close();
});

// IPC Handlers: Dynamic Island (Guaranteed Single Window - Always Responsive)
ipcMain.on("island:show", (_event, routineData) => {
  // Always use the singleton window instance
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

  // Notify mainWindow that island is executing this routine
  safeSend(mainWindow, "island:status", { isBusy: true, routine: routineData });
});

ipcMain.on("island:hide", () => {
  if (islandWindow && !islandWindow.isDestroyed()) {
    islandWindow.hide();
  }
  releaseIslandLock();
});

ipcMain.on("island:resize", (_event, { width, height }) => {
  if (!islandWindow || islandWindow.isDestroyed()) return;
  const primaryDisplay = screen.getPrimaryDisplay();
  const screenWidth = primaryDisplay.workAreaSize.width;
  islandWindow.setBounds({
    x: Math.round((screenWidth - width) / 2),
    y: 5,
    width,
    height,
  });
});

// IPC Handlers: Simulation & Routine Execution
ipcMain.on("voice:simulate-wake", () => {
  const win = createIslandWindow();

  if (win && !win.isDestroyed()) {
    win.show();
    if (win.webContents.isLoading()) {
      win.webContents.once("did-finish-load", () => {
        safeSend(win, "island:activate", null);
      });
    } else {
      safeSend(win, "island:activate", null);
    }
  }
});

ipcMain.on("routine:run", async (_event, routineId: string) => {
  // Notify listeners that routine started
  const broadcast = (channel: string, data: any) => {
    mainWindow?.webContents.send(channel, data);
    islandWindow?.webContents.send(channel, data);
  };

  // Mock execution steps
  broadcast("routine:started", { routineId });
});
