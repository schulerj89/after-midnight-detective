import { describe, expect, it } from 'vitest';
import levelOneSource from '../../content/levels/level-1.lvl.txt?raw';
import { parseLevel } from './LevelParser';
import { resolveRoomTransition } from './RoomTransitionModel';

function levelOne() {
  const result = parseLevel(levelOneSource);
  if (!result.ok) throw new Error(result.errors.map((error) => error.message).join('\n'));
  return result.level;
}

describe('room transitions', () => {
  it.each([
    ['lounge', 29, 14, 'kitchen', 1, 4],
    ['kitchen', 0, 4, 'lounge', 28, 14],
    ['lounge', 14, 0, 'bedroom', 3, 6],
    ['bedroom', 3, 7, 'lounge', 14, 1],
    ['lounge', 0, 15, 'office', 8, 3],
    ['office', 9, 3, 'lounge', 1, 15],
  ])('resolves %s door %i,%i to %s arrival %i,%i', (roomId, x, y, destination, enterX, enterY) => {
    expect(resolveRoomTransition(levelOne(), roomId, x, y)).toMatchObject({ toRoomId: destination, enterX, enterY });
  });

  it('ignores ordinary floor tiles', () => {
    expect(resolveRoomTransition(levelOne(), 'lounge', 15, 15)).toBeUndefined();
  });
});
