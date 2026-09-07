import { FC, useState } from "react";
import { motion } from "framer-motion";
import { sound } from "../utils/soundEffects";
import { fireStarBurst } from "../utils/confetti";

export type MascotState = "idle" | "listening" | "thinking" | "tinkering" | "celebrating";

interface FlowyMascotProps {
  state?: MascotState;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const FlowyMascot: FC<FlowyMascotProps> = ({
  state = "idle",
  size = "md",
  className = "",
}) => {
  const [isPoke, setIsPoke] = useState(false);

  const dimension = size === "sm" ? 48 : size === "md" ? 72 : 96;

  const handlePoke = (e: React.MouseEvent) => {
    setIsPoke(true);
    sound.playPop(780);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    fireStarBurst(rect.left / window.innerWidth, rect.top / window.innerHeight);
    setTimeout(() => setIsPoke(false), 600);
  };

  return (
    <motion.div
      onClick={handlePoke}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      animate={
        isPoke
          ? { rotate: [0, -12, 12, -6, 6, 0], y: [0, -10, 0] }
          : state === "celebrating"
          ? { y: [0, -8, 0, -8, 0], rotate: [-4, 4, -4, 4, 0] }
          : state === "listening"
          ? { scale: [1, 1.05, 1], y: [0, -3, 0] }
          : { y: [0, -4, 0] }
      }
      transition={{
        duration: state === "idle" ? 3 : 0.8,
        repeat: state === "idle" || state === "listening" ? Infinity : 0,
        ease: "easeInOut",
      }}
      className={`relative cursor-pointer select-none inline-flex items-center justify-center ${className}`}
      style={{ width: dimension, height: dimension }}
      title="Hi! I'm Flowy, your voice automation buddy. Click me!"
    >
      {/* Speech / Status Bubble */}
      {state === "listening" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: -28 }}
          className="absolute -top-1 bg-sunny text-slate-900 px-2 py-0.5 rounded-full text-[10px] font-black border border-sunny-dark shadow-sm whitespace-nowrap z-20"
        >
          Listening... 🎙️
        </motion.div>
      )}

      {state === "tinkering" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: -28 }}
          className="absolute -top-1 bg-mint text-white px-2 py-0.5 rounded-full text-[10px] font-black border border-mint-dark shadow-sm whitespace-nowrap z-20"
        >
          Tinkering! ⚙️
        </motion.div>
      )}

      {state === "celebrating" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: -28 }}
          className="absolute -top-1 bg-strawberry text-white px-2 py-0.5 rounded-full text-[10px] font-black border border-strawberry-dark shadow-sm whitespace-nowrap z-20"
        >
          All Done! ✨
        </motion.div>
      )}

      <svg
        viewBox="0 0 100 100"
        width={dimension}
        height={dimension}
        className="drop-shadow-md overflow-visible"
      >
        {/* Antenna */}
        <line
          x1="50"
          y1="24"
          x2="50"
          y2="10"
          stroke="#3B82F6"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle
          cx="50"
          cy="8"
          r="6"
          fill={state === "listening" ? "#FF5C8A" : "#FFC837"}
          stroke="#E5A817"
          strokeWidth="1.5"
          className={state === "listening" ? "animate-ping" : ""}
        />

        {/* Soft Cloud / Robot Body */}
        <path
          d="M 30,35 
             C 18,35 12,48 18,62 
             C 14,75 25,85 40,84 
             C 48,87 56,87 64,84 
             C 78,85 88,74 84,60 
             C 90,46 80,35 68,36 
             C 62,26 38,25 30,35 Z"
          fill="#FFFFFF"
          stroke="#D8E2EC"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Cheeks */}
        <ellipse cx="28" cy="62" rx="5" ry="3.5" fill="#FFB4C8" opacity="0.8" />
        <ellipse cx="72" cy="62" rx="5" ry="3.5" fill="#FFB4C8" opacity="0.8" />

        {/* Eyes based on state */}
        {state === "celebrating" ? (
          // Joyful squint eyes (^^)
          <>
            <path
              d="M 33 54 Q 38 48 43 54"
              fill="none"
              stroke="#1E293B"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M 57 54 Q 62 48 67 54"
              fill="none"
              stroke="#1E293B"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        ) : state === "listening" ? (
          // Wide open curious eyes
          <>
            <circle cx="38" cy="52" r="5" fill="#1E293B" />
            <circle cx="40" cy="50" r="1.8" fill="#FFFFFF" />
            <circle cx="62" cy="52" r="5" fill="#1E293B" />
            <circle cx="64" cy="50" r="1.8" fill="#FFFFFF" />
          </>
        ) : state === "thinking" ? (
          // Looking up / pondering
          <>
            <circle cx="38" cy="48" r="4" fill="#1E293B" />
            <circle cx="39" cy="46" r="1.5" fill="#FFFFFF" />
            <circle cx="62" cy="48" r="4" fill="#1E293B" />
            <circle cx="63" cy="46" r="1.5" fill="#FFFFFF" />
          </>
        ) : (
          // Friendly gentle eyes
          <>
            <ellipse cx="38" cy="52" rx="3.5" ry="4.5" fill="#1E293B" />
            <circle cx="39" cy="50" r="1.5" fill="#FFFFFF" />
            <ellipse cx="62" cy="52" rx="3.5" ry="4.5" fill="#1E293B" />
            <circle cx="63" cy="50" r="1.5" fill="#FFFFFF" />
          </>
        )}

        {/* Mouth */}
        {state === "celebrating" ? (
          <path
            d="M 44 63 Q 50 71 56 63"
            fill="#FF5C8A"
            stroke="#1E293B"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ) : state === "listening" ? (
          <circle cx="50" cy="64" r="2.5" fill="#1E293B" />
        ) : (
          <path
            d="M 46 62 Q 50 66 54 62"
            fill="none"
            stroke="#1E293B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}
      </svg>
    </motion.div>
  );
};
