import { useEffect } from "react";

interface UseHotkeysOptions {
  onTriggerVoice?: () => void;
  enabled?: boolean;
}

export function useHotkeys({ onTriggerVoice, enabled = true }: UseHotkeysOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Space or Alt + V trigger simulated voice wake word
      if ((e.ctrlKey && e.code === "Space") || (e.altKey && e.code === "KeyV")) {
        e.preventDefault();
        onTriggerVoice?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onTriggerVoice, enabled]);
}
