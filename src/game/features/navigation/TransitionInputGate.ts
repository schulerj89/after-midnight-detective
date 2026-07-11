import type { MovementVector } from '../movement/MovementVector';

export interface TransitionInputResult {
  vector: MovementVector;
  requiresNeutral: boolean;
}

export function gateTransitionInput(
  physical: MovementVector,
  transitionActive: boolean,
  interfaceBlocked: boolean,
  requiresNeutral: boolean,
): TransitionInputResult {
  if (transitionActive) return { vector: { x: 0, y: 0 }, requiresNeutral };
  if (requiresNeutral) {
    const released = physical.x === 0 && physical.y === 0;
    return { vector: { x: 0, y: 0 }, requiresNeutral: !released };
  }
  return { vector: interfaceBlocked ? { x: 0, y: 0 } : physical, requiresNeutral: false };
}
