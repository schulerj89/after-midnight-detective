import type {
  LevelDefinition,
  LevelDoorLink,
  LevelParseError,
  LevelParseResult,
  LevelRoom,
  LevelTile,
  PlacementKind,
} from './LevelDefinition';

const ALLOWED_TILES = new Set(['#', '.', '+']);
const ALLOWED_KINDS = new Set<PlacementKind>(['actor', 'prop', 'clue']);

function tokens(line: string): string[] {
  const values: string[] = [];
  const matcher = /"([^"]*)"|(\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = matcher.exec(line)) !== null) values.push(match[1] ?? match[2]);
  return values;
}

function integer(value: string | undefined): number | undefined {
  if (value === undefined || !/^-?\d+$/.test(value)) return undefined;
  return Number(value);
}

function walkable(room: LevelRoom, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < room.width && y < room.height && room.map[y]?.[x] !== '#';
}

function onPerimeter(room: LevelRoom, x: number, y: number): boolean {
  return x === 0 || y === 0 || x === room.width - 1 || y === room.height - 1;
}

function occupiedByPlacement(room: LevelRoom, x: number, y: number): boolean {
  return room.placements.some((placement) =>
    x >= placement.x && x < placement.x + placement.width &&
    y >= placement.y && y < placement.y + placement.height);
}

export function parseLevel(source: string): LevelParseResult {
  const lines = source.replace(/\r/g, '').split('\n');
  const errors: LevelParseError[] = [];
  const rooms: LevelRoom[] = [];
  const links: LevelDoorLink[] = [];
  let id = '';
  let name = '';
  let version = 0;
  let tileSize = 0;
  let start: LevelDefinition['start'] | undefined;
  let currentRoom: LevelRoom | undefined;
  let readingMap = false;
  let sawEnd = false;

  const fail = (line: number, message: string) => errors.push({ line, message });

  lines.forEach((raw, index) => {
    const lineNumber = index + 1;
    if (readingMap) {
      if (raw.trim() === 'ENDMAP') {
        readingMap = false;
      } else if (currentRoom) {
        currentRoom.map.push([...raw] as LevelTile[]);
      }
      return;
    }

    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith(';') || trimmed.startsWith('//')) return;
    const parts = tokens(trimmed);
    const command = parts[0];

    switch (command) {
      case 'LEVEL':
        if (parts.length !== 3) fail(lineNumber, 'LEVEL requires an id and quoted name');
        else { id = parts[1]; name = parts[2]; }
        break;
      case 'VERSION': {
        const value = integer(parts[1]);
        if (parts.length !== 2 || value === undefined || value < 1) fail(lineNumber, 'VERSION must be a positive integer');
        else version = value;
        break;
      }
      case 'TILE_SIZE': {
        const value = integer(parts[1]);
        if (parts.length !== 2 || value === undefined || value < 48 || value > 128) fail(lineNumber, 'TILE_SIZE must be between 48 and 128');
        else tileSize = value;
        break;
      }
      case 'START': {
        const x = integer(parts[2]);
        const y = integer(parts[3]);
        if (parts.length !== 4 || x === undefined || y === undefined) fail(lineNumber, 'START requires room id, x, and y');
        else start = { roomId: parts[1], x, y };
        break;
      }
      case 'ROOM': {
        const width = integer(parts[3]);
        const height = integer(parts[4]);
        const originX = integer(parts[6]);
        const originY = integer(parts[7]);
        if (currentRoom) fail(lineNumber, 'ROOM cannot begin before ENDROOM');
        else if (parts.length !== 8 || parts[5] !== 'AT' || width === undefined || height === undefined || originX === undefined || originY === undefined || width < 3 || height < 3) {
          fail(lineNumber, 'ROOM requires id, name, width, height, AT, origin x, and origin y');
        } else {
          currentRoom = { id: parts[1], name: parts[2], width, height, originX, originY, map: [], placements: [] };
        }
        break;
      }
      case 'MAP':
        if (!currentRoom) fail(lineNumber, 'MAP must be inside a ROOM');
        else readingMap = true;
        break;
      case 'PLACE': {
        const x = integer(parts[4]);
        const y = integer(parts[5]);
        const kind = parts[2] as PlacementKind;
        if (!currentRoom || parts.length < 6 || !ALLOWED_KINDS.has(kind) || x === undefined || y === undefined) {
          fail(lineNumber, 'PLACE requires id, actor|prop|clue, archetype, x, and y inside a ROOM');
          break;
        }
        const options = Object.fromEntries(parts.slice(6).map((part) => part.split('=', 2)));
        const width = integer(options.w) ?? 1;
        const height = integer(options.h) ?? 1;
        const solid = options.solid === 'true';
        currentRoom.placements.push({ id: parts[1], kind, archetype: parts[3], x, y, width, height, solid });
        break;
      }
      case 'ENDROOM':
        if (!currentRoom) fail(lineNumber, 'ENDROOM has no matching ROOM');
        else { rooms.push(currentRoom); currentRoom = undefined; }
        break;
      case 'LINK': {
        const fromX = integer(parts[2]);
        const fromY = integer(parts[3]);
        const fromEnterX = integer(parts[5]);
        const fromEnterY = integer(parts[6]);
        const toX = integer(parts[9]);
        const toY = integer(parts[10]);
        const toEnterX = integer(parts[12]);
        const toEnterY = integer(parts[13]);
        if (parts.length !== 16 || parts[4] !== 'ENTER' || parts[7] !== '<->' || parts[11] !== 'ENTER' || parts[14] !== 'ID' ||
          fromX === undefined || fromY === undefined || fromEnterX === undefined || fromEnterY === undefined ||
          toX === undefined || toY === undefined || toEnterX === undefined || toEnterY === undefined) {
          fail(lineNumber, 'LINK requires room x y ENTER x y <-> room x y ENTER x y ID id');
        } else {
          links.push({
            id: parts[15], fromRoomId: parts[1], fromX, fromY, fromEnterX, fromEnterY,
            toRoomId: parts[8], toX, toY, toEnterX, toEnterY,
          });
        }
        break;
      }
      case 'ENDLEVEL':
        sawEnd = true;
        break;
      default:
        fail(lineNumber, `Unknown command: ${command}`);
    }
  });

  if (readingMap) fail(lines.length, 'MAP is missing ENDMAP');
  if (currentRoom) fail(lines.length, 'ROOM is missing ENDROOM');
  if (!id || !name) fail(0, 'LEVEL declaration is required');
  if (version !== 1) fail(0, 'Only VERSION 1 is supported');
  if (!tileSize) fail(0, 'TILE_SIZE is required');
  if (!start) fail(0, 'START is required');
  if (!sawEnd) fail(0, 'ENDLEVEL is required');

  const roomIds = new Set<string>();
  const placementIds = new Set<string>();
  rooms.forEach((room) => {
    if (roomIds.has(room.id)) fail(0, `Duplicate room id: ${room.id}`);
    roomIds.add(room.id);
    if (room.map.length !== room.height) fail(0, `Room ${room.id} expected ${room.height} map rows, received ${room.map.length}`);
    room.map.forEach((row, y) => {
      if (row.length !== room.width) fail(0, `Room ${room.id} row ${y} expected width ${room.width}, received ${row.length}`);
      row.forEach((glyph) => { if (!ALLOWED_TILES.has(glyph)) fail(0, `Room ${room.id} contains invalid tile ${glyph}`); });
    });
    room.placements.forEach((placement) => {
      if (placementIds.has(placement.id)) fail(0, `Duplicate placement id: ${placement.id}`);
      placementIds.add(placement.id);
      if (placement.width < 1 || placement.height < 1) fail(0, `Placement ${placement.id} has invalid size`);
      for (let y = placement.y; y < placement.y + placement.height; y += 1) {
        for (let x = placement.x; x < placement.x + placement.width; x += 1) {
          if (!walkable(room, x, y) || (placement.solid && room.map[y]?.[x] === '+')) fail(0, `Placement ${placement.id} is outside walkable floor`);
        }
      }
    });
    const solidPlacements = room.placements.filter((placement) => placement.solid);
    for (let a = 0; a < solidPlacements.length; a += 1) {
      for (let b = a + 1; b < solidPlacements.length; b += 1) {
        const first = solidPlacements[a];
        const second = solidPlacements[b];
        const overlaps = first.x < second.x + second.width && first.x + first.width > second.x && first.y < second.y + second.height && first.y + first.height > second.y;
        if (overlaps) fail(0, `Solid placements ${first.id} and ${second.id} overlap`);
      }
    }
  });

  for (let a = 0; a < rooms.length; a += 1) {
    for (let b = a + 1; b < rooms.length; b += 1) {
      const first = rooms[a];
      const second = rooms[b];
      const overlaps = first.originX < second.originX + second.width && first.originX + first.width > second.originX && first.originY < second.originY + second.height && first.originY + first.height > second.originY;
      if (overlaps) fail(0, `Rooms ${first.id} and ${second.id} overlap`);
    }
  }

  const roomsById = new Map(rooms.map((room) => [room.id, room]));
  if (start) {
    const room = roomsById.get(start.roomId);
    if (!room || !walkable(room, start.x, start.y) || onPerimeter(room, start.x, start.y) || room.map[start.y]?.[start.x] === '+' || occupiedByPlacement(room, start.x, start.y)) {
      fail(0, 'START must reference an unoccupied interior floor tile');
    }
  }

  const linkIds = new Set<string>();
  const linkedDoorCounts = new Map<string, number>();
  links.forEach((link) => {
    if (linkIds.has(link.id)) fail(0, `Duplicate link id: ${link.id}`);
    linkIds.add(link.id);
    const from = roomsById.get(link.fromRoomId);
    const to = roomsById.get(link.toRoomId);
    if (!from || !to) { fail(0, `Link ${link.id} references an unknown room`); return; }
    if (from.map[link.fromY]?.[link.fromX] !== '+' || to.map[link.toY]?.[link.toX] !== '+') fail(0, `Link ${link.id} endpoints must use + tiles`);
    if (!onPerimeter(from, link.fromX, link.fromY) || !onPerimeter(to, link.toX, link.toY)) fail(0, `Link ${link.id} door endpoints must be on room perimeters`);
    if (!walkable(from, link.fromEnterX, link.fromEnterY) || from.map[link.fromEnterY]?.[link.fromEnterX] === '+') fail(0, `Link ${link.id} from ENTER must use an interior walkable tile`);
    if (!walkable(to, link.toEnterX, link.toEnterY) || to.map[link.toEnterY]?.[link.toEnterX] === '+') fail(0, `Link ${link.id} to ENTER must use an interior walkable tile`);
    if (onPerimeter(from, link.fromEnterX, link.fromEnterY) || onPerimeter(to, link.toEnterX, link.toEnterY)) fail(0, `Link ${link.id} ENTER tiles must be inside the room perimeter`);
    if (occupiedByPlacement(from, link.fromEnterX, link.fromEnterY) || occupiedByPlacement(to, link.toEnterX, link.toEnterY)) fail(0, `Link ${link.id} ENTER tiles cannot overlap placements`);
    if (Math.abs(link.fromX - link.fromEnterX) + Math.abs(link.fromY - link.fromEnterY) !== 1) fail(0, `Link ${link.id} from ENTER must be adjacent to its door`);
    if (Math.abs(link.toX - link.toEnterX) + Math.abs(link.toY - link.toEnterY) !== 1) fail(0, `Link ${link.id} to ENTER must be adjacent to its door`);
    const fromKey = `${from.id}:${link.fromX}:${link.fromY}`;
    const toKey = `${to.id}:${link.toX}:${link.toY}`;
    linkedDoorCounts.set(fromKey, (linkedDoorCounts.get(fromKey) ?? 0) + 1);
    linkedDoorCounts.set(toKey, (linkedDoorCounts.get(toKey) ?? 0) + 1);
  });
  rooms.forEach((room) => room.map.forEach((row, y) => row.forEach((tile, x) => {
    if (tile === '+' && linkedDoorCounts.get(`${room.id}:${x}:${y}`) !== 1) {
      fail(0, `Door ${room.id}:${x}:${y} must have exactly one LINK`);
    }
  })));

  if (start && roomsById.has(start.roomId)) {
    const visited = new Set([start.roomId]);
    let changed = true;
    while (changed) {
      changed = false;
      links.forEach((link) => {
        if (visited.has(link.fromRoomId) && !visited.has(link.toRoomId)) { visited.add(link.toRoomId); changed = true; }
        if (visited.has(link.toRoomId) && !visited.has(link.fromRoomId)) { visited.add(link.fromRoomId); changed = true; }
      });
    }
    rooms.forEach((room) => { if (!visited.has(room.id)) fail(0, `Room ${room.id} is disconnected from START`); });
  }

  if (errors.length || !start) return { ok: false, errors };
  return { ok: true, level: { id, name, version, tileSize, start, rooms, links } };
}
