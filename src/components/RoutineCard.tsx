import { FC } from "react";
import { motion } from "framer-motion";
import { Play, Flame, Sliders, Trash2 } from "lucide-react";
import { Routine } from "../data/mockRoutines";
import { PushButton } from "./PushButton";

interface RoutineCardProps {
  routine: Routine;
  onEdit: (routine: Routine) => void;
  onTestRun: (routine: Routine) => void;
  onToggleEnabled: (id: string) => void;
  onDelete: (id: string) => void;
  isRunning?: boolean;
}

const colorBorders: Record<string, { bg: string; border: string; text: string; light: string }> = {
  strawberry: {
    bg: "bg-strawberry",
    border: "border-strawberry-dark",
    text: "text-strawberry",
    light: "bg-strawberry-light",
  },
  mint: {
    bg: "bg-mint",
    border: "border-mint-dark",
    text: "text-mint-dark",
    light: "bg-mint-light",
  },
  sunny: {
    bg: "bg-sunny",
    border: "border-sunny-dark",
    text: "text-amber-600",
    light: "bg-sunny-light",
  },
  blueberry: {
    bg: "bg-blueberry",
    border: "border-blueberry-dark",
    text: "text-blueberry-dark",
    light: "bg-blueberry-light",
  },
  grape: {
    bg: "bg-grape",
    border: "border-grape-dark",
    text: "text-grape-dark",
    light: "bg-grape-light",
  },
};

export const RoutineCard: FC<RoutineCardProps> = ({
  routine,
  onEdit,
  onTestRun,
  onToggleEnabled,
  onDelete,
  isRunning = false,
}) => {
  const theme = colorBorders[routine.color] || colorBorders.mint;

  return (
    <motion.div
      layout="position"
      whileHover={{ y: -3 }}
      animate={{
        opacity: routine.enabled ? 1 : 0.6,
        filter: routine.enabled ? "grayscale(0%)" : "grayscale(35%)",
      }}
      transition={{
        layout: { type: "spring", stiffness: 220, damping: 26, mass: 0.9 },
        opacity: { duration: 0.2 },
        filter: { duration: 0.2 },
      }}
      className="relative rounded-3xl p-5 bg-cream-card border-2 border-cream-border shadow-tactile-card flex flex-col justify-between"
    >
      {/* Top Row: Icon, Title, Streak & Toggle */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 ${theme.light} ${theme.border} shadow-sm`}
            >
              {routine.icon}
            </div>

            <div>
              <h3 className="font-black text-ink text-base leading-tight">
                {routine.name}
              </h3>
              <p className="text-xs font-bold text-ink-muted">
                {routine.steps.length} Steps
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {routine.streakCount > 0 && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-black text-amber-600 bg-sunny-light px-2 py-0.5 rounded-full border border-sunny-dark"
                title={`${routine.streakCount} day automation streak!`}
              >
                <Flame size={12} className="text-amber-500 fill-amber-500" />
                {routine.streakCount}
              </span>
            )}

            {/* Toggle switch */}
            <button
              onClick={() => onToggleEnabled(routine.id)}
              className={`w-11 h-6 rounded-full transition-colors relative border-2 ${
                routine.enabled
                  ? "bg-mint border-mint-dark"
                  : "bg-cream-dark border-cream-border"
              }`}
              title={routine.enabled ? "Routine enabled" : "Routine paused"}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                  routine.enabled ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Voice Trigger Tags (Clean & to the point) */}
        <div className="mb-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-ink-muted block mb-1">
            🎙️ Say:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {routine.triggers.slice(0, 3).map((trigger, idx) => (
              <span
                key={idx}
                className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-xl bg-cream border border-cream-border text-ink"
              >
                "{trigger}"
              </span>
            ))}
            {routine.triggers.length > 3 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-xl bg-cream text-ink-muted">
                +{routine.triggers.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-2.5 border-t-2 border-dashed border-cream-border mt-1">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(routine)}
            className="px-3 py-1.5 rounded-xl text-xs font-black text-ink-muted hover:text-ink hover:bg-cream border border-cream-border flex items-center gap-1.5 transition-all active:scale-95"
            title="Edit routine"
          >
            <Sliders size={13} />
            <span>Edit</span>
          </button>

          <button
            onClick={() => onDelete(routine.id)}
            className="p-1.5 rounded-xl text-xs font-black text-ink-muted hover:text-strawberry hover:bg-strawberry-light border border-cream-border hover:border-strawberry-dark flex items-center justify-center transition-all active:scale-95"
            title="Remove routine"
          >
            <Trash2 size={13} />
          </button>
        </div>

        <PushButton
          variant={isRunning ? "strawberry" : "sunny"}
          size="sm"
          icon={<Play size={12} className={isRunning ? "animate-spin" : ""} />}
          onClick={() => onTestRun(routine)}
          disabled={!routine.enabled}
        >
          {isRunning ? "Running..." : "Run"}
        </PushButton>
      </div>
    </motion.div>
  );
};
