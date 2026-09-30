import { app, BrowserWindow, dialog } from "electron";
import { execFile } from "node:child_process";
import path from "node:path";
import { ActionError } from "./errors";

export interface ActionContext {
  signal: AbortSignal;
  parent?: BrowserWindow;
}

export function checkCancelled(signal: AbortSignal): void {
  if (signal.aborted) throw new ActionError("CANCELLED", "Routine cancelled.");
}

export function wait(ms: number, signal: AbortSignal): Promise<void> {
  checkCancelled(signal);
  return new Promise((resolve, reject) => {
    const abort = () => { clearTimeout(timer); reject(new ActionError("CANCELLED", "Routine cancelled.")); };
    const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, ms);
    signal.addEventListener("abort", abort, { once: true });
  });
}

export async function message(context: ActionContext, text: string, confirmation = false): Promise<void> {
  checkCancelled(context.signal);
  const options: Electron.MessageBoxOptions = {
    type: confirmation ? "warning" : "info", title: confirmation ? "Flowy - Confirm action" : "Flowy",
    message: text, buttons: confirmation ? ["Cancel", "Continue"] : ["OK"],
    defaultId: 0, cancelId: 0, noLink: true, signal: context.signal,
  };
  // Parent to the visible main window, not the non-focusable Island overlay.
  const parent = context.parent;
  const result = await (parent && !parent.isDestroyed() ? dialog.showMessageBox(parent, options) : dialog.showMessageBox(options));
  checkCancelled(context.signal);
  if (confirmation && result.response !== 1) throw new ActionError("CANCELLED", "Action cancelled. Remaining blocks were not run.");
}

export function windowsExecutable(name: string): string {
  if (process.platform !== "win32") throw new ActionError("PLATFORM_UNSUPPORTED", "This action requires Windows.");
  return path.join(process.env.SystemRoot || "C:\\Windows", "System32", name);
}

export function command(executable: string, args: string[], signal: AbortSignal, input?: string, timeout = 30000): Promise<string> {
  checkCancelled(signal);
  return new Promise((resolve, reject) => {
    const child = execFile(executable, args, {
      windowsHide: true, timeout, signal, encoding: "utf8", maxBuffer: 1024 * 1024,
    }, (error, stdout, stderr) => {
      if (signal.aborted) reject(new ActionError("CANCELLED", "Routine cancelled."));
      else if (error) reject(new ActionError("COMMAND_FAILED", stderr.trim() || stdout.trim() || error.message));
      else resolve(stdout.trim());
    });
    // A missing executable may close stdin before the request can be written.
    child.stdin?.on("error", () => {});
    child.stdin?.end(input ? input + "\n" : undefined);
  });
}

export async function powershell(script: string, signal: AbortSignal): Promise<void> {
  const executable = windowsExecutable(path.join("WindowsPowerShell", "v1.0", "powershell.exe"));
  const encoded = Buffer.from(`$ErrorActionPreference = 'Stop';\n${script}\nif (!$?) { exit 1 }; if ($null -ne $LASTEXITCODE -and $LASTEXITCODE -ne 0) { exit $LASTEXITCODE }`, "utf16le").toString("base64");
  await command(executable, ["-NoProfile", "-NonInteractive", "-EncodedCommand", encoded], signal);
}

export function nativeHelperPath(): string {
  // Packagers must copy dist-electron/native into resources/native (outside ASAR).
  return app.isPackaged
    ? path.join(process.resourcesPath, "native", "Flowy.Windows.exe")
    : path.join(__dirname, "../native", "Flowy.Windows.exe");
}
