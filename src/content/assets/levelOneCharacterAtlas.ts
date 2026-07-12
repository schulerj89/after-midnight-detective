export const LEVEL_ONE_CHARACTER_ATLAS_KEY = 'level-one-characters';
export const LEVEL_ONE_CHARACTER_ATLAS_IMAGE = 'assets/images/characters/level-one-characters-atlas.png';
export const LEVEL_ONE_CHARACTER_ATLAS_JSON = 'assets/images/characters/level-one-characters-atlas.json';
export const LEVEL_ONE_CHARACTER_ATLAS_WIDTH = 1_792;
export const LEVEL_ONE_CHARACTER_ATLAS_HEIGHT = 720;
export const LEVEL_ONE_CHARACTER_ATLAS_DECODED_BYTES = LEVEL_ONE_CHARACTER_ATLAS_WIDTH * LEVEL_ONE_CHARACTER_ATLAS_HEIGHT * 4;

export const LEVEL_ONE_CHARACTER_IDS = ['detective', 'vera', 'miles', 'officer'] as const;
export const LEVEL_ONE_CHARACTER_POSES = ['neutral', 'speaking', 'suspicious', 'alarmed'] as const;

export type LevelOneCharacterId = (typeof LEVEL_ONE_CHARACTER_IDS)[number];
export type LevelOneCharacterPose = (typeof LEVEL_ONE_CHARACTER_POSES)[number];
export type LevelOneCharacterFrame = `${LevelOneCharacterId}-${LevelOneCharacterPose}`;

export const LEVEL_ONE_CHARACTER_FRAMES = LEVEL_ONE_CHARACTER_IDS.flatMap((character) =>
  LEVEL_ONE_CHARACTER_POSES.map((pose) => `${character}-${pose}` as LevelOneCharacterFrame));
export const LEVEL_ONE_CHARACTER_PORTRAITS = LEVEL_ONE_CHARACTER_IDS.map((character) => `portrait-${character}` as const);

export function levelOneCharacterFrame(character: LevelOneCharacterId, pose: LevelOneCharacterPose): LevelOneCharacterFrame {
  return `${character}-${pose}`;
}

export function levelOnePortraitFrame(character: LevelOneCharacterId): `portrait-${LevelOneCharacterId}` {
  return `portrait-${character}`;
}
