export interface MovementVector {
  x: number;
  y: number;
}

export function normalizeMovementVector(
  x: number,
  y: number,
  deadzone = 0.12,
): MovementVector {
  const magnitude = Math.hypot(x, y);
  if (magnitude <= deadzone) {
    return { x: 0, y: 0 };
  }

  if (magnitude <= 1) {
    return { x, y };
  }

  return { x: x / magnitude, y: y / magnitude };
}
