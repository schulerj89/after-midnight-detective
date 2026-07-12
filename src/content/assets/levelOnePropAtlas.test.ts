import { describe, expect, it } from 'vitest';
import levelOneSource from '../levels/level-1.lvl.txt?raw';
import { buildLevelGeometry, placementRect } from '../../game/levels/LevelGeometry';
import { parseLevel } from '../../game/levels/LevelParser';
import { resolveMovement } from '../../game/features/movement/CollisionResolver';
import {
  buildPropRenderPlan,
  LEVEL_ONE_PROP_FRAMES,
  missingLevelOnePropFrames,
} from './levelOnePropAtlas';

function levelOne() {
  const parsed = parseLevel(levelOneSource);
  if (!parsed.ok) throw new Error(parsed.errors.map((error) => error.message).join('\n'));
  return parsed.level;
}

describe('Level 1 prop atlas', () => {
  it('covers every authored prop and clue archetype', () => {
    expect(missingLevelOnePropFrames(levelOne())).toEqual([]);
    expect(LEVEL_ONE_PROP_FRAMES).toHaveLength(31);
    expect(LEVEL_ONE_PROP_FRAMES).toContain('room-317-key-card');
  });

  it('keeps every solid prop visual rectangle identical to its text collision rectangle', () => {
    const level = levelOne();
    const geometry = buildLevelGeometry(level);
    level.rooms.forEach((room) => room.placements
      .filter((placement) => placement.kind === 'prop' && placement.solid)
      .forEach((placement) => {
        const expected = placementRect(level, geometry, room, placement);
        const plan = buildPropRenderPlan(level, geometry, room, placement);
        expect(plan?.visualRect, placement.id).toEqual(expected);
        expect(plan?.collisionRect, placement.id).toEqual(expected);
        expect(geometry.collisions, placement.id).toContainEqual(expected);
      }));
  });

  it('does not place the generated key card into the active mystery', () => {
    const level = levelOne();
    expect(level.rooms.flatMap((room) => room.placements).some(
      (placement) => placement.archetype === 'room-317-key-card',
    )).toBe(false);
  });

  it('keeps clue art compact while providing a forgiving hit target', () => {
    const level = levelOne();
    const geometry = buildLevelGeometry(level);
    const plans = level.rooms.flatMap((room) => room.placements
      .filter((placement) => placement.kind === 'clue')
      .map((placement) => buildPropRenderPlan(level, geometry, room, placement)));
    plans.forEach((plan) => {
      expect(plan?.visualRect.width).toBe(64);
      expect(plan?.interactionRect).toMatchObject({ width: 96, height: 96 });
    });
  });

  it('still blocks the player at the west sofa collision edge', () => {
    const level = levelOne();
    const geometry = buildLevelGeometry(level);
    const lounge = level.rooms.find((room) => room.id === 'lounge');
    const sofa = lounge?.placements.find((placement) => placement.id === 'prop.west-sofa');
    if (!lounge || !sofa) throw new Error('missing west sofa');
    const obstacle = placementRect(level, geometry, lounge, sofa);
    const start = { x: obstacle.x - 22, y: obstacle.y + obstacle.height / 2 };
    expect(resolveMovement(
      start,
      { x: 12, y: 0 },
      { halfWidth: 22, halfHeight: 15 },
      geometry.playerBounds,
      [obstacle],
    )).toEqual(start);
  });
});
