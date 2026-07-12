import { describe, expect, it } from 'vitest';
import {
  LEVEL_ONE_CHARACTER_ATLAS_DECODED_BYTES,
  LEVEL_ONE_CHARACTER_FRAMES,
  LEVEL_ONE_CHARACTER_PORTRAITS,
  levelOneCharacterFrame,
} from './levelOneCharacterAtlas';

describe('Level 1 character atlas', () => {
  it('provides four planted poses and one portrait for every cast member', () => {
    expect(LEVEL_ONE_CHARACTER_FRAMES).toHaveLength(16);
    expect(LEVEL_ONE_CHARACTER_PORTRAITS).toEqual([
      'portrait-detective', 'portrait-vera', 'portrait-miles', 'portrait-officer',
    ]);
    expect(levelOneCharacterFrame('miles', 'suspicious')).toBe('miles-suspicious');
  });

  it('stays below a five MiB decoded texture budget', () => {
    expect(LEVEL_ONE_CHARACTER_ATLAS_DECODED_BYTES).toBeLessThan(5 * 1024 * 1024);
  });
});
