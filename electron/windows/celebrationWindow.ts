import { BrowserWindow, screen } from "electron";
import path from "node:path";
import { isDev, restrictRendererNavigation, safeSend } from "./windowManager";

let window: BrowserWindow | null = null;
let closeTimer: ReturnType<typeof setTimeout> | null = null;

export function getCelebrationWindow(): BrowserWindow | null { return window; }

export function closeCelebrationWindow(): void {
  if (closeTimer) clearTimeout(closeTimer);
  closeTimer = null;
  if (window && !window.isDestroyed()) window.close();
}

export function startCelebration(): void {
  const current = window;
  if (!current || current.isDestroyed()) return;
  const { bounds } = screen.getPrimaryDisplay();
  current.setBounds(bounds);
  current.showInactive();
  safeSend(current, "celebration:start");
  if (closeTimer) clearTimeout(closeTimer);
  // Lifetime independent of Island dismissal; never leave an invisible overlay behind.
  closeTimer = setTimeout(closeCelebrationWindow, 2800);
}

export function showCelebrationWindow(): void {
  if (window && !window.isDestroyed()) {
    if (window.isVisible()) startCelebration();
    return; // A loading renderer will signal readiness.
  }
  const current = new BrowserWindow({
    ...screen.getPrimaryDisplay().bounds,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    focusable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "../preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  window = current;
  restrictRendererNavigation(current);
  current.setAlwaysOnTop(true, "screen-saver");
  current.setIgnoreMouseEvents(true); // The entire desktop overlay is click-through.
  current.on("closed", () => {
    if (window === current) window = null;
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = null;
  });
  // Also clean up if loading hangs or fails before the readiness handshake.
  closeTimer = setTimeout(closeCelebrationWindow, 10000);
  current.webContents.once("did-fail-load", closeCelebrationWindow);
  const load = isDev
    ? current.loadURL(`${process.env.VITE_DEV_SERVER_URL!}#/celebration`)
    : current.loadFile(path.join(__dirname, "../../dist/index.html"), { hash: "celebration" });
  void load.catch(() => closeCelebrationWindow());
}
