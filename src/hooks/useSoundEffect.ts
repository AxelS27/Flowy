import { useState, useCallback } from "react";
import { sound } from "../utils/soundEffects";

export function useSoundEffect() {
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());

  const toggleMute = useCallback(() => {
    const nextState = !sound.getMuted();
    sound.setMuted(nextState);
    setIsMuted(nextState);
  }, []);

  const playSound = useCallback((effect: keyof typeof sound) => {
    const fn = sound[effect];
    if (typeof fn === "function") {
      (fn as () => void)();
    }
  }, []);

  return {
    isMuted,
    toggleMute,
    playSound,
  };
}
