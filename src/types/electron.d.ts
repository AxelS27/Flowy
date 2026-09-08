import { Routine } from "./routine";

export interface StepProgressData {
  routineId: string;
  stepIndex: number;
  stepTitle: string;
  status: "running" | "completed" | "failed";
}

export interface RoutineFinishedData {
  routineId: string;
  success: boolean;
}

export interface IslandStatusData {
  isBusy: boolean;
  routine?: Routine;
}

export interface ElectronAPI {
  // Window management
  minimize: () => void;
  maximize: () => void;
  close: () => void;

  // Dynamic Island
  showIsland: (routine?: Routine) => void;
  hideIsland: () => void;
  resizeIsland: (width: number, height: number) => void;
  onIslandActivate: (callback: (routine: Routine | null) => void) => () => void;
  onIslandStatus: (callback: (status: IslandStatusData) => void) => () => void;

  // Voice Simulation & Execution
  simulateWakeWord: (routine?: Routine) => void;
  runRoutine: (routineId: string) => void;
  cancelRoutine: () => void;

  // Listeners
  onWakeDetected: (callback: (data: { keyword: string }) => void) => () => void;
  onStepProgress: (callback: (data: StepProgressData) => void) => () => void;
  onRoutineFinished: (callback: (data: RoutineFinishedData) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
