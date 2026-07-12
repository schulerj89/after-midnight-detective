# Decision: Generated Level 1 prop atlas

- Date: 2026-07-11
- Status: Accepted
- Discipline: Visuals
- Owner: Noir visual direction
- Supersedes: placeholder furniture rendering in Level 1

## Context

Level 1 furniture and clues are currently colored rectangles labelled with their
archetype. They communicate collision size but do not sell the hotel as a noir
diorama. The user requested a large GPT Image 2 sprite sheet with no characters,
including furniture and a Room 317 key card, while preserving placement and
collision behavior.

## Options considered

### Generate one finished room illustration

This would create strong atmosphere, but it would detach visible objects from
the level text and make collision alignment difficult to validate.

### Generate one image per prop

Individual outputs offer more detail but increase requests, files, memory, and
style drift across thirty objects.

### Generate and normalize one fixed-grid atlas

Create one 6x6 chroma-key source sheet, remove the background, then normalize
every cell into a deterministic transparent atlas with a companion manifest.

## Decision

Use GPT Image 2 through the built-in image generation path to create a 6x6
paper-cutout noir prop sheet. The final runtime atlas is 1536x1536 with 256x256
cells and stable frame names. It contains all 25 unique Level 1 prop archetypes,
the five existing clues, and one unused `room-317-key-card` frame. Characters,
labels, grid lines, cast shadows, and environmental backgrounds are excluded.

Generated art changes rendering only. World placement, approachability,
interaction coordinates, and solid collision rectangles remain derived from
`level-1.lvl.txt`. The unused key-card frame does not become evidence and does
not alter the solution.

## Rationale

A normalized atlas gives the generated art a single coherent palette and keeps
runtime coordinates deterministic. Separating visual bounds from collision
bounds lets the level text remain the source of truth while replacing every
placeholder label with readable furniture silhouettes.

## Tradeoffs

- A shared square cell can soften detail on long sofas and counters.
- Generated objects may need one targeted regeneration if silhouettes merge or
  occupy the wrong cells.
- Stretching a normalized frame to a collision footprint can distort some
  objects; aspect-specific display fitting must be reviewed in-room.
- The physical key-card frame is intentionally unused until the story proves or
  places that object.

## Mobile considerations

Silhouettes must remain distinct at the 844x390 landscape viewport. Clues keep
their existing invisible forgiving interaction targets even when their visible
sprites are smaller. Furniture must not obscure the mobile controls or required
dialogue.

## Performance considerations

Load one atlas image and one JSON map rather than thirty independent textures.
The final atlas is capped at 1536x1536 RGBA; Phaser reuses frames without adding
new draw-call materials. No animation frames are introduced.

## Validation

- Validate atlas dimensions, alpha corners, frame count, named frame coordinates,
  and nonempty alpha coverage programmatically.
- Unit-test that every Level 1 prop and clue archetype resolves to an atlas frame.
- Assert collision rectangles before and after rendering are exactly those
  derived from the text level.
- Publish runtime sprite bounds and collision bounds for deterministic QA poses.
- Capture lounge, kitchen, bedroom, and office on desktop plus representative
  mobile lounge/clue poses.
- Run layout analysis for collision containment/alignment and visually inspect
  originals and annotated grids for silhouette clarity and accidental overlap.

## Validation results

The final 1536x1536 atlas contains 31 valid named frames and passes alpha/bounds
validation. Eighty-nine unit tests pass, including exact visual/collision
rectangles, sofa blocking, clue approachability, and key-card non-placement. Six
desktop/mobile screenshot manifests pass with zero geometry failures. Runtime
captures report the atlas loaded with 31 frames; human review found no cut
sprites or collision-scale mismatch. The deployed atlas payload is 1.70 MB and
its decoded RGBA estimate is 9.0 MiB. A representative mobile browser smoke pose
reported 21 loaded textures and 59.3 FPS.
