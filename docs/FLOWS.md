# VoFlow Desktop - Application & Frontend Architecture Flows (`FLOWS.md`)

- **Product:** VoFlow Desktop
- **Architecture Standard:** Electron (React + TypeScript) + Windows Native & Voice Engine
- **Design Philosophy:** Cozy Modular Toybox & Playful Daily Driver
- **Document Purpose:** Complete end-to-end interactive and operational flows across the entire system.

---

## 1. System Triad Overview

VoFlow Desktop operates as three interconnected components communicating via high-speed local IPC (Inter-Process Communication):

```
+---------------------------------------------------------------------------------+
|                                 ELECTRON HOST                                   |
|                                                                                 |
|  +---------------------------------+   +-------------------------------------+  |
|  |     WORKBENCH DASHBOARD         |   |       DYNAMIC ISLAND OVERLAY        |  |
|  |   (Playful Gamified Frontend)   |   |   (Always-on-Top Floating Notch)    |  |
|  | - Routine Builder (Toy Blocks)  |   | - Top-center primary display        |  |
|  | - Mascot Companion ("Flowy")    |   | - Transparent, frameless window     |  |
|  | - Test Run Simulation           |   | - Real-time execution checklist     |  |
|  +---------------------------------+   +-------------------------------------+  |
|                  ▲                                         ▲                    |
|                  │            Electron IPC                 │                    |
|                  ▼                                         ▼                    |
|  +---------------------------------------------------------------------------+  |
|  |                         MAIN CONTROLLER PROCESS                           |  |
|  | - Window lifecycle (Workbench & Island management)                        |  |
|  | - Global keyboard shortcut listener (Ctrl+Space / Win+Shift+V)            |  |
|  | - System tray manager & startup service                                   |  |
|  | - Local routine database & vector trigger cache                           |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
                                    ▲
                   Local WebSocket / IPC Pipe (Sub-10ms)
                                    ▼
+---------------------------------------------------------------------------------+
|                     WINDOWS AUTOMATION & VOICE ENGINE                           |
| - Wake Word Detector: Picovoice Porcupine / openWakeWord ("VoFlow")             |
| - Offline STT & VAD: Vosk Speech Recognizer + Silero VAD                        |
| - Intent Matcher: ONNX Runtime (all-MiniLM / IndoBERT sentence embedding)       |
| - Native Execution: Win32 CoreAudio (Volume), PowerShell Runner, ShellExecuteEx |
+---------------------------------------------------------------------------------+
```

---

## 2. Master System Lifecycle Flow

From PC boot to command execution and standby:

```
[ Windows Boots / App Launched ]
              │
              ▼
[ Electron Main Initializes ]
  ├── 1. Register System Tray Icon
  ├── 2. Register Global Hotkey (Ctrl + Space)
  ├── 3. Load Saved Routines & Precompute Trigger Vectors
  └── 4. Spawn Background Voice & Automation Daemon
              │
              ▼
[ STATE: IDLE / STANDBY ]
  ├── Mic streams audio chunks (16kHz PCM) to Wake Word Engine (CPU < 0.5%)
  ├── Workbench is either minimized to tray or open for routine editing
  └── Dynamic Island is completely hidden (dimensions: 0x0 or collapsed above Y=0)
              │
              │ User says: "VoFlow"  OR  Presses: [Ctrl + Space]
              ▼
[ EVENT: INVOCATION DETECTED ]
  ├── Play subtle audio chime ("soft-chime.wav")
  ├── Summon Dynamic Island: slides down from top-center (Y: 0 -> Y: 24px)
  ├── Dynamic Island renders: [Mic Icon Waveform] "Listening..."
  ├── Mascot Flowy wakes up (ears perked, eyes wide)
  └── Start 4.0-second silence watchdog timer
              │
       +──────┴───────────────────────────+
       │                                  │
[ Speech Detected within 4.0s ]    [ Silence >= 4.0s Timeout ]
       │                                  │
       ▼                                  ▼
[ Capture Utterance & VAD ]        [ Abort Invocation ]
  ├── Silero VAD monitors stream     ├── Dynamic Island shows: "Timed Out"
  ├── User speaks: "Mulai Kerja"     └── Slides up and collapses to standby
  └── Trailing silence (1.2s)
      triggers audio finalize
              │
              ▼
[ Speech-to-Text & Intent Routing ]
  ├── Vosk transcribes audio -> "mulai kerja"
  ├── Dynamic Island updates: [Gear Icon] "Thinking..."
  ├── ONNX encodes text -> 384-d vector
  └── Cosine Similarity against all routine trigger vectors
              │
       +──────┴───────────────────────────+
       │                                  │
[ Confidence >= 0.75 ]             [ Confidence < 0.75 ]
       │                                  │
       ▼                                  ▼
[ WORKFLOW MATCHED: "Work Mode" ]   [ UNRECOGNIZED COMMAND ]
  ├── Dynamic Island displays:        ├── Dynamic Island displays:
  │   "Work Mode - Starting..."       │   "Sorry, couldn't match that!"
  └── Dispatch action pipeline        ├── Plays soft confused wobble sound
              │                       └── Collapses after 1.8s
              ▼
[ SEQUENTIAL ACTION EXECUTION ]
  ├── Dynamic Island expands to Checklist View
  ├── Step 1: Set Volume 25%       ──> [v] Completed (Chime)
  ├── Step 2: Focus Assist ON      ──> [v] Completed (Chime)
  ├── Step 3: Launch VS Code       ──> [v] Completed (Chime)
  └── Step 4: Open Browser URLs    ──> [v] Completed (Chime)
              │
              ▼
[ COMPLETION & CELEBRATION ]
  ├── Dynamic Island shows: [★] "Work Mode - All Done!"
  ├── Mascot Flowy cheers with mini star burst
  ├── Hold for 1.5 seconds
  └── Smooth spring animation collapses Island back to hidden standby
```

---

## 3. Frontend UI & User Interaction Flows

### Flow 3.1: Routine Authoring & Assembly ("The Toybox Builder")
How the user creates or customizes a routine in the Electron Workbench:

```
[ User opens VoFlow Workbench ]
              │
              ▼
[ Dashboard Screen ]
  ├── Shows Routine Cards in a cozy 2-column masonry grid
  ├── Displays Mascot Flowy in header with daily greeting
  └── Quick Search Bar (`Ctrl+F` or click)
              │
              │ Clicks "+ New Routine" (Strawberry PushButton)
              ▼
[ Routine Editor Canvas ]
  ├── Step 1: Routine Identity
  │     ├── Routine Name: "Deep Focus Mode"
  │     ├── Icon Picker: Select cute 3D icon (e.g., 🧙‍♂️ or 💻)
  │     └── Color Theme Picker: Strawberry, Mint, Sunny, Blueberry, Grape
  │
  ├── Step 2: Voice Incantation (Triggers)
  │     ├── Default trigger: "Deep focus mode"
  │     ├── Add natural phrasing variants: "Mulai kerja", "Waktunya ngoding"
  │     └── Instant Preview: Shows similarity test badge
  │
  ├── Step 3: Action Blocks Pipeline (Modular Toy Bricks)
  │     ├── Visual snap-in pipeline with connector nubs
  │     ├── User clicks "+ Add Action" from Bottom Palette:
  │     │     ├── [🔊 Audio & Media Block]
  │     │     ├── [🚀 App Launcher Block]
  │     │     ├── [🌐 Web Workspace Block]
  │     │     └── [⚡ PowerShell / Script Block]
  │     │
  │     ├── Drag-and-Drop Reordering:
  │     │     └── Cards squish, jiggle, and bounce into place
  │     │
  │     └── Progressive Disclosure ("Pro Mode" Toggle):
  │           ├── Default: Simple friendly dropdowns (e.g. "Volume: 25%")
  │           └── Click "Pro ⚙️": Expands code tray for raw PowerShell scripts,
  │               launch arguments, and custom delay offsets (ms)
              │
              │ Clicks "Save Routine" (Mint PushButton)
              ▼
[ Routine Saved & Indexed ]
  ├── Saves JSON routine configuration to disk
  ├── Triggers IPC: `intent:index-routine`
  ├── Local ONNX pre-caches vector embeddings for the new trigger phrases
  └── Shows cheerful toast notification with soft pop sound
```

---

### Flow 3.2: Interactive "Test Run" Simulation
Allows users to test a routine inside the Workbench with visual and sound feedback:

```
[ User in Routine Editor ]
              │
              │ Clicks "Test Run ▶️" (Sunny PushButton)
              ▼
[ Interactive Simulation Begins ]
  ├── Workbench locks editor fields during test
  ├── Mascot Flowy changes state to "Tinkering" (holding tiny wrench)
  │
  ├── [Action Block 1: Set Volume]
  │     ├── Energy Beam shoots from top connector into Block 1
  │     ├── Block 1 borders pulse with neon glow
  │     ├── Native CoreAudio executes volume change
  │     ├── Block 1 displays green checkmark [v]
  │     └── Audio haptic: soft marimba pop (440 Hz)
  │
  ├── [Action Block 2: Launch IDE]
  │     ├── Energy Beam travels down connector wire into Block 2
  │     ├── Block 2 glows, VS Code launches
  │     ├── Block 2 displays green checkmark [v]
  │     └── Audio haptic: soft marimba pop (554 Hz)
  │
  ├── [Action Block 3: Open URLs]
  │     ├── Energy Beam reaches Block 3
  │     ├── Browser tabs open
  │     ├── Block 3 displays green checkmark [v]
  │     └── Audio haptic: soft marimba pop (659 Hz)
  │
  └── [Pipeline Complete]
        ├── Canvas-confetti triggers mini starburst around "Test Run" button
        ├── High chord fanfare chime plays (880 Hz)
        ├── Mascot Flowy bounces with heart eyes
        └── Editor unlocks, ready for further customization
```

---

### Flow 3.3: Dynamic Island Overlay Interaction Flow

The Dynamic Island window is an always-on-top, borderless Electron window (`transparent: true`, `frame: false`) floating at the top-center of the primary monitor.

```
+----------------------------------------------------------------------+
| STATE 0: HIDDEN / STANDBY                                            |
| Width: 0px, Height: 0px, or Y: -80px (offscreen)                     |
| Pointer events: ignored (passthrough to apps underneath)             |
+----------------------------------------------------------------------+
                                  │
                     Trigger: Wake Word / Hotkey
                                  │
                                  ▼
+----------------------------------------------------------------------+
| STATE 1: LISTENING PILL                                              |
| Size: 240px x 42px, Position: Centered at top (Y: 12px)              |
| Background: Rich Dark Slate (#1E293B) with 2px Strawberry Rim        |
| Content: [🎙️ Live Animated Audio Waves]  "VoFlow: Listening..."     |
+----------------------------------------------------------------------+
                                  │
                     Spoken Command Detected
                                  │
                                  ▼
+----------------------------------------------------------------------+
| STATE 2: RECOGNIZING & MATCHING                                      |
| Size: 300px x 46px                                                   |
| Content: [✨ Spinning Magic Wand]  "Mulai Kerja..."                  |
+----------------------------------------------------------------------+
                                  │
                     Intent Matched: WORK_MODE
                                  │
                                  ▼
+----------------------------------------------------------------------+
| STATE 3: EXPANDED CHECKLIST (Live Execution)                         |
| Size: 380px x 180px, Corner Radius: 28px                             |
| Header: "Work Mode"  [ 3/4 Running ]                                 |
| Body:                                                                |
|   [v] Set Master Volume to 25%            (Done)                     |
|   [v] Turn ON Focus Assist                (Done)                     |
|   [▶] Launch Visual Studio Code           (In progress...)           |
|   [ ] Open GitHub & Board Tabs            (Queued)                   |
+----------------------------------------------------------------------+
                                  │
                     All Steps Completed Successfully
                                  │
                                  ▼
+----------------------------------------------------------------------+
| STATE 4: CELEBRATION & COMPLETION                                    |
| Size: 320px x 48px                                                   |
| Content: [🎉 Star Icon]  "Work Mode Ready! Enjoy deep work!"         |
| Mini star particles burst from the pill sides                        |
+----------------------------------------------------------------------+
                                  │
                     Auto-dismiss delay (1.5 seconds)
                                  │
                                  ▼
+----------------------------------------------------------------------+
| Smooth spring collapse animation back to STATE 0 (Standby)          |
+----------------------------------------------------------------------+
```

---

### Flow 3.4: Mascot ("Flowy") State Engine

Flowy is the user's ambient companion. Flowy lives in the Workbench header and inside the Dynamic Island status:

```
                +----------------------------+
                |         IDLE_SLEEP         |
                |  Floating gently, "Zzz"    |
                +----------------------------+
                              │
               Wake word / User opens app
                              ▼
                +----------------------------+
                |        IDLE_AWAKE          |
                | Blinking, smiling, waving  |
                +----------------------------+
                   │                      ▲
     Voice detected│                      │ Inactivity > 30s
                   ▼                      │
+----------------------------+            │
|         LISTENING          |            │
| Ears perked, cheeks glow   |            │
+----------------------------+            │
               │                          │
   Audio sent to STT                      │
               ▼                          │
+----------------------------+            │
|          THINKING          |            │
| Looking up, pondering dots |            │
+----------------------------+            │
               │                          │
   Routine matched & running              │
               ▼                          │
+----------------------------+            │
|         TINKERING          |            │
| Holding wrench/wand, busy  |            │
+----------------------------+            │
               │                          │
   Routine finished                       │
               ▼                          │
+----------------------------+            │
|         CELEBRATING        |            │
| Jumping with stars & heart ├────────────+
+----------------------------+ (after 3s)
```

---

## 4. IPC (Inter-Process Communication) Event Matrix

To keep all parts connected and synchronized, the Electron main process, renderers, and native background daemon communicate via defined IPC channels:

### 4.1 Channels: Voice & Inference Pipeline

| IPC Channel | Direction | Payload Example | Description |
|---|---|---|---|
| `voice:wake-detected` | Native -> Main -> Renderers | `{ timestamp: 1720000000, keyword: "voflow" }` | Emitted when wake word engine detects "VoFlow". Triggers Dynamic Island expansion. |
| `voice:sound-level` | Native -> Main -> Island | `{ rms: 0.42 }` | Live audio input amplitude (for drawing the animated waveform). |
| `voice:transcription` | Native -> Main -> Island | `{ text: "mulai kerja", isFinal: true }` | STT transcribed text from user speech. |
| `intent:match-result` | Native -> Main -> Island | `{ routineId: "wf_01", title: "Work Mode", confidence: 0.92 }` | Matched routine after vector cosine similarity evaluation. |
| `intent:unmatched` | Native -> Main -> Island | `{ rawText: "buka martabak", maxScore: 0.41 }` | Emitted when confidence is below threshold (< 0.75). |

### 4.2 Channels: Routine Execution & Control

| IPC Channel | Direction | Payload Example | Description |
|---|---|---|---|
| `routine:run` | Workbench/Island -> Main -> Native | `{ routineId: "wf_01", origin: "voice" \| "test_run" }` | Requests execution of a routine by ID. |
| `routine:step-started` | Native -> Main -> Renderers | `{ routineId: "wf_01", stepIndex: 0, stepTitle: "Set Volume" }` | Signals an action step has started running. |
| `routine:step-finished`| Native -> Main -> Renderers | `{ routineId: "wf_01", stepIndex: 0, success: true }` | Signals an action step completed. |
| `routine:completed` | Native -> Main -> Renderers | `{ routineId: "wf_01", totalSteps: 4, durationMs: 1200 }` | Routine finished. Triggers celebrations and auto-collapse. |
| `routine:abort` | Workbench/Island -> Main -> Native | `{ routineId: "wf_01", reason: "user_cancel" }` | Cancels any running action chain. |

### 4.3 Channels: Window & UI Management

| IPC Channel | Direction | Payload Example | Description |
|---|---|---|---|
| `window:island-resize` | Island -> Main | `{ width: 380, height: 180 }` | Requests BrowserWindow resize with smooth native animation. |
| `window:toggle-workbench`| Tray/Shortcut -> Main | `{}` | Shows or hides the main gamified control panel. |
| `settings:sound-toggle`| Workbench -> Main -> Renderers | `{ soundEnabled: false }` | Toggles app-wide audio haptics (mute mode). |

---

## 5. Error Handling & Fallback Flows

```
[ Error Scenario 1: Unrecognized Voice Command ]
User says something not configured (e.g. "Pesen makan siang")
  ├── STT transcribes: "pesen makan siang"
  ├── ONNX cosine similarity max score is 0.42 (< 0.75 threshold)
  ├── Island displays: "Command not recognized" with gentle wobble animation
  ├── Plays soft low chime
  └── Island collapses after 1.8s back to standby without executing anything

[ Error Scenario 2: Action Fails during Execution ]
User configured an action launching "D:\OldApp\test.exe" that was deleted
  ├── Step 1 executes successfully
  ├── Step 2 encounters: Win32 File Not Found (Error 2)
  ├── Step 2 card in Dynamic Island turns soft coral [!] "App not found"
  ├── If "Continue on Error" is TRUE:
  │     └── Step 3 and 4 continue executing
  └── If "Continue on Error" is FALSE:
        ├── Pipeline halts gracefully
        ├── Island shows: "Work Mode paused at step 2"
        └── Island collapses after 3.0s, leaving a notification in Workbench

[ Error Scenario 3: Microphone Disconnected ]
Windows default audio recording device changes or disconnects
  ├── Audio stream throws WASAPI capture error
  ├── Background daemon attempts automatic reconnection every 2.0s
  ├── Workbench header displays: [!] "Microphone sleeping - Check connection"
  └── Wake word listening resumes automatically once mic returns
```

---

## 6. Summary of Key Principles

1. **Deterministic Execution:** The AI model is used strictly for **intent routing** (mapping natural phrasing to a user-defined routine ID). Once routed, execution is 100% deterministic, local, and reliable.
2. **Immediate Feedback:** Every user action (voice trigger, button click, step completion) provides instant visual and auditory feedback.
3. **Decoupled Architecture:** Even if the Electron Workbench dashboard is closed, the lightweight background daemon and Dynamic Island overlay remain responsive to voice triggers and hotkeys.
