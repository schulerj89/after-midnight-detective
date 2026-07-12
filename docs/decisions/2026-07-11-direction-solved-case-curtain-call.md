# Decision: End Level 1 with a solved-case curtain call

- Date: 2026-07-11
- Status: Accepted
- Discipline: Direction
- Owner: Game direction
- Supersedes: none

## Context

The correct accusation currently flows into the Detective's Reconstruction and
then returns directly to the case board. The player earns an explanation, but
does not receive a distinct emotional payoff showing that the accusation changed
the world. Exploration HUD elements also remain visible beneath the reconstruction,
weakening its cinematic hierarchy.

## Options considered

1. End on the reconstruction's `CASE CLOSED` card.
2. Add an arrest beat inside the existing lounge reconstruction.
3. Follow the reconstruction with a separate arrest tableau.

## Decision

Hide ordinary exploration HUD and mobile controls throughout the reconstruction.
When the reconstruction completes—or is intentionally skipped—launch a separate,
non-interactive `CASE CLOSED` scene showing Miles behind bars. Hold the final
tableau until the player selects `RETURN TO CASE`, which restores the solved board.

## Rationale

A separate curtain call gives the solved state a new place, composition, and
rhythm. It confirms consequence without inventing additional mystery facts or
turning the ending into a reflex challenge.

## Tradeoffs

The arrest is a stylized epilogue rather than a legal simulation. It adds one
scene and return transition, but reuses placeholder cutout language and simple
graphics instead of expanding Level 1 content.

## Dependencies

The reconstruction completion/skip flow, solved case state, scene manager, and
mobile visibility classes.

## Player impact

The player gets an unmistakable earned ending: explanation first, consequence
second, then voluntary return to the solved notebook.

## Scope impact

One short scene, no new clues, dialogue, rooms, suspects, or gameplay systems.

## Validation plan

Verify the full solved flow, skip path, replay path, desktop and 844x390 landscape
framing, keyboard/touch return, input lock, and reduced-motion final pose.

Validation completed for the skip-to-arrest path, retained solved state, keyboard
return, desktop/mobile framing, hidden exploration controls, and reduced motion.
The solved board retains the reconstruction replay action after return.
