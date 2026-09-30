// Compatibility facade. New execution is owned by backend/engine.ts.
import { RoutineStep } from "./types";
import { actionRegistry } from "./backend/actions";
import { ensureNativeHelper } from "./backend/native";
import { checkCancelled } from "./backend/runtime";
import { normalizeStep, resolveAction } from "./backend/validation";
import { ActionError } from "./backend/errors";

export { resolveAction, localPath, website } from "./backend/validation";
export { wait } from "./backend/runtime";

export async function executeStep(step: RoutineStep, signal: AbortSignal): Promise<void> {
  const normalized = normalizeStep(step);
  const id = resolveAction(normalized);
  if (!Object.hasOwn(actionRegistry, id)) throw new ActionError("UNKNOWN_ACTION", `Unknown action: ${id}.`);
  const definition = actionRegistry[id];
  const execute = definition.prepare(normalized);
  if (definition.native) await ensureNativeHelper();
  checkCancelled(signal);
  await execute({ signal });
}
