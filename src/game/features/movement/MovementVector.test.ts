import { describe, expect, it } from 'vitest';
import { normalizeMovementVector } from './MovementVector';

describe('normalizeMovementVector', () => {
  it('removes input inside the deadzone', () => {
    expect(normalizeMovementVector(0.05, -0.05)).toEqual({ x: 0, y: 0 });
  });

  it('preserves analog strength inside the unit circle', () => {
    expect(normalizeMovementVector(0.4, -0.3)).toEqual({ x: 0.4, y: -0.3 });
  });

  it('normalizes diagonal input to unit speed', () => {
    const vector = normalizeMovementVector(1, 1);
    expect(Math.hypot(vector.x, vector.y)).toBeCloseTo(1);
    expect(vector.x).toBeCloseTo(Math.SQRT1_2);
    expect(vector.y).toBeCloseTo(Math.SQRT1_2);
  });

  it('accepts a custom deadzone', () => {
    expect(normalizeMovementVector(0.2, 0, 0.25)).toEqual({ x: 0, y: 0 });
  });
});
