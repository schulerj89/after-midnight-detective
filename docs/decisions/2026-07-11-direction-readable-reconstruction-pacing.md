# Decision: Readable reconstruction pacing

- Date: 2026-07-11
- Status: Accepted
- Discipline: Cross-discipline
- Owner: Noir game direction and mystery mechanics
- Supersedes: Timing portions of `2026-07-11-direction-guided-altered-loop.md` and `2026-07-11-direction-solved-case-curtain-call.md`

## Player-facing problem

The altered-loop restage and the solved detective reconstruction advance before
players can comfortably read the captions and understand why Miles moves. The
fast changes make evidence presentation feel like unexplained motion instead of
a deliberate deduction.

## Constraints

- Observation must remain replayable and free of reflex pressure.
- Movement and captions must identify the same dramatic beat.
- The sequence must remain skippable and support reduced motion.
- The reconstruction score is approximately 36 seconds long.
- Required information cannot depend on audio alone.

## Options considered

### Option A: Apply one global speed multiplier

This is simple, but it slows empty transitions and dense explanations equally.

### Option B: Require a continue tap for every card

This guarantees reading time, but turns the stage presentation into a slideshow
and adds repeated taps on mobile.

### Option C: Author longer per-beat holds

Give short labels a modest hold and dense evidence cards more time, while
stretching actor travel to fit the corresponding beat.

## Decision

Use authored per-beat pacing. The altered-loop presentation lasts approximately
17 seconds, with its anticipation and confirmation cards held for at least 1.8
seconds and each transit lasting 3.4 seconds. The solved reconstruction lasts
35.3 seconds, aligning its final card with the generated score. Pause and skip
remain available throughout.

## Rationale

Per-beat holds preserve cinematic flow while giving each inference enough room.
They also keep Miles's theatrical slide attached to the caption that explains
it, which is the key comprehension failure being corrected.

## Tradeoffs and risks

Repeat viewers may find the sequences slower. Existing pause, skip, replay, and
end-restage controls contain that risk. Reading speed still varies, so captions
remain visible in the notebook or case state after the presentation.

## State model

The deterministic phase and beat order is unchanged. Only authored durations
and matching tween durations change; evidence recording and solution gates do
not.

## Failure cases and recovery

Skipping never removes solved evidence. Ending the altered loop restores player
control, while replay restarts at the first authored beat.

## Mobile considerations

No additional touch actions are required. Existing 48-pixel pause, skip, and
end controls remain available, and mobile captions retain their compact layout.

## Dependencies

The timing data drives both runtime playback and deterministic tests. The
reconstruction music remains non-looping.

## Player impact

Players have time to read what Miles claimed, watch where he goes, and connect
that movement to the recorded observation before control returns.

## Scope impact

No new scenes, facts, or assets are introduced.

## Validation plan

- Unit-test deterministic phase order and exact total durations.
- Assert movement tweens use their authored phase or beat duration.
- Run the scripted Level 1 reconstruction proof.
- Capture and inspect representative mobile altered-loop and reconstruction
  poses to ensure the slower timing does not change layout.

## Validation results

The deterministic restage proof passes at 17,200ms and the solved reconstruction
proof passes at 35,300ms with all six evidence-bounded beats. The full 84-test
suite and production build pass. Existing mobile presentation poses remain
layout-stable because this change alters authored holds and matching tweens, not
overlay geometry.
