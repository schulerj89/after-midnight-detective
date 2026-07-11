# Decision: Record the altered-loop fact on office arrival

- Date: 2026-07-11
- Status: Accepted
- Discipline: Mechanics
- Owner: Mystery mechanics
- Supersedes: departure-time recording in `2026-07-11-mechanics-level-one-solvable-case.md`

## Context

The office observation is currently granted as soon as Miles begins moving. The
player may receive credit before seeing where he goes.

## Options considered

### Continue recording on departure

This is forgiving but breaks the meaning of `Miles checked the office`.

### Record only after the authored office-arrival hold

This aligns knowledge with the witnessed event while remaining unmissable inside
the guided sequence.

## Decision

Drive restaging through ordered phases: `reset`, `establish`, `anticipate`,
`transit-1`, `transit-2`, `arrived`, `recorded`, and `released`. Record
`observation.miles-office-check` and `timeline.miles-office-deviation` exactly
once when entering `recorded`, after the arrival hold.

## Rationale

The notebook fact now means what it says, and tests can distinguish departure
from completed observation.

## Tradeoffs

- Ending restaging early cannot award the fact.
- A short input lock replaces free-roaming interception.

## State model

Restage state contains phase, elapsed phase time, actor mark, status, replay
count, and whether recording has occurred. Case knowledge remains idempotent.

## Failure cases and recovery

- Ending before arrival returns control without recording; restaging remains
  available.
- Repeating a completed restage does not duplicate notebook entries.
- Existing NPC tweens are killed before reset and between route legs.

## Mobile considerations

No timing input is required. Gameplay controls are hidden/inert during focus;
one 48px end-restaging control remains available.

## Validation plan

Unit-test phase order and timings, prove facts are absent during both transit
phases and present once in `recorded`, and export phase/mark/input state.

