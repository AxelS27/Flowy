export type RoutineCategory = "work" | "gaming" | "study" | "chill" | "system";
export type RoutineColor = "strawberry" | "mint" | "sunny" | "blueberry" | "grape";
export type ActionType = "audio" | "app" | "web" | "powershell" | "focus" | "file" | "clipboard" | "utility" | "system";

export interface RoutineStep {
  id: string;
  type: ActionType;
  title: string;
  subtitle?: string;
  param: string;
  /** Stable action identifier. Older routines are resolved by type/title. */
  action?: string;
  secondaryParam?: string;
  proScript?: string;
  delayMs?: number;
}

export interface Routine {
  id: string;
  name: string;
  category?: RoutineCategory;
  icon: string;
  color: RoutineColor;
  description?: string;
  triggers: string[];
  steps: RoutineStep[];
  enabled: boolean;
  streakCount?: number;
  lastRun?: string;
}
