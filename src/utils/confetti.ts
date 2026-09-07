import confetti from "canvas-confetti";

export function fireCelebrationConfetti() {
  try {
    // Starburst explosion from both bottom corners and center
    const colors = ["#FF5C8A", "#FFC837", "#2DD4BF", "#60A5FA", "#C084FC"];

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.7 },
      colors,
      shapes: ["circle", "square"],
      scalar: 1.1,
    });

    setTimeout(() => {
      confetti({
        particleCount: 25,
        angle: 60,
        spread: 55,
        origin: { x: 0.1, y: 0.8 },
        colors,
      });
      confetti({
        particleCount: 25,
        angle: 120,
        spread: 55,
        origin: { x: 0.9, y: 0.8 },
        colors,
      });
    }, 150);
  } catch (e) {
    // Canvas confetti safeguard
  }
}

export function fireStarBurst(x = 0.5, y = 0.5) {
  try {
    confetti({
      particleCount: 30,
      spread: 70,
      origin: { x, y },
      colors: ["#FFC837", "#FF5C8A", "#2DD4BF"],
      ticks: 120,
      gravity: 1.2,
      scalar: 0.9,
    });
  } catch (e) {}
}
