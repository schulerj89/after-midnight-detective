import type { LevelDefinition, LevelDoorLink } from './LevelDefinition';

export interface RoomTransitionDestination {
  linkId: string;
  fromRoomId: string;
  toRoomId: string;
  toDoorX: number;
  toDoorY: number;
  enterX: number;
  enterY: number;
}

export function resolveRoomTransition(
  level: LevelDefinition,
  roomId: string,
  doorX: number,
  doorY: number,
): RoomTransitionDestination | undefined {
  const link = level.links.find((candidate) => endpointMatches(candidate, roomId, doorX, doorY));
  if (!link) return undefined;
  if (link.fromRoomId === roomId && link.fromX === doorX && link.fromY === doorY) {
    return {
      linkId: link.id,
      fromRoomId: roomId,
      toRoomId: link.toRoomId,
      toDoorX: link.toX,
      toDoorY: link.toY,
      enterX: link.toEnterX,
      enterY: link.toEnterY,
    };
  }
  return {
    linkId: link.id,
    fromRoomId: roomId,
    toRoomId: link.fromRoomId,
    toDoorX: link.fromX,
    toDoorY: link.fromY,
    enterX: link.fromEnterX,
    enterY: link.fromEnterY,
  };
}

function endpointMatches(link: LevelDoorLink, roomId: string, x: number, y: number): boolean {
  return (link.fromRoomId === roomId && link.fromX === x && link.fromY === y) ||
    (link.toRoomId === roomId && link.toX === x && link.toY === y);
}
