# Everyday action blocks

The palette in `src/data/actionCatalog.ts` contains 27 configurable blocks.
26 execute normally; Focus Assist / Do not disturb is temporarily reported as
skipped and does not stop the routine. See [backend architecture](BACKEND.md)
for execution semantics and Windows compatibility limitations.

## Actions

- Audio: set speaker volume, mute/unmute microphone or speaker.
- Apps: launch an executable, close an app normally.
- Web: open a website, open multiple websites, search Google.
- Focus: Focus Assist / Do not disturb (temporarily skipped).
- Files: open file/folder, create folder, recycle file/folder, rename, copy, move.
- Clipboard: copy text, clear clipboard.
- Timing and messages: wait, desktop notification, message, confirmation.
- Computer: lock, schedule shutdown/restart, cancel scheduled shutdown.
- Advanced: custom PowerShell script.

Audio requires a default audio device. Focus Assist is currently a safe no-op,
including legacy saved focus blocks. It emits a skipped status with a note,
does not require the native helper, and never opens Settings or changes DND.

## Safety

- All parameters are preflight-validated before the routine begins.
- Delete uses Recycle Bin and confirmation, never a permanent-delete fallback.
- Close App waits for normal window closure and reports save-dialog refusals.
  Tray/background processes are not force-terminated.
- Clipboard clearing, locking, power actions and scripts require confirmation.
- Power countdowns may force apps closed when they expire. Save your work first.
- Copy/move/rename refuse existing destinations; moves can cross local drives.
- Copy uses a staging path so cancellation does not publish a partial result.
- Paths must be absolute and local. Drive-root mutation and links are rejected.
- Website links use HTTP/HTTPS only; multi-website blocks accept up to 20 links.
- Wait and execution delay are bounded to five minutes.
- Stop does not undo completed actions or cancel a pending Windows shutdown.
- Explicit custom PowerShell scripts run with user privileges, with confirmation.
  Legacy reference snippets are not automatically executed as overrides.

The browser-only Island is a labelled visual preview. Real execution requires
the Electron desktop application.

## Build and checks

- `npm run build`: compile Electron/native helper and renderer.
- `npm run typecheck`: check renderer and Electron TypeScript.
- `npm run build:native`: rebuild only the Windows helper.
- `npm test`: optional existing Playwright Electron E2E suite.

The backend implementation change is validated without running Playwright or
shutdown/restart/lock/toggle operations on the user's machine.
