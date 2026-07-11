# Decision: Flat mobile analog joystick

- Date: 2026-07-11
- Status: Accepted
- Discipline: Visual direction and mobile input
- Owner: Noir visual direction
- Refines: `2026-07-11-roaming-exploration-sandbox.md`

## Context

The first analog-control pass still showed four arrow buttons inside the circular
housing. Although the inner knob moved freely, the arrows made the control read
as a digital D-pad rather than the flat analog joystick requested by the player.
The supplied reference establishes the desired proportions: a restrained outer
disc, a smaller movable circular puck, and low-contrast guide lines.

## Options considered

### Keep the arrow buttons and reduce their opacity

This preserves four discrete fallback targets, but the controller still reads as
a D-pad and competes visually with the movable puck.

### Hide the arrows visually but keep invisible hit zones

This preserves the old event source but creates unexplained invisible controls
that can intercept analog dragging and makes screenshot geometry misleading.

### Use one continuous analog surface

Remove the four arrow elements. Keep a flat circular base, subtle cross-axis
guides, and a larger center puck that can travel continuously in every direction.

## Decision

Use one continuous analog surface. Remove all arrow markup and directional hit
zones from the mobile overlay. The 160px outer disc remains the pointer target.
Increase the puck to 56px and keep it within the disc at maximum travel. Use only
thin horizontal and vertical guide lines; do not use arrowheads, boxed sectors,
direction labels, or diagonal D-pad artwork.

## Rationale

The simplified control communicates its behavior through the draggable puck
itself. It matches the supplied reference without copying its arrow decoration,
reduces visual noise over clues and characters, and better supports continuous
X/Y exploration.

## Tradeoffs

- The legacy blocking sandbox loses its four mobile focus-step buttons; direct
  touch remains available there and the route is retained for regression work.
- A flat disc has less explicit first-use instruction than arrows. The HUD's
  `JOYSTICK` label and visible displaced QA pose provide supporting affordance.
- Physical-device held-drag testing remains necessary before production sign-off.

## Mobile considerations

- Retain the full 160px pointer surface and safe-area offset.
- The visible 56px puck is an indicator, while the whole disc is the touch target.
- Pointer capture, cancellation, blur reset, and normalized movement remain
  unchanged.
- A/B remain 62px circles and must not overlap the joystick or primary subjects.

## Performance considerations

The control uses only CSS gradients, borders, and one translated element. It adds
no textures, canvas draws, animation loop, or additional event listeners.

## Validation

- Capture the named `exploration-joystick` pose at 1000x560 landscape.
- Confirm no arrow glyph or directional button appears in DOM or pixels.
- Confirm the 160px disc and displaced 56px puck remain contained in the viewport.
- Confirm the disc does not overlap the player, clue, Miles, or A/B buttons.
- Run the screenshot analyzer and inspect the original plus annotated grid.
- Request independent review from the QA sub-agent before sign-off.

## Validation results

Passed on 2026-07-11:

- Browser DOM inspection found one `Movement joystick` group, one puck, zero
  directional buttons, and no arrow text.
- The 1000x560 named pose records a 160x160 surface and displaced 56x56 puck.
- Screenshot analysis passed all 32 checks with zero failures. The puck remains
  inside the disc, and the disc/A/B controls avoid declared character and clue
  overlaps.
- The refreshed dialogue pose also passed, confirming the arrow-free control
  alongside the portrait dialogue layout.
- The independent QA sub-agent compared the reference, source capture, annotated
  grid, manifest, report, markup, CSS, and input math and reported PASS with no
  blocking findings.
- Non-blocking: the centered radial glow is slightly fuller than a perfectly flat
  disc, but the translated puck remains unambiguous. A/B sublabels remain small.
- Limitation: deterministic visual displacement and unit-tested vector math do
  not replace sustained held-drag testing on physical touch hardware.
