# Decision: Text-authored multi-room Level 1

- Date: 2026-07-11
- Status: Accepted
- Discipline: Game direction, level architecture, and mechanics infrastructure
- Owner: Game direction and mystery mechanics
- Supersedes: The one-room scope limit in the foundation bible

## Context

Level construction needs to move out of the Phaser scene and into a plain text
file that a designer can edit without touching TypeScript. Level 1 should contain
multiple meaningful rooms with a large 20x20 main area and smaller supporting
rooms such as an 8x8 bedroom.

## Options considered

### One giant ASCII map

Immediately visual, but brittle to resize and difficult to attach stable IDs or
multi-tile placeholder metadata.

### JSON level files

Easy for code to consume, but noisy for hand-authored room maps and less inviting
for non-programmer iteration.

### Room-based `.lvl.txt` format

Use a small line-oriented format. Each room has dimensions, a world-tile origin,
an ASCII wall/floor/door map, and explicit `PLACE` records. `LINK` records connect
door apertures with stable IDs.

## Decision

Build Level 1 as `src/content/levels/level-1.lvl.txt` with four connected rooms:

- Main Lounge: 20x20 observation hub;
- Service Kitchen: 12x10 staff/alibi space;
- Room 317 Bedroom: 8x8 intimate evidence room;
- Manager Office: 10x8 documentary-evidence room.

Use a 72px tile. `#` is a solid wall, `.` walkable floor, and `+` a linked door.
Actors, props, and clues use explicit stable `PLACE` records with optional width,
height, and collision fields. Mystery truth and gating remain outside the spatial
file and refer to its stable IDs.

## Rationale

Independent room maps preserve the immediate readability of ASCII while explicit
origins, links, and placements make dimensions, topology, collision, and mystery
references testable. A hub-and-spoke layout keeps travel compact and lets the
lounge remain the primary observation stage.

## Tradeoffs

- Four rooms expand content and traversal QA before the complete mystery loop is
  implemented; all new contents remain placeholders in this pass.
- Authored door coordinates require validation and can be tedious when resizing.
- Negative room origins are human-friendly but require normalized pixel offsets.
- A custom parser creates maintenance cost, so the grammar remains deliberately
  small and versioned.

## Dependencies

- Vite raw text imports;
- typed parser and validation diagnostics;
- pure coordinate/collision geometry helpers;
- Phaser room renderer and placement factory;
- existing camera, player, dialogue, and interaction systems.

## Player impact

The detective can roam between a large central lounge and three distinct rooms.
The spatial structure begins supporting alibis, route observation, and evidence
provenance while retaining slow, non-reflexive exploration.

## Scope impact

This deliberately supersedes the foundation's one-room limit for Level 1. It does
not authorize more floors, a large cast, combat, or production art. The first pass
proves authoring, rendering, collision, connectivity, and placeholders only.

## Validation plan

- Unit-test parsing, dimensions, stable IDs, map rows, door links, room graph,
  coordinate normalization, bounds, collision extraction, and invalid fixtures.
- Assert Level 1 has exactly four rooms with the accepted dimensions and three
  connected links.
- Render the parsed file as the default exploration level with player, NPC, clue,
  prop, wall, and door placeholders.
- Export room/current-level debug state and capture lounge plus representative
  connected-room poses on desktop and landscape mobile.
- Keep the original blocking sandbox reachable for regression testing.

## Validation results

Passed for the construction baseline on 2026-07-11:

- Level 1 parses from `src/content/levels/level-1.lvl.txt` into four rooms with
  accepted dimensions, three adjacent door links, stable placements, and a
  normalized 3204x2196 pixel world.
- Six level-specific tests plus the existing suite pass. They cover the accepted
  room plan, negative-origin geometry, malformed rows, invalid door endpoints,
  duplicate placement IDs, and unlinked door apertures.
- The Phaser scene now derives camera bounds, walls, floors, door markers,
  collisions, spawn, actors, clues, props, room HUD, and QA poses from the parsed
  file rather than hard-coded room geometry.
- Browser state reports level ID, four-room count, and current room. Lounge,
  bedroom, kitchen, and office named poses loaded their expected room IDs.
- Desktop captures for the lounge and three satellite rooms plus landscape mobile
  captures pass their geometry and pixel-activity manifests.
- Independent QA found the room placeholders distinct and readable enough to
  prove construction, while explicitly withholding final-art sign-off.
- Non-blocking: rooms are intentionally sparse, some neighboring-room silhouettes
  enter camera edges, and room labels need later dressing/occlusion polish.
