# Level 1 room texture generation prompt

- Generator: built-in image generation (`gpt-image-2` path)
- Generated: 2026-07-11
- Source: `level-one-room-textures-source-gpt-image-2.png`
- Runtime derivative: `public/assets/images/backgrounds/level-one-room-textures.webp`

## Final prompt

```text
Use case: stylized-concept
Asset type: source material atlas for a browser-based 2D noir mystery game's room floors
Primary request: Create one square 2-by-2 atlas containing exactly four isolated, flat, top-down seamless floor material swatches in this strict order: top-left vintage Hotel Marlowe lounge carpet; top-right worn service-kitchen dark stone floor; bottom-left Room 317 muted burgundy hotel carpet; bottom-right manager-office dark walnut parquet.
Style/medium: polished 2D graphic-novel paper-cutout texture, subtle hand-inked grain, restrained pixel-art-adjacent shapes but not low-resolution pixel art.
Composition/framing: perfectly flat orthographic top-down material samples, each quadrant filled edge to edge by only its surface; no perspective, horizon, wall, baseboard, furniture, objects, characters, shadows, lighting pools, borders, frames, labels, or empty margins. Keep the four quadrants cleanly separated and equal in size.
Lounge carpet: charcoal-black base with a very sparse large-scale Art Deco fan motif in dim yellow and desaturated blue-gray, low contrast.
Kitchen stone: irregular worn charcoal stone slabs with subtle stains and cream-gray edge variation, no bright grout grid.
Bedroom carpet: deep charcoal and muted burgundy woven surface with a restrained large-scale diamond motif, low contrast.
Office parquet: dark walnut herringbone wood with blackened seams and sparse dim-yellow wear, low contrast.
Lighting/mood: neutral even material scan; no directional light, cast shadow, vignette, glow, reflection, or highlight.
Color palette: black #090A0D, charcoal #17191F, cream #D9CFB6 used sparingly, muted red #8F2432, dim yellow #C7A85B used sparingly, desaturated blue-gray.
Constraints: every swatch must be dark enough for cream text, clue sprites, character silhouettes, and furniture to remain readable; no fine regular tile grid; no checkerboard; no words, numbers, symbols, watermark, UI, or decorative border. Design each quadrant so it can be mirrored and tiled without an obvious directional seam.
```

The committed normalizer mirrors a downsampled quadrant into each 512x512 frame
so opposite outer edges match exactly when Phaser tiles the material.
