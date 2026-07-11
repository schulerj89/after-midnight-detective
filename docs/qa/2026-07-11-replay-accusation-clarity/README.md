# Replay and accusation clarity regression

## Reported problems

- `REPLAY THE NIGHT` implied a cinematic but started the interactive timeline.
- Altered-loop Miles movement crossed the lounge too quickly and received two
  conflicting movement beats near 12:14.
- A missing accusation choice leaked the internal field name `timelineFactId`.

## Fixes

- Renamed the action to `RESTAGE ALTERED LOOP` or
  `START NEXT OBSERVATION LOOP` and added text explaining that it resumes live
  observation, not the post-solve cinematic.
- Restaging now returns the player to lounge tile 15,14 before beginning the next
  loop, preventing the required observation from occurring offscreen.
- Altered loops suppress the conflicting baseline piano beat.
- NPC travel time now scales with distance, capped at 3.4 seconds, with bob count
  scaled to the same duration.
- The accusation board shows `THEORY LINKS SELECTED: n/4`, disables facts absent
  from the notebook, highlights an omitted group, and uses player-facing error
  text.

## Automated validation

- Timeline tests assert that an armed later loop emits the office check and one
  return beat without the conflicting baseline piano event.
- Accusation tests assert that missing and incorrect links never expose internal
  property names.

## Browser validation at 844x390

- A three-link accusation displayed `THEORY LINKS SELECTED: 3/4`, highlighted
  `TIMELINE FACT`, and said: `The theory is incomplete. Choose a witnessed timeline
  fact before presenting it.` No `timelineFactId` text was present.
- Selecting `MILES CHECKED THE OFFICE` and submitting launched
  `THE DETECTIVE'S RECONSTRUCTION` with the case outcome solved.
- `RESTAGE ALTERED LOOP` closed the board, activated the lounge, placed the
  player at tile 15,14, and incremented the loop.
