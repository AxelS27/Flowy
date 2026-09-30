import { audioActions } from "./audio";
import { appActions } from "./apps";
import { fileActions } from "./files";
import { webActions } from "./web";
import { utilityActions } from "./utility";
import { systemActions } from "./system";
import { ActionRegistry } from "./definition";

export const actionRegistry: ActionRegistry = Object.freeze({
  ...audioActions, ...appActions, ...fileActions, ...webActions, ...utilityActions, ...systemActions,
});
