import { shell } from "electron";
import { checkCancelled } from "../runtime";
import { text, website } from "../validation";
import { ActionError } from "../errors";
import { ActionRegistry } from "./definition";

export const webActions: ActionRegistry = {
  "web.open": {
    prepare: (step) => {
      const url = website(step.param);
      return async ({ signal }) => { checkCancelled(signal); await shell.openExternal(url); };
    },
  },
  "web.multiple": {
    prepare: (step) => {
      const urls = step.param.split(/\r?\n/).filter((line) => line.trim()).map(website);
      if (!urls.length || urls.length > 20) throw new ActionError("INVALID_PARAMETER", "Enter 1 to 20 website URLs, one per line.");
      return async ({ signal }) => {
        for (const url of urls) { checkCancelled(signal); await shell.openExternal(url); }
      };
    },
  },
  "web.search": {
    prepare: (step) => {
      const query = text(step.param, "Search text", 2048);
      return async ({ signal }) => { checkCancelled(signal); await shell.openExternal(`https://www.google.com/search?q=${encodeURIComponent(query)}`); };
    },
  },
};
