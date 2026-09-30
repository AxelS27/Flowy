import { ActionType } from "../types/routine";

export interface PaletteBlock {
  action: string;
  type: ActionType;
  category: ActionType;
  title: string;
  subtitle: string;
  defaultParam: string;
  paramLabel?: string;
  placeholder?: string;
  secondaryLabel?: string;
  defaultSecondaryParam?: string;
  noParam?: boolean;
  defaultScript?: string;
  available?: boolean;
}

const block = (action: string, type: ActionType, title: string, subtitle: string,
  defaultParam = "", options: Partial<PaletteBlock> = {}): PaletteBlock =>
  ({ action, type, category: type, title, subtitle, defaultParam, ...options });

export const PALETTE_BLOCKS: PaletteBlock[] = [
  block("audio.volume", "audio", "Set Volume", "Set the default speaker volume", "30", { paramLabel: "Volume (%)" }),
  block("audio.mute", "audio", "Mute or Unmute", "Mute your default microphone or speaker", "mute_mic", { paramLabel: "Mute action" }),
  block("app.open", "app", "Launch App", "Open an app or executable", "notepad.exe", { paramLabel: "App path or name" }),
  block("app.close", "app", "Close App", "Close app windows without force-terminating", "notepad", { paramLabel: "Process name (without .exe)" }),
  block("web.open", "web", "Open Website", "Open a link in your default browser", "https://github.com", { paramLabel: "Website URL" }),
  block("web.multiple", "web", "Open Multiple Websites", "One URL per line", "https://github.com\nhttps://notion.so", { paramLabel: "Website URLs" }),
  block("web.search", "web", "Search Web", "Search using Google", "", { paramLabel: "Search text", placeholder: "What do you want to find?" }),
  block("focus.mode", "focus", "Focus Assist", "Temporarily unavailable - skipped when running", "PriorityOnly", { paramLabel: "Focus mode" }),
  block("file.open", "file", "Open File", "Open with its default application", "", { paramLabel: "File path" }),
  block("folder.open", "file", "Open Folder", "Open in File Explorer", "", { paramLabel: "Folder path" }),
  block("folder.create", "file", "Create Folder", "Create a folder and missing parent folders", "", { paramLabel: "New folder path" }),
  block("file.delete", "file", "Delete File", "Confirm, then move to Recycle Bin", "", { paramLabel: "File path" }),
  block("folder.delete", "file", "Delete Folder", "Confirm, then move to Recycle Bin", "", { paramLabel: "Folder path" }),
  block("path.rename", "file", "Rename File / Folder", "Change the name without overwriting", "", { paramLabel: "Current path", secondaryLabel: "New name (not a path)" }),
  block("path.copy", "file", "Copy File / Folder", "Copy to a new path without overwriting", "", { paramLabel: "Source path", secondaryLabel: "Full destination path" }),
  block("path.move", "file", "Move File / Folder", "Move to a new local path, including another drive", "", { paramLabel: "Source path", secondaryLabel: "Full destination path" }),
  block("clipboard.copy", "clipboard", "Copy Text to Clipboard", "Put reusable text on your clipboard", "", { paramLabel: "Text" }),
  block("clipboard.clear", "clipboard", "Clear Clipboard", "Confirm before clearing clipboard contents", "", { noParam: true }),
  block("utility.wait", "utility", "Wait", "Pause before the next block", "1", { paramLabel: "Seconds (0 to 300)" }),
  block("utility.notification", "utility", "Show Notification", "Send a Windows desktop notification", "Workspace ready!", { paramLabel: "Message" }),
  block("utility.message", "utility", "Show Message", "Show a message until you dismiss it", "Workspace ready!", { paramLabel: "Message" }),
  block("utility.confirm", "utility", "Ask for Confirmation", "Continue only when you choose Continue", "Ready to continue?", { paramLabel: "Question" }),
  block("system.lock", "system", "Lock Computer", "Confirm before locking Windows", "", { noParam: true }),
  block("system.shutdown", "system", "Shutdown Computer", "Confirm, then schedule a 60-second countdown", "", { noParam: true }),
  block("system.restart", "system", "Restart Computer", "Confirm, then schedule a 60-second countdown", "", { noParam: true }),
  block("system.cancelShutdown", "system", "Cancel Scheduled Shutdown", "Cancel a pending Windows shutdown / restart", "", { noParam: true }),
  block("powershell.custom", "powershell", "PowerShell Script", "Advanced: confirm before running custom code", "Write-Output 'Flowy script executed successfully'", { paramLabel: "PowerShell script" }),
];
