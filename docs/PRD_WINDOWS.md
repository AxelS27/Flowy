# Product Requirements Document (PRD) - VoFlow for Windows Desktop

- **Product Name:** VoFlow Desktop
- **Product Type:** Desktop Utility & Automation Application
- **Platform:** Windows 10 / Windows 11 (x64)
- **Primary Technology Stack:** Electron (React 18 + Vite + TypeScript) + C++ (Win32 APIs) / PowerShell Runner
- **Project Focus:** On-Device Wake Word, Speech-to-Text, Deep Learning Intent Routing, Windows System Automation, Floating Dynamic Island Overlay, Gamified Tactile Control Panel (Playful & Cute Daily Driver)
- **Status:** Product Concept / MVP Specification

---

## 1. Product Overview

VoFlow Desktop is a customizable voice automation application for Windows that allows users to trigger and execute multi-step desktop workflows using personalized voice commands.

Instead of manually launching multiple programs, adjusting audio settings, enabling focus modes, and opening browser workspaces every time they switch contexts, users define single voice triggers to orchestrate sequential Windows actions.

### Two-Stage Interaction Model
VoFlow Desktop utilizes an intuitive two-stage interaction flow:
1. **Invocation (Wake Word):** The user speaks the wake word: *"VoFlow"*.
2. **Visual Activation:** A sleek, always-on-top **Dynamic Island / Floating Notch overlay** smoothly expands from the top center of the primary display, accompanied by a subtle audio chime (*"Listening..."*).
3. **Command Input:** The user utters their custom command (e.g., *"Work Mode"* or *"Mulai Kerja"*).
4. **Execution & Live Feedback:** The workflow executes sequentially, rendering live checklist progress in the overlay.
5. **Completion:** The overlay signals completion (*"Completed"*) and smoothly collapses back into standby.

### Design Identity: The Playful, Cute & Ergonomic Daily Driver
VoFlow pairs its minimalist Dynamic Island overlay with a vibrant, tactile **Control Panel Workbench** built in **Electron + React**:
- **Aesthetic Inspiration:** Blends the joyful, tactile physics of **Toca Boca**, the comforting routine-building warmth of **Finch**, and the snappy, satisfying feedback of **Nintendo Switch**.
- **Tactile Toy-Box UX:** Features chunky 3D pushable buttons, bouncy spring physics (Framer Motion), soft audio haptics (chimes, pops, bubble sounds with a quick global mute toggle), and celebratory star particles.
- **Daily Driver Comfort:** While playful and colorful (*Candy Popsicle* palette), high contrast is strictly preserved so typography is clear and fatigue-free for 8+ hour workdays.
- **Progressive Disclosure:** Simple, squishy action blocks on the surface for beginners; one-click expandable **"Pro Mode"** trays for power users to edit raw PowerShell scripts, execution flags, and timing delays.
- **Ambient Mascot ("Flowy"):** A charming, non-intrusive cloud/robot buddy residing in the corner of the workbench that reacts to speech states and celebrates completed routines.

### Example Scenario: "Work Mode"
A software engineer or student configures a workflow titled **"Work Mode"**:
1. Set Master Volume to 25%.
2. Enable Windows Focus Assist (Do Not Disturb).
3. Launch Visual Studio Code.
4. Launch Spotify and start playing a focus playlist.
5. Open browser tabs for GitHub and project Kanban board.

**Execution Flow:**
- User: *"VoFlow"*
- Dynamic Island expands at top center of monitor: `[Mic] VoFlow: Listening...`
- User: *"Work mode"* (or *"Mulai kerja"*)
- Dynamic Island updates: `[Gear] Work Mode - Processing...`
- Actions execute sequentially with live checklist ticks in the overlay.
- Dynamic Island shows `[v] Work Mode - Completed` and collapses.

---

## 2. Problem Statement

Desktop users switch contexts multiple times a day (e.g., between working, studying, gaming, and relaxing). Each transition involves repetitive manual friction:
```
Adjust Volume -> Turn on Focus Mode -> Launch IDE -> Open Music App -> Open Workspace URLs
```

While each task is trivial on its own, repeating these steps creates friction throughout the workday.

Existing assistants (such as Microsoft Copilot or Cortana) operate as conversational chatbots or search helpers. They do not provide deterministic, user-defined workflow chaining tied directly to local Windows APIs, shell scripts, and personal preferences.

VoFlow Desktop solves this by acting as a dedicated voice-activated automation engine:
> **"When I say X, execute desktop workflow Y."**

---

## 3. Product Vision & Value Proposition

### Vision Statement
Empower desktop users to orchestrate complex desktop environments and repetitive system routines through single, personalized voice commands.

### Core Value: Desktop-Grade Customizable Automation
VoFlow enables users to map natural voice utterances to powerful Windows system actions, application launches, and command scripts.

| Voice Command | Executed Desktop Actions |
|---|---|
| **"Work Mode"** | Volume 25% -> Focus Assist ON -> Launch VS Code -> Launch Spotify -> Open GitHub |
| **"Meeting Mode"** | Volume 40% -> Mute Microphone -> Launch Zoom -> Close Discord/Games |
| **"Study Session"** | Volume 20% -> Focus Assist ON -> Set 50m Timer -> Launch Notion |
| **"Gaming Mode"** | Volume 70% -> Focus Assist ON -> Launch Steam -> Launch Discord |
| **"Shutdown Routine"** | Close all browsers -> Set Volume 0% -> Lock Workstation |

### Positioning: General Assistant vs. VoFlow Desktop

| Dimension | Copilot / Web Assistants | VoFlow Desktop |
|---|---|---|
| **Scope** | Broad conversational Q&A and text generation | Focused local Windows automation |
| **Trigger & UX** | Manual typing or clicking sidebar | Hands-free wake word + Dynamic Island overlay |
| **Execution** | Cloud-based generative suggestions | Deterministic, local multi-step action pipeline |
| **OS Control** | Minimal / sandbox limited | Direct Win32, ShellExecute, and PowerShell control |
| **Privacy & Speed** | Remote server processing | 100% on-device wake word and intent routing |

---

## 4. Target Users & Personas

### Target Audience
- Software developers, engineers, and digital creators.
- Students and academics studying at PC/laptop desks.
- Power users who appreciate workflow tools like Raycast, Alfred, or Elgato Stream Deck, but want hands-free voice control.
- Gamers and remote workers needing instant workspace setup.

### Persona: Kevin - Full Stack Developer
- **Profile:** Spends 8+ hours a day at his dual-monitor Windows workstation.
- **Pain Point:** Frequently switches between deep coding sessions, team meetings, and relaxation. Manually reorganizing windows, opening dev tools, and adjusting audio settings breaks his rhythm.
- **Solution with VoFlow Desktop:** Without touching the mouse, he says *"VoFlow, Meeting Mode"*, and his workspace configures itself instantly.

---

## 5. Core Interaction Architecture

```
+-----------------------------------------------------------------+
| STATE 0: STANDBY (Background Listening)                         |
| Low-power Wake Word Engine listens for "VoFlow" via mic input   |
+-----------------------------------------------------------------+
                                |
                   Wake Word Detected ("VoFlow")
                                v
+-----------------------------------------------------------------+
| STATE 1: WAKE & EXPAND                                          |
| Audio chime plays + Dynamic Island slides down at top of screen |
| Status: "Listening for command..."                              |
+-----------------------------------------------------------------+
                                |
                 User speaks: "Work Mode"
         (Timeout fallback: 4s silence -> Auto collapse)
                                v
+-----------------------------------------------------------------+
| STATE 2: RECOGNITION & INTENT ROUTING                           |
| Speech-to-Text transcribes audio                                |
| Deep Learning / Sentence Embedding maps phrase -> Target WF     |
| Status: "Work Mode - Processing..."                             |
+-----------------------------------------------------------------+
                                |
                                v
+-----------------------------------------------------------------+
| STATE 3: SEQUENTIAL WORKFLOW EXECUTION                          |
| C++ / Win32 Native Layer executes actions in sequence:          |
|   [v] Set Master Volume to 25%                                  |
|   [v] Enable Focus Assist                                       |
|   [v] Launch VS Code                                            |
|   [*] Launch Spotify (In progress)...                           |
|   [ ] Open Project URLs                                         |
+-----------------------------------------------------------------+
                                |
                                v
+-----------------------------------------------------------------+
| STATE 4: COMPLETION & COLLAPSE                                  |
| Status: "Work Mode - Completed"                                 |
| Dynamic Island collapses back to hidden / pill state            |
+-----------------------------------------------------------------+
```

---

## 6. Functional Requirements & Features

### 6.1 Wake Word Detection & Trigger Methods
- **Primary Hands-Free Invocation:** On-device keyword spotting for the wake word **"VoFlow"** (e.g., via Picovoice Porcupine or Vosk). Operates with negligible CPU utilization (< 0.5% on modern x86_64 CPUs).
- **Secondary / Manual Triggers:**
  - **Global Keyboard Shortcut:** User-configurable global hotkey (e.g., `Ctrl + Space` or `Win + Shift + V`) to summon the listening overlay instantly.
  - **System Tray Icon:** Single-click on the VoFlow tray icon.
  - **In-App Mic Button:** Push-to-talk button on the Electron desktop dashboard.
- **Silence Timeout:** If the overlay activates but no speech is detected within 4 seconds, the overlay smoothly collapses back to standby.

### 6.2 Floating Dynamic Island Overlay (Windows Top Bar)
A transparent, borderless, always-on-top window anchored to the top-center of the primary monitor:
- Implemented as a hardware-accelerated, transparent Electron BrowserWindow (`frame: false`, `transparent: true`, `alwaysOnTop: true`, `skipTaskbar: true`, with mouse passthrough when idle) or native Win32 layered window (`WS_EX_LAYERED`, `WS_EX_TOPMOST`, `WS_EX_TOOLWINDOW`) to avoid taskbar pollution or focus stealing.
- Hardware-accelerated smooth expand and collapse animations.
- Renders live execution states:
  1. **Listening:** Subtle waveform or pulsing mic icon.
  2. **Processing:** Command title with loading indicator.
  3. **Executing:** Step-by-step checklist of running actions.
  4. **Completed:** Success state displayed for 1.5 seconds before auto-dismissal.

### 6.3 Gamified Control Panel & Routine Builder (Modular Toy Blocks)
The desktop control panel provides an intuitive, tactile workbench for authoring and managing automation routines:
- **Modular Toy Blocks:** Actions assemble like snap-in toy bricks with color-coded categories (Audio in Sorbet Red, Apps in Boba Mint, Web in Blueberry Milk, Scripts in Grape Jelly).
- **Tactile Physics & Motion:** Smooth drag-and-drop reordering with squash & stretch spring physics (180ms - 220ms responsiveness).
- **Interactive "Test Run":** Users can test routines directly inside the dashboard; an animated glowing energy beam shoots sequentially down the action pipeline, checking off blocks with cheerful audio feedback and mini star confetti upon success.
- **Progressive Disclosure ("Pro Mode"):** Each action block contains a toggleable Pro drawer exposing raw PowerShell parameters, timeout guards, and fallback conditions.
- **Audio Haptics & Mute:** Tactile clicks, pops, and chimes on button presses and routine execution, with a prominent cute mute switch for quiet office environments.
- **Companion Mascot ("Flowy"):** A lightweight animated companion in the workbench header that mirrors voice detection, sleep, and routine success states.
- **Routine Management:** Full CRUD capabilities (create, duplicate, edit, delete, enable/disable toggle) with instant local indexing for voice intent matching.

### 6.4 Desktop Action System
The Windows execution engine supports a modular action catalog:

#### System & Audio Actions
- **Set Master Volume:** Set speaker output level (0% - 100%).
- **Toggle Mute:** Mute or unmute system audio or microphone input.
- **Focus Assist / Do Not Disturb:** Enable or disable Windows Focus Assist to silence notifications.
- **Lock Workstation:** Instantly lock Windows session (`rundll32.exe user32.dll,LockWorkStation`).
- **Windows Timer / Countdown:** Set desktop reminder countdown.
- **Media Controls:** Send virtual media keys (Play/Pause, Next Track, Previous Track).

#### Application & Workspace Actions
- **Launch Application:** Start installed Windows applications (.exe, UWP app URI, or registered desktop shortcuts).
- **Kill / Close Application:** Terminate specific background processes gracefully or by process name.
- **Open URL(s):** Launch one or multiple URLs in the user's default browser or specific browser profiles.
- **Open File / Folder:** Open designated directories or files in Windows File Explorer or targeted IDEs.

#### Power & Developer Actions
- **Execute Shell / PowerShell Command:** Run arbitrary PowerShell scripts or commands (headless or in a new terminal window) for advanced user automation.

### 6.5 Natural Voice Command Matching (Deep Learning Layer)
Users should not be forced to speak rigid exact phrases. The engine accommodates natural conversational phrasing:
- Example variants for *"Work Mode"*:
  - *"Work mode"*
  - *"Start working"*
  - *"Mulai kerja"*
  - *"Aktifkan mode kerja"*
  - *"Waktunya kerja"*
- **Implementation:** Pretrained lightweight Sentence Embedding model (e.g., `all-MiniLM-L6-v2` or `IndoBERT-small` running via **ONNX Runtime** on Windows).
- Calculates Cosine Similarity between user utterance vector and stored workflow trigger vectors.
- If similarity exceeds confidence threshold ($\tau \ge 0.75$), the matching workflow executes immediately without requiring cloud round-trips.

---

## 7. User Flows

### 7.1 Authoring Flow (Workflow Creation)
```
Open VoFlow Dashboard
    |
    v
Click "New Command"
    |
    v
Enter Command Title & Trigger Phrases ("Work Mode", "Mulai Kerja")
    |
    v
Add Actions from Catalog:
  - Action 1: Set Volume (25%)
  - Action 2: Focus Assist (ON)
  - Action 3: Launch App ("C:\...\Code.exe")
  - Action 4: Open URL ("https://github.com")
    |
    v
Reorder & Configure Parameters
    |
    v
Save -> Automatically indexed by Intent Matcher
```

### 7.2 Voice Execution Flow (Two-Stage Invocation)
```
User speaks: "VoFlow"
    |
    v
Background Wake Word Engine detects keyphrase
    |
    v
Audio chime plays + Dynamic Island slides down from top of monitor
    |
    v
User speaks: "Mulai kerja"
    |
    v
Speech-to-Text converts audio to text transcript
    |
    v
ONNX / Sentence Embedding matches transcript to WORKFLOW_WORK_MODE
    |
    v
Native Win32 / C++ Execution Engine executes actions sequentially:
  [v] Volume set to 25%
  [v] Focus Assist activated
  [v] VS Code launched
  [v] GitHub opened in browser
    |
    v
Dynamic Island shows "Completed" -> Smoothly slides up and collapses
```

---

## 8. Technical Architecture

### 8.1 Responsibility Separation

```
+-------------------------------------------------------------------+
|               ELECTRON RENDERER (Playful Client UI)               |
| - React 18 + Vite + TypeScript Frontend Framework                 |
| - Styling: Tailwind CSS with "Candy Popsicle" design tokens       |
| - Animation & Physics: Framer Motion (Spring & drag-and-drop)     |
| - Audio Haptics: Web Audio Synthesizer / Howler.js (Pop/Chime)    |
| - Visual Rewards: Canvas-Confetti & Animated SVG Mascot ("Flowy") |
| - Settings, Gamified Action Builder & Quick Search Dashboard      |
+-------------------------------------------------------------------+
                                 |
                 Electron IPC (contextBridge / preload)
                                 |
                                 v
+-------------------------------------------------------------------+
|               ELECTRON MAIN PROCESS (Desktop Controller)          |
| - Window Management: Main Workbench + Transparent Dynamic Island  |
| - System Tray Lifecycle (Tray icon, minimize to tray, autostart)  |
| - Local JSON / SQLite Storage for User Routines                   |
| - Global Keyboard Shortcut Registration (globalShortcut API)      |
+-------------------------------------------------------------------+
                                 |
                     Child Process / Win32 Bridge
                                 |
                                 v
+-------------------------------------------------------------------+
|               WINDOWS AUTOMATION & EXECUTION LAYER                |
| - PowerShell Runner: Headless execution for advanced automation   |
| - CoreAudio Volume Helper: Master volume & microphone mute        |
| - ShellExecuteEx & CreateProcess: App, URL, and directory launch  |
| - Virtual Media Keys & Windows Focus Assist Toggles               |
+-------------------------------------------------------------------+
                                 |
                                 v
+-------------------------------------------------------------------+
|               VOICE & DEEP LEARNING INFERENCE LAYER               |
| - Wake Word Engine: Picovoice Porcupine / openWakeWord ("VoFlow") |
| - Speech-to-Text: Vosk Offline STT (Indonesian / English Model)   |
| - Intent Matching: ONNX Runtime (IndoBERT-small / MiniLM)         |
| - Fast Vector Search (Cosine Similarity against trigger vectors)  |
+-------------------------------------------------------------------+
```

### 8.2 Dynamic Island Window Specifications (Windows)
- **Window Flags:** `WS_POPUP`, `WS_EX_TOPMOST`, `WS_EX_LAYERED`, `WS_EX_TOOLWINDOW` (prevents taskbar entry and alt-tab pollution).
- **Positioning:** Horizontally centered at `(Screen.Width - Island.Width) / 2`, anchored at `Y = 0` (top of screen).
- **Animation:** Hardware-accelerated sliding down / expansion via easing curve, followed by collapse upon completion.

---

## 9. Scope Boundaries

### In Scope for MVP
- **Two-Stage Voice Interaction:** Wake word ("VoFlow") -> Dynamic Island activation -> Spoken command -> Execution.
- **Dynamic Island Overlay:** Smooth, borderless floating window on Windows primary display with real-time status indicators.
- **Gamified Control Panel Workbench:** Tactile, cute, and colorful Electron UI with 3D pushable buttons, bouncy spring physics, and modular action blocks.
- **Interactive Test Run:** Visual pipeline testing with energy beam animation, star particles, and soft sound haptics.
- **Alternative Invocations:** Global hotkey (`Ctrl + Space`), system tray, and in-app button.
- **Custom Workflow Management:** Full CRUD capabilities for workflows, custom trigger phrases, and expandable Pro Mode for raw scripting.
- **Supported Desktop Actions:**
  - Master volume control & mute.
  - Windows Focus Assist (Do Not Disturb) toggle.
  - Application launcher (paths and installed shortcuts).
  - Browser URL launcher.
  - Folder and file opener in Explorer.
  - PowerShell / Command line execution.
  - Lock workstation.
  - Media key simulation (Play/Pause, Next, Previous).
- **On-Device NLP / Intent Router:** Local sentence embedding vector matching via ONNX Runtime.
- **System Tray Integration:** Run in background on Windows startup with minimize-to-tray capability.

### Out of Scope for MVP
- Open-domain generative conversation or chatbot dialogues.
- Multi-monitor custom overlay placement (fixed to primary monitor for MVP).
- Complex OCR / GUI mouse-clicking automation (e.g., RPA-style clicking specific coordinates inside third-party apps).
- Cloud synchronization or web accounts (all configurations stored locally on disk).

---

## 10. Academic & Research Potential

VoFlow Desktop offers an ideal testbed for on-device natural language routing on modern PC hardware:

### Research Topic
> *Evaluating On-Device Sentence Embedding and Intent Routing Architectures for Low-Latency Desktop Voice Automation.*

### Experimental Matrix
1. **Rule-Based & Exact Matching:** Normalized string matching and Levenshtein distance.
2. **Traditional NLP / ML:** TF-IDF vectorization with Linear SVM / Naive Bayes.
3. **Deep Learning Embeddings:** Quantized Transformer models (e.g., `all-MiniLM-L6-v2` vs. `IndoBERT-small` via ONNX Runtime).

### Evaluated Metrics
- **Intent Classification Accuracy & F1-Score** across diverse command phrasings (Indonesian and English).
- **Inference Latency (ms):** Vector encoding and cosine similarity search time on desktop CPU.
- **CPU & Memory Footprint:** Background resource usage during idle wake-word standby vs. active execution.

---

## 11. Key Success Metrics & KPIs

| Metric | Definition | MVP Target |
|---|---|---|
| **Wake Word Detection Rate** | Successful detection of "VoFlow" within normal speaking distance | >= 95% |
| **False Activation Rate** | Unintended wake word triggers during standard room conversation | < 1 per 8 hours |
| **Command Match Rate** | Correctly resolved workflow from natural phrasing variants | >= 90% |
| **Inference Latency** | Time taken from speech transcript to matched workflow ID | < 150 ms |
| **Workflow Completion Rate** | Ratio of workflows completing all configured steps successfully | >= 98% |
| **UI Spring Transition Latency** | Time taken for tactile UI animations to settle smoothly | < 250 ms |
| **Idle CPU Utilization** | Continuous background standby CPU usage | < 1.0% |

---

## 12. Product Summary & Defense

### Elevator Pitch
> VoFlow Desktop is an intelligent Windows automation utility that lets users create personalized multi-action desktop routines and execute them hands-free using a natural two-stage voice command ("VoFlow" -> Command), complete with a sleek Dynamic Island overlay that tracks execution in real time.

### Addressing the Fundamental Question: "Why not Copilot or Elgato Stream Deck?"
> *"Copilot is a conversational web-centric AI, not a deterministic desktop automation orchestrator. Elgato Stream Deck and macro utilities like AutoHotkey are powerful, but they require physical button presses or memorizing complex keyboard shortcuts. VoFlow Desktop combines the flexibility of customizable multi-action workflows with the speed and elegance of voice control and an ambient Dynamic Island display."*
