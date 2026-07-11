import { describe, expect, it } from 'vitest';
import { resolveMovement, type Rect } from './CollisionResolver';

const bounds: Rect = { x: 0, y: 0, width: 500, height: 400 };
const body = { halfWidth: 10, halfHeight: 10 };

describe('resolveMovement', () => {
  it('moves freely when no obstacle blocks the body', () => {
    expect(resolveMovement({ x: 50, y: 50 }, { x: 20, y: 15 }, body, bounds, [])).toEqual({
      x: 70,
      y: 65,
    });
  });

  it('blocks one axis while allowing wall sliding on the other', () => {
    const obstacle = { x: 70, y: 20, width: 40, height: 80 };
    expect(
      resolveMovement({ x: 50, y: 50 }, { x: 20, y: 20 }, body, bounds, [obstacle]),
    ).toEqual({ x: 50, y: 70 });
  });

  it('clamps the body inside world bounds', () => {
    expect(resolveMovement({ x: 15, y: 15 }, { x: -100, y: -100 }, body, bounds, [])).toEqual({
      x: 10,
      y: 10,
    });
  });
});
