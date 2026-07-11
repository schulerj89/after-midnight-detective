# Decision: Interactive gameplay sandbox foundation

- Date: 2026-07-11
- Status: Accepted
- Discipline: Cross-discipline
- Owner: Visual direction, mystery mechanics, and game direction
- Supersedes: None

## Context

The project needs a safe room for proving interaction and presentation before
case content or final art exists. The first target is a dialogue box with a
pixel-style font and character portrait, but it must live inside enough of the
actual game loop to expose bad assumptions about staging, touch targets,
movement, inspection, and state transitions.

## Player-facing problem

Players need to understand what can be observed, who can be questioned, what
can be inspected, and how dialogue advances without reflex demands. Placeholder
art must still communicate the intended theatrical production rather than look
like an unfinished conventional adventure game.

## Options considered

### Isolated UI component gallery

Build only dialogue and button widgets on a blank page. This is fast and useful
for visual variations, but it cannot validate scene occlusion, click priority,
timeline pausing, character movement, or the relationship between the game
world and dialogue.

### Full first-case prototype

Build the first mystery immediately with authored characters and clues. This
would provide realistic content, but it would entangle narrative iteration with
unproven UI and interaction architecture.

### Small interactive stage sandbox

Build one placeholder noir room with two clickable character cutouts, one
inspectable object, fixed stage marks, theatrical slide movement, a portrait
dialogue box, and explicit sandbox controls. Keep content intentionally generic
and expose stable debug state for automated validation.

## Decision

Build the small interactive stage sandbox and make it the default scene after
boot. Use vector placeholders generated at runtime so no temporary art becomes
a production dependency. Use the locally bundled Press Start 2P font for the
dialogue interface while retaining larger, more cinematic type outside it.

The sandbox will include:

- two full-body placeholder cutouts with soft contact shadows;
- fixed left, center, and right stage marks;
- eased horizontal slides, restrained travel bob, directional lean, and clean
  settling without walk cycles;
- one foreground counter that partially masks feet;
- click/tap questioning for both characters;
- one click/tap inspectable clue;
- a dialogue panel with portrait, speaker label, wrapped text, progress marker,
  and both pointer and keyboard advancement;
- pause and replay controls for a short deterministic movement loop;
- a small event/status strip showing the sandbox state;
- a read-only debug snapshot on `window.__AMD_SANDBOX__` for smoke tests.

Dialogue pauses the authored movement timeline and resumes it when dismissed.
This avoids missed observations while the panel covers the stage.

## Rationale

The stage sandbox tests a complete perceive-act-feedback chain without spending
final art or story budget. Runtime placeholders keep silhouettes, baselines,
portraits, pose swaps, and occlusion honest. A bundled font avoids network
dependency and ensures canvas text is reproducible. Pure state models for
dialogue and the timeline allow fast regression tests, while the debug snapshot
lets browser smoke tests validate the rendered integration without relying on
canvas DOM text.

## Tradeoffs

- Placeholder vector actors cannot validate final cutout texture quality.
- Press Start 2P is intentionally stylized but dense; body copy must remain
  short and relatively large, especially on phones.
- Pausing during dialogue simplifies fairness but reduces the sense of a fully
  continuous world. This can be revisited only with a later decision record.
- A single room does not validate multi-scene persistence or the notebook.

## State model

- `DialogueModel`: closed/open state, speaker, portrait key, ordered pages, and
  current page index.
- `SandboxTimeline`: deterministic elapsed time, running/paused state, loop
  count, and fired event IDs.
- Scene presentation: disposable Phaser objects derived from those models.
- Debug snapshot: read-only projection of dialogue, timeline, and interaction
  state for validation; never used as authoritative game state.

## Failure cases and recovery

- Clicking another hotspot during dialogue is ignored so conversations cannot
  overlap.
- Advancing past the last page closes dialogue and restores the prior timeline
  running state.
- Replaying resets actors, event markers, and elapsed time deterministically.
- Keyboard and pointer advancement share the same model transition.
- If the font is slow to load, game creation waits on the browser font promise
  and still has a monospace fallback.

## Dependencies

- Phaser continues to own scene rendering, input, and tweens.
- `@fontsource/press-start-2p` supplies a local OFL-licensed webfont.
- Vitest validates pure dialogue and timeline state.
- The existing browser smoke workflow validates canvas creation, debug state,
  console errors, and representative viewports.

## Player impact

The player receives a forgiving, legible interaction language: click a person
to question, click a prop to inspect, and advance dialogue by tap, click, Space,
or Enter. The surrounding room demonstrates that static cutouts are a deliberate
stage convention rather than missing animation.

## Scope impact

This slice deliberately stops before evidence inventory, notebook, branching
questions, or accusation logic. Those systems will build on the interaction and
state boundaries proven here.

## Mobile considerations

- Treat landscape as the supported gameplay orientation for this sandbox.
- Keep character and clue hit areas at least 48 CSS pixels at representative
  scale and avoid hover-only meaning.
- Reserve the lower portion of the 16:9 canvas for dialogue without covering the
  speaker's upper body.
- Wrap short dialogue pages rather than shrinking the font.
- Add a portrait rotate-device presentation outside the canvas in a follow-up
  implementation step if the current shell cannot keep text readable.

## Performance considerations

- Generate static placeholder textures once in the boot scene.
- Use a small bounded rain field and graphics primitives rather than large
  transparent image layers.
- Keep all movement tween counts bounded and stop prior movement tweens before
  starting replacements.
- Avoid post-processing in the sandbox baseline.

## Validation plan

Automated checks must verify:

- dialogue opens, advances, closes, and cannot exceed its page range;
- timeline advances deterministically, pauses, loops, and resets;
- the production build type-checks;
- the browser creates one canvas with a ready debug snapshot and no errors;
- clicking a character opens the correct dialogue state;
- the sandbox fits desktop and 844x390 landscape-oriented mobile dimensions
  without page overflow;
- character cutouts settle upright on their stage marks after movement;
- dialogue body text, speaker name, portrait, and advance prompt remain visible.

## Validation results

Accepted on 2026-07-11.

- `npm run validate` passes: 2 test files, 7 unit tests, strict TypeScript,
  and the Vite production build.
- `git diff --check` reports no whitespace errors.
- Desktop smoke test at 1280x720 creates one Phaser WebGL canvas, loads the
  bundled Press Start 2P font, and reports no browser errors.
- Clicking Vera opens `sandbox-vera`, pauses the timeline, advances through two
  pages, closes, and restores the running timeline.
- The first theatrical movement was observed in transit with directional lean,
  then at its target with `moving=false` and `rotation=0.000`.
- Landscape mobile smoke test at 844x390 fits a 693.3x390 canvas without body
  overflow. The matchbook touch target opens its portrait dialogue and pauses
  the timeline.
- Portrait mobile smoke test at 390x844 hides the gameplay canvas and displays
  the styled, accessible `ROTATE DEVICE` presentation.
- Screenshots confirmed the portrait, speaker label, wrapped body copy, advance
  marker, foreground foot occlusion, stage marks, and pause/replay controls are
  visible and coherent.

Known follow-up: Phaser remains in the main JavaScript chunk and triggers Vite's
500 kB chunk advisory. This is acceptable for the foundation but should be
addressed with loading strategy and performance budgets before content scale-up.
