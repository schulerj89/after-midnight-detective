# Level 1 character pose-sheet prompts

- Generator: built-in image generation (`gpt-image-2` path)
- Reference: `../level-one-cast-choice-source-gpt-image-2.png`
- Sources: `*-source-gpt-image-2.png`
- Chroma derivatives: `*-alpha.png`

## Shared final prompt

Create a production source sheet for static pixel character cutouts using the
supplied Level 1 cast board as the locked identity, costume, palette, and style
reference. Use one exact 2x2 invisible grid on a perfectly uniform `#00ff00`
background. Cell order is neutral, speaking/inspect, suspicious/decisive, and
alarmed/finale. Preserve identity, costume, proportions, upper-left lighting,
scale, eye line, and foot baseline. Show the complete full body with generous
padding. Use hard square pixel clusters and a restrained 1940s noir palette.
Exclude antialiasing, painterly or 3D rendering, labels, dividers, scenery,
shadows, walk/run frames, duplicate limbs, extra figures, logos, watermark, and
green foreground pixels.

## Detective A

Preserve the selected Long-Coat Gumshoe: wide soft-brim fedora, long belted
charcoal trench with asymmetric hem, cream shirt wedge, muted-red tie/notebook
strap, and slim notebook. Poses: neutral/listening; open-notebook inspect;
controlled explanatory accusation with no gun gesture; restrained alarm with
notebook held close.

## Miles Pike

Preserve the tall narrow night porter: slick side part, brown-charcoal fitted
service jacket/waistcoat, cream collar, dim-yellow piping, fixed square belt key
fob, long trousers. Poses: hands-behind alibi; palm-out deflection; shoulder-turn
route check with hand near fob; caught posture with the broken right heel kept on
the same anatomical side.

## Vera Vale

Preserve the professional hotel manager: Art Deco bob, angular charcoal peplum
jacket, cream blouse/cuffs, straight skirt, tiny badge, restrained muted-red
scarf/lapel. Poses: composed clasp; precise speaking palm; guarded crossed arms
or pencil; controlled alarm with one hand near collar.

## Officer Hale

Preserve the broad procedural officer: blue-charcoal uniform greatcoat, peaked
cap, pale badge, blue-gray piping, dark trousers, no weapon. Poses: planted door
guard; calm notebook testimony; open-arm exit seal; angled open-hand arrest/
escort with no second person or aggression.

## Post-processing

Each source was chroma-keyed with the installed background-removal helper, split
into fixed cells, normalized onto a shared logical pixel grid, quantized to a
24-color per-character palette, converted to binary alpha, and nearest-neighbor
upscaled. Portraits are deterministic head-and-shoulder crops of the neutral
references rather than separately generated identities.
