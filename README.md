# Flowy

> Intelligent, customizable voice automation utility for Windows with Dynamic Island live feedback.

Flowy enables users to automate repetitive multi-step system and application routines through a natural two-stage voice interaction model (**"Hey Flowy"** wake word -> Dynamic Island overlay -> Spoken command -> Multi-action execution).

---

## Project Documentation

1. **[Windows Product Requirements Document (PRD)](docs/PRD_WINDOWS.md)**
   - Complete product specification for Flowy Desktop on Windows 10/11.
   - Two-stage voice interaction model, supported Windows system actions, architecture, and roadmap.

2. **[Application & Frontend Architecture Flows (FLOWS.md)](docs/FLOWS.md)**
   - End-to-end interactive and operational flows across the entire system.
   - Master system lifecycle, gamified routine builder flow, interactive test run, Dynamic Island state transitions, and IPC event matrix.

3. **[Deep Learning Architecture & Engineering Specification](docs/DEEP_LEARNING_SPEC.md)**
   - Technical specification for the Deep Learning intent classification model (Transfer Learning / Fine-Tuning Transformer backbone).
   - Dataset engineering, training pipeline, evaluation metrics, and ONNX deployment.

4. **[Speech Recognition & Audio Pipeline Specification](docs/SPEECH_RECOGNITION_SPEC.md)**
   - Technical specification for audio capture, Wake Word Detection ("Hey Flowy"), Voice Activity Detection (VAD), and offline Speech to Text (Vosk Indonesian / Whisper).

5. **[Android Concept PRD](docs/PRD.md)**
   - Original mobile specification preserved for future mobile reference.
