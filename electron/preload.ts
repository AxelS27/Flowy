import { contextBridge, ipcRenderer } from "electron";

export interface RoutineStep {
  id: string;
  type: "audio" | "app" | "web" | "powershell" | "focus";
  title: string;
  param: string;
  proScript?: string;
  delayMs?: number;
}

export interface Routine {
  id: string;
  name: string;
  icon: string;
  color: "strawberry" | "mint" | "sunny" | "blueberry" | "grape";
  triggers: string[];
  steps: RoutineStep[];
  enabled: boolean;
  streakCount?: number;
}

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

  onIslandStatus: (callback: (status: { isBusy: boolean; routine?: Routine }) => void) => {
    const handler = (_: any, status: any) => callback(status);
    ipcRenderer.on("island:status", handler);
    return () => ipcRenderer.removeListener("island:status", handler);
  },

  // Voice Simulation & Execution
  simulateWakeWord: (routine?: Routine) => ipcRenderer.send("voice:simulate-wake", routine),
  runRoutine: (routineId: string) => ipcRenderer.send("routine:run", routineId),
  cancelRoutine: () => ipcRenderer.send("routine:cancel"),

  // Listeners
  onWakeDetected: (callback: (data: { keyword: string }) => void) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on("voice:wake-detected", handler);
    return () => ipcRenderer.removeListener("voice:wake-detected", handler);
  },
  onStepProgress: (
    callback: (data: {
      routineId: string;
      stepIndex: number;
      stepTitle: string;
      status: "running" | "completed" | "failed";
    }) => void
  ) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on("routine:step-progress", handler);
    return () => ipcRenderer.removeListener("routine:step-progress", handler);
  },
  onRoutineFinished: (
    callback: (data: { routineId: string; success: boolean }) => void
  ) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on("routine:finished", handler);
    return () => ipcRenderer.removeListener("routine:finished", handler);
  },
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);

export type ElectronAPI = typeof electronAPI;
