import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, CheckCircle2, Circle, Loader2, Mic, SkipForward } from "lucide-react";
import { IslandState, Routine } from "../../types";
import "./island.css";

interface IslandSurfaceProps {
  state: IslandState;
  routine?: Routine | null;
  dimensions: { width: number; height: number; borderRadius: number };
  exiting: boolean;
  standalone: boolean;
  currentStep: number;
  completedSteps: number[];
  skippedSteps: Record<number, string>;
  error: string;
  registerStep: (index: number, element: HTMLDivElement | null) => void;
  onStop: () => void;
  onDismiss: () => void;
}

/** Presentation only: changing the notch appearance never re-starts execution. */
export function IslandSurface({ state, routine, dimensions, exiting, standalone, currentStep,
  completedSteps, skippedSteps, error, registerStep, onStop, onDismiss }: IslandSurfaceProps) {
  const reducedMotion = useReducedMotion();
  const actionsFinished = !!routine?.steps.length && completedSteps.length === routine.steps.length;
  const transition = { duration: reducedMotion ? 0 : .12 };
  const contentAnimation = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition };
  return (
    <div className={`flex items-start justify-center select-none pointer-events-none ${standalone ? "w-full h-full" : "w-full"}`}>
      <motion.div role="region" aria-label="Flowy Dynamic Island" className="flowy-island"
        data-state={state} data-reduced-motion={!!reducedMotion}
        initial={{ y: -dimensions.height, opacity: 0, width: dimensions.width, height: dimensions.height,
          borderBottomLeftRadius: dimensions.borderRadius, borderBottomRightRadius: dimensions.borderRadius }}
        animate={{ y: exiting ? -dimensions.height - 16 : 0, opacity: exiting ? 0 : 1,
          width: dimensions.width, height: dimensions.height,
          borderBottomLeftRadius: dimensions.borderRadius, borderBottomRightRadius: dimensions.borderRadius }}
        transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34, mass: .65 }}
        onMouseEnter={() => { if (standalone) window.electronAPI?.setIslandInteractive(true); }}
        onMouseLeave={() => { if (standalone) window.electronAPI?.setIslandInteractive(false); }}>
        <div className="island-content">
          {state === "completed" && !reducedMotion && (
            <div className="island-success-burst" aria-hidden="true">
              {Array.from({ length: 14 }, (_, index) => {
                const angle = index / 14 * Math.PI * 2;
                const x = Math.cos(angle) * 150;
                const y = Math.sin(angle) * 28;
                return <motion.span key={index}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                  animate={{ x: [0, x * .8, x], y: [0, y * .8, y], opacity: [0, .85, 0],
                    scale: [0, 1.15, .5], rotate: [0, index % 2 ? 160 : -160] }}
                  transition={{ duration: 1.45, delay: index % 4 * .045, ease: "easeOut" }} />;
              })}
            </div>
          )}
          <AnimatePresence mode="wait" initial={false}>
            {state === "idle" && (
              <motion.div key="idle" {...contentAnimation} className="island-compact">
                <span className="island-indicator" />
                <span className="island-title island-copy">Flowy</span>
                <span className="island-caption" style={{ margin: 0 }}>Ready</span>
              </motion.div>
            )}
            {state === "listening" && (
              <motion.div key="listening" {...contentAnimation} className="island-compact">
                <div className="island-icon island-blue"><Mic size={16} /></div>
                <div className="island-copy">
                  <p className="island-title">Listening...</p>
                  <p className="island-caption">Speak your command</p>
                </div>
                <div className="island-wave" aria-hidden="true">
                  {[8, 16, 24, 12, 28, 18, 10].map((height, index) => (
                    <motion.span key={index} style={{ height }}
                      animate={reducedMotion ? undefined : { height: [height * .25, height, height * .45, height * .8, height * .25] }}
                      transition={{ duration: .65 + index * .07, repeat: Infinity, ease: "easeInOut" }} />
                  ))}
                </div>
              </motion.div>
            )}
            {state === "thinking" && (
              <motion.div key="thinking" {...contentAnimation} className="island-compact">
                <div className="island-icon island-blue"><Loader2 size={16} className="animate-spin" /></div>
                <div className="island-copy">
                  <p className="island-title">Getting things ready</p>
                  <p className="island-caption truncate">{routine?.name || "Matching your command"}</p>
                </div>
              </motion.div>
            )}
            {state === "executing" && (
              <motion.div key="executing" {...contentAnimation} className="island-executing">
                <div className="island-header">
                  <div className={`island-icon ${actionsFinished ? "island-green" : "island-blue"}`}>
                    {actionsFinished ? <CheckCircle2 size={16} /> : <Loader2 size={16} className="animate-spin" />}
                  </div>
                  <div className="island-copy">
                    <h4 className="island-title">{routine?.name || "Running routine"}</h4>
                    <p className="island-caption">{!window.electronAPI ? "Visual preview only" : actionsFinished ? "Actions finished" : "Taking care of your routine"}</p>
                  </div>
                  <span className="island-count">{completedSteps.length}/{routine?.steps.length || 0}</span>
                  {window.electronAPI && !actionsFinished && <button className="island-button" onClick={onStop}>Stop</button>}
                </div>
                <div className="island-list">
                  {(routine?.steps || []).map((step, index) => {
                    const done = completedSteps.includes(index);
                    const skipReason = skippedSteps[index];
                    const current = currentStep === index && !done;
                    const status = skipReason ? "skipped" : done ? "completed" : current ? "running" : "queued";
                    return (
                      <div key={step.id} ref={(element) => registerStep(index, element)} className="island-step" data-status={status}>
                        {skipReason ? <SkipForward size={14} className="island-amber flex-shrink-0" /> :
                          done ? <CheckCircle2 size={14} className="island-green flex-shrink-0" /> :
                          current ? <Loader2 size={14} className="island-blue animate-spin flex-shrink-0" /> :
                          <Circle size={12} className="flex-shrink-0" />}
                        <span className="island-step-name" title={step.title}>{step.title}</span>
                        <span title={skipReason} className={`island-step-status ${skipReason ? "island-amber" : done ? "island-green" : ""}`}>
                          {skipReason ? "Skipped" : done ? "Done" : current ? "Running" : "Queued"}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="island-track" role="progressbar" aria-label="Routine progress" aria-valuemin={0}
                  aria-valuemax={routine?.steps.length || 1} aria-valuenow={completedSteps.length}>
                  <motion.div animate={{ width: `${completedSteps.length / (routine?.steps.length || 1) * 100}%` }}
                    transition={{ duration: reducedMotion ? 0 : .2 }} />
                </div>
              </motion.div>
            )}
            {state === "failed" && (
              <motion.div key="failed" {...contentAnimation} role="alert" className="island-error">
                <div className="island-header"><AlertCircle size={16} className="island-red" /><p className="island-title">Routine stopped</p></div>
                <p className="island-caption">{error}</p>
                <button className="island-button" onClick={onDismiss}>Dismiss</button>
              </motion.div>
            )}
            {state === "completed" && (
              <motion.div key="completed" {...contentAnimation} className="island-compact" role="status">
                <div className="island-icon island-green island-success-icon"><CheckCircle2 size={18} /></div>
                <div className="island-copy">
                  <p className="island-title">{window.electronAPI ? "Routine Completed!" : "Preview Completed"}</p>
                  <p className="island-caption">{Object.keys(skippedSteps).length ? "Finished. Do not disturb was skipped." : routine?.name || "Everything is ready."}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
