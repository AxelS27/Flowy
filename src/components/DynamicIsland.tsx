import { FC, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Sparkles, CheckCircle2, Loader2, Play } from "lucide-react";
import { Routine, RoutineStep } from "../data/mockRoutines";
import { sound } from "../utils/soundEffects";
import { fireCelebrationConfetti } from "../utils/confetti";

export type IslandState = "idle" | "listening" | "thinking" | "executing" | "completed";

interface DynamicIslandProps {
  activeRoutine?: Routine | null;
  state?: IslandState;
  onStateChange?: (state: IslandState) => void;
  isStandaloneWindow?: boolean;
}

const stateDimensions: Record<
  IslandState,
  { width: number; height: number; borderRadius: number }
> = {
  idle: { width: 220, height: 38, borderRadius: 20 },
  listening: { width: 280, height: 46, borderRadius: 23 },
  thinking: { width: 310, height: 46, borderRadius: 23 },
  executing: { width: 400, height: 180, borderRadius: 28 },
  completed: { width: 325, height: 48, borderRadius: 24 },
};

export const DynamicIsland: FC<DynamicIslandProps> = ({
  activeRoutine,
  state: externalState,
  onStateChange,
  isStandaloneWindow = false,
}) => {
  const [internalState, setInternalState] = useState<IslandState>(externalState || "idle");
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Timer references for robust cleanup and serialization
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const finishTimerRef = useRef<NodeJS.Timeout | null>(null);
  const exitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const celebrationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll references for auto-scrolling checklist items
  const listRef = useRef<HTMLDivElement | null>(null);
  const stepItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const state = externalState !== undefined ? externalState : internalState;

  const setState = (s: IslandState) => {
    setInternalState(s);
    onStateChange?.(s);
  };

  // Clear all pending timeouts
  const clearAllTimers = () => {
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
    stepTimerRef.current = null;
    finishTimerRef.current = null;
    exitTimerRef.current = null;
    celebrationTimerRef.current = null;
  };

  // Reset state and timers on unmount
  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  // Reset exiting state whenever active state changes
  useEffect(() => {
    if (state !== "idle") {
      setIsExiting(false);
    }
  }, [state]);

  // Whenever activeRoutine changes, reset step index and clear timers cleanly
  const prevRoutineIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (activeRoutine && activeRoutine.id !== prevRoutineIdRef.current) {
      prevRoutineIdRef.current = activeRoutine.id;
      setCurrentStepIndex(0);
      setCompletedSteps([]);
      clearAllTimers();
    }
  }, [activeRoutine]);

  // Sound effects & state lifecycle
  useEffect(() => {
    clearAllTimers();

    if (state === "listening") {
      sound.playWakeChime();
      setCurrentStepIndex(0);
      setCompletedSteps([]);
    } else if (state === "executing") {
      setCurrentStepIndex(0);
      setCompletedSteps([]);
    } else if (state === "completed") {
      sound.playFanfare();
      fireCelebrationConfetti();

      celebrationTimerRef.current = setTimeout(() => {
        setIsExiting(true);
        exitTimerRef.current = setTimeout(() => {
          setState("idle");
        }, 360);
      }, 1800);
    }

    return () => {
      if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, [state]);

  // Automated step progression when in "executing" mode (serialized)
  useEffect(() => {
    if (state !== "executing" || !activeRoutine) return;

    if (currentStepIndex < activeRoutine.steps.length) {
      stepTimerRef.current = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, currentStepIndex]);
        sound.playMarimba(currentStepIndex);
        setCurrentStepIndex((prev) => prev + 1);
      }, 650);

      return () => {
        if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      };
    } else {
      finishTimerRef.current = setTimeout(() => {
        setState("completed");
      }, 450);

      return () => {
        if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
      };
    }
  }, [state, currentStepIndex, activeRoutine]);

  // Auto-scroll list to keep active running step visible
  useEffect(() => {
    if (state === "executing" && stepItemRefs.current[currentStepIndex]) {
      stepItemRefs.current[currentStepIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [currentStepIndex, state]);

  // Dynamic island height based on routine steps count
  const getExecutingHeight = () => {
    const stepCount = activeRoutine?.steps.length || 0;
    if (stepCount <= 1) return 150;
    if (stepCount === 2) return 180;
    if (stepCount === 3) return 210;
    return 235; // optimal height for 4+ steps with scrolling
  };

  const currentDim = {
    ...stateDimensions[state],
    height: state === "executing" ? getExecutingHeight() : stateDimensions[state].height,
  };

  return (
    <div
      className={`flex items-start justify-center select-none ${
        isStandaloneWindow ? "w-full h-full pt-0" : "w-full my-1"
      }`}
    >
      <motion.div
        initial={{ y: -70, opacity: 0, scale: 0.8 }}
        animate={{
          y: isExiting ? -70 : 0,
          opacity: isExiting ? 0 : 1,
          scale: isExiting ? 0.8 : 1,
          width: currentDim.width,
          height: currentDim.height,
          borderRadius: currentDim.borderRadius,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
          mass: 0.75,
        }}
        className="relative bg-slate-900 text-white border-2 border-slate-700/80 shadow-tactile-island overflow-hidden flex flex-col items-center justify-center cursor-pointer select-none"
        onClick={() => {
          if (state === "idle") {
            setIsExiting(false);
            setState("listening");
            setTimeout(() => setState("thinking"), 1600);
            setTimeout(() => setState("executing"), 2600);
          }
        }}
        title="Dynamic Island: Click to test sequence"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {/* STATE: IDLE */}
          {state === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92, position: "absolute" }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="flex items-center gap-2.5 px-4 py-1.5 whitespace-nowrap"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-mint animate-pulse" />
              <span className="text-xs font-black tracking-wide text-slate-300">
                Flowy Island
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                Standby
              </span>
            </motion.div>
          )}

          {/* STATE: LISTENING */}
          {state === "listening" && (
            <motion.div
              key="listening"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92, position: "absolute" }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="flex items-center justify-between w-full px-4 py-1.5"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-strawberry flex items-center justify-center text-white shadow-sm">
                  <Mic size={15} className="animate-pulse" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-white leading-tight">Listening...</p>
                  <p className="text-[10px] font-bold text-slate-400">Speak your command</p>
                </div>
              </div>

              {/* Animated sound bars */}
              <div className="flex items-center gap-1">
                {[12, 22, 16, 26, 14].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [h * 0.4, h, h * 0.3] }}
                    transition={{
                      duration: 0.5 + i * 0.1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-1 bg-strawberry rounded-full"
                    style={{ height: h }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* STATE: THINKING */}
          {state === "thinking" && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92, position: "absolute" }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="flex items-center gap-2.5 px-4 py-1.5 whitespace-nowrap"
            >
              <Sparkles size={16} className="text-sunny animate-spin" />
              <span className="text-xs font-black text-white">
                Matching: <span className="text-sunny font-mono">"{activeRoutine?.triggers[0] || 'Mulai kerja'}"</span>
              </span>
            </motion.div>
          )}

          {/* STATE: EXECUTING CHECKLIST */}
          {state === "executing" && (
            <motion.div
              key="executing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, position: "absolute" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full p-4 flex flex-col justify-between h-full"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-1.5 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-base">{activeRoutine?.icon || "⚡"}</span>
                  <h4 className="text-xs font-black text-white truncate max-w-[200px]">
                    {activeRoutine?.name || "Running Routine"}
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-mint bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                  {completedSteps.length} / {activeRoutine?.steps.length || 0}
                </span>
              </div>

              {/* Scrollable Checklist Items: All steps rendered with auto-scroll! */}
              <div
                ref={listRef}
                className="flex-1 flex flex-col gap-1.5 overflow-y-auto pr-1 my-1 max-h-[135px] scroll-smooth"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#334155 transparent",
                }}
              >
                {(activeRoutine?.steps || []).map((step: RoutineStep, idx: number) => {
                  const isDone = completedSteps.includes(idx);
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <motion.div
                      key={step.id}
                      ref={(el) => (stepItemRefs.current[idx] = el)}
                      layout
                      className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl border flex-shrink-0 transition-all ${
                        isDone
                          ? "bg-slate-800/80 border-mint/40 text-slate-200"
                          : isCurrent
                          ? "bg-slate-800 border-sunny text-white font-bold ring-1 ring-sunny/30"
                          : "bg-slate-900/40 border-slate-800 text-slate-500"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isDone ? (
                          <CheckCircle2 size={14} className="text-mint flex-shrink-0" />
                        ) : isCurrent ? (
                          <Loader2 size={14} className="text-sunny animate-spin flex-shrink-0" />
                        ) : (
                          <Play size={12} className="text-slate-600 flex-shrink-0" />
                        )}
                        <span className="truncate">{step.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">
                        {isDone ? "Done" : isCurrent ? "Active" : "Queued"}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom status bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5 flex-shrink-0">
                <motion.div
                  className="bg-mint h-full rounded-full"
                  initial={{ width: "0%" }}
                  animate={{
                    width: `${
                      ((completedSteps.length) /
                        (activeRoutine?.steps.length || 1)) *
                      100
                    }%`,
                  }}
                  transition={{ ease: "easeOut", duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}

          {/* STATE: COMPLETED */}
          {state === "completed" && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92, position: "absolute" }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="flex items-center gap-2.5 px-4 py-1.5 text-mint whitespace-nowrap"
            >
              <CheckCircle2 size={18} className="text-mint animate-bounce" />
              <div className="text-left">
                <p className="text-xs font-black text-white">Routine Completed! 🎉</p>
                <p className="text-[10px] font-bold text-slate-400">Workspace is ready!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
