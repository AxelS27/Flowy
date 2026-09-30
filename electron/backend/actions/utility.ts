import { clipboard, Notification } from "electron";
import { ActionError } from "../errors";
import { checkCancelled, message, powershell, wait } from "../runtime";
import { numberInRange, text } from "../validation";
import { ActionRegistry } from "./definition";

export const utilityActions: ActionRegistry = {
  "clipboard.copy": {
    prepare: (step) => {
      text(step.param, "Text");
      const content = step.param;
      return async () => {
        clipboard.writeText(content);
        if (clipboard.readText() !== content) throw new ActionError("CLIPBOARD_FAILED", "Another application replaced the clipboard before Flowy could verify it.");
      };
    },
  },
  "clipboard.clear": {
    prepare: () => async (context) => {
      await message(context, "Clear your clipboard contents?", true);
      clipboard.clear();
      if (clipboard.availableFormats().length) throw new ActionError("CLIPBOARD_FAILED", "Windows did not clear the clipboard.");
    },
  },
  "utility.wait": {
    prepare: (step) => {
      const ms = numberInRange(step.param, "Seconds", 0, 300) * 1000;
      return async ({ signal }) => wait(ms, signal);
    },
  },
  "utility.notification": {
    prepare: (step) => {
      const body = text(step.param, "Message", 4096);
      if (!Notification.isSupported()) throw new ActionError("NOTIFICATIONS_UNSUPPORTED", "Desktop notifications are unavailable on this system.");
      return async ({ signal }) => {
        checkCancelled(signal);
        // AUMID is configured in main.ts before the first notification.
        const notification = new Notification({ title: "Flowy", body });
        await new Promise<void>((resolve, reject) => {
          const cleanup = () => {
            clearTimeout(timer);
            signal.removeEventListener("abort", abort);
            notification.removeAllListeners("show");
            notification.removeAllListeners("failed");
          };
          const abort = () => { cleanup(); notification.close(); reject(new ActionError("CANCELLED", "Routine cancelled.")); };
          signal.addEventListener("abort", abort, { once: true });
          const timer = setTimeout(() => {
            cleanup();
            // DND may suppress display. Delivery is best-effort, not proof it was seen.
            resolve();
          }, 3000);
          notification.once("show", () => { cleanup(); resolve(); });
          notification.once("failed", (_event, error) => { cleanup(); reject(new ActionError("NOTIFICATION_FAILED", error)); });
          notification.show();
          // Keep the object alive until it is closed; Electron retains native notifications.
          notification.once("close", () => notification.removeAllListeners());
        });
      };
    },
  },
  "utility.message": {
    prepare: (step) => { const body = text(step.param, "Message", 4096); return async (context) => message(context, body); },
  },
  "utility.confirm": {
    prepare: (step) => { const body = text(step.param, "Question", 4096); return async (context) => message(context, body, true); },
  },
  "powershell.custom": {
    prepare: (step) => {
      const script = text(step.action ? step.param : step.proScript || step.param, "PowerShell script", 8000);
      return async (context) => {
        await message(context, `Run this custom PowerShell script? It can modify your computer.\n\n${script}`, true);
        await powershell(script, context.signal);
      };
    },
  },
};
