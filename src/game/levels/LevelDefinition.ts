export type LevelTile = '#' | '.' | '+';
export type PlacementKind = 'actor' | 'prop' | 'clue';

export interface LevelPlacement {
  id: string;
  kind: PlacementKind;
  archetype: string;
  x: number;
  y: number;
  width: number;
  height: number;
  solid: boolean;
}

export interface LevelRoom {
  id: string;
  name: string;
  width: number;
  height: number;
  originX: number;
  originY: number;
  map: LevelTile[][];
  placements: LevelPlacement[];
}

export interface LevelDoorLink {
  id: string;
  fromRoomId: string;
  fromX: number;
  fromY: number;
  fromEnterX: number;
  fromEnterY: number;
  toRoomId: string;
  toX: number;
  toY: number;
  toEnterX: number;
  toEnterY: number;
}

export interface LevelDefinition {
  id: string;
  name: string;
  version: number;
  tileSize: number;
  start: { roomId: string; x: number; y: number };
  rooms: LevelRoom[];
  links: LevelDoorLink[];
}

export interface LevelParseError {
  line: number;
  message: string;
}

export type LevelParseResult =
  | { ok: true; level: LevelDefinition }
  | { ok: false; errors: LevelParseError[] };
