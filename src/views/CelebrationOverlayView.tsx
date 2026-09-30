import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

// A dedicated transparent desktop window, not a canvas clipped to the Island.
export function CelebrationOverlayView() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const api = window.electronAPI;
    if (!canvas || !api) return;
    const fire = confetti.create(canvas, { resize: true, useWorker: true });
    const timers: ReturnType<typeof setTimeout>[] = [];
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stop = () => {
      timers.splice(0).forEach(clearTimeout);
      fire.reset();
    };
    const celebrate = () => {
      stop(); // Repeated requests restart, not stack unbounded particle storms.
      if (motion.matches) return;
      const colors = ["#64a8ff", "#62d98b", "#af9dff", "#ffc857", "#ff8583", "#ffffff"];
      const defaults = { colors, ticks: 230, gravity: .9, decay: .94, scalar: 1.15, disableForReducedMotion: true };
      // Burst down and out from the notch, then cannons across both desktop edges.
      void fire({ ...defaults, particleCount: 140, angle: 270, spread: 145,
        startVelocity: 42, origin: { x: .5, y: .015 } });
      timers.push(setTimeout(() => {
        void fire({ ...defaults, particleCount: 75, angle: 55, spread: 65,
          startVelocity: 55, origin: { x: .03, y: .55 } });
        void fire({ ...defaults, particleCount: 75, angle: 125, spread: 65,
          startVelocity: 55, origin: { x: .97, y: .55 } });
      }, 180));
      [0.15, .32, .5, .68, .85].forEach((x, index) => {
        timers.push(setTimeout(() => {
          void fire({ ...defaults, particleCount: 22, angle: 270, spread: 95,
            startVelocity: 20, gravity: .7, scalar: .9, origin: { x, y: .01 } });
        }, 650 + index * 90));
      });
    };
    const unsubscribe = api.onCelebrationStart(celebrate);
    motion.addEventListener("change", stop);
    // Signal only after the listener exists, avoiding first-frame event loss.
    api.celebrationReady();
    return () => {
      unsubscribe();
      motion.removeEventListener("change", stop);
      stop();
    };
  }, []);
  return <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 w-full h-full pointer-events-none" />;
}
