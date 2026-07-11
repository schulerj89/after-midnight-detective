# Decision: Level 1 knowledge and dialogue chain

- Date: 2026-07-11
- Status: Accepted
- Discipline: Mystery mechanics and narrative content
- Owner: Mystery gameplay and narrative specialists

## Context

The four-room construction needs its first playable information chain. Physical
clues currently open generic placeholder text and NPC conversations do not retain
knowledge or unlock later responses.

## Options considered

### Script every room but keep conversations stateless

This supplies atmosphere but does not prove investigation progression.

### Build the entire loop, notebook, timeline, and accusation now

This reaches the full design faster on paper, but joins too many unvalidated
systems and makes failures difficult to isolate.

### Build one persistent evidence-to-dialogue unlock ladder

Author every current clue, preserve testimony separately from observations, and
prove one confrontation chain that unlocks two later responses plus a future-loop
variant flag. Defer full loop simulation and accusation UI.

## Decision

Implement typed Level 1 case content outside the Phaser scene with:

- immutable world-truth documentation kept separate from player flags;
- idempotent persistent flags grouped as `evidence`, `observation`, `statement`,
  `topic`, `confrontation`, `reviewed`, and `variant`;
- authored first/repeat inspection text for all five clue IDs;
- first/repeat questioning for Vera and Miles;
- clue-dependent responses for wet footprints, matchbook, and switchboard log;
- torn-ledger evidence shown to Miles after his initial Room 317 denial;
- the confrontation unlocking Vera's ledger follow-up;
- Vera's follow-up unlocking Miles's missing-key response;
- Miles's response setting `variant.miles.checks-office-next-loop` for later
  timeline implementation.

Apply a variant's effects only when the player advances through its final page.
Dismissing early must not grant evidence, statements, topics, or variants.

## Rationale

This is the smallest complete social-information chain: inspect, question, show,
unlock, revisit, and change future state. It demonstrates meaningful text gates
without pretending the notebook, timeline, or accusation systems are finished.

## Tradeoffs

- Evidence presentation uses the contextual A/E interaction prompt rather than a
  dedicated notebook picker in this pass.
- The later-loop variant is armed and visible in debug/case notes but NPC schedule
  deviation is deferred.
- Flags persist only for the current browser session until save data is added.
- The content points toward contradictions but deliberately does not resolve the
  final culprit for the player.

## State model

- `LevelOneCaseState`: unique knowledge flags, completed script IDs, event log,
  and last unlock.
- `InteractionVariant`: target ID, prompt, requirements, exclusions, script,
  completion effects, and priority by authored order.
- Immutable case truth remains content documentation and is never written by
  dialogue or player actions.
- Scene state reads the case snapshot for prompts/HUD/debug only.

## Failure cases and recovery

- Clues remain inspectable in any order and never disappear.
- Repeating a completed script produces reminder text and no duplicate entries.
- Early dialogue dismissal applies no effects and the script remains available.
- Finding the ledger before questioning Miles still serves his first question
  first, so the denial exists before confrontation.
- Missing future loop behavior cannot block this slice; the variant is only armed.

## Mobile considerations

- Pages target roughly 60 characters and one idea each.
- Contextual prompts state `QUESTION`, `INSPECT`, `SHOW`, or `ASK` explicitly.
- No unlock requires timing, precision dragging, hover, or audio.
- The case-notes HUD remains short and does not replace a future notebook.

## Validation plan

- Unit-test first/repeat selection, idempotent effects, early dismissal semantics,
  ledger confrontation prerequisites, Vera/Miles follow-ups, arbitrary clue order,
  and variant flag creation.
- Capture named first-question, clue-inspection, confrontation, and unlocked
  follow-up poses on desktop and landscape mobile.
- Export case flags, completed script, and last unlock for browser assertions.
- Use two independent screenshot-QA reviews plus a code-review pass before sign-off.

## Validation results

Implemented and accepted for the placeholder milestone. Thirty-five automated
tests pass, including resolver ordering, idempotence, unknown-clue fallback,
last-unlock preservation, and completion-versus-dismissal behavior. Deterministic
1000x560 and 844x390 captures prove the dialogue ladder and later-loop variant
feedback. Two screenshot QA reviews and two code reviews were completed; their
findings and resolutions are recorded in
`docs/qa/2026-07-11-level-one-gameplay/README.md`.
