---
name: playful-gamified-desktop-ui
description: Design and build gamified, playful, cute, and tactile desktop UI components (inspired by Toca Boca, Finch, and Nintendo) for Electron and React apps. Use when designing, styling, or coding colorful, toy-like, yet ergonomic daily-driver interfaces.
---

# Playful & Gamified Desktop UI Design Skill

A practical specification and design system for creating **tactile, cute, colorful, and gamified** desktop interfaces that feel like delightful digital toys while maintaining the efficiency, speed, and ergonomics required for a daily productivity driver.

---

## 1. Core Philosophy: "Cozy Modular Toybox"

1. **Not a Gimmick, but an Emotional Ergonomic Tool:**
   - Avoid shallow or annoying gamification (e.g. constant nagging mascots or guilt-tripping streaks).
   - Instead, prioritize **tactile satisfaction**: every click, drag, toggle, and trigger should feel like interacting with a well-crafted physical toy or gadget (like a Nintendo Switch or Teenage Engineering device).
2. **The "WAH!" Factor via Micro-Interactions:**
   - Delight the user with bouncy spring physics, physical 3D button presses, smooth drag reordering, energy beam progress animations, and celebratory micro-particles.
3. **Daily-Driver Comfort:**
   - Visuals are colorful and cute (*Candy Popsicle*), but contrast is strictly maintained so text is effortlessly readable.
   - Animations are snappy (180ms - 250ms), never blocking workflow execution or user speed.
   - Built-in sound toggle allows instant mute for quiet or professional environments.
4. **Progressive Disclosure:**
   - Simple & visual on the outside (toy-like blocks, big icons, friendly labels).
   - Powerful on the inside (expandable "Pro Mode" with PowerShell scripting, raw arguments, and system flags).

---

## 2. Color System: "Candy Popsicle"

Use warm, saturated, yet harmonious candy tones on an eye-soothing cream-cloud canvas.

| Token Name | Light/Face Hex | Dark 3D Rim / Border Hex | Semantic Meaning |
|---|---|---|---|
| **Strawberry Sorbet** | `#FF5C8A` | `#E03B6B` | Primary actions, recording, urgent alerts |
| **Sunny Yolk** | `#FFC837` | `#E5A817` | Voice status, wake word active, favorites |
| **Boba Mint** | `#2DD4BF` | `#14B8A6` | Workflows, success, automation chains |
| **Blueberry Milk** | `#60A5FA` | `#3B82F6` | URL / Web actions, external links |
| **Grape Jelly** | `#C084FC` | `#A855F7` | System settings, scripts, OS automation |
| **Cream Cloud Canvas**| `#FFFDF9` | `#EDE7DE` | App window background |
| **Toy Card White** | `#FFFFFF` | `#F0EAE1` | Card container background |
| **Slate Ink (Text)** | `#2D3748` | `#1A202C` | High contrast readable typography |
| **Muted Pastel Text** | `#718096` | `#4A5568` | Secondary labels and helper text |

---

## 3. Tactile 3D Component Recipes

### 3.1 3D Pushable Button (Arcade / Toy Feel)
A button that has a thick physical bottom rim and sinks when pressed down.

```tsx
import { FC, ReactNode } from "react";

interface PushButtonProps {
  children: ReactNode;
  color?: "strawberry" | "mint" | "sunny" | "blueberry";
  onClick?: () => void;
  className?: string;
}

const colorStyles = {
  strawberry: "bg-[#FF5C8A] border-[#E03B6B] shadow-[0_5px_0_#E03B6B]",
  mint: "bg-[#2DD4BF] border-[#14B8A6] shadow-[0_5px_0_#14B8A6]",
  sunny: "bg-[#FFC837] border-[#E5A817] shadow-[0_5px_0_#E5A817] text-gray-900",
  blueberry: "bg-[#60A5FA] border-[#3B82F6] shadow-[0_5px_0_#3B82F6]",
};

export const PushButton: FC<PushButtonProps> = ({
  children,
  color = "mint",
  onClick,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative inline-flex items-center justify-center font-bold px-6 py-3
        rounded-2xl border-2 text-white transition-all select-none
        active:translate-y-[4px] active:shadow-[0_1px_0_currentColor]
        hover:brightness-105 active:brightness-95
        ${colorStyles[color]}
        ${className}
      `}
    >
      {children}
    </button>
  );
};
```

### 3.2 Modular Action Block ("Toy Brick")
Action cards inside the routine builder feature squishy borders, modular connector nubs, and an expandable "Pro Settings" tray.

```tsx
import { FC, useState } from "react";
import { motion } from "framer-motion";

interface ActionBlockProps {
  title: string;
  icon: string;
  color: string;
  borderColor: string;
  subtitle: string;
  onRemove?: () => void;
}

export const ActionBlock: FC<ActionBlockProps> = ({
  title,
  icon,
  color,
  borderColor,
  subtitle,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="relative rounded-2xl p-4 bg-white border-2 transition-shadow"
      style={{
        borderColor: borderColor,
        boxShadow: `0 4px 0 ${borderColor}`,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner"
            style={{ backgroundColor: color }}
          >
            {icon}
          </div>
          <div>
            <h4 className="font-extrabold text-slate-800 text-base">{title}</h4>
            <p className="text-xs font-semibold text-slate-500">{subtitle}</p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          {isExpanded ? "Simple ⚡" : "Pro ⚙️"}
        </button>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 pt-3 border-t border-dashed border-slate-200 text-xs"
        >
          <label className="font-bold text-slate-600 block mb-1">
            Custom Arguments / PowerShell Override:
          </label>
          <input
            type="text"
            placeholder="e.g. -ArgumentList '--silent' -DelayMs 500"
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-400"
          />
        </motion.div>
      )}
    </motion.div>
  );
};
```

---

## 4. Animation & Physics Rules (Framer Motion)

- **Snappy Spring Presets:**
  ```ts
  export const bouncySpring = {
    type: "spring",
    stiffness: 420,
    damping: 22,
    mass: 0.8,
  };

  export const gentleFloat = {
    y: [0, -4, 0],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };
  ```
- **Squash and Stretch on Click:**
  Buttons and cards should scale to `0.96 - 0.98` during tap and smoothly bounce back.
- **Energy Beam Progress (Test Run):**
  When running a test of the workflow pipeline, animate a glowing trail or pulse traveling down from connector to connector, turning each block's icon green with a subtle pop.

---

## 5. Audio Haptics (Sound Effects)

Sound feedback should feel soft, organic, and cute (marimba, bubble pop, chime) rather than shrill 8-bit beeps.

```ts
// Example Web Audio API Soft Pop synthesizer (no external audio assets required)
export function playSoftPop(freq = 440) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch (e) {
    // AudioContext disabled or unsupported
  }
}
```

---

## 6. Mascot / Companion Guidelines: "Flowy"

1. **Role:** Ambient companion, not an intrusive assistant.
2. **Positions:** Top-right corner of the workbench or embedded in the Dynamic Island pill.
3. **States:**
   - **Idle:** Gently floating up and down (`gentleFloat`), blinking eyes occasionally.
   - **Listening:** Perked ears, glowing antenna/cheek sparkles.
   - **Running Routine:** Spinning happily or holding a tiny wrench / wand.
   - **Success:** Starburst / heart particles, cheerful bounce!

---

## 7. Quality Checklist for Any New UI Screen

- [ ] Does the screen use the **Candy Popsicle** palette tokens?
- [ ] Are buttons and interactive tiles **3D pushable** with visible tactile depth?
- [ ] Is high contrast preserved for text on light backgrounds?
- [ ] Are animations using **bouncy spring physics** under 250ms?
- [ ] Is there an expandable **Pro Mode** so power users are never locked out of raw Windows control?
- [ ] Can audio effects be easily muted with a single global toggle?
