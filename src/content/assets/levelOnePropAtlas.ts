import type { Rect } from '../../game/features/movement/CollisionResolver';
import type { LevelDefinition, LevelPlacement, LevelRoom } from '../../game/levels/LevelDefinition';
import type { LevelGeometry } from '../../game/levels/LevelGeometry';
import { levelPoint, placementRect } from '../../game/levels/LevelGeometry';

export const LEVEL_ONE_PROP_ATLAS_KEY = 'level-one-props';
export const LEVEL_ONE_PROP_ATLAS_IMAGE = 'assets/images/props/level-one-props-atlas.png';
export const LEVEL_ONE_PROP_ATLAS_JSON = 'assets/images/props/level-one-props-atlas.json';
export const LEVEL_ONE_PROP_ATLAS_SIZE = 1_536;
export const LEVEL_ONE_PROP_ATLAS_DECODED_BYTES = LEVEL_ONE_PROP_ATLAS_SIZE * LEVEL_ONE_PROP_ATLAS_SIZE * 4;

export const LEVEL_ONE_PROP_FRAMES = [
  'front-desk', 'piano', 'sofa', 'low-table', 'grand-clock', 'coat-rack',
  'folding-screen', 'sink-counter', 'counter', 'stove', 'prep-table', 'pantry-crates',
  'bin', 'bed', 'nightstand', 'wardrobe', 'luggage-rack', 'chair',
  'safe', 'desk', 'manager-chair', 'switchboard', 'filing-cabinets', 'visitor-chair',
  'coat-stand', 'wet-footprints', 'torn-ledger', 'damp-matchbook', 'stopped-watch', 'switchboard-log',
  'room-317-key-card',
] as const;

export type LevelOnePropFrame = (typeof LEVEL_ONE_PROP_FRAMES)[number];
const frameSet = new Set<string>(LEVEL_ONE_PROP_FRAMES);

export interface PropRenderPlan {
  id: string;
  frame: LevelOnePropFrame;
  visualRect: Rect;
  collisionRect: Rect | null;
  interactionRect: Rect | null;
}

export function levelOnePropFrame(archetype: string): LevelOnePropFrame | null {
  return frameSet.has(archetype) ? archetype as LevelOnePropFrame : null;
}

export function buildPropRenderPlan(
  level: LevelDefinition,
  geometry: LevelGeometry,
  room: LevelRoom,
  placement: LevelPlacement,
): PropRenderPlan | null {
  const frame = levelOnePropFrame(placement.archetype);
  if (!frame || placement.kind === 'actor') return null;
  if (placement.kind === 'prop') {
    const rect = placementRect(level, geometry, room, placement);
    return {
      id: placement.id,
      frame,
      visualRect: { ...rect },
      collisionRect: placement.solid ? { ...rect } : null,
      interactionRect: null,
    };
  }
  const point = levelPoint(level, geometry, room, placement.x, placement.y);
  return {
    id: placement.id,
    frame,
    visualRect: { x: point.x - 32, y: point.y - 48, width: 64, height: 64 },
    collisionRect: null,
    interactionRect: { x: point.x - 48, y: point.y - 64, width: 96, height: 96 },
  };
}

export function missingLevelOnePropFrames(level: LevelDefinition): string[] {
  return level.rooms.flatMap((room) => room.placements
    .filter((placement) => placement.kind !== 'actor' && !levelOnePropFrame(placement.archetype))
    .map((placement) => placement.archetype));
}
