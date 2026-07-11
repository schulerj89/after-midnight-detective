import type { Rect } from '../features/movement/CollisionResolver';
import type { LevelDefinition, LevelPlacement, LevelRoom } from './LevelDefinition';

export interface LevelGeometry {
  worldWidth: number;
  worldHeight: number;
  offsetX: number;
  offsetY: number;
  padding: number;
  playerBounds: Rect;
  collisions: Rect[];
}

export function levelPoint(level: LevelDefinition, geometry: LevelGeometry, room: LevelRoom, localX: number, localY: number): { x: number; y: number } {
  return {
    x: geometry.offsetX + (room.originX + localX + 0.5) * level.tileSize,
    y: geometry.offsetY + (room.originY + localY + 0.5) * level.tileSize,
  };
}

export function placementRect(level: LevelDefinition, geometry: LevelGeometry, room: LevelRoom, placement: LevelPlacement): Rect {
  return {
    x: geometry.offsetX + (room.originX + placement.x) * level.tileSize,
    y: geometry.offsetY + (room.originY + placement.y) * level.tileSize,
    width: placement.width * level.tileSize,
    height: placement.height * level.tileSize,
  };
}

export function buildLevelGeometry(level: LevelDefinition, padding = 90): LevelGeometry {
  const minX = Math.min(...level.rooms.map((room) => room.originX));
  const minY = Math.min(...level.rooms.map((room) => room.originY));
  const maxX = Math.max(...level.rooms.map((room) => room.originX + room.width));
  const maxY = Math.max(...level.rooms.map((room) => room.originY + room.height));
  const offsetX = padding - minX * level.tileSize;
  const offsetY = padding - minY * level.tileSize;
  const collisions: Rect[] = [];
  const geometry: LevelGeometry = {
    worldWidth: (maxX - minX) * level.tileSize + padding * 2,
    worldHeight: (maxY - minY) * level.tileSize + padding * 2,
    offsetX,
    offsetY,
    padding,
    playerBounds: { x: padding, y: padding, width: (maxX - minX) * level.tileSize, height: (maxY - minY) * level.tileSize },
    collisions,
  };

  level.rooms.forEach((room) => {
    room.map.forEach((row, y) => row.forEach((tile, x) => {
      if (tile === '#') {
        collisions.push({
          x: offsetX + (room.originX + x) * level.tileSize,
          y: offsetY + (room.originY + y) * level.tileSize,
          width: level.tileSize,
          height: level.tileSize,
        });
      }
    }));
    room.placements.filter((placement) => placement.solid).forEach((placement) => collisions.push(placementRect(level, geometry, room, placement)));
  });
  return geometry;
}
