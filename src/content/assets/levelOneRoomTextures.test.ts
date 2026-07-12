import { describe, expect, it } from 'vitest';
import levelOneSource from '../levels/level-1.lvl.txt?raw';
import { parseLevel } from '../../game/levels/LevelParser';
import {
  LEVEL_ONE_ROOM_TEXTURE_DECODED_BYTES,
  LEVEL_ONE_ROOM_TEXTURE_FRAMES,
  levelOneRoomTextureFrame,
} from './levelOneRoomTextures';

describe('Level 1 room textures', () => {
  it('maps every authored room to one named texture frame', () => {
    const parsed = parseLevel(levelOneSource);
    if (!parsed.ok) throw new Error(parsed.errors.map((error) => error.message).join('\n'));
    expect(parsed.level.rooms.map((room) => levelOneRoomTextureFrame(room.id))).toEqual([
      'lounge', 'kitchen', 'bedroom', 'office',
    ]);
    expect(Object.keys(LEVEL_ONE_ROOM_TEXTURE_FRAMES)).toHaveLength(4);
  });

  it('keeps the decoded texture budget at four MiB', () => {
    expect(LEVEL_ONE_ROOM_TEXTURE_DECODED_BYTES).toBe(4 * 1024 * 1024);
  });
});
