import { nativeAction } from "../native";
import { numberInRange, option } from "../validation";
import { ActionRegistry } from "./definition";

export const audioActions: ActionRegistry = {
  "audio.volume": {
    native: true,
    prepare: (step) => {
      const level = numberInRange(step.param, "Volume", 0, 100);
      return async ({ signal }) => { await nativeAction("audio.volume", String(level), signal); };
    },
  },
  "audio.mute": {
    native: true,
    prepare: (step) => {
      const mode = option(step.param, ["mute_mic", "unmute_mic", "mute_audio", "unmute_audio"], "mute action");
      return async ({ signal }) => { await nativeAction("audio.mute", mode, signal); };
    },
  },
  "focus.mode": {
    // Keep saved routines compatible without opening Settings or changing DND.
    skipReason: "Do not disturb is temporarily unavailable. This block was skipped; the routine continues.",
    prepare: () => async () => {},
  },
};
