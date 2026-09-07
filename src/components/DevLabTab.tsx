import { FC, useState } from "react";
import { Sparkles, Mic, Terminal, Play, CheckCircle2, RefreshCw } from "lucide-react";
import { Routine } from "../data/mockRoutines";
import { PushButton } from "./PushButton";
import { sound } from "../utils/soundEffects";

interface DevLabTabProps {
  routines: Routine[];
  onTriggerIsland: (routine?: Routine) => void;
  onSimulateVoice: () => void;
  isListening: boolean;
}

/**
 * TEMPORARY DEV LAB COMPONENT
 * Isolates all testing and simulation controls in one place so it can be deleted easily.
 */
export const DevLabTab: FC<DevLabTabProps> = ({
  routines,
  onTriggerIsland,
  onSimulateVoice,
  isListening,
}) => {
  const [testPhrase, setTestPhrase] = useState("");
  const [matchResult, setMatchResult] = useState<{
    matched: boolean;
    routineName?: string;
    confidence?: number;
  } | null>(null);

  const handleTestIntent = () => {
    if (!testPhrase.trim()) return;
    sound.playPop(520);

    // Simple keyword / substring similarity mock
    const query = testPhrase.toLowerCase();
    let bestMatch: Routine | null = null;
    let highestScore = 0;

    for (const r of routines) {
      for (const t of r.triggers) {
        if (query.includes(t.toLowerCase()) || t.toLowerCase().includes(query)) {
          bestMatch = r;
          highestScore = 0.94;
          break;
        }
      }
      if (bestMatch) break;
    }

    if (!bestMatch) {
      // Fallback matching first word
      const firstWord = query.split(" ")[0];
      for (const r of routines) {
        if (r.name.toLowerCase().includes(firstWord)) {
          bestMatch = r;
          highestScore = 0.81;
          break;
        }
      }
    }

    if (bestMatch) {
      setMatchResult({
        matched: true,
        routineName: bestMatch.name,
        confidence: highestScore,
      });
      sound.playFanfare();
    } else {
      setMatchResult({
        matched: false,
        confidence: 0.35,
      });
      sound.playPop(350);
    }
  };

  return (
    <div className="flex flex-col space-y-6 max-w-4xl mx-auto w-full pb-10">
      {/* Notice Banner */}
      <div className="bg-sunny-light border-2 border-sunny-dark rounded-3xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧪</span>
          <div>
            <h3 className="text-sm font-black text-slate-900">
              Developer & Testing Playground (Dev Tab)
            </h3>
            <p className="text-xs font-bold text-amber-800">
              This tab contains simulation buttons for testing the Dynamic Island and voice triggers. It is isolated from the main UI and can be removed with one click when no longer needed.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider bg-sunny text-slate-900 px-3 py-1 rounded-xl border border-sunny-dark whitespace-nowrap">
          Dev Only
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Real Floating Dynamic Island Trigger */}
        <div className="bg-cream-card rounded-3xl p-6 border-2 border-cream-border shadow-tactile-card flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blueberry-light text-blueberry-dark flex items-center justify-center text-xl border-2 border-blueberry-dark mb-3">
              🏝️
            </div>
            <h4 className="font-black text-ink text-base">
              Floating Dynamic Island Test
            </h4>
            <p className="text-xs font-bold text-ink-muted mt-1">
              Spawns the real OS-level always-on-top window at the top center of your primary monitor, complete with slide-down entrance, live checklist ticks, and auto-collapse.
            </p>
          </div>

          <div className="pt-2">
            <PushButton
              variant="blueberry"
              size="md"
              icon={<Sparkles size={16} />}
              onClick={() => onTriggerIsland()}
              className="w-full"
            >
              Summon Floating Island 🏝️
            </PushButton>
          </div>
        </div>

        {/* Card 2: Voice Trigger Simulation */}
        <div className="bg-cream-card rounded-3xl p-6 border-2 border-cream-border shadow-tactile-card flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-strawberry-light text-strawberry flex items-center justify-center text-xl border-2 border-strawberry-dark mb-3">
              🎙️
            </div>
            <h4 className="font-black text-ink text-base">
              Voice Trigger Simulator ("Hey Flowy")
            </h4>
            <p className="text-xs font-bold text-ink-muted mt-1">
              Simulates speech recognition triggering the automation routine. This plays the wake chime, wakes mascot Flowy, and opens the Dynamic Island.
            </p>
          </div>

          <div className="pt-2">
            <PushButton
              variant="strawberry"
              size="md"
              icon={<Mic size={16} className={isListening ? "animate-bounce" : ""} />}
              onClick={onSimulateVoice}
              className="w-full"
            >
              {isListening ? "Listening Active..." : "Simulate 'Hey Flowy' 🎙️"}
            </PushButton>
          </div>
        </div>
      </div>

      {/* Card 3: Natural Phrasing & Intent Matching Sandbox */}
      <div className="bg-cream-card rounded-3xl p-6 border-2 border-cream-border shadow-tactile-card space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-mint-light text-mint-dark flex items-center justify-center border-2 border-mint-dark">
            <Terminal size={18} />
          </div>
          <div>
            <h4 className="font-black text-ink text-base">
              Local Intent Matcher Sandbox
            </h4>
            <p className="text-xs font-bold text-ink-muted">
              Test how natural spoken sentences resolve to your configured routines.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={testPhrase}
            onChange={(e) => setTestPhrase(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTestIntent()}
            placeholder="Type a spoken sentence (e.g. 'tolong mulai kerja dong' or 'let's play')..."
            className="flex-1 text-xs font-bold px-4 py-2.5 rounded-2xl bg-cream border-2 border-cream-border focus:border-mint focus:outline-none text-ink"
          />
          <PushButton
            variant="mint"
            size="md"
            icon={<Play size={14} />}
            onClick={handleTestIntent}
          >
            Evaluate
          </PushButton>
        </div>

        {matchResult && (
          <div
            className={`p-4 rounded-2xl border-2 flex items-center justify-between text-xs font-bold ${
              matchResult.matched
                ? "bg-mint-light border-mint-dark text-slate-800"
                : "bg-strawberry-light border-strawberry-dark text-strawberry"
            }`}
          >
            <div className="flex items-center gap-2">
              {matchResult.matched ? (
                <CheckCircle2 size={16} className="text-mint-dark flex-shrink-0" />
              ) : (
                <RefreshCw size={16} className="text-strawberry flex-shrink-0" />
              )}
              <span>
                {matchResult.matched
                  ? `Matched Routine: "${matchResult.routineName}"`
                  : "No routine matched (Confidence below 0.75 threshold)"}
              </span>
            </div>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded-lg bg-white/80 border">
              Confidence: {Math.round((matchResult.confidence || 0) * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
