# Decision: Textured rooms and mobile breathing room

- Date: 2026-07-11
- Status: Accepted
- Discipline: Cross-discipline
- Owner: Noir visual direction and game direction
- Supersedes: Level 1 floor-grid rendering and fixed-width exploration HUD placement

## Context

Level 1 still exposes construction-grid lines across every floor tile. On
landscape phones the camera feels close to actors and furniture, while the left
HUD, music control, and case-notes HUD cluster around positions authored for a
1280-wide canvas instead of using the expanded mobile stage.

## Options considered

### Keep flat floors and only hide grid strokes

This is inexpensive, but the rooms remain visually provisional after adding the
generated prop atlas.

### Use one full-room background per room

Painted backgrounds could be atmospheric, but they would embed furniture and
architecture into pixels, making text-authored placement and collision harder
to read and revise.

### Use one reusable four-surface floor atlas

Generate lounge, kitchen, bedroom, and office material swatches, normalize them
into seamless named frames, and tile them underneath the existing text-authored
walls, doors, props, clues, and collisions.

## Decision

Replace per-tile floor fills and strokes with one generated 2x2 material source
normalized into four seamless 512x512 texture frames: lounge carpet, kitchen
stone, bedroom carpet, and office parquet. Keep walls, door apertures, room
geometry, props, clues, and collisions data-driven and unchanged. Remove wall
segment strokes so construction cells are not visible.

On landscape devices at or below 1400x600, use a restrained `0.88` exploration
camera zoom. Anchor the left HUD to the left safe edge, the music control to the
true viewport center, and the case-notes panel to the right safe edge. Increase
HUD height and internal line spacing without enlarging its overall footprint.

## Rationale

Material texture gives each isolated stage an immediate identity while
preserving the living-diorama layers and deterministic level file. A small
pullback creates breathing room without making clues tiny. Responsive HUD
anchors use the negative space already available on wide phones instead of
compressing three panels into the old desktop coordinates.

## Tradeoffs

- Generated swatches add one more decoded texture and initial payload.
- Tiled surfaces are intentionally stylized rather than perspective-perfect.
- A mobile pullback slightly reduces character and clue size; existing forgiving
  interaction ranges and 96x96 clue hit targets contain that risk.
- Small rooms may show more surrounding black stage space, which is acceptable
  as theatrical negative space so long as the room remains centered and readable.

## Dependencies

The existing text level, isolated room activation, Phaser atlas loading, mobile
controls, audio HUD, and screenshot debug hooks are retained.

## Player impact

Rooms read as finished hotel spaces instead of a construction grid. Mobile
players see more context around the detective and can scan the top HUD without
crowded or uneven panels.

## Scope impact

No room dimensions, placements, collision rectangles, clue logic, or solution
state changes.

## Mobile considerations

- Validate 844x390 and an extra-wide 1280x512 landscape viewport.
- Keep all top HUD panels inside safe edges with positive gaps.
- Preserve 48x48 CSS touch targets and clue readability.
- Confirm controls do not cover required clues at the pulled-back zoom.

## Performance considerations

Use one texture atlas for all four surfaces. Cap the runtime atlas at 1024x1024
RGBA (4 MiB decoded), reuse tile sprites, expose load/FPS metrics, and retain a
flat charcoal fallback if the atlas fails to load.

## Validation plan

- Validate atlas size, frame names, alpha/coverage, and source prompt.
- Unit-test room-to-frame mapping and unchanged collision geometry.
- Capture all four rooms on landscape mobile, plus one desktop lounge pose.
- Export runtime HUD, room-stage, camera, controls, and clue bounds.
- Run geometry checks for safe-area containment, HUD gaps, and overlap.
- Visually inspect originals and annotated grids for removed construction lines,
  texture legibility, clue clarity, and mobile breathing room.
- Run production build, full tests, asset inventory, and mobile FPS smoke.

## Validation results

- The 1024x1024 WebP atlas contains all four named frames, weighs 95.2 KiB on
  disk, and stays within the 4 MiB decoded budget.
- Seam, luminance, variance, frame mapping, and unchanged level-parser checks pass.
- Five named browser captures cover all mobile rooms and the desktop lounge.
- All five layout manifests pass with zero safe-area, overlap, touch-size, or
  expected-pixel-activity failures.
- Mobile captures report one active room, the expected texture frame, `0.88`
  camera zoom, and 58.5 FPS during the final smoke route.
- Human review confirms no construction grid, readable low-contrast surfaces,
  centered compact rooms, and separated top HUD zones.
