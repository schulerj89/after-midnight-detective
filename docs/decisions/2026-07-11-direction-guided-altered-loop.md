# Decision: Direct the altered loop as a guided observation

- Date: 2026-07-11
- Status: Accepted
- Discipline: Direction
- Owner: Gameplay director
- Supersedes: altered-loop presentation in `2026-07-11-direction-level-one-ending.md`

## Context

`RESTAGE ALTERED LOOP` currently closes the notebook, waits, then sends Miles
across the large lounge without anticipation, camera direction, or confirmation.
The behavior is technically observable but not understandable.

## Options considered

### Leave the loop fully free-roaming

This preserves control but makes the decisive behavior easy to miss and visually
reads as an animation bug.

### Convert restaging into the post-solve cinematic

This would confuse investigation with the reward that follows accusation.

### Use a short guided live-observation beat

This keeps the event part of investigation while temporarily directing camera,
captions, and attention.

## Decision

Restaging runs an approximately 11-second sequence labeled
`ALTERED LOOP // LIVE OBSERVATION`: black reset; Miles at his claimed north-window
post; office anticipation cue; two-leg route through the center aisle; office
arrival; observation-recorded card; then camera and input restoration.

## Rationale

The player sees the claimed position, the choice to leave it, the destination,
and the resulting notebook fact in one causal sequence.

## Tradeoffs

- Player control is temporarily locked.
- The sequence is more directed than ordinary observation.
- Repeated restages remain short but not instantaneous.

## Dependencies

The existing case flag, lounge marks, cutout motion, camera, and case-board
timeline are reused.

## Player impact

The altered behavior reads as intentional evidence instead of unexplained NPC
movement. No reflex or timing is required.

## Scope impact

No mystery facts, rooms, or accusation requirements change.

## Validation plan

Prove phase order, arrival-only recording, restored input/camera, mobile caption
layout, reduced-motion tableaux, and deterministic debug poses.

