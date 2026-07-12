# Level 1 prop atlas generation prompt

- Generator: built-in image generation (`gpt-image-2` path)
- Generated: 2026-07-11
- Source: `level-one-props-source-gpt-image-2.png`
- Runtime derivative: `public/assets/images/props/level-one-props-atlas.png`

## Final prompt

```text
Use case: stylized-concept
Asset type: production sprite-sheet source for a browser-based 2D noir mystery game
Primary request: Create one square 6-by-6 sprite sheet of isolated Level 1 hotel props, with exactly one object centered in each cell, in this strict row-major order.
Row 1: hotel front desk, upright piano, long lounge sofa, low coffee table, grandfather clock, coat rack.
Row 2: folding privacy screen, sink counter, long kitchen counter, freestanding stove, kitchen prep table, stacked pantry crates.
Row 3: small kitchen bin, hotel bed, nightstand, tall wardrobe, luggage rack, simple bedroom chair.
Row 4: hotel safe, manager office desk, manager chair, vintage telephone switchboard, filing cabinets, visitor chair.
Row 5: coat stand, pair of wet footprints, torn hotel key ledger slip, damp matchbook, stopped wristwatch, switchboard log sheet.
Row 6: square brass Room 317 service key card/tag, then five completely empty cells.
Style/medium: polished 2D graphic-novel paper-cutout sprites, strong readable silhouettes, restrained pixel-art-adjacent edge shapes but not low-resolution pixel art, consistent three-quarter slightly top-down viewpoint.
Color palette: black #090A0D, charcoal #17191F, cream #D9CFB6, muted red #8F2432, dim yellow/brass #C7A85B, supporting desaturated blue-gray only.
Lighting/mood: one consistent dim upper-left hotel light, hard internal graphic shading, noir atmosphere contained inside each object.
Composition/framing: perfectly even 6-by-6 invisible grid; identical cell sizes; each object fully contained in its own cell with generous padding; no object crosses or touches a cell boundary; wide items stay wide, tall items stay tall; all cells aligned precisely.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background across the entire sheet, including all empty space.
Constraints: no characters, no people, no hands, no labels, no captions, no numbers, no readable writing, no grid lines, no borders, no watermark. The key-card/tag may have an abstract inset plate but no readable text. Background must be one uniform #00ff00 with no gradient, texture, floor, reflection, or lighting variation. Do not use #00ff00 anywhere in an object. No cast shadow, no contact shadow, no smoke, no glow outside object silhouettes. Crisp separated edges suitable for chroma-key removal.
```

The generated source used content-aware column widths. The committed normalizer
records the transparent row/column valleys and repacks the 31 subjects into
stable named atlas frames.

