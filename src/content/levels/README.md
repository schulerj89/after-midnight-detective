# Text level authoring

Level geometry lives in `.lvl.txt` files. The current playable source is
`level-1.lvl.txt`; editing that file changes room construction without changing
the Phaser scene.

## Structure

```text
LEVEL stable-level-id "Display Name"
VERSION 1
TILE_SIZE 72
START room-id local-x local-y

ROOM room-id "Display Name" width height AT world-tile-x world-tile-y
MAP
####+###
#......#
########
ENDMAP
PLACE stable-id actor|prop|clue archetype local-x local-y w=1 h=1 solid=false
ENDROOM

LINK room-a door-x door-y ENTER arrival-x arrival-y <-> room-b door-x door-y ENTER arrival-x arrival-y ID stable-door-id
ENDLEVEL
```

Map legend:

- `#` — solid wall tile
- `.` — walkable floor tile
- `+` — walkable door aperture that must have exactly one `LINK`

Coordinates in `START` and `PLACE` are local to their room. `AT` positions the
room in the level-wide tile grid. Negative room origins are allowed. Room width
and height include the perimeter wall tiles.

Placements use stable IDs so later mystery, notebook, timeline, and dialogue data
can refer to spatial objects without depending on coordinates. Multi-tile props
use `w` and `h`; `solid=true` adds their footprint to collision geometry.

Each `LINK` endpoint names its walkable `+` door tile and an adjacent interior
`ENTER` tile. A room transition fades to black and places the player on the
destination endpoint's `ENTER` tile, preventing immediate door bounce.

## Level 1

- `lounge`: 30x30 main observation hub
- `kitchen`: 12x10 service room
- `bedroom`: 8x8 Room 317
- `office`: 10x8 manager office

All three satellite rooms connect directly to the lounge. Current actors, clues,
and furniture are placeholders for spatial and interaction testing.

## Validation

Run `npm run validate`. The parser rejects malformed row sizes, invalid glyphs,
duplicate stable IDs, overlapping rooms, invalid placements, disconnected room
graphs, door endpoints that are not `+` tiles, and invalid
or non-adjacent `ENTER` arrivals.
