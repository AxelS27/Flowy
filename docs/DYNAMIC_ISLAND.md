# macOS-notch-inspired Dynamic Island

The Island has its own neutral system palette. The playful main application
palette is unchanged.

- Anchored to the primary display's full top-center bounds, with no 5px gap.
  Uses display origin coordinates, including negative coordinates, not workArea.
- Flat black surface, inverse top shoulders, rounded lower corners and a soft
  shadow. No colored rim or toy-button shadow.
- System typography, charcoal rows and blue/green/amber/red status accents.
- Local state glow, animated multicolor waveform, running-row/progress shimmer
  and checkmark pops, plus full-desktop success confetti.
- Celebration uses a separate transparent, always-on-top, non-focusable window
  covering the primary display. Bursts spread from the notch and both screen
  edges over other application windows. The overlay is entirely click-through,
  closes automatically after 2.8 seconds and respects reduced-motion preferences.
  It cannot render over Windows secure-desktop/UAC prompts.
- Top-origin expansion with reduced-motion support.
- Execution checklist stays visible for at least 2 seconds, followed by a
  3-second completion message. These are UI dwell times, not backend delays.
  Finished actions are labelled accurately during the reading pause.
- Transparent native-window margins forward clicks to the underlying app;
  only the visible notch is interactive.
- Repositions when display topology, primary display or metrics change.
- Fixed transparent frame leaves room for expansion/shadow without clipping.

`DynamicIsland.tsx` owns execution/state and `IslandSurface.tsx` owns presentation.
The existing native execution, Stop/Dismiss controls and DND Skipped state are
preserved. Browser previews remain explicitly labelled.

This is an inspired visual design for Flowy on Windows, not a macOS system
feature. The Island is a transient overlay when activated, not an always-visible
replacement for a physical camera notch.

Checks: Electron/renderer build and TypeScript only. No Playwright run.
