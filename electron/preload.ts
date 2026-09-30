import { contextBridge, ipcRenderer } from "electron";
import { Routine, IslandStatusData, RoutineStep } from "./types";

export type { Routine, RoutineStep, IslandStatusData };

const electronAPI = {
  // Window management
  minimize: () => ipcRenderer.send("window:minimize"),
  maximize: () => ipcRenderer.send("window:maximize"),
  close: () => ipcRenderer.send("window:close"),

  // Dynamic Island
  showIsland: (routine?: Routine) => ipcRenderer.send("island:show", routine),
  hideIsland: () => ipcRenderer.send("island:hide"),
  resizeIsland: (width: number, height: number) =>
    ipcRenderer.send("island:resize", { width, height }),

  onIslandActivate: (callback: (routine: Routine | null) => void) => {
    const handler = (_: any, routine: any) => callback(routine);
    ipcRenderer.on("island:activate", handler);
    return () => ipcRenderer.removeListener("island:activate", handler);
  },

  onIslandStatus: (callback: (status: IslandStatusData) => void) => {
    const handler = (_: any, status: any) => callback(status);
    ipcRenderer.on("island:status", handler);
    return () => ipcRenderer.removeListener("island:status", handler);
  },

  // Voice Simulation & Execution
  simulateWakeWord: (routine?: Routine) => ipcRenderer.send("voice:simulate-wake", routine),
  executeRoutine: (routine: { id: string; steps: RoutineStep[]; runId?: string }): Promise<{ success: boolean; runId: string; error?: string; code?: string; stepIndex?: number }> =>
    ipcRenderer.invoke("routine:execute", routine),
  cancelRoutine: (runId?: string) => ipcRenderer.send("routine:cancel", runId),

  // Listeners
  onWakeDetected: (callback: (data: { keyword: string }) => void) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on("voice:wake-detected", handler);
    return () => ipcRenderer.removeListener("voice:wake-detected", handler);
  },
  onStepProgress: (
    callback: (data: {
      routineId: string;
      runId: string;
      error?: string;
      stepIndex: number;
      stepTitle: string;
      status: "running" | "completed" | "failed" | "skipped";
  note?: string;
    }) => void
  ) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on("routine:step-progress", handler);
    return () => ipcRenderer.removeListener("routine:step-progress", handler);
  },
  onRoutineFinished: (
    callback: (data: { routineId: string; runId: string; success: boolean; error?: string; code?: string }) => void
  ) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on("routine:finished", handler);
    return () => ipcRenderer.removeListener("routine:finished", handler);
  },
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);

export type ElectronAPI = typeof electronAPI;
