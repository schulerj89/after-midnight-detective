# Decision: Larger lounge with room-local stage transitions

- Date: 2026-07-11
- Status: Accepted
- Discipline: Direction
- Owner: Game direction and level design specialists
- Supersedes: `2026-07-11-direction-text-authored-level-one.md` where continuous-room presentation conflicts

## Context

Level One currently exposes every connected room in one continuous world. The
short routes make the hotel feel like a diagram rather than a sequence of noir
stages, while neighboring rooms at the camera edge weaken composition.

## Options considered

### Enlarge every room by 1.5 times

This produces more travel everywhere but dilutes clue density in the bedroom,
kitchen, and office.

### Add invisible connector distance

This makes travel longer in geometry without giving the player a meaningful
space to observe.

### Enlarge the lounge hub and isolate rooms behind doors

Expand the 20x20 lounge to 30x30, keep the clue-focused satellites compact, and
present only the active room. Door thresholds cut through black to the linked
room with a short fade.

## Decision

Adopt the third option. The lounge becomes 30x30 with three-tile central travel
axes and longer center-to-door routes. Kitchen, bedroom, and office retain their
current dimensions. Entering a linked `+` tile starts a guarded 140 ms fade-out,
relocates the player to an authored inward `ENTER` tile while fully black, then
uses a 160 ms fade-in. Exactly one room is rendered, collidable, and interactive.

## Rationale

The larger hub directly creates the requested travel time while preserving the
purposeful density of evidence rooms. Black transitions make each room read as a
stage set and prevent accidental previews of off-room clues or characters.

## Tradeoffs

- Room origins remain topology metadata even though other rooms are hidden.
- A held movement input must be neutralized to prevent arrival-door bounce.
- Small rooms can show black gutters on wide desktop screens; that is preferable
  to leaking adjacent sets.
- The timeline will eventually continue offstage, pausing only during the brief
  transition; the current slice has no running timeline yet.

## Dependencies

- Text parser support for per-endpoint `ENTER x y` destination tiles.
- Pure reciprocal door resolution and validation.
- Room-scoped visibility, collision, interaction, and camera bounds.

## Player impact

Crossing the lounge becomes a deliberate 7-10 second traversal, while doorway
cuts remain quick and non-interactive. No reflex timing or precision button press
is introduced.

## Scope impact

This changes Level One presentation and navigation only. It does not add
hallways, another floor, timeline simulation, or loading screens.

## Validation plan

- Unit-test both directions of every link and all six authored arrival tiles.
- Prove all room grids remain reachable and door arrivals are walkable.
- Browser-test source, black, and destination transition states.
- Capture desktop and landscape-mobile room-isolation evidence.
- Require spatial QA and code-review sign-off.

## Validation results

Implemented and accepted. The lounge is 30x30 while all three satellite rooms
retain their compact dimensions. Six reciprocal endpoints resolve to authored
arrivals, a live browser trace proves lounge-to-kitchen relocation with one
active room, and the full 140/160 ms fade flow preserves case state. Fifty tests,
the production build, and ten current transition screenshot analyzers pass.
Gameplay QA, spatial QA, and code review all returned Pass.
