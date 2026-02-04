import confetti from "canvas-confetti";

export function premiumConfettiBurst(intensity: "small" | "medium" | "big" = "medium") {
  const map = {
    small: { a: 55, b: 25, scalar: 0.8 },
    medium: { a: 90, b: 45, scalar: 0.9 },
    big: { a: 130, b: 65, scalar: 1.0 },
  }[intensity];

  const defaults = {
    spread: 58,
    ticks: 150,
    gravity: 0.95,
    decay: 0.92,
    startVelocity: 42,
    scalar: map.scalar,
  };

  confetti({ ...defaults, particleCount: map.a, origin: { x: 0.5, y: 0.5 } });
  confetti({ ...defaults, particleCount: map.b, spread: 85, startVelocity: 34, origin: { x: 0.2, y: 0.55 } });
  confetti({ ...defaults, particleCount: map.b, spread: 85, startVelocity: 34, origin: { x: 0.8, y: 0.55 } });
}