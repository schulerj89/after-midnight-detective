# Decision: Solved finale is a presentation state, not new evidence

- Date: 2026-07-11
- Status: Accepted
- Discipline: Mechanics
- Owner: Mystery mechanics
- Supersedes: none

## Context

The arrest payoff occurs after the accusation is already validated. It must not
silently add evidence, strengthen the theory, or create another failure state.

## Options considered

1. Make the arrest another timed reenactment beat.
2. Require a final confirm-arrest choice.
3. Treat the arrest as a deterministic presentation state after the solved result.

## Decision

The arrest scene can begin only when `outcome.level-one-solved` exists. It writes
no clue, statement, observation, or timeline flags. Completing or skipping the
reconstruction both reach the same arrest tableau. Returning resumes the retained
solved exploration state and opens the solved accusation board, where the
reconstruction remains replayable.

## Rationale

The deduction is finished before the epilogue. Keeping truth/knowledge unchanged
prevents a cinematic consequence from masquerading as proof and makes every path
recoverable.

## Tradeoffs

Skipping the reconstruction also advances to the arrest; this respects the skip
label while preserving the earned ending. The player can replay the complete
reconstruction afterward from the solved board.

## State model

`investigating -> solved -> reconstruction playing/skipped/completed -> arrest
tableau -> solved board`. The exploration scene remains paused beneath the arrest
scene so its case state is not recreated.

## Failure cases and recovery

The arrest scene rejects unsolved launches in the normal flow. Return is available
by 48-pixel pointer target and Enter/Escape. Replaying the reconstruction can launch
the tableau again without duplicating case flags.

## Mobile considerations

All exploration inputs and translucent controls remain unavailable during both
presentation states. Return is a single safe-area-aware action.

## Validation plan

Test solved-state gating, completed and skipped paths, replay, zero new knowledge
flags, keyboard/touch return, and reduced-motion behavior.

Automated gating and zero-mutation tests pass. Browser validation confirmed the
skip path, 23 retained knowledge flags, solved outcome persistence, case-board
return, keyboard return, and reduced-motion state. Pointer geometry is covered by
the 184x50 mobile control manifest.
