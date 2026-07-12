export const LEVEL_ONE_ROOM_TEXTURE_KEY = 'level-one-room-textures';
export const LEVEL_ONE_ROOM_TEXTURE_IMAGE = 'assets/images/backgrounds/level-one-room-textures.webp';
export const LEVEL_ONE_ROOM_TEXTURE_JSON = 'assets/images/backgrounds/level-one-room-textures.json';
export const LEVEL_ONE_ROOM_TEXTURE_SIZE = 1_024;
export const LEVEL_ONE_ROOM_TEXTURE_DECODED_BYTES = LEVEL_ONE_ROOM_TEXTURE_SIZE * LEVEL_ONE_ROOM_TEXTURE_SIZE * 4;

export const LEVEL_ONE_ROOM_TEXTURE_FRAMES = {
  lounge: 'lounge',
  kitchen: 'kitchen',
  bedroom: 'bedroom',
  office: 'office',
} as const;

export type LevelOneRoomTextureId = keyof typeof LEVEL_ONE_ROOM_TEXTURE_FRAMES;

export function levelOneRoomTextureFrame(roomId: string): string | null {
  return roomId in LEVEL_ONE_ROOM_TEXTURE_FRAMES
    ? LEVEL_ONE_ROOM_TEXTURE_FRAMES[roomId as LevelOneRoomTextureId]
    : null;
}
