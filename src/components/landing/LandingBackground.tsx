import { FC } from "react";
import { motion, useReducedMotion } from "framer-motion";

const breezeStrands = [
  ["M 0 12 C 25 2 48 22 75 12 S 105 8 120 12", "M 0 14 C 25 24 48 2 75 14 S 105 20 120 14"],
  ["M 16 26 C 35 20 58 30 94 25", "M 16 28 C 35 36 58 18 94 28"],
  ["M 43 37 C 58 33 75 42 104 36", "M 43 38 C 58 45 75 30 104 38"],
];

export const LandingBackground: FC = () => {
  const reducedMotion = useReducedMotion();

  return (
    <div className="flowy-sky-bg fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="flowy-home-cloud flowy-home-cloud-one" />
      <div className="flowy-home-cloud flowy-home-cloud-two" />
      <div className="flowy-home-cloud flowy-home-cloud-three" />
      <div className="flowy-home-cloud flowy-home-cloud-four" />
      <div className="flowy-home-breezes">
        {[
          { id: "one", scale: 1.15, top: "22%", dur: "13s", delay: "0s" },
          { id: "two", scale: 0.72, top: "48%", dur: "11s", delay: "-4s" },
          { id: "three", scale: 0.95, top: "35%", dur: "14s", delay: "-8s" },
          { id: "four", scale: 0.62, top: "68%", dur: "10s", delay: "-2s" },
        ].map(({ id, scale, top, dur, delay }) => (
          <span
            key={id}
            className={`flowy-home-breeze flowy-home-breeze-${id}`}
            style={{
              top,
              animationDuration: dur,
              animationDelay: delay,
              transform: `scale(${scale})`,
            }}
          >
            <svg viewBox="0 0 120 48" focusable="false">
              {breezeStrands.map(([rest, bend], index) => (
                <motion.path
                  key={index}
                  d={rest}
                  animate={reducedMotion ? undefined : { d: [rest, bend, rest] }}
                  transition={{ duration: 2.2 + index * 0.35, repeat: Infinity, ease: "easeInOut" }}
                  fill="none"
                  stroke="#ffffffb3"
                  strokeWidth={index === 0 ? 2.5 : 2}
                  strokeLinecap="round"
                />
              ))}
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
};
