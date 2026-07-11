import { describe, expect, it } from 'vitest';
import levelOneSource from '../../content/levels/level-1.lvl.txt?raw';
import { buildLevelGeometry, levelPoint } from './LevelGeometry';
import { assessLevelGrid } from './LevelGridAssessment';
import { parseLevel } from './LevelParser';

describe('text level construction', () => {
  it('parses the four-room Level 1 plan', () => {
    const result = parseLevel(levelOneSource);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.level.rooms.map(({ id, width, height }) => ({ id, width, height }))).toEqual([
      { id: 'lounge', width: 20, height: 20 },
      { id: 'kitchen', width: 12, height: 10 },
      { id: 'bedroom', width: 8, height: 8 },
      { id: 'office', width: 10, height: 8 },
    ]);
    expect(result.level.links).toHaveLength(3);
  });

  it('derives normalized bounds and collision geometry from negative origins', () => {
    const result = parseLevel(levelOneSource);
    if (!result.ok) throw new Error(result.errors.map((error) => error.message).join('\n'));
    const geometry = buildLevelGeometry(result.level);
    expect(geometry.worldWidth).toBe(3204);
    expect(geometry.worldHeight).toBe(2196);
    expect(geometry.collisions.length).toBeGreaterThan(100);
    const bedroom = result.level.rooms.find((room) => room.id === 'bedroom');
    if (!bedroom) throw new Error('missing bedroom');
    expect(levelPoint(result.level, geometry, bedroom, 3, 7)).toEqual({ x: 1494, y: 630 });
  });

  it('rejects malformed room rows', () => {
    const result = parseLevel(levelOneSource.replace('#########+##########', '####'));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((error) => error.message.includes('expected width 20'))).toBe(true);
  });

  it('rejects disconnected door endpoints', () => {
    const result = parseLevel(levelOneSource.replace('LINK lounge 19 9', 'LINK lounge 18 9'));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((error) => error.message.includes('endpoints must use +'))).toBe(true);
  });

  it('rejects duplicate stable placement ids', () => {
    const result = parseLevel(levelOneSource.replace('PLACE clue.stopped-watch', 'PLACE clue.torn-ledger'));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((error) => error.message.includes('Duplicate placement id'))).toBe(true);
  });

  it('rejects unlinked door apertures', () => {
    const result = parseLevel(levelOneSource.replace('LINK lounge 0 10 <-> office 9 3 ID door.lounge-office', ''));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((error) => error.message.includes('must have exactly one LINK'))).toBe(true);
  });

  it('keeps every clue and actor approachable on the authored grid', () => {
    const result = parseLevel(levelOneSource);
    if (!result.ok) throw new Error(result.errors.map((error) => error.message).join('\n'));
    const assessments = assessLevelGrid(result.level);
    expect(assessments).toHaveLength(4);
    assessments.forEach((room) => {
      expect(room.reachableTiles, room.roomId).toBe(room.walkableTiles);
      room.placements.forEach((placement) => {
        expect(placement.reachableApproach, placement.id).toBe(true);
        if (placement.kind === 'clue') expect(placement.cardinalApproachTiles, placement.id).toBeGreaterThanOrEqual(2);
        if (placement.kind === 'actor') expect(placement.cardinalApproachTiles, placement.id).toBeGreaterThanOrEqual(1);
      });
    });
  });
});
