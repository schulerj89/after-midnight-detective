# Level 1 generated prop atlas QA

## Scope

Validated the GPT Image 2 Level 1 prop sheet, chroma-key removal, normalized
Phaser atlas, all text-level prop/clue mappings, collision preservation, clue
touch targets, four-room presentation, mobile scale, and runtime asset budget.

## Asset validation

- Final atlas: 1536x1536 RGBA PNG with transparent corners.
- Named frames: 31; all have nonempty alpha coverage between 28.9% and 87.9%.
- Runtime PNG payload: 1.70 MB; decoded RGBA estimate: 9.0 MiB.
- Total current public asset payload: 3.03 MB.
- One atlas image/texture is reused across every placement.
- The mobile browser smoke pose reported 21 loaded textures and 59.3 FPS with
  the atlas active.
- A primitive rectangle fallback preserves readable geometry if the atlas fails
  to load.

The brass `room-317-key-card` frame is present in the atlas but intentionally
absent from the active level, so it does not invent physical evidence.

## Named poses

- `level-1-props-lounge-overview-desktop.png`
- `level-1-props-kitchen-desktop.png`
- `level-1-props-bedroom-desktop.png`
- `level-1-props-office-desktop.png`
- `level-1-props-sofa-collision-mobile.png`
- `level-1-props-ledger-mobile.png`

Each screenshot has a companion runtime-derived manifest. Analyzer reports and
10% grid annotations are stored in `artifacts/`.

## Automated geometry results

- All six manifests pass with zero failures.
- Every solid prop's sprite rectangle matches the collision rectangle on left,
  right, top, and bottom within 0.5 CSS pixels.
- The mobile player body remains outside the east-sofa collision rectangle.
- A movement test confirms the west sofa still blocks the player's 44x30 body.
- Every room remains fully reachable and all five clues remain approachable.
- The ledger's 34.67x34.67 CSS visible sprite is centered inside a 52x52 CSS
  direct-touch target.

## Human visual review

The furniture now reads as one coherent noir hotel set. The red sofas establish
the lounge, cream counters clarify the kitchen's upper work wall, the bed and
wardrobe give Room 317 immediate identity, and the safe/desk/switchboard produce
a clear office silhouette. No sprite is visibly cut by an atlas cell. Shadows
ground objects without changing collision footprints. The ledger, matchbook,
watch, footprints, and switchboard log remain distinct at phone scale.

## Limitations

Generated perspective is illustrative rather than a physically exact shared
camera. Long counters and some tall one-tile props are stretched to their
authored collision footprints; the current room screenshots show acceptable
distortion, but future level edits should preserve each archetype's aspect class.
Browser screenshots and pixel analysis cannot prove performance on every phone;
the 9 MiB decoded texture estimate is recorded for regression control.
