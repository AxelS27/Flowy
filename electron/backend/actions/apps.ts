import { nativeAction } from "../native";
import { message } from "../runtime";
import { localPath, text } from "../validation";
import { ActionError } from "../errors";
import { ActionRegistry } from "./definition";

export const appActions: ActionRegistry = {
  "app.open": {
    native: true,
    prepare: (step) => {
      const raw = text(step.param, "App path or name", 4096);
      const name = /^[a-z]:/i.test(raw) ? localPath(raw) : raw;
      if (!/\.exe$/i.test(name) || (!/^[a-z]:/i.test(name) && !/^[\w .-]+\.exe$/i.test(name))) {
        throw new ActionError("INVALID_PARAMETER", "Enter an .exe name or a full local executable path.");
      }
      return async ({ signal }) => { await nativeAction("app.open", name, signal); };
    },
  },
  "app.close": {
    native: true,
    prepare: (step) => {
      const name = text(step.param, "Process name", 256).replace(/\.exe$/i, "");
      if (!/^[\w .-]+$/.test(name)) throw new ActionError("INVALID_PARAMETER", "Use a process name without paths or wildcards.");
      return async (context) => {
        await message(context, `Close the windows of ${name}? Save your documents first. Background/tray processes may remain; Flowy will not force-terminate them.`, true);
        await nativeAction("app.close", name, context.signal);
      };
    },
  },
};
