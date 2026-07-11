# Decision: Door transition state and Officer Hale testimony

- Date: 2026-07-11
- Status: Accepted
- Discipline: Mechanics
- Owner: Mystery mechanics specialist
- Supersedes: none

## Context

Door cuts need deterministic rules that cannot duplicate events or alter case
knowledge. Level One also needs the third character promised by the game bible.

## Options considered

### Button-activated doors and a generic officer placeholder

This adds unnecessary interaction precision and gives the officer no information
role.

### Automatic thresholds and authored first/repeat testimony

Crossing a threshold automatically transitions. Officer Hale establishes scene
control and records one modest statement without becoming another suspect.

## Decision

Use `idle -> fading-out -> relocating -> fading-in -> idle`. Movement and action
input are rejected during the roughly 300 ms transition. The fade never changes
case flags. Arrival uses the destination endpoint's authored inward `ENTER` tile
and cannot immediately retrigger the same door.

Add `npc.officer` to the lounge. The first completed conversation records that
Officer Hale sealed the hotel exits after the alarm and saw nobody leave; repeat
text remains available. This is attributed testimony, not immutable truth.

## Rationale

Automatic thresholds keep navigation frictionless. The officer makes the hotel
lockdown legible and completes the three-character slice without expanding the
suspect pool.

## Tradeoffs

- The officer currently has only neutral first/repeat dialogue.
- A later evidence reaction can be added when it supports an actual deduction.
- Timeline pause/resume hooks are represented by transition state until the
  timeline system exists.

## State model

- Active room ID and transition state remain navigation state.
- Door events use stable link IDs and do not write evidence flags.
- Officer effects use `statement.officer.exits-sealed` and
  `reviewed.officer.first-question` only after final-page completion.

## Failure cases and recovery

- Held input is cleared at transition start and must return to neutral.
- Dialogue prevents movement, so a door transition cannot begin mid-conversation.
- Invalid arrival tiles fail level parsing rather than trapping the player.

## Mobile considerations

No door button is required. Joystick input is ignored during fades and the
visible knob is reset to center.

## Validation plan

- Test officer first/repeat selection and completion-only effects.
- Test transition guard, reciprocal destinations, arrival tiles, and room state.
- Inspect mobile doorway, officer dialogue, and black transition poses.

## Validation results

Implemented and accepted. Officer Hale has authored first/repeat testimony with
completion-only effects. The pure transition input gate remains locked through
the fade and until real input returns to neutral. Parser validation rejects door,
perimeter, occupied, or invalid start/arrival tiles. Reciprocal door tests,
browser transition provenance, gameplay QA, and code review pass.
