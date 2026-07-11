---
name: validate-game-screenshots
description: Validate game screenshots with deterministic pose capture, companion layout manifests, geometry checks, pixel-activity heuristics, annotated grids, and evidence-backed visual review. Use for desktop, mobile-landscape, and portrait screenshot QA; UI regression checks; touch-target, safe-area, overlap, alignment, dialogue, portrait, and control-placement validation.
---

# Validate Game Screenshots

## Establish reproducible evidence

1. Capture stable, named poses rather than arbitrary gameplay moments. Freeze time, seed randomness, and wait for fonts and assets before capture.
2. Save each PNG beside a companion layout JSON following [references/layout-schema.md](references/layout-schema.md).
3. Export layout boxes from runtime coordinates when possible. Do not estimate geometry from pixels when the game can report it directly.
4. Cover desktop, mobile landscape, and portrait/orientation-gate states. Add dialogue-open and controls-active poses when those systems are present.
5. Preserve screenshots, manifests, analyzer reports, and annotated images as review evidence.

## Validate in this order

1. Run deterministic geometry checks before interpreting pixels:

   ```powershell
   python .agents/skills/validate-game-screenshots/scripts/analyze_layout.py screenshot.png screenshot.layout.json --output-dir qa-output
   ```

2. Fail bounds, containment, minimum-size, forbidden-overlap, and alignment rules before visual sign-off.
3. Treat 48 by 48 CSS pixels as the default minimum touch target unless the project records a stricter standard.
4. Require interactive controls and important text to remain inside declared safe areas.
5. Forbid dialogue text from portraits and controls, controls from primary interaction targets, and UI from orientation-gate messaging unless a manifest explicitly allows it.
6. Use luminance and variance only to detect suspiciously blank, flat, or unexpectedly bright/dark regions. Never use pixel heuristics as proof that composition is correct.
7. Inspect the original and annotated 10% grid image. Confirm visual hierarchy, readable text, unobscured portraits, coherent control grouping, intentional occlusion, and adequate contrast.

## Apply screenshot principles

- Judge role and hierarchy, not mere presence. The active dialogue, focused target, and primary action must read first.
- Distinguish intended theatrical overlap from accidental UI collision in the manifest.
- Validate text at rendered mobile size; do not infer readability from desktop zoom.
- Verify portraits keep faces and identifying silhouettes visible.
- Verify circular controls retain semantic touch boxes even when their visible artwork is smaller or translucent.
- Verify portrait mode presents the intended orientation treatment and hides landscape-only controls.
- Compare like-for-like named poses across revisions.
- Report what automation cannot establish. A passing analyzer never replaces human visual inspection.

## Record every material decision

Before changing screenshot standards or tolerances, create a dated decision record under `docs/decisions/` explaining the evidence, alternatives, tradeoffs, and validation plan. For every QA run, create a dated report under `docs/qa/` listing poses, viewport sizes, automated results, visual findings, limitations, and artifact paths. Do not issue a pass without both machine-readable evidence and human review.
