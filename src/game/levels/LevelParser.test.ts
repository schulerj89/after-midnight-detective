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
      { id: 'lounge', width: 30, height: 30 },
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
    expect(geometry.worldWidth).toBe(3924);
    expect(geometry.worldHeight).toBe(2916);
    expect(geometry.collisions.length).toBeGreaterThan(100);
    const bedroom = result.level.rooms.find((room) => room.id === 'bedroom');
    if (!bedroom) throw new Error('missing bedroom');
    expect(levelPoint(result.level, geometry, bedroom, 3, 7)).toEqual({ x: 1854, y: 630 });
  });

  it('rejects malformed room rows', () => {
    const result = parseLevel(levelOneSource.replace('##############+###############', '####'));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((error) => error.message.includes('expected width 30'))).toBe(true);
  });

  it('rejects disconnected door endpoints', () => {
    const result = parseLevel(levelOneSource.replace('LINK lounge 29 14', 'LINK lounge 28 14'));
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
    const result = parseLevel(levelOneSource.replace('LINK lounge 0 15 ENTER 1 15 <-> office 9 3 ENTER 8 3 ID door.lounge-office', ''));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((error) => error.message.includes('must have exactly one LINK'))).toBe(true);
  });

  it('rejects arrival tiles that are not adjacent to their door', () => {
    const result = parseLevel(levelOneSource.replace('ENTER 28 14 <-> kitchen', 'ENTER 27 14 <-> kitchen'));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((error) => error.message.includes('ENTER must be adjacent'))).toBe(true);
  });

  it('rejects arrival tiles occupied by solid furniture', () => {
    const result = parseLevel(levelOneSource.replace('ENTER 28 14 <-> kitchen', 'ENTER 28 14 <-> kitchen').replace('PLACE prop.east-sofa prop sofa 21 20', 'PLACE prop.east-sofa prop sofa 27 14'));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((error) => error.message.includes('ENTER tiles cannot overlap'))).toBe(true);
  });

  it('rejects a START placed on a door threshold', () => {
    const result = parseLevel(levelOneSource.replace('START lounge 15 26', 'START lounge 14 0'));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((error) => error.message.includes('unoccupied interior floor'))).toBe(true);
  });

  it('rejects a START placed on a perimeter floor tile', () => {
    const source = levelOneSource
      .replace('START lounge 15 26', 'START lounge 13 0')
      .replace('##############+###############', '#############.+###############');
    const result = parseLevel(source);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((error) => error.message.includes('unoccupied interior floor'))).toBe(true);
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
