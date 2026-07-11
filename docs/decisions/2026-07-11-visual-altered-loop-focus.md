# Decision: Focus Miles with route and office cues

- Date: 2026-07-11
- Status: Accepted
- Discipline: Visuals
- Owner: Noir visual direction
- Supersedes: live-loop portions of `2026-07-11-visual-case-board-and-timeline-motion.md`

## Context

Miles crosses roughly twenty-one lounge tiles. A single fast diagonal tween and
player-follow camera make him appear to launch without purpose.

## Options considered

### Zoom out to show the whole lounge

Both endpoints fit, but Miles becomes too small on phones.

### Follow Miles through two authored route legs

This preserves silhouette readability and establishes the office as a deliberate
destination.

## Decision

Black-reset Miles to the windows. Frame him at readable scale, mark the claimed
post in text, flicker/edge the office cue, and move windows → center aisle →
office threshold at approximately 300px/s. Use Sine easing, two-to-three-degree
lean, restrained bob, settled route marks, and a smooth subject-follow camera.
Show a bottom caption card throughout and a recorded-observation card on arrival.

Reduced motion crossfades the windows, aisle, and office tableaux without travel
tweens.

## Rationale

Anticipation, route, destination, and result become legible without a walk cycle
or oversized map view.

## Tradeoffs

- Camera control is temporarily cinematic.
- The route line is a restrained debug-like abstraction and must remain subtle.

## Mobile considerations

Captions remain above safe areas in no more than two short lines. The player and
joystick are hidden during focus; the end-restaging control remains 48px.

## Performance considerations

Reuse current cutouts and one lightweight Graphics route/cue overlay. No new
textures or post-processing are introduced.

## Validation

Capture anticipation, center-route, recorded-arrival, and reduced-motion arrival
at desktop and 844x390. Check subject, cue, captions, control bounds, and restored
normal HUD/input.

