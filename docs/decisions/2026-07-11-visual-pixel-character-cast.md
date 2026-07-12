# Decision: Level 1 pixel character cast

- Date: 2026-07-11
- Status: Accepted — Detective A selected
- Discipline: Visual direction, gameplay readability, and asset production
- Owner: Noir visual direction

## Context

Level 1 still uses programmatic placeholder people. They share almost the same
silhouette and cannot carry the guarded, suspicious, or alarmed states required
by dialogue, the altered loop, reconstruction, and arrest. The replacement must
remain readable near 50x100 CSS pixels on short landscape phones without adding
walk cycles or changing movement/collision behavior.

## Options considered

### One generated mega-sheet

Generating the entire cast and every pose in one image is fast, but identity,
costume, baseline, and cell consistency are likely to drift.

### Per-character pose strips without a reference gate

This produces cleaner sheets, but the detective would be selected implicitly
instead of giving the user the requested choice.

### Choice board, locked cast references, then per-character pose sheets

First generate three neutral detective choices and one finalized NPC lineup.
After the user selects the detective, lock one reference for every character,
generate separate static pose sheets, normalize them, and build one atlas.

## Decision

Use GPT Image 2 through the built-in image-generation path for pixel-art source
boards on a flat removable chroma background. Lock these NPC directions:

- Miles Pike: tall, narrow hotel night porter; brown-charcoal service jacket,
  dim-yellow piping/key fob, no hat, controlled posture, consistent right-heel cue.
- Vera Vale: compact angular hotel manager; squared charcoal tailoring, Art Deco
  bob, cream blouse/cuffs, small muted-red scarf or lapel accent.
- Officer Hale: broad planted blue-charcoal uniform; peaked cap, pale badge,
  procedural posture, no visible weapon.

Present three detective choices:

- A — Long-Coat Gumshoe: androgynous, wide fedora, long belted trench, classic
  triangular noir silhouette. Recommended for immediate mobile readability.
- B — Tailored Investigator: woman, hatless sharp asymmetrical bob, cropped
  double-breasted jacket, wide trousers, muted-red scarf. Best face visibility and
  NPC differentiation.
- C — Veteran Inspector: older stockier man, short-brim fedora, open knee-length
  overcoat, cream waistcoat, patient square silhouette. Most seasoned tone.

After selection, create four planted static poses per character in fixed order:
neutral, speaking/inspect, suspicious/guarded, and alarmed/caught. Miles also
needs custody continuity; Hale's fourth pose doubles as arrest/escort. Runtime
continues to supply slide, easing, lean, bob, depth, and oval shadow.

Normalize sources to a 35x70 logical pixel grid, nearest-neighbor upscale to the
existing 140x280 frame size, derive matching 160x160 dialogue portraits from the
locked references, and pack 16 cutouts plus four portraits into one atlas. Apply
nearest filtering only to the character texture.

## Rationale

Distinct outer silhouettes preserve identity in grayscale and at mobile scale.
Separate reference and pose stages reduce GPT identity drift. Fixed frame size,
origin, and foot baseline let generated art replace placeholders without touching
collision, stage marks, or theatrical movement.

## Tradeoffs

- A user choice is required before the final detective pose sheet and atlas.
- A 35x70 logical grid limits facial nuance, so portraits require their own crop
  and normalization pass.
- Generated pose consistency must be validated and rejected when costume,
  anatomy, heel side, or baseline drifts.
- Long hats and raised hands need generous transparent padding to avoid clipping.

## Mobile considerations

- Full bodies must remain recognizable around 96 CSS pixels tall and retain a
  readable face patch at the current 844x390 exploration scale.
- Detective, Miles, Vera, and Hale must be identifiable from silhouette alone.
- Miles and Hale must differ clearly in shoulder width, hat shape, and leg mass.
- Vera's red accent must stay subordinate so it does not pre-label guilt.
- Existing independent touch targets remain unchanged and at least 48x48 CSS px.

## Performance considerations

Target one character atlas with 20 named frames. The final production atlas is
1792x720 and approximately 4.92 MiB decoded RGBA because the static accusation,
exit-seal, and escort gestures require extra transparent horizontal padding.
Visible bodies retain the original height; only the transparent frame is wider.
Keep alpha binary after normalization, use at most 24 opaque colors per character
set, and avoid global pixel-art filtering so room and prop textures retain their
current treatment.

## Validation

- Validate fixed source cells, chroma removal, transparent corners, alpha,
  palette count, 4x pixel-grid alignment, and absence of green fringe.
- Require all 16 body frames at 140x280, portraits at 160x160, soles within four
  pixels, and same-character height variance within eight pixels.
- Capture desktop and 844x390 lineup, dialogue portraits, altered-loop Miles,
  reconstruction Miles/Hale, and case-closed custody.
- Inspect grayscale silhouettes, feet, hats, hands, prop occlusion, portrait
  continuity, right-heel orientation, UI overlap, and mobile FPS of at least 50.

## Expert review

Roster/story, pixel-production, and gameplay-readability specialists reviewed
the direction independently. All three locked the same NPC identities and
rejected walk-cycle generation. They differed only on which detective should be
preferred, so that decision remains with the user as requested.

## User selection

The user selected **A — Long-Coat Gumshoe**. Final detective pose generation and
runtime integration must preserve that choice's wide fedora, long belted trench,
cream shirt wedge, restrained muted-red accent, notebook, and triangular mobile
silhouette.

## Validation results

- Four separate GPT Image 2 pose sources were generated from the locked cast
  reference and preserved with their final prompts.
- The 1792x720 atlas contains 16 fixed 224x280 body frames and four 160x160
  portraits. Runtime payload is about 64 KiB; decoded estimate is 4.92 MiB.
- All body alpha is binary, every pose shares the same foot baseline, every frame
  aligns to the 4x4 runtime pixel grid, and each character set uses 24 colors.
- Detective, Vera, and Miles share identical pose heights. Hale's widest escort
  gesture varies by 12 pixels while remaining fully padded and unclipped.
- Named mobile captures cover exploration, Miles and detective dialogue,
  reconstruction finale, and custody; all five layout analyzers pass.
- Browser smoke captures report the atlas loaded, expected pose frames, and
  approximately 60 FPS at 844x390.
