# Decision: Bottom-anchored mobile controls

- Date: 2026-07-11
- Status: Accepted
- Discipline: Visual direction and mobile UX
- Owner: Visual design and screenshot QA
- Refines: `2026-07-11-visual-flat-mobile-joystick.md`

## Context

At 1000x560, the joystick and A/B controls are centered around 51–53% of the
viewport height. They float over the middle of the stage at character-waist
height instead of occupying expected landscape thumb zones near the bottom.

## Options considered

### Move every control down without changing dialogue

This fixes traversal but places the controls directly over the dialogue panel.

### Keep the controls centered to protect dialogue

This preserves the old dialogue composition but does not solve the reported
problem and keeps high-priority scene space covered during exploration.

### Use traversal and dialogue control states

Bottom-anchor the joystick and A/B during traversal. When dialogue locks player
movement, hide and disable the joystick while leaving A/B low over a reserved
right-side region clear of portrait and copy.

## Decision

Use distinct traversal and dialogue states. At 1000x560 with zero safe-area
insets:

- place the 160x160 joystick at x=16, y=384 (16px bottom clearance);
- place B at approximately x=846, y=448;
- place A at approximately x=922, y=466;
- derive positions from bottom/right safe-area offsets, never viewport midpoint;
- keep the 56px puck, 62px A/B circles, and 14px horizontal control gap;
- hide and disable the joystick while dialogue is open.

## Rationale

The controls become balanced lower-corner anchors and return the upper/middle
stage to characters, clues, and room construction. Dialogue does not need a
movement stick, so removing it in that state is clearer than allowing collision
with the panel.

## Tradeoffs

- A/B occupy the dialogue panel's low-right visual region; dialogue copy must
  retain a narrower wrap width so the action rail stays clear.
- Very short landscape viewports leave less vertical separation between control
  art and the dialogue panel, requiring a dedicated 844x390 regression pose.
- Physical safe-area and one-thumb comfort still require real-device testing.

## Mobile considerations

- Effective edge clearance is at least safe-area inset plus 8px and normally 16px.
- Control centers should be within 24px vertically across the left/right groups.
- Gameplay controls must not cover the prompt, player, focused NPC, or clue.
- Dialogue controls must not cover portrait, speaker, copy, or continue marker.

## Performance considerations

The state change uses CSS positioning, opacity, and pointer-events only. It does
not add rendering work or a per-frame layout measurement.

## Validation

- Capture traversal and dialogue at 1000x560 and short landscape at 844x390.
- Record safe-area containment, bottom clearance, touch sizes, and forbidden
  subject/content overlaps in manifests.
- Require zero analyzer failures and independent QA review of annotated grids.
- Confirm the joystick is visually absent and non-interactive during dialogue.

## Validation results

Passed on 2026-07-11:

- At 1000x560 the joystick is `(16,384,160,160)`, leaving 16px below it;
  center Y is 464, or 82.9% of viewport height.
- A is `(922,466,62,62)` and B is `(846,448,62,62)`, with 14px between
  circles and 16px right clearance. The action-group center remains within 24px
  of the joystick center.
- At 844x390, the same bottom offsets keep every control fully visible and above
  the 48px touch minimum.
- Traversal, dialogue, and short-landscape manifests pass 37, 31, and 18 checks
  respectively with zero failures.
- During dialogue, the joystick has zero opacity and `pointer-events: none`.
  A/B remain at least 72px from portrait/copy/marker content.
- Independent design and QA sub-agents both reported PASS with no blocking
  findings.
- Non-blocking: A intentionally straddles the dialogue panel's right border while
  remaining within the viewport; later panel art may formalize this action rail.
