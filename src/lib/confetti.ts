import confetti from "canvas-confetti";

export function fireConfetti() {
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const defaults = { zIndex: 9999, colors: ["#3b7bff", "#8a5cf6", "#f6608f", "#fb8b46", "#5b4ce6"] };

  confetti({ ...defaults, particleCount: 80, spread: 70, origin: { y: 0.6 } });

  setTimeout(() => {
    confetti({ ...defaults, particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 0.65 } });
    confetti({ ...defaults, particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.65 } });
  }, 150);

  setTimeout(() => {
    confetti({ ...defaults, particleCount: 40, spread: 100, decay: 0.91, scalar: 0.8, origin: { y: 0.55 } });
  }, 350);
}
