# Decision: Level 1 placeholder dressing

- Date: 2026-07-11
- Status: Accepted
- Discipline: Level design and visual direction
- Owner: Level design specialist
- Refines: `2026-07-11-direction-text-authored-level-one.md`

## Context

The four rooms prove scale but remain sparse. Each needs enough placeholder
furniture to communicate function, create theatrical occlusion, and stage clues
without blocking the authored door network or mobile readability.

## Options considered

### Add arbitrary props in the renderer

Fast, but breaks text authoring and makes collision/QA drift from the source file.

### Fill most empty tiles

Creates believable density but damages observation sightlines and travel clarity.

### Dress each room around a protected circulation spine

Keep all placements in the `.lvl.txt`, preserve the lounge's central cross and
satellite-room door aisles, and use room-specific placeholder archetypes.

## Decision

Adopt the level designer's exact PLACE plan while preserving current room maps,
dimensions, doors, links, clue IDs, and NPC IDs. Key staging rules:

- lounge: front desk and piano mask Vera/Miles feet; keep central cross open;
- kitchen: perimeter work surfaces plus a circleable prep table;
- bedroom: reduce bed to 3x3 and reveal the watch through the east-side route;
- office: dominant desk, switchboard/log cluster, and open lower aisle;
- every clue retains at least two adjacent approach tiles;
- no solid footprint touches a door or overlaps another solid.

Render placeholder archetypes with differentiated charcoal/brown/red values and
simple accent strips so the grid reads as furniture rather than identical boxes.

## Rationale

The rooms become legible stages while remaining easy to revise in text. Protected
negative space preserves observation gameplay and prevents the 20x20 lounge from
becoming either empty or maze-like.

## Tradeoffs

- Placeholder rectangles cannot prove final prop silhouettes or surface anchoring.
- Actors intentionally overlap the front desk/piano footprints for occlusion;
  interaction reachability must be checked from adjacent floor.
- Neighboring rooms may appear at camera edges because the connected level is
  spatially continuous.

## Mobile considerations

- Keep clues and NPC approach tiles outside lower-corner control regions in named
  QA poses.
- Validate clue prompts at 844x390 as well as 1000x560.
- Maintain at least one 72px route through satellite rooms and two-tile primary
  circulation through the lounge.

## Performance considerations

The pass adds simple rectangles/text and fewer than 30 placements. Collision uses
the existing pure rectangle system; no textures, physics engine, or particles are
added.

## Validation

- Parser rejects solid overlaps, wall placement, and door occupation.
- Grid assessment flood-fills each room and verifies clue/NPC approach reachability.
- Capture all four rooms with the tile grid and annotated 10% screenshot grid.
- Review depth/occlusion at desk, piano, prep table, bed, and office desk.
- Require independent QA and code-review sign-off.

## Validation results

Implemented and accepted for the placeholder milestone. Flood-fill reaches every
walkable tile in all four rooms. Every clue has at least two reachable cardinal
approach tiles and every actor has at least one. The evidence suite covers the
full 20x20 lounge, current kitchen/bedroom/office dressing, 1000x560 landscape,
and compact 844x390 landscape; all eleven layout analyzers pass. Independent
spatial, mobile, and code reviews are summarized in
`docs/qa/2026-07-11-level-one-gameplay/README.md`.
