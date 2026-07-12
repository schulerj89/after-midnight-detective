# Decision: Lock input during the solved-case handoff

- Date: 2026-07-11
- Status: Accepted
- Discipline: Game direction and interaction QA
- Owner: Gameplay direction

## Context

Rapid taps around the final accusation can feel like browser double-click text
selection and can leak an exploration interaction into the short delay before
the reconstruction begins. Officer Hale is near the normal lounge solve route,
so an unintended interaction is especially visible there.

## Options considered

### Only disable text selection

This removes the browser highlight but does not prevent a second activation from
reaching gameplay during the finale handoff.

### Remove the solved-case delay

An immediate cut avoids the gap, but loses the brief confirmation that the
player's theory was accepted.

### Add an explicit finale transition lock

Keep the confirmation beat, suppress browser selection, and gate keyboard,
touch, pointer, movement, prompt, and dialogue activation until reconstruction
owns the screen.

## Decision

Disable selection, callout, and tap-highlight behavior across the game UI. When
the accusation resolves as solved, enter one idempotent finale-transition state:
clear movement, dismiss any dialogue, hide exploration prompts, block case-board
and mobile pointer input, and reject all world interactions. During that lock,
hide the premature Officer Hale epilogue and replay action behind a neutral
`RECONSTRUCTION STARTING...` status. Start the reconstruction once after the
existing 1.1-second confirmation beat.

## Rationale

The player should experience one deliberate sequence: theory accepted,
reconstruction begins, arrest follows. Browser-native selection and accidental
Officer Hale dialogue break that dramatic ownership.

## Tradeoffs

- Game copy can no longer be selected with the pointer; the experience has no
  text-copy workflow that depends on selection.
- The solved confirmation is intentionally non-interactive for 1.1 seconds.

## Dependencies

The existing case board, dialogue box, reconstruction sequence, mobile controls,
and debug canvas state remain in place.

## Player impact

Fast taps no longer highlight text or open police dialogue during the solve.
The accusation flows cleanly into the reconstruction.

## Scope impact

No evidence, accusation, timing, or ending logic changes. The existing Officer
Hale epilogue remains available after the cinematic rather than appearing in the
automatic pre-cinematic handoff.

## Validation plan

- Unit and production build regression.
- Mobile browser solve using the canonical four accusation links.
- Inspect immediate, mid-delay, and reconstruction states for closed dialogue,
  hidden prompts, one transition, and no text selection.
- Verify computed selection/callout styles on the game, case board, and controls.
