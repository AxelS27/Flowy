import { useState, useEffect, useRef } from "react";
import { DynamicIsland } from "../components";
import { Routine, IslandState } from "../types";

export function IslandOverlayView() {
  const [islandState, setIslandState] = useState<IslandState>("idle");
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);

  const activateTimer1 = useRef<NodeJS.Timeout | null>(null);
  const activateTimer2 = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const api = window.electronAPI;
    if (!api) return;

    // Listen to activate events specifically targeted at this floating overlay
    const cleanupActivate = api.onIslandActivate?.((incomingRoutine: Routine | null) => {
      setActiveRoutine(incomingRoutine);
      setIslandState("listening");

      if (activateTimer1.current) clearTimeout(activateTimer1.current);
      if (activateTimer2.current) clearTimeout(activateTimer2.current);

      activateTimer1.current = setTimeout(() => setIslandState("thinking"), 1400);
      activateTimer2.current = setTimeout(() => setIslandState("executing"), 2500);
    });

    return () => {
      cleanupActivate?.();
      if (activateTimer1.current) clearTimeout(activateTimer1.current);
      if (activateTimer2.current) clearTimeout(activateTimer2.current);
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-transparent flex items-start justify-center pt-0 select-none overflow-hidden">
      <DynamicIsland
        activeRoutine={activeRoutine}
        state={islandState}
        onStateChange={(s) => {
          setIslandState(s);
          if (s === "idle") {
            window.electronAPI?.hideIsland?.();
          }
        }}
        isStandaloneWindow={true}
      />
    </div>
  );
}
