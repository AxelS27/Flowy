import { promises as fs } from "node:fs";
import { spawn } from "node:child_process";
import { ActionError } from "./errors";
import { checkCancelled, nativeHelperPath } from "./runtime";

export async function ensureNativeHelper(): Promise<void> {
  if (process.platform !== "win32") throw new ActionError("PLATFORM_UNSUPPORTED", "This action requires Windows.");
  try { await fs.access(nativeHelperPath()); }
  catch { throw new ActionError("NATIVE_HELPER_MISSING", "The Windows helper is missing. Run npm run build:native, then restart Flowy."); }
}

export async function nativeAction(action: string, param: string, signal: AbortSignal, secondaryParam?: string): Promise<unknown> {
  await ensureNativeHelper();
  checkCancelled(signal);
  return new Promise((resolve, reject) => {
    const child = spawn(nativeHelperPath(), [], { windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "", stderr = "", settled = false;
    const finish = (error?: Error, data?: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      if (error) reject(error); else resolve(data);
    };
    const abort = () => { child.kill(); finish(new ActionError("CANCELLED", "Routine cancelled.")); };
    const timer = setTimeout(() => {
      child.kill();
      finish(new ActionError("NATIVE_TIMEOUT", "The Windows action timed out. Check for a save dialog or an unresponsive Settings window."));
    }, 20000);
    signal.addEventListener("abort", abort, { once: true });
    child.on("error", (error) => finish(new ActionError("NATIVE_START_FAILED", error.message)));
    child.stdin.on("error", () => {});
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
      if (stdout.length > 131072) { child.kill(); finish(new ActionError("NATIVE_PROTOCOL_ERROR", "The Windows helper returned too much output.")); }
    });
    child.stderr.on("data", (chunk: string) => { stderr = (stderr + chunk).slice(-4096); });
    child.on("close", (exitCode) => {
      if (settled) return;
      try {
        const response: unknown = JSON.parse(stdout.replace(/^\uFEFF/, "").trim());
        if (!response || typeof response !== "object" || !("ok" in response)) throw new Error("Malformed helper response");
        const result = response as { ok: boolean; error?: string; code?: string; data?: unknown };
        if (!result.ok || exitCode !== 0) finish(new ActionError(result.code || "WINDOWS_ACTION_FAILED", result.error || stderr || "The Windows action failed."));
        else finish(undefined, result.data);
      } catch {
        finish(new ActionError("NATIVE_PROTOCOL_ERROR", stderr || "The Windows helper did not return a valid response."));
      }
    });
    child.stdin.end(JSON.stringify({ action, param, secondaryParam }) + "\n", "utf8");
  });
}
