# Decision: Noir case board and altered-loop motion

- Date: 2026-07-11
- Status: Accepted
- Discipline: Visuals
- Owner: Noir visual direction
- Supersedes: none

## Context

Making Level 1 solvable adds a full-screen notebook, timeline, accusation, and
ending plus authored Miles movement during the altered loop. These elements must
read as part of the noir stage rather than a generic web form or conventional
walk animation.

## Options considered

### Use unstyled browser forms over the canvas

This is accessible by default but visually separates deduction from the game.

### Build every interface element inside Phaser

This preserves one renderer but makes responsive scrolling, semantic controls,
and mobile text handling unnecessarily fragile.

### Use a semantic HTML case board styled as an evidence dossier

This combines responsive, accessible controls with the established charcoal,
cream, muted-red, and dim-yellow visual language.

## Decision

Present the case board as a centered charcoal dossier over a dimmed stage. Use
cream pixel text, yellow for navigation/provenance, and muted red only for the
accusation action and solved stamp. Keep the room faintly visible behind it.

Miles travels between timeline marks as a grounded cutout: Sine easing, a
three-degree destination lean, a four-pixel body bob while moving, a tracking
oval shadow, and an upright settled pose. No walk cycle is introduced.

## Rationale

The board feels like the detective laying evidence over the living scene. The
controlled red stamp makes the ending decisive without turning red into general
decoration. The movement convention remains deliberately theatrical.

## Tradeoffs

- Pixel text limits information density, so entries remain concise.
- HTML overlays require screenshot validation in addition to Phaser checks.
- Placeholder cutouts cannot yet express suspicious or alarmed pose swaps.

## Mobile considerations

- Every interactive board control is at least 48 CSS pixels high.
- The 844x390 ending fits without scrolling.
- The altered timeline keeps both its observed fact and replay action visible.
- The board respects viewport and safe-area padding and hides gameplay controls
  while open.

## Performance considerations

The board uses HTML/CSS and no additional textures or post-processing. Only the
moving NPC root and body receive short tweens; no persistent particle or shader
cost is added.

## Validation

- Desktop and 844x390 mobile case-closed captures retain clear outcome hierarchy.
- The mobile timeline visibly distinguishes CLAIMED, RECORDED, and OBSERVED in
  text, not color alone.
- Runtime bounds prove all controls remain inside the board and at least 48px.
- Three screenshot manifests pass automated geometry and pixel-activity review.
- Human grid review confirms no outcome copy, tabs, or close control overlap.
