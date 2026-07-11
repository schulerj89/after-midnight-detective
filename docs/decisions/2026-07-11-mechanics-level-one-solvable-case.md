# Decision: Make Level 1 provably solvable

- Date: 2026-07-11
- Status: Accepted
- Discipline: Mechanics
- Owner: Mystery mechanics
- Supersedes: `2026-07-11-mechanics-level-one-dialogue-chain.md`

## Context

Level 1 has five clues and a persistent dialogue ladder, but it stops after
arming a future Miles behavior flag. There is no integrated loop observation,
case-theory workspace, accusation evaluator, or ending, so the player cannot
finish the case.

## Options considered

### Treat collecting every clue as solving the case

This is cheap, but reduces deduction to a checklist and ignores the game bible's
requirement for an explainable accusation.

### Add a suspect button with a binary answer

This creates an ending, but guessing Miles would bypass evidence and reasoning.

### Require an evidence, contradiction, and witnessed timeline fact

This completes the intended loop while keeping the first mystery compact. It
also creates a deterministic contract that tests and browser automation can
prove.

## Decision

Level 1 is solved only when the player accuses Miles and supports the theory
with the torn ledger, his Room 317 denial contradiction, and the witnessed fact
that he checks the manager office during the altered loop. The chain is:

1. question Miles;
2. inspect the torn ledger;
3. confront Miles with it;
4. question Vera about the torn page;
5. question Miles about the missing key, arming his altered behavior;
6. replay or wait for the next loop and witness his office check;
7. build and submit the complete accusation.

The notebook records evidence and attributed statements. The timeline separates
baseline events from witnessed altered-loop facts. Incorrect and incomplete
accusations remain recoverable and identify the unsupported part.

## Rationale

The answer depends on three distinct information channels: documentary
evidence, testimony contradicted by that evidence, and a personally witnessed
behavior change. The player must explain the case rather than select the known
culprit.

## Tradeoffs

- The first timeline is deliberately short and uses a few authored stage marks.
- The case board summarizes entries instead of providing a full freeform graph.
- Save persistence remains outside this milestone; reload begins a fresh case.

## State model

- Canonical truth remains immutable content.
- Case flags retain evidence, statements, contradictions, timeline facts, and
  the final outcome.
- Loop state holds loop index, elapsed time, emitted beats, and armed variants.
- Accusation drafts contain suspect, evidence, contradiction, and timeline fact.
- Evaluation returns missing-link or conflict feedback without mutating truth.

## Failure cases and recovery

- Missing a loop event never blocks the case; the player may replay the night.
- Closing the case board preserves the draft and knowledge.
- A correct suspect with weak support is not accepted.
- A wrong suspect or conflicting support returns the player to investigation.
- Repeated interactions and loop events remain idempotent.

## Mobile considerations

- The case board is a scroll-safe HTML overlay with 48px-or-larger controls.
- B opens the board outside dialogue; its 48px close control returns to play.
  Desktop also supports N to toggle the board.
- Accusation choices use taps, not dragging or hover.
- The live timeline pauses while the board covers the stage.

## Validation plan

- Unit-test baseline/later-loop reset and variant emission.
- Unit-test correct, incomplete, and wrong accusations.
- Execute the canonical solution through the same interaction resolver used by
  play and assert the final solved outcome.
- Add a deterministic browser debug solve route exposing every completed step.
- Capture solved-case and altered-timeline screenshots on desktop and landscape
  mobile, export authoritative bounds, and run the screenshot analyzer.

## Validation results

- Fifty-eight total tests pass; eight directly cover the canonical solution,
  accusation failures, loop reset, variant gating, and pause behavior.
- The browser debug route exports the expected seven ordered steps and the
  `solved` outcome.
- Visible browser controls were used to select all four correct theory links and
  submit them; the interface reached `CASE CLOSED` with the timeline paused.
- Three desktop/mobile screenshot layouts pass automated and human review. Full
  evidence is stored in `docs/qa/2026-07-11-level-one-solution/`.
