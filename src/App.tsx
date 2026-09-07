import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Wand2, ArrowLeft, Plus, Volume2, VolumeX } from "lucide-react";
import { initialRoutines, Routine } from "./data/mockRoutines";
import { TitleBar } from "./components/TitleBar";
import { DynamicIsland, IslandState } from "./components/DynamicIsland";
import { RoutineCard } from "./components/RoutineCard";
import { RoutineEditor } from "./components/RoutineEditor";
import { DevLabTab } from "./components/DevLabTab";
import { LandingPage } from "./components/LandingPage";
import { MascotState } from "./components/FlowyMascot";
import { PushButton } from "./components/PushButton";
import { sound } from "./utils/soundEffects";

export type AppScreen = "home" | "routines" | "lab";

export function App() {
  const [routines, setRoutines] = useState<Routine[]>(() => {
    const saved = localStorage.getItem("flowy_routines") || localStorage.getItem("voflow_routines");
    return saved ? JSON.parse(saved) : initialRoutines;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [activeScreen, setActiveScreen] = useState<AppScreen>("home");

  // Dynamic Island & Voice State
  const [islandState, setIslandState] = useState<IslandState>("idle");
  const [runningRoutineId, setRunningRoutineId] = useState<string | null>(null);
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);
  const [mascotState, setMascotState] = useState<MascotState>("idle");
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());

  // Timers for safe serialization & single-thread lifecycle
  const autoResetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activateTimer1 = useRef<NodeJS.Timeout | null>(null);
  const activateTimer2 = useRef<NodeJS.Timeout | null>(null);
  const isSimulatingVoiceRef = useRef<boolean>(false);

  // Check if this window was opened as the standalone Island overlay
  const isIslandOverlayWindow = window.location.hash === "#/island";

  // Save routines to localStorage on update
  useEffect(() => {
    localStorage.setItem("flowy_routines", JSON.stringify(routines));
  }, [routines]);

  // Global hotkey simulation (Ctrl + Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.code === "Space") || (e.altKey && e.code === "KeyV")) {
        e.preventDefault();
        handleSimulateVoice();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [routines]);

  // Sync mascot state with island state
  useEffect(() => {
    if (islandState === "listening") {
      setMascotState("listening");
    } else if (islandState === "thinking") {
      setMascotState("thinking");
    } else if (islandState === "executing") {
      setMascotState("tinkering");
    } else if (islandState === "completed") {
      setMascotState("celebrating");
    } else {
      setMascotState("idle");
    }
  }, [islandState]);

  // Listen to IPC events from Electron Main if available
  useEffect(() => {
    const api = (window as any).electronAPI;
    if (!api) return;

    const cleanupWake = api.onWakeDetected?.(() => {
      if (!isSimulatingVoiceRef.current && islandState === "idle") {
        handleSimulateVoice();
      }
    });

    // If this window is the standalone floating island, listen to activate events
    const cleanupActivate = api.onIslandActivate?.((incomingRoutine: Routine | null) => {
      const routine = incomingRoutine || routines[0];
      setActiveRoutine(routine);
      setRunningRoutineId(routine.id);
      setIslandState("listening");

      if (activateTimer1.current) clearTimeout(activateTimer1.current);
      if (activateTimer2.current) clearTimeout(activateTimer2.current);

      activateTimer1.current = setTimeout(() => setIslandState("thinking"), 1200);
      activateTimer2.current = setTimeout(() => setIslandState("executing"), 2200);
    });

    // Listen to global island status changes from main process (broadcasted to mainWindow)
    const cleanupStatus = api.onIslandStatus?.((status: { isBusy: boolean; routine?: Routine }) => {
      if (status.isBusy) {
        if (!isSimulatingVoiceRef.current) {
          setIslandState("executing");
          if (status.routine) {
            setActiveRoutine(status.routine);
            setRunningRoutineId(status.routine.id);
          }
        }
      } else {
        setIslandState("idle");
        setRunningRoutineId(null);
        isSimulatingVoiceRef.current = false;
      }
    });

    return () => {
      cleanupWake?.();
      cleanupActivate?.();
      cleanupStatus?.();
    };
  }, [routines, isIslandOverlayWindow]);

  // Simulate Voice Trigger Flow: "Hey Flowy" -> Listen -> Intent -> Execute
  const handleSimulateVoice = () => {
    if (isSimulatingVoiceRef.current || islandState !== "idle") return;
    isSimulatingVoiceRef.current = true;

    const target = routines.find((r) => r.enabled) || routines[0];
    setActiveRoutine(target);
    setRunningRoutineId(target.id);
    setIslandState("listening");

    const api = (window as any).electronAPI;
    if (api?.simulateWakeWord) {
      api.simulateWakeWord();
    }

    if (activateTimer1.current) clearTimeout(activateTimer1.current);
    if (activateTimer2.current) clearTimeout(activateTimer2.current);
    if (autoResetTimerRef.current) clearTimeout(autoResetTimerRef.current);

    activateTimer1.current = setTimeout(() => {
      setIslandState("thinking");
    }, 1400);

    activateTimer2.current = setTimeout(() => {
      setIslandState("executing");
    }, 2500);

    const stepCount = target.steps.length || 3;
    const estimatedTotalMs = 2500 + stepCount * 650 + 2000;
    autoResetTimerRef.current = setTimeout(() => {
      setIslandState("idle");
      setRunningRoutineId(null);
      isSimulatingVoiceRef.current = false;
    }, estimatedTotalMs);
  };

  // Run a specific routine directly via the real floating island
  const handleRunRoutine = (routine: Routine) => {
    setActiveRoutine(routine);
    setRunningRoutineId(routine.id);
    setIslandState("executing");

    const api = (window as any).electronAPI;
    if (api?.showIsland) {
      api.showIsland(routine);
    }

    if (autoResetTimerRef.current) clearTimeout(autoResetTimerRef.current);
    const stepCount = routine.steps.length || 3;
    const estimatedTotalMs = stepCount * 650 + 2500;
    autoResetTimerRef.current = setTimeout(() => {
      setIslandState("idle");
      setRunningRoutineId(null);
    }, estimatedTotalMs);
  };

  const handleToggleEnabled = (id: string) => {
    sound.playPop(480);
    setRoutines(
      routines.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleSaveRoutine = (updated: Routine) => {
    setRoutines((prev) => {
      const exists = prev.some((r) => r.id === updated.id);
      if (exists) {
        return prev.map((r) => (r.id === updated.id ? updated : r));
      } else {
        return [updated, ...prev];
      }
    });
    setEditingRoutine(null);
  };

  const handleDeleteRoutine = (id: string) => {
    sound.playPop(380);
    setRoutines((prev) => prev.filter((r) => r.id !== id));
    if (editingRoutine && editingRoutine.id === id) {
      setEditingRoutine(null);
    }
    if (runningRoutineId === id) {
      setRunningRoutineId(null);
    }
  };

  const handleCreateNewRoutine = () => {
    sound.playPop(560);
    const newRoutine: Routine = {
      id: `routine_${Date.now()}`,
      name: "",
      category: "work",
      icon: "✨",
      color: "strawberry",
      description: "",
      triggers: [],
      enabled: true,
      streakCount: 0,
      steps: [
        {
          id: `step_${Date.now()}_1`,
          type: "audio",
          title: "Set Volume",
          subtitle: "Level: 40%",
          param: "40",
        },
      ],
    };
    // Do NOT add to routines list yet! Only set as draft in editor.
    setEditingRoutine(newRoutine);
  };

  // If this window is dedicated to the floating Dynamic Island overlay
  if (isIslandOverlayWindow) {
    return (
      <div className="w-screen h-screen bg-transparent flex items-start justify-center pt-0 select-none overflow-hidden">
        <DynamicIsland
          activeRoutine={activeRoutine || routines[0]}
          state={islandState}
          onStateChange={(newState) => {
            setIslandState(newState);
            if (newState === "idle") {
              (window as any).electronAPI?.hideIsland();
            }
          }}
          isStandaloneWindow={true}
        />
      </div>
    );
  }

  // Filter & sort routines: enabled routines on top, disabled sink to bottom!
  const filteredRoutines = routines
    .filter((r) => {
      const matchesCategory =
        selectedCategory === "all" || r.category === selectedCategory;
      const matchesSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.triggers.some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (a.enabled === b.enabled) return 0;
      return a.enabled ? -1 : 1;
    });

  return (
    <div className="flex flex-col h-screen w-screen bg-cream overflow-hidden font-sans text-ink">
      {/* Minimal Draggable Titlebar with Window Controls */}
      <TitleBar isListening={islandState === "listening"} />

      {/* Main Workspace Canvas (Full Width - No Sidebar) */}
      <main className="flex-1 overflow-y-auto p-6 flex flex-col">
        {editingRoutine ? (
          <RoutineEditor
            routine={editingRoutine}
            onSave={handleSaveRoutine}
            onCancel={() => setEditingRoutine(null)}
            onDelete={handleDeleteRoutine}
            isNew={!routines.some((r) => r.id === editingRoutine.id)}
            existingRoutines={routines}
          />
        ) : activeScreen === "home" ? (
          <LandingPage
            onNavigate={(screen) => setActiveScreen(screen)}
            onCreateRoutine={handleCreateNewRoutine}
            onSimulateVoice={handleSimulateVoice}
            onRunRoutine={handleRunRoutine}
            routines={routines}
            isListening={islandState === "listening"}
            mascotState={mascotState}
            isMuted={isMuted}
            onToggleMute={() => {
              const muted = sound.toggleMute();
              setIsMuted(muted);
            }}
          />
        ) : activeScreen === "lab" ? (
          <div className="space-y-6 max-w-4xl mx-auto w-full">
            {/* Top Bar with Back to Home */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-cream-border">
              <button
                onClick={() => {
                  sound.playPop(480);
                  setActiveScreen("home");
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-cream-card hover:bg-cream border-2 border-cream-border font-extrabold text-xs text-ink transition-all active:translate-y-0.5 shadow-sm"
              >
                <ArrowLeft size={16} />
                <span>Home</span>
              </button>

              <h2 className="text-xl font-black text-ink">
                Test Lab (Dev)
              </h2>

              <div className="w-20" />
            </div>

            <DevLabTab
              routines={routines}
              onTriggerIsland={() =>
                handleRunRoutine(routines.find((r) => r.enabled) || routines[0])
              }
              onSimulateVoice={handleSimulateVoice}
              isListening={islandState === "listening"}
            />
          </div>
        ) : (
          <div className="space-y-6 max-w-5xl mx-auto w-full">
            {/* Workspace Header: Back to Home + Title + Search + Create */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b-2 border-dashed border-cream-border">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    sound.playPop(480);
                    setActiveScreen("home");
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-cream-card hover:bg-cream border-2 border-cream-border font-extrabold text-xs text-ink transition-all active:translate-y-0.5 shadow-sm"
                  title="Back to Home"
                >
                  <ArrowLeft size={16} />
                  <span>Home</span>
                </button>

                <h1 className="text-2xl font-black text-ink tracking-tight">
                  My Routines
                </h1>
              </div>

              {/* Quick Search & Create & Sound */}
              <div className="flex items-center gap-2.5">
                <div className="relative w-full sm:w-60">
                  <Search
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search routines..."
                    className="w-full text-xs font-bold pl-9 pr-4 py-2 rounded-2xl bg-cream-card border-2 border-cream-border focus:border-mint focus:outline-none text-ink shadow-sm"
                  />
                </div>

                <PushButton
                  variant="strawberry"
                  size="sm"
                  icon={<Plus size={15} strokeWidth={3} />}
                  onClick={handleCreateNewRoutine}
                >
                  + New Routine
                </PushButton>

                {/* Sound toggle button */}
                <button
                  onClick={() => {
                    const muted = sound.toggleMute();
                    setIsMuted(muted);
                  }}
                  className="w-9 h-9 rounded-2xl bg-cream-card hover:bg-cream border-2 border-cream-border flex items-center justify-center text-ink transition-all active:scale-95 shadow-sm"
                  title={isMuted ? "Unmute sound effects" : "Mute sound effects"}
                >
                  {isMuted ? (
                    <VolumeX size={15} className="text-strawberry" />
                  ) : (
                    <Volume2 size={15} className="text-mint-dark" />
                  )}
                </button>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: "all", label: "🌟 All Routines" },
                { id: "work", label: "💻 Work & Code" },
                { id: "gaming", label: "🎮 Gaming" },
                { id: "chill", label: "🍿 Chill & Media" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    sound.playPop(500);
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-4 py-2 rounded-2xl font-extrabold text-xs transition-all border-2 ${
                    selectedCategory === cat.id
                      ? "bg-mint text-white border-mint-dark shadow-tactile-mint"
                      : "bg-cream-card text-ink-muted hover:text-ink border-cream-border hover:bg-cream"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Routine Cards 2-Column Grid (Smooth FLIP Spring Layout) */}
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
              <AnimatePresence mode="popLayout">
                {filteredRoutines.map((routine) => (
                  <RoutineCard
                    key={routine.id}
                    routine={routine}
                    onEdit={(r) => {
                      sound.playPop(520);
                      setEditingRoutine(r);
                    }}
                    onTestRun={handleRunRoutine}
                    onToggleEnabled={handleToggleEnabled}
                    onDelete={handleDeleteRoutine}
                    isRunning={runningRoutineId === routine.id && islandState !== "idle"}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredRoutines.length === 0 && (
              <div className="p-12 text-center bg-cream-card rounded-3xl border-2 border-dashed border-cream-border">
                <Wand2 size={32} className="mx-auto text-ink-muted mb-2" />
                <h3 className="font-extrabold text-ink text-base">
                  No matching routines found
                </h3>
                <p className="text-xs font-bold text-ink-muted mt-1">
                  Try searching for something else, or create a brand new routine.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Dynamic Island ONLY for pure browser dev mode (Never render duplicate in Electron!) */}
      {!(window as any).electronAPI && (
        <AnimatePresence>
          {islandState !== "idle" && (
            <motion.div
              initial={{ y: -70, opacity: 0, scale: 0.85 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -70, opacity: 0, scale: 0.85 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed top-1.5 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
            >
              <DynamicIsland
                activeRoutine={activeRoutine || routines[0]}
                state={islandState}
                onStateChange={setIslandState}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

export default App;
