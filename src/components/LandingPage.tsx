import { FC } from "react";
import { motion } from "framer-motion";
import {
  Mic,
  LayoutGrid,
  Plus,
  FlaskConical,
  Volume2,
  VolumeX,
  ArrowRight,
  Zap,
} from "lucide-react";
import { FlowyMascot, MascotState } from "./FlowyMascot";
import { Routine } from "../data/mockRoutines";
import { sound } from "../utils/soundEffects";

interface LandingPageProps {
  onNavigate: (tab: "routines" | "lab") => void;
  onCreateRoutine: () => void;
  onSimulateVoice: () => void;
  onRunRoutine: (routine: Routine) => void;
  routines: Routine[];
  isListening: boolean;
  mascotState: MascotState;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const LandingPage: FC<LandingPageProps> = ({
  onNavigate,
  onCreateRoutine,
  onSimulateVoice,
  onRunRoutine,
  routines,
  isListening,
  mascotState,
  isMuted,
  onToggleMute,
}) => {
  const handleMicClick = () => {
    sound.playWakeChime();
    onSimulateVoice();
  };

  // Quick sample triggers from real user routines
  const sampleRoutines = routines.slice(0, 3);

  return (
    <div className="flex flex-col justify-center max-w-6xl mx-auto w-full h-full px-6 py-6 select-none space-y-6">
      {/* 1. Grand Welcome Header Bar (No more empty void above the card!) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b-2 border-dashed border-cream-border">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cream-card border-2 border-cream-border shadow-sm flex items-center justify-center text-2xl">
            ✨
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight leading-tight">
              Flo<span className="text-strawberry">wy</span> Desktop
            </h1>
            <p className="text-xs font-extrabold text-ink-muted">
              Intelligent Voice Automation for Windows
            </p>
          </div>
        </div>

        {/* Center/Right: Audio Toggle */}
        <div className="flex items-center gap-3">
          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl border-2 text-xs font-black transition-all active:scale-95 ${
              isMuted
                ? "bg-cream text-strawberry border-strawberry/40"
                : "bg-cream-card text-ink border-cream-border hover:bg-cream shadow-sm"
            }`}
            title={isMuted ? "Unmute sound effects" : "Mute sound effects"}
          >
            {isMuted ? (
              <>
                <VolumeX size={15} className="text-strawberry" />
                <span className="text-[11px] text-strawberry">Muted</span>
              </>
            ) : (
              <>
                <Volume2 size={15} className="text-mint-dark" />
                <span className="text-[11px]">Sound ON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Grand Hero Command Stage (Bigger, Richer & Fully Immersive) */}
      <div className="bg-cream-card rounded-[40px] p-8 sm:p-10 border-2 border-cream-border shadow-tactile-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Mascot, Dialogue & Quick Voice Chips (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-5">
          {/* Mascot & Dialogue Bubble */}
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <FlowyMascot state={mascotState} size="lg" />
            </div>

            {/* Speech Bubble */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-cream text-ink font-black text-xs sm:text-sm px-4 py-2.5 rounded-3xl border-2 border-cream-border shadow-sm max-w-xs"
            >
              <p className="leading-snug">
                {isListening
                  ? "I'm listening! Speak your command... 🎙️"
                  : "Hi! Tap the big mic or speak your command!"}
              </p>
            </motion.div>
          </div>

          {/* Main Title & Catchphrase */}
          <div className="space-y-1.5">
            <h2 className="text-3xl sm:text-4xl font-black text-ink tracking-tight leading-tight">
              What do you want to automate today?
            </h2>
            <p className="text-xs sm:text-sm font-extrabold text-ink-muted leading-relaxed">
              Launch apps, adjust audio, set focus modes, and open workspaces with single natural voice commands.
            </p>
          </div>

          {/* Quick Voice Chips */}
          <div className="space-y-2 w-full pt-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
              <Zap size={13} className="text-amber-500" />
              <span>Try saying:</span>
            </span>

            <div className="flex flex-wrap gap-2">
              {sampleRoutines.map((routine) => (
                <button
                  key={routine.id}
                  onClick={() => {
                    sound.playPop(540);
                    onRunRoutine(routine);
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-cream hover:bg-cream-dark border-2 border-cream-border hover:border-mint-dark font-extrabold text-xs text-ink transition-all active:translate-y-0.5 shadow-sm group"
                  title={`Run "${routine.name}"`}
                >
                  <span className="text-base">{routine.icon}</span>
                  <span className="group-hover:text-mint-dark">"{routine.triggers[0]}"</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Giant Tactile 3D Voice Orb Station (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-2">
          <div className="relative flex items-center justify-center">
            {/* Outer Pedestal Ring */}
            <div className="w-56 h-56 sm:w-60 sm:h-60 rounded-full bg-cream border-2 border-cream-border shadow-inner flex items-center justify-center relative">
              {/* Concentric pulse ripples when listening */}
              {isListening && (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.35, 1.55], opacity: [0.65, 0.25, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full bg-strawberry"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1.38], opacity: [0.55, 0.2, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                    className="absolute inset-0 rounded-full bg-sunny"
                  />
                </>
              )}

              {/* Giant Tactile 3D Pushable Mic Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleMicClick}
                className={`w-36 h-36 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center border-4 text-white transition-all cursor-pointer select-none active:translate-y-2 z-10 ${
                  isListening
                    ? "bg-sunny border-sunny-dark text-slate-900 shadow-[0_10px_0_#E5A817] active:shadow-[0_2px_0_#E5A817]"
                    : "bg-strawberry border-strawberry-dark shadow-[0_10px_0_#E03B6B] active:shadow-[0_2px_0_#E03B6B] hover:brightness-105"
                }`}
                title="Speak your command"
              >
                <Mic
                  size={50}
                  className={isListening ? "animate-bounce" : ""}
                  strokeWidth={2.5}
                />
                <span className="text-xs font-black tracking-widest uppercase mt-1">
                  {isListening ? "Listening" : "Speak"}
                </span>
              </motion.button>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 text-xs font-black text-ink-muted">
            <span>Or press shortcut:</span>
            <kbd className="px-2 py-0.5 rounded-xl bg-cream border-2 border-cream-border font-mono text-[11px] text-ink font-black shadow-sm">
              Ctrl + Space
            </kbd>
          </div>
        </div>
      </div>

      {/* 3. Bottom Navigation Toy Cards (Chunky, Rich & Well-Proportioned) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: My Routines */}
        <button
          onClick={() => {
            sound.playPop(520);
            onNavigate("routines");
          }}
          className="group p-5 rounded-3xl bg-cream-card hover:bg-mint-light border-2 border-cream-border hover:border-mint-dark transition-all text-left shadow-tactile-card active:translate-y-1 active:shadow-[0_2px_0_#14B8A6] flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-mint text-white flex items-center justify-center flex-shrink-0 shadow-sm text-2xl">
              <LayoutGrid size={26} />
            </div>
            <div>
              <h3 className="font-black text-ink text-base group-hover:text-mint-dark">
                My Routines
              </h3>
              <p className="text-xs font-bold text-ink-muted">
                Manage Routines
              </p>
            </div>
          </div>
          <ArrowRight
            size={18}
            className="text-ink-muted group-hover:text-mint-dark group-hover:translate-x-1 transition-transform mr-1"
          />
        </button>

        {/* Card 2: Create Routine */}
        <button
          onClick={() => {
            sound.playPop(560);
            onCreateRoutine();
          }}
          className="group p-5 rounded-3xl bg-cream-card hover:bg-strawberry-light border-2 border-cream-border hover:border-strawberry-dark transition-all text-left shadow-tactile-card active:translate-y-1 active:shadow-[0_2px_0_#E03B6B] flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-strawberry text-white flex items-center justify-center flex-shrink-0 shadow-sm text-2xl">
              <Plus size={26} strokeWidth={3} />
            </div>
            <div>
              <h3 className="font-black text-ink text-base group-hover:text-strawberry-dark">
                New Routine
              </h3>
              <p className="text-xs font-bold text-ink-muted">
                Build with Toy Blocks
              </p>
            </div>
          </div>
          <ArrowRight
            size={18}
            className="text-ink-muted group-hover:text-strawberry-dark group-hover:translate-x-1 transition-transform mr-1"
          />
        </button>

        {/* Card 3: Test Lab */}
        <button
          onClick={() => {
            sound.playPop(580);
            onNavigate("lab");
          }}
          className="group p-5 rounded-3xl bg-cream-card hover:bg-blueberry-light border-2 border-cream-border hover:border-blueberry-dark transition-all text-left shadow-tactile-card active:translate-y-1 active:shadow-[0_2px_0_#3B82F6] flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blueberry text-white flex items-center justify-center flex-shrink-0 shadow-sm text-2xl">
              <FlaskConical size={26} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-ink text-base group-hover:text-blueberry-dark">
                  Test Lab
                </h3>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-sunny text-slate-900 border border-sunny-dark uppercase">
                  Dev
                </span>
              </div>
              <p className="text-xs font-bold text-ink-muted">
                Island & Voice Simulator
              </p>
            </div>
          </div>
          <ArrowRight
            size={18}
            className="text-ink-muted group-hover:text-blueberry-dark group-hover:translate-x-1 transition-transform mr-1"
          />
        </button>
      </div>
    </div>
  );
};
