---
name: design-mystery-mechanics
description: Design, review, or materially change After Midnight, Detective's mystery gameplay systems, including repeating timelines, observable character movement, questioning, inspectable clues, the notebook, evidence confrontation, loop-dependent behavior, timeline reconstruction, and accusation explanations.
---

# Design Mystery Mechanics

Design for deliberate observation and deduction, never fast reflexes. Preserve the living-diorama rhythm: let the player watch, pause, question, inspect, compare, and revise a theory without execution pressure.

## Record decisions first

Before any material mechanics change, create `docs/decisions/YYYY-MM-DD-mechanics-<topic>.md`. Treat a change as material when it alters player rules, mystery state, progression, information availability, win/loss logic, loop behavior, or a core UI flow.

Include these sections:

1. Context
2. Options considered
3. Decision
4. Rationale
5. Tradeoffs
6. State model
7. Failure cases and recovery
8. Mobile considerations
9. Validation plan

Explain why the decision serves this mystery; do not merely describe implementation. Keep the record synchronized if implementation reveals a different decision.

## Preserve the deduction loop

Build and review this complete loop:

1. Observe a readable, repeating timeline of characters moving among fixed scene positions.
2. Question characters at forgiving interaction windows; do not require precise timing.
3. Inspect scene objects to discover clues and contextual observations.
4. Record confirmed evidence, statements, locations, times, and unresolved contradictions in the notebook.
5. Present discovered evidence to suspects to unlock reactions, corrections, lies, or new questions.
6. Change later-loop behavior only through explicit, understandable causes such as a confrontation, discovery, or player choice.
7. Let the player reconstruct who was where on a timeline screen, distinguishing fact, testimony, and player hypothesis.
8. Require an accusation that names a suspect and explains the case with relevant evidence and reasoning links.
9. Give specific feedback on unsupported or contradictory reasoning and allow recovery without replaying unrelated content.

## Model truth and knowledge separately

Keep immutable case truth separate from player knowledge and mutable loop state. At minimum model:

- world facts: actual actors, locations, times, actions, motives, and causal links;
- observations: what the player personally witnessed and in which loop;
- statements: speaker, claim, subject, time range, confidence, and contradiction status;
- evidence: source, discovery requirements, implications, and presentation reactions;
- hypotheses: player-authored timeline placements and accusation links;
- loop state: loop index, triggered deviations, remembered knowledge, and resettable scene state.

Never silently convert testimony or a hypothesis into fact. Make persistence across loops explicit.

## Enforce fairness and readability

- Make every required conclusion supported by at least two legible signals, preferably from different channels.
- Establish timeline positions, travel time, and event ordering consistently enough to reason about them.
- Telegraph consequential deviations before or as they occur; retain a notebook trace afterward.
- Prevent unwinnable states, permanently missed mandatory clues, and single-tap irreversible accusations.
- Keep optional red herrings plausible but falsifiable; do not resolve the case through hidden information or arbitrary reveals.
- Expose newly unlocked dialogue and evidence reactions without forcing exhaustive menu repetition.
- Distinguish new, reviewed, contradicted, and unresolved notebook entries through text and shape as well as color.
- Make incorrect theories informative. Point to the broken link, missing support, or conflicting fact without revealing the solution.
- Ensure the final explanation tests causal reasoning, not merely selection of the correct suspect.

## Design for mobile

Use generous targets, short tap paths, scroll-safe notebook layouts, and readable timeline density at phone sizes. Avoid hover-only meaning, drag-only critical actions, tiny time markers, and precision-dependent interception. Provide tap alternatives for timeline placement and evidence linking. Preserve state through orientation changes, interruption, and audio focus loss.

## Validate the mechanic

Test the decision record's validation plan. Cover at least:

- a blind first loop and a later altered loop;
- early, late, and repeated interactions;
- required clue recovery and contradiction discovery;
- notebook provenance and timeline edits;
- correct suspect with weak reasoning, wrong suspect with plausible reasoning, and a complete correct accusation;
- phone-sized touch input, text scaling, interruption, and save/resume;
- deterministic reset behavior and persistent knowledge boundaries.

Report what was validated, what remains uncertain, and any divergence from the recorded decision.
