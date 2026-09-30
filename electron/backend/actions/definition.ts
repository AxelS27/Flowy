import { RoutineStep } from "../../types";
import { ActionContext } from "../runtime";

export type PreparedAction = (context: ActionContext) => Promise<void>;
export interface ActionDefinition {
  prepare: (step: RoutineStep) => PreparedAction;
  native?: boolean;
  /** Temporarily disabled actions are reported as skipped, never completed. */
  skipReason?: string;
}
export type ActionRegistry = Record<string, ActionDefinition>;
