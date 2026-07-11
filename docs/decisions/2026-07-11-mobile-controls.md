# Decision: Translucent landscape-mobile controls

- Date: 2026-07-11
- Status: Accepted
- Discipline: Cross-discipline
- Owner: Visual direction, mystery mechanics, and game direction
- Supersedes: None

## Context

The sandbox supports direct tapping, but landscape-mobile players also need a
stable control surface that does not require precise selection of characters or
small clues. The game has no free-roaming detective and must not imply that the
player controls a conventional walking avatar.

## Options considered

### Virtual movement pad

Use a D-pad to move an avatar around the room. This conflicts with fixed stage
blocking, adds collision and navigation work, and suggests reflex play.

### Action buttons only

Add translucent interact and pause buttons while retaining direct tapping. This
is simple but does not improve selection accessibility for small or moving
targets.

### Focus-navigation pad with action buttons

Use the D-pad to move an explicit focus reticle between authored interactables.
Use A to interact or advance and B to pause/resume or dismiss dialogue. Direct
tapping remains available.

## Decision

Adopt focus navigation. In the sandbox, the ordered focus set is Vera, the
matchbook, and Miles. Left/up select the previous target; right/down select the
next target. Selection wraps and follows moving character positions.

Add a DOM-based mobile control overlay visible only in landscape viewports no
larger than 1000x600. Place a low-opacity D-pad near the left safe area and A/B
buttons near the right safe area. Keep controls visible but visually secondary.

- **A:** activate the selected person or clue; advance an open dialogue.
- **B:** pause/resume the timeline; dismiss an open dialogue without changing
  clue or statement state.
- **Direct tap:** remains fully supported.

## Rationale

Focus navigation makes the same authored targets accessible without inventing
player locomotion. DOM controls retain dependable CSS-pixel touch sizes even as
the Phaser canvas scales. A visible in-scene reticle connects pad input to the
diorama and makes selection state understandable without relying on color alone.

## Tradeoffs

- The overlay occupies screen edges and may overlap art on exact 16:9 phones.
- Ordered focus navigation is less freeform than direct tapping.
- DOM and Phaser input require a small event bridge and lifecycle cleanup.
- B can dismiss unread dialogue, so it must never mark a page as read or award
  evidence merely because the panel closed.

## State model

- `FocusNavigator` owns an ordered target ID list and selected index.
- The Phaser scene resolves target IDs to live positions and activation actions.
- DOM buttons dispatch semantic control events; they do not mutate game state.
- The dialogue model remains authoritative for open/page state.

## Failure cases and recovery

- Input before the sandbox is ready is ignored.
- Repeated directional input wraps predictably without losing focus.
- A during dialogue advances exactly one page.
- B during dialogue closes the panel and runs its normal cleanup callback.
- B outside dialogue toggles the timeline without changing focus.
- Controls are hidden in portrait, where the rotate-device screen remains the
  only active mobile presentation.

## Dependencies

- Existing dialogue, timeline, actor snapshots, and portrait orientation shell.
- A pure focus-navigation model for deterministic tests.
- Scene shutdown removes the DOM event listener.

## Player impact

Landscape-mobile players gain generous, predictable controls while retaining
direct touch. The pad reads as navigation between clues and people rather than
movement through the room.

## Scope impact

This does not add avatar movement, notebook navigation, evidence selection, or
gamepad support. Later screens may reuse the semantic event bridge with their
own focus sets.

## Mobile considerations

- Use at least 48x48 CSS-pixel action targets where viewport space permits.
- Apply safe-area offsets and `touch-action: none`.
- Use translucent charcoal fills, cream borders, dim-yellow focus, and muted-red
  A emphasis.
- Preserve the dialogue portrait, main body text, and advance marker.
- Keep the overlay absent on desktop-sized and portrait layouts.

## Performance considerations

- Use CSS and DOM buttons rather than extra transparent WebGL layers.
- Update only one small Phaser focus reticle each frame.
- Dispatch one semantic event per pointer activation; do not poll DOM controls.

## Validation plan

- Unit-test previous/next wrapping and stable initial selection.
- Unit-test dialogue dismissal cleanup.
- Verify the overlay is hidden at 1280x720, visible at 844x390, and hidden behind
  the rotate-device presentation at 390x844.
- Verify every control is at least 48 CSS pixels at 844x390.
- Use the D-pad to select a different target and confirm the debug selection ID.
- Use A to open and advance dialogue; use B to close it and restore timeline state.
- Confirm direct tapping still works and the browser reports no errors.

## Validation results

Accepted on 2026-07-11.

- `npm run validate` passes: 3 test files, 12 unit tests, strict TypeScript,
  and the Vite production build.
- `git diff --check` reports no whitespace errors.
- At 1280x720, the mobile overlay is hidden, one Phaser canvas is present, and
  the browser reports no errors.
- At 844x390 landscape, the overlay is visible. All four D-pad buttons measure
  48x48 CSS pixels and both action buttons measure 62x62 CSS pixels.
- Computed control styling uses a 30% opaque charcoal background and 42% opaque
  cream border, keeping the controls legible but subordinate to the stage.
- Pressing right selected `matchbook` and made the focus reticle visible.
- Pressing A opened `sandbox-matchbook` and paused the timeline; pressing A
  again advanced the dialogue without closing it.
- Pressing B dismissed the dialogue, ran normal cleanup, and restored the
  running timeline.
- At 390x844 portrait, the mobile controls are hidden and the existing
  rotate-device presentation is visible.
- Direct pointer interactions remain registered on the Phaser targets, and the
  browser reported no console errors throughout validation.
- Approved regression captures are stored in `docs/screenshots/mobile/`:
  `sandbox-mobile-landscape-controls.png`,
  `sandbox-mobile-landscape-dialogue.png`, and
  `sandbox-mobile-portrait-rotate.png`.
- The two landscape captures use the same named debug pose: loop 1 paused at
  approximately 133 ms with the matchbook selected. The screenshot QA report
  found no blocking overlap, framing, texture, or readability defects.
- Screenshot inspection prompted contextual action labels: A changes from ACT
  to NEXT during dialogue, while B changes among PAUSE, PLAY, and BACK.
