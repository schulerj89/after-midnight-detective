# Decision: End Level 1 with a detective reconstruction

- Date: 2026-07-11
- Status: Accepted
- Discipline: Direction
- Owner: Gameplay expert and noir game direction
- Supersedes: ending flow in `2026-07-11-direction-level-one-ending.md`

## Context

The solved board confirms the player's reasoning but ends on text. A staged
reconstruction can turn that reasoning into a dramatic visual payoff.

## Options considered

### Show an omniscient murder flashback

This is cinematic but would invent a weapon, motive, caller, and exact act that
Level 1 does not establish.

### Keep the static case-closed board

This is accurate but underuses the living-diorama presentation at its payoff.

### Show the detective's evidence-bounded reconstruction

This restages proven and inferred links with explicit provenance, then returns
to the solved board.

## Decision

After the solved stamp holds briefly, fade into a skippable 25–30 second
`THE DETECTIVE'S RECONSTRUCTION`. Stage six beats: title; 12:06 switchboard;
12:08 key ledger; inferred Room 317 doorway; the later altered-loop office tell;
and a final evidence tableau with Hale behind Miles. Return to CASE CLOSED with
`REPLAY RECONSTRUCTION`.

Do not show a victim performance, weapon, killing, motive, caller identity, key
disposal, or Vera as accomplice.

## Rationale

The ending rewards deduction by making the player's own reasoning move onstage,
while provenance labels preserve the distinction between fact and inference.

## Tradeoffs

- Restraint makes the sequence less sensational than a literal murder scene.
- Placeholder actors limit performance nuance.
- The extra ending beat must remain short and skippable.

## Dependencies

The solved outcome, case knowledge flags, isolated room stages, cutout movement,
and responsive HTML overlays are reused.

## Player impact

The player sees why the accusation works, may pause or skip without penalty, and
can replay the reconstruction from the solved board.

## Scope impact

No new crime facts, rooms, suspects, clue requirements, or ending branches are
added.

## Validation plan

Test automatic unlock, deterministic beat order, pause, skip, replay, return to
the solved board, reduced motion, and provenance coverage. Capture key, inferred
doorway, observed office-tell, and finale poses on desktop and mobile.

## Validation results

The original 28-second six-beat sequence completed and returned to CASE CLOSED.
Its timing is superseded by the 35.3-second readable-pacing decision. Browser
interaction proves pause, confirmed skip, and replay; deterministic tests prove
unlock and order. Desktop/mobile captures confirm the evidence-bounded staging.
