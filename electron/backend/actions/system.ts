import { command, message, windowsExecutable } from "../runtime";
import { nativeAction } from "../native";
import { numberInRange } from "../validation";
import { ActionRegistry } from "./definition";

export const systemActions: ActionRegistry = {
  "system.lock": {
    prepare: () => {
      const executable = windowsExecutable("rundll32.exe");
      return async (context) => {
        await message(context, "Lock your computer now?", true);
        await command(executable, ["user32.dll,LockWorkStation"], context.signal);
      };
    },
  },
  "system.shutdown": power("shutdown"),
  "system.restart": power("restart"),
  "system.cancelShutdown": {
    prepare: () => {
      const executable = windowsExecutable("shutdown.exe");
      return async ({ signal }) => {
        try { await command(executable, ["/a"], signal); }
        catch (error) {
          // Windows ERROR_NO_SHUTDOWN_IN_PROGRESS (1116) means the desired state is already reached.
          if (!(error instanceof Error) || !/\b1116\b/.test(error.message)) throw error;
        }
      };
    },
  },
  // Compatibility for older saved blocks, without confusing sleep with shutdown.
  "system.sleep": {
    native: true,
    prepare: () => async (context) => {
      await message(context, "Put your computer to sleep now?", true);
      await nativeAction("system.sleep", "", context.signal);
    },
  },
  "system.displayOff": {
    native: true,
    prepare: () => async (context) => {
      await message(context, "Turn off your display now? Mouse or keyboard activity will wake it.", true);
      await nativeAction("system.displayOff", "", context.signal);
    },
  },
};

function power(mode: "shutdown" | "restart"): ActionRegistry[string] {
  return {
    prepare: (step) => {
      const executable = windowsExecutable("shutdown.exe");
      const legacy = !step.action ? /^shutdown\s+-s\s+-t\s+(\d+)$/i.exec(step.param) : null;
      const seconds = legacy ? numberInRange(legacy[1], "Countdown", 30, 86400) : 60;
      return async (context) => {
        await message(context, `${mode === "restart" ? "Restart" : "Shut down"} Windows in ${seconds} seconds? Save your work first: Windows may force apps closed when the countdown expires. Use Cancel Scheduled Shutdown to cancel.`, true);
        await command(executable, [mode === "restart" ? "/r" : "/s", "/t", String(seconds)], context.signal);
      };
    },
  };
}
