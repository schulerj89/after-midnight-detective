# Game Direction Foundation

## Context

After Midnight, Detective is intended to be a short browser-based noir mystery presented as a living stage diorama. Its systems—repeating character timelines, questioning, clue inspection, a notebook, evidence presentation, behavior changes, timeline reconstruction, and accusation—can easily grow into disconnected features or an oversized branching narrative. A shared direction discipline is needed before implementation expands.

## Options considered

1. Let each discipline make local decisions without a game-direction gate.
2. Write a fixed design specification now and treat it as immutable.
3. Establish concise direction principles, require records for material decisions, and prove the game through a narrow vertical slice.

## Decision

Use option 3. The project will protect a no-reflex detective fantasy, judge features by their contribution to observation and deduction, and require a dated game-direction record before material design changes. Development will first complete one coherent room-to-accusation vertical slice.

## Rationale

The player should feel clever because they noticed, compared, and tested information—not because they clicked quickly or exhausted every dialogue option. A vertical slice exposes weak links between story, mechanics, visual staging, audio cues, notebook support, and deduction much earlier than building each system broadly. Decision records preserve the reasons behind scope and experience choices so later work does not silently undermine them.

## Tradeoffs

- Writing decisions adds a small cost before material changes.
- A narrow slice delays the appearance of a large world or cast.
- No-reflex and accessibility requirements constrain timing-based tension and interface density.
- Strong coherence may require cutting individually appealing scenes, effects, or branches.

These costs favor a shorter, more comprehensible, and more polished game.

## Dependencies

- The game bible must state the player fantasy, core loop, mystery scope, and experience pillars.
- Visual, mechanics, narrative, audio, and engineering work must consult relevant direction records.
- Notebook, timeline, dialogue, and audio systems must expose enough state to validate comprehension and accessibility.
- Mobile testing must be part of slice acceptance rather than a late porting task.

## Player impact

Players receive a readable, replayable mystery where missed observations can be recovered, evidence has visible consequences, and the final accusation is supported by information they personally assembled. Mobile and accessibility needs are considered in the core experience rather than layered on afterward.

## Scope impact

The first milestone is limited to one room, three characters total with at least two active in the repeating timeline, one contradiction, one evidence chain, one behavior change, one timeline deduction, and one provisional accusation. Additional content is gated on the slice demonstrating coherent play and acceptable performance on representative desktop and mobile devices.

## Validation plan

- Ask first-time players to explain the observed contradiction without prompting.
- Confirm they can acquire evidence, use it in questioning, observe changed behavior, and justify an accusation.
- Record where players confuse atmosphere with actionable information.
- Test completion without audio, without color distinctions, with reduced motion, and using touch only.
- Verify readable text and targets at representative phone sizes and safe areas.
- Review whether every major scene element supports mystery comprehension, dramatic pacing, or player agency.
- Expand scope only when the complete slice works without reflex demands or designer explanation.
