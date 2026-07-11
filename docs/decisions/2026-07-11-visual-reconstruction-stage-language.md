# Decision: Reconstruction uses shadow-stage tableaux

- Date: 2026-07-11
- Status: Accepted
- Discipline: Visuals
- Owner: Noir visual direction
- Supersedes: none

## Context

The reenactment must feel like the miniature noir stage coming alive without
introducing a separate cinematic language or walk cycles.

## Options considered

### Full-screen illustrated cutscene

This requires new art and disconnects the payoff from the explored rooms.

### Reuse the room stages with graphic overlays and cutout blocking

This preserves place memory, production scope, and theatrical intent.

## Decision

Reuse the isolated office, lounge, and Room 317 stages. Dim the stage beneath a
letterbox overlay, spotlight the relevant prop or silhouette, and keep a caption
card with time and provenance. Use black/charcoal, cream, dim yellow, and muted
red. Render inferred action with lower-opacity shadow/halftone treatment.

Cutouts slide between fixed marks with Sine easing, three-degree lean, restrained
bob, tracking oval shadow, and clean upright settling. No walk cycles. Reduced
motion uses still tableaux and short crossfades.

## Rationale

The player recognizes the same spatial evidence they investigated, now arranged
as the detective's explanation.

## Tradeoffs

- Placeholder props reduce close-up detail.
- Provenance text must remain concise at phone size.

## Mobile considerations

Keep captions above the bottom safe area and controls in the upper corners.
Hide the joystick and gameplay A/B buttons. All reconstruction controls remain
48px or larger.

## Performance considerations

Reuse existing textures and rooms. Add one reusable silhouette and lightweight
DOM overlay; avoid post-processing and new full-screen texture assets.

## Validation

Capture named desktop and 844x390 poses for recorded key, inferred doorway,
observed altered-loop tell, and finale. Validate caption/control containment,
provenance legibility, minimum touch size, no overlap, and reduced-motion state.

## Validation results

Six desktop/mobile screenshot layouts pass automated geometry and pixel checks.
Human grid review confirms readable provenance, isolated caption/control zones,
clean two-character finale staging, and a non-scrolling mobile replay board.
