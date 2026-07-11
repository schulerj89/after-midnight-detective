import type { LevelDefinition, LevelPlacement, LevelRoom } from './LevelDefinition';

export interface PlacementReachability {
  id: string;
  kind: LevelPlacement['kind'];
  reachableApproach: boolean;
  nearestTileDistance: number;
  cardinalApproachTiles: number;
}

export interface RoomGridAssessment {
  roomId: string;
  walkableTiles: number;
  reachableTiles: number;
  placements: PlacementReachability[];
}

function key(x: number, y: number): string {
  return `${x},${y}`;
}

export function assessLevelGrid(level: LevelDefinition): RoomGridAssessment[] {
  return level.rooms.map((room) => assessRoom(level, room));
}

function assessRoom(level: LevelDefinition, room: LevelRoom): RoomGridAssessment {
  const blocked = new Set<string>();
  room.placements.filter((placement) => placement.solid).forEach((placement) => {
    for (let y = placement.y; y < placement.y + placement.height; y += 1) {
      for (let x = placement.x; x < placement.x + placement.width; x += 1) blocked.add(key(x, y));
    }
  });
  const walkable = new Set<string>();
  room.map.forEach((row, y) => row.forEach((tile, x) => {
    if (tile !== '#' && !blocked.has(key(x, y))) walkable.add(key(x, y));
  }));

  const start = level.start.roomId === room.id
    ? { x: level.start.x, y: level.start.y }
    : findDoor(room);
  const reachable = new Set<string>();
  const queue = start && walkable.has(key(start.x, start.y)) ? [start] : [];
  while (queue.length) {
    const current = queue.shift();
    if (!current || reachable.has(key(current.x, current.y))) continue;
    reachable.add(key(current.x, current.y));
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
      const next = { x: current.x + dx, y: current.y + dy };
      if (walkable.has(key(next.x, next.y)) && !reachable.has(key(next.x, next.y))) queue.push(next);
    });
  }

  const placements = room.placements
    .filter((placement) => placement.kind !== 'prop')
    .map((placement) => {
      let nearest = Number.POSITIVE_INFINITY;
      reachable.forEach((tileKey) => {
        const [x, y] = tileKey.split(',').map(Number);
        nearest = Math.min(nearest, Math.hypot(x - placement.x, y - placement.y));
      });
      const range = placement.kind === 'actor' ? 175 / level.tileSize : 145 / level.tileSize;
      const footprint = new Set<string>();
      for (let y = placement.y; y < placement.y + placement.height; y += 1) {
        for (let x = placement.x; x < placement.x + placement.width; x += 1) footprint.add(key(x, y));
      }
      const approaches = new Set<string>();
      footprint.forEach((tileKey) => {
        const [x, y] = tileKey.split(',').map(Number);
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
          const candidate = key(x + dx, y + dy);
          if (reachable.has(candidate) && !footprint.has(candidate)) approaches.add(candidate);
        });
      });
      return {
        id: placement.id,
        kind: placement.kind,
        reachableApproach: nearest <= range,
        nearestTileDistance: nearest,
        cardinalApproachTiles: approaches.size,
      };
    });

  return { roomId: room.id, walkableTiles: walkable.size, reachableTiles: reachable.size, placements };
}

function findDoor(room: LevelRoom): { x: number; y: number } | undefined {
  for (let y = 0; y < room.map.length; y += 1) {
    const x = room.map[y].indexOf('+');
    if (x >= 0) return { x, y };
  }
  return undefined;
}
