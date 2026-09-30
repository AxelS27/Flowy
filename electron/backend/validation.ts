import path from "node:path";
import { RoutineStep } from "../types";
import { ActionError } from "./errors";

export function text(value: unknown, label: string, maximum = 32768): string {
  if (typeof value !== "string" || !value.trim()) throw new ActionError("INVALID_PARAMETER", `${label} is required.`);
  if (value.length > maximum || /[\0]/.test(value)) throw new ActionError("INVALID_PARAMETER", `${label} is invalid or too long.`);
  return value.trim();
}

export function localPath(value: unknown): string {
  const input = text(value, "Path");
  if (!/^[a-z]:[\\/]/i.test(input) || input.startsWith("\\\\") || input.includes(":") && input.slice(2).includes(":")) {
    throw new ActionError("INVALID_PATH", "Use an absolute local path, for example C:\\Users\\you\\Documents\\Notes. Network and device paths are not supported.");
  }
  const normalized = path.win32.normalize(input);
  const parts = normalized.slice(3).split(/[\\/]/).filter(Boolean);
  if (parts.some((part) => /[<>"|?*\x00-\x1f]/.test(part) || /[. ]$/.test(part) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i.test(part))) {
    throw new ActionError("INVALID_PATH", "The path contains an invalid or reserved Windows name.");
  }
  return normalized;
}

export function newName(value: unknown): string {
  const name = text(value, "New name", 255);
  if (/[<>:"/\\|?*\x00-\x1f]/.test(name) || /[. ]$/.test(name) || name === "." || name === ".." ||
    /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i.test(name)) {
    throw new ActionError("INVALID_PARAMETER", "Enter a valid Windows file or folder name, not a path.");
  }
  return name;
}

export function website(value: unknown): string {
  const input = text(value, "Website URL", 8192);
  let url: URL;
  try { url = new URL(input); } catch { throw new ActionError("INVALID_URL", "Enter a complete website URL beginning with https:// or http://."); }
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) {
    throw new ActionError("INVALID_URL", "Use an HTTP/HTTPS website without embedded credentials.");
  }
  return url.href;
}

export function numberInRange(value: unknown, label: string, minimum: number, maximum: number): number {
  const parsed = Number(text(value, label));
  if (!Number.isFinite(parsed) || parsed < minimum || parsed > maximum) {
    throw new ActionError("INVALID_PARAMETER", `${label} must be between ${minimum} and ${maximum}.`);
  }
  return parsed;
}

export function option(value: string, allowed: readonly string[], label: string): string {
  if (!allowed.includes(value)) throw new ActionError("INVALID_PARAMETER", `Choose a valid ${label}.`);
  return value;
}

export function resolveAction(step: RoutineStep): string {
  if (step.action) return step.action;
  // Explicit compatibility mapping. Never interpret arbitrary legacy sample scripts.
  if (step.type === "audio") return /^(un)?mute_(mic|audio)$/.test(step.param) ? "audio.mute" : "audio.volume";
  if (step.type === "focus") return "focus.mode";
  if (step.type === "web") return "web.open";
  if (step.type === "app") return /close/i.test(step.title) ? "app.close" : "app.open";
  if (step.type === "powershell") {
    if (step.param === "lock") return "system.lock";
    if (step.param === "sleep") return "system.sleep";
    if (step.param === "display_off") return "system.displayOff";
    if (/^shutdown\s+-s\s+-t\s+\d+$/i.test(step.param)) return "system.shutdown";
    return "powershell.custom";
  }
  throw new ActionError("UNKNOWN_ACTION", `Unrecognized legacy block: ${step.title}.`);
}

export function normalizeStep(value: unknown): RoutineStep {
  if (!value || typeof value !== "object") throw new ActionError("INVALID_BLOCK", "Invalid routine block.");
  const step = value as Record<string, unknown>;
  const types = ["audio", "app", "web", "powershell", "focus", "file", "clipboard", "utility", "system"];
  if (typeof step.type !== "string" || !types.includes(step.type) || typeof step.param !== "string" ||
    step.param.length > 32768 || step.param.includes("\0")) throw new ActionError("INVALID_BLOCK", "Invalid block type or parameter.");
  const delay = step.delayMs ?? 0;
  if (typeof delay !== "number" || !Number.isFinite(delay) || delay < 0 || delay > 300000) {
    throw new ActionError("INVALID_BLOCK", "Execution delay must be between 0 and 300000 ms.");
  }
  const result: RoutineStep = {
    id: text(step.id, "Block ID", 128), title: text(step.title, "Block title", 256),
    type: step.type as RoutineStep["type"], param: step.param, delayMs: delay,
  };
  if (step.action !== undefined) result.action = text(step.action, "Action ID", 128);
  if (step.secondaryParam !== undefined) {
    if (typeof step.secondaryParam !== "string" || step.secondaryParam.length > 32768 || step.secondaryParam.includes("\0")) throw new ActionError("INVALID_BLOCK", "Invalid secondary parameter.");
    result.secondaryParam = step.secondaryParam;
  }
  if (step.proScript !== undefined) {
    if (typeof step.proScript !== "string" || step.proScript.length > 32768 || step.proScript.includes("\0")) throw new ActionError("INVALID_BLOCK", "Invalid legacy script.");
    result.proScript = step.proScript;
  }
  return result;
}
