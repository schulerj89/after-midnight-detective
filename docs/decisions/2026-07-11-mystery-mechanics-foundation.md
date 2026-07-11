# Mystery Mechanics Foundation

## Context

After Midnight, Detective is an observation-led noir mystery staged as a living diorama. Characters repeat a timeline, the player questions suspects and inspects objects, and knowledge accumulated across loops supports a final accusation. The mechanics need a shared foundation before feature implementation so that clues, dialogue, timeline changes, and notebook state remain mutually consistent.

## Options considered

1. Use a branching dialogue adventure with timeline movement as atmosphere.
2. Use a freeform simulation where events emerge and the player records everything manually.
3. Use a deterministic repeating case timeline with authored, causally triggered deviations and structured deduction tools.

## Decision

Use a deterministic repeating timeline as the case's baseline. Separate immutable case truth, player knowledge, player hypotheses, resettable scene state, and persistent loop changes. Center play on observing, questioning, inspecting, recording, confronting, reconstructing, and explaining. Allow authored later-loop deviations only when caused by an explicit player action or discovery.

The notebook will preserve provenance: witnessed observations, suspect statements, physical evidence, and player hypotheses remain visibly distinct. The timeline screen will combine these sources without presenting unverified claims as truth. The accusation will require a suspect plus supporting evidence and causal reasoning, with a confirmation step and recoverable feedback.

## Rationale

A deterministic baseline makes repeated observation meaningful: the player can notice absences, overlaps, impossible travel, and changed behavior. Causal deviations let the world react without making the mystery unreadable. Separating truth from knowledge prevents the UI and logic from accidentally confirming a lie. Requiring an explanation makes deduction—not menu completion—the final skill being tested.

## Tradeoffs

- Authored schedules and reactions require more content validation than a simple dialogue tree.
- Determinism reduces emergent variation but substantially improves fairness and testability.
- Structured notebook entries constrain freeform expression but work better on mobile and permit useful validation.
- Recoverable accusation feedback lowers punishment, but suits a short narrative game without reflex challenges.

## State model

- **Case truth:** canonical actors, actions, locations, times, motives, and causal relationships; never reset or mutated.
- **Baseline schedule:** deterministic events and movement for an untouched loop.
- **Loop state:** current time, positions, dialogue availability, inspected objects, and temporary reactions; reset each loop.
- **Persistent knowledge:** witnessed observations, collected evidence, heard statements, unlocked questions, and known contradictions.
- **Triggered deviations:** persistent or loop-scoped causes that replace specific baseline events in later loops.
- **Player hypotheses:** editable timeline placements, suspect theories, and evidence links; never treated as confirmed fact.
- **Accusation draft:** selected suspect, claim links, evidence support, contradictions, and confirmation status.

Every notebook entry retains its source, acquisition loop, relevant time range, verification status, and relationships to other entries.

## Failure cases and recovery

- **Mandatory clue missed:** make it observable again in a later loop or expose a causally justified alternate source.
- **Character questioned outside an ideal moment:** pause or defer the schedule through a forgiving interaction window; do not discard the opportunity permanently.
- **Loop deviation obscures baseline evidence:** retain witnessed baseline notes and provide a way to restore or replay the baseline.
- **Testimony mistaken for fact:** label provenance and confidence consistently; show contradictions without auto-resolving them.
- **Player submits an incomplete or wrong accusation:** identify unsupported links or conflicting known facts, then return to investigation with the draft preserved.
- **Save or interruption occurs mid-event:** restore from a safe deterministic checkpoint with knowledge intact and no duplicate rewards.

## Mobile considerations

All critical actions need tap-first controls and generous targets. Timeline events must remain readable without precision dragging; tapping a person, location, and time slot is an equivalent placement method. Notebook distinctions must use labels and icons in addition to palette. Scrolling, text enlargement, orientation changes, interruption, and audio focus changes must not corrupt loop or dialogue state.

## Validation plan

- Run a blind first-loop playtest and verify that the baseline schedule can be understood without prior knowledge.
- Trigger each authored deviation and verify its cause is telegraphed and recorded.
- Confirm every required conclusion has at least two discoverable supporting signals and no mandatory clue is permanently missable.
- Test notebook provenance, contradiction display, timeline editing, and reset/persistence boundaries.
- Test accusation outcomes for the correct suspect with insufficient reasoning, a plausible wrong suspect, and a complete correct explanation.
- Repeat the flow at phone viewport sizes using touch only, including text scaling, interruption, orientation change, and save/resume.
- Verify identical inputs reproduce identical baseline events and that resettable scene state never leaks between loops.
