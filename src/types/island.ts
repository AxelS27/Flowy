export type IslandState = "idle" | "listening" | "thinking" | "executing" | "completed";

export interface IslandDimensions {
  width: number;
  height: number;
  borderRadius: number;
}
