# Level 1 pixel character QA

## Scope

This pass validates the GPT Image 2 Level 1 cast, static-pose atlas, dialogue
portraits, altered/reconstruction usage, custody continuity, mobile framing, and
the continued absence of walk-cycle animation.

## Named captures

- `characters-lounge-mobile.png` — Detective A and Officer Hale in exploration.
- `character-miles-dialogue-mobile.png` — suspicious Miles plus matching portrait.
- `character-detective-dialogue-mobile.png` — detective inspect pose and portrait.
- `characters-reconstruction-finale-mobile.png` — caught Miles and arrest-pose Hale.
- `character-miles-custody-mobile.png` — the same caught Miles behind foreground bars.

All captures use 844x390 landscape and have companion manifests under
`docs/screenshots/level-1-characters/`. Analyzer reports and annotated grids are
in `artifacts/`.

## Automated results

- Atlas: 1792x720, 20 named frames, 4.92 MiB decoded estimate, about 64 KiB PNG.
- Bodies: 16 fixed 224x280 frames; portraits: four fixed 160x160 frames.
- Alpha is binary; all frames have transparent corners and safe padding.
- Every body aligns to the 4x4 runtime pixel grid; no chroma-green fringe remains.
- Each character's four-pose set uses exactly 24 opaque colors.
- All soles end at the same frame row. Detective, Vera, and Miles have identical
  height; Hale's wide escort gesture remains within a 12-pixel height variance.
- Five screenshot analyzers pass with zero containment, overlap, or activity
  failures.
- Browser snapshots report the expected neutral, suspicious, inspect, arrest,
  and custody frames and roughly 60 FPS on the mobile route.

## Visual review

- Detective A retains the selected wide-fedora/long-trench silhouette and reads
  distinctly from Hale's peaked cap and broad uniform block.
- Miles is narrow and controlled, with consistent hair, service uniform, key fob,
  and right-heel orientation.
- Vera remains professional and guarded; her red accent is restrained.
- Dialogue portraits are deterministic bust crops of the same identities and
  remain readable inside the existing image box.
- Reconstruction shows planted static poses while the existing containers still
  provide slide, lean, bob, easing, and shadow movement.
- Custody reuses Miles's caught frame; bars remain foreground and the spotlight
  stays centered on him.

## Limitations

The wide static gestures require more transparent atlas width than the initial
expert estimate. The decoded cost remains modest, and browser smoke stayed at the
existing frame-rate target. Small facial expressions depend on portraits; world
silhouettes carry identity at exploration scale.
