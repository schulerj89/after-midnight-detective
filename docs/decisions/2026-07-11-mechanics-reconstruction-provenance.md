# Decision: Evidence provenance governs reenactment beats

- Date: 2026-07-11
- Status: Accepted
- Discipline: Mechanics
- Owner: Mystery mechanics
- Supersedes: none

## Context

A post-solve reenactment can accidentally present the detective's theory as
omniscient truth. The current case proves only a limited chain.

## Options considered

### Allow cinematic beats without evidence links

This is flexible but violates the separation of truth, observation, testimony,
and inference.

### Require every beat to declare its basis and certainty

This makes the reconstruction auditable, testable, and fair.

## Decision

Author every reconstruction beat as data with a stable ID, duration, room,
caption, provenance (`RECORDED`, `TESTIMONY`, `OBSERVED`, or `INFERRED`), and
one or more basis IDs. Factual styling is allowed only for supported beats.
Inferred beats use shadow treatment and cautious language.

The reconstruction unlocks only after `outcome.level-one-solved`. It changes no
case knowledge and cannot improve or invalidate the accusation.

## Rationale

The sequence becomes a legible summary of the player's case rather than a new
source of hidden information.

## Tradeoffs

- Captions carry more explanatory weight.
- Future truth changes require updating beat bases and tests.

## State model

Reenactment state contains status, beat index, elapsed beat time, pause state,
completion reason, and replay count. Case truth and knowledge remain unchanged.

## Failure cases and recovery

- Skipping returns safely to CASE CLOSED.
- Pausing freezes beat time and movement.
- Interruption can restart the sequence from the solved board.
- Unsupported basis IDs fail automated validation.

## Mobile considerations

Pause and skip controls are at least 48px. Gameplay controls are hidden during
playback, captions stay inside safe areas, and no interaction requires timing.

## Validation plan

Unit-test unlock gating, beat order, basis coverage, pause, skip, completion, and
replay. Export beat ID, provenance, and basis IDs through the debug snapshot.

## Validation results

Five reenactment tests pass, including canonical-solution basis coverage. The
browser snapshot exports beat, provenance, basis IDs, status, replay count, and
reduced-motion state. No beat lacks an acquired support ID.
