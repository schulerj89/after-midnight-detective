# Level 1 cast choice board prompt

- Generator: built-in image generation (`gpt-image-2` path)
- Intent: `stylized-concept`
- Source: `level-one-cast-choice-source-gpt-image-2.png`
- Alpha preview: `level-one-cast-choice-preview.png`
- Status: detective selection pending; this board is not a runtime atlas

## Final prompt

Create one polished landscape 3-column by 2-row pixel-character reference board
for the noir mystery game *After Midnight, Detective*. The top row contains three
alternate main detectives for user selection; the bottom row contains the single
finalized designs for the three Level 1 NPCs.

Use a perfectly flat solid `#00ff00` chroma-key background with no gradients,
texture, floor, scenery, shadows, reflections, or lighting variation. Render
authentic hard-edged pixel art with square pixel clusters, a limited 1940s
graphic-noir palette, paper-cutout silhouette clarity, and the appearance of a
35x70 logical design enlarged with nearest-neighbor scaling. No antialiasing,
painterly brushwork, smooth vector edges, 3D rendering, or anime styling.

Place exactly six separate full-body figures on an invisible 3x2 grid, one per
cell, front or slight three-quarter, neutral and planted. Show hats, hands, legs,
and shoes with generous padding and a shared baseline. Add only the labels `A`,
`B`, `C`, `MILES`, `VERA`, and `HALE`; no cell dividers or other text.

Use black `#090A0D`, charcoal `#17191F`, mid-charcoal `#2A2D35`, cream
`#D9CFB6`, muted red `#8F2432`, dim yellow `#C7A85B`, restrained skin/hair
tones, and blue-gray `#718293` only for Hale. Use no green in foreground pixels.

- A: androgynous Long-Coat Gumshoe, 35–45, wide soft-brim fedora, long belted
  charcoal trench with asymmetric hem, cream shirt wedge, narrow muted-red tie
  or notebook strap, slim notebook, strong triangular silhouette.
- B: woman Tailored Investigator, 30–42, no hat, sharp short asymmetric bob,
  cropped double-breasted charcoal jacket, high-waisted wide trousers, cream
  gloves/cuffs and notebook, restrained muted-red scarf.
- C: man Veteran Inspector, 48–60, stockier square body, short-brim fedora,
  heavy open knee-length charcoal overcoat, cream waistcoat/shirt vertical,
  dim-yellow pocket notebook, slightly stooped patient posture.
- Miles Pike: tall narrow hotel night porter, 32–40, no hat, slick side part,
  forward neck, fitted brown-charcoal service jacket/waistcoat, cream collar,
  dim-yellow piping and square belt key fob, long trousers, hands behind back.
- Vera Vale: hotel manager, 40–50, compact angular silhouette, Art Deco jaw-length
  bob, squared charcoal tailored jacket with angular peplum, cream blouse/cuffs,
  straight skirt, small muted-red scarf/lapel, composed clasped hands.
- Officer Hale: police officer, 45–58, broad planted rectangle, blue-charcoal
  short uniform greatcoat, peaked cap distinct from a fedora, pale badge/metal,
  restrained blue-gray piping, wide stance, hands behind back, no weapon.

Neutral static references only. No walk/run/action frames, duplicate limbs,
extra people, props behind feet, environment, shadows, glows, grid lines,
captions, logos, watermark, cropped pixels, or touching figures.

## Post-processing

The chroma source was converted with the installed image-generation skill's
background-removal helper using border auto-key, soft matte, and despill. The
result reported 1,246,445 transparent and 9,566 partially transparent pixels out
of 1,572,864 total pixels. Final pose sheets will be normalized to binary alpha.
