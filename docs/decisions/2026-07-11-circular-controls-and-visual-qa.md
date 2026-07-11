# Decision: Circular mobile controls and geometry-backed screenshot QA

- Date: 2026-07-11
- Status: Accepted
- Discipline: Cross-discipline
- Owner: Visual direction, game direction, and screenshot QA
- Supersedes: Visual styling portion of `2026-07-11-mobile-controls.md`

## Context

The tested landscape controls work, but the D-pad reads as four separate square
buttons. The preferred presentation is one circular pad with circular A/B
buttons. The project also needs repeatable screenshot validation that measures
placement rather than relying only on subjective review.

## Options considered

### Add a virtual-joystick library

NippleJS and Phaser joystick plugins provide analog direction, distance, and
drag behavior. The game uses discrete focus navigation, so those capabilities
add dependency and input complexity without improving the player action.

### Move all controls into Phaser

Phaser supports unified pointer events and circular or polygonal hit areas. A
canvas-only controller would be visually coherent, but it would give up native
button semantics, CSS safe-area handling, and straightforward DOM geometry
measurement.

### Keep semantic controls and style one circular pad

Retain the existing DOM buttons and semantic event bridge, but place the four
48px directional hit targets inside a single 160px circular housing. Keep A/B
circular. Continue routing their actions into the Phaser scene, whose pointer
and interaction model remains authoritative for game objects.

## Decision

Use the semantic circular-pad approach and add no control library. The D-pad
housing will use a restrained radial/conic treatment, outer cream boundary,
subtle sector divisions, central hub, and transparent cardinal hit regions.
Pressed input will use the existing muted-red/dim-yellow feedback.

Create a project-local `$validate-game-screenshots` specialist. Every material
visual QA pass must pair each screenshot with a JSON layout report containing
viewport and element rectangles. A Python analyzer will:

- confirm PNG and viewport dimensions;
- confirm containment and safe-area bounds;
- enforce minimum control sizes;
- detect forbidden rectangle overlaps;
- compare specified alignments within tolerance;
- confirm expected regions contain non-flat pixel information;
- emit machine-readable results and an annotated 10% grid PNG.

Human screenshot inspection remains mandatory because geometry cannot judge
visual hierarchy, legibility, thematic fit, or misleading silhouettes.

## Rationale

This preserves a compact, accessible input surface for discrete clue selection
while achieving the desired controller silhouette. Phaser documentation confirms
that touch and mouse are unified as pointer input and that circle, ellipse,
rectangle, triangle, and polygon hit regions are supported when future in-canvas
interactions need them.

The companion layout JSON is more reliable than inferring all geometry from
pixels. Pixel statistics still catch blank, missing, or fully obscured regions,
while the annotated grid lets a reviewer verify what the numbers mean.

## Tradeoffs

- DOM and Phaser continue to share an event boundary.
- Rectangular semantic buttons sit inside a circular visual housing; the hit
  targets are intentionally larger than the visible arrow glyphs.
- Rectangle overlap checks cannot model every irregular silhouette.
- Pixel variance can detect empty regions but cannot prove text is readable.
- Capture generation still requires a browser; Python validates artifacts after
  capture rather than replacing browser automation.

## Dependencies

- Existing semantic mobile-control bridge and focus navigator.
- Pillow for screenshot loading, pixel statistics, and annotated output.
- Browser capture capable of exporting both screenshots and DOM rectangles.
- New project-local screenshot-QA specialist skill.

## Player impact

Landscape-mobile players see a coherent circular pad and circular A/B controls
without any change to focus, interaction, dialogue, pause, or direct-touch
behavior.

## Scope impact

This is a presentation and validation upgrade. It does not introduce analog
movement, a player avatar, gesture input, or production HUD design.

## Mobile considerations

- Preserve four independent minimum 48px directional targets.
- Keep the 160px pad within the left safe area and the 62px A/B controls within
  the right safe area.
- Keep controls translucent and outside essential dialogue/portrait regions.
- Hide the controls in portrait behind the rotate-device presentation.

## Performance considerations

- Use CSS backgrounds and borders only; add no images, canvas layers, or runtime
  joystick polling.
- Run the Python analyzer outside the game runtime.
- Keep annotated QA artifacts out of production asset loading paths.

## Validation plan

- Preserve all 12 current unit tests and production build validation.
- Add Python analyzer self-validation with passing and failing geometry fixtures.
- Validate the new skill using `quick_validate.py`.
- Capture stable 844x390 controls and dialogue screenshots plus layout JSON.
- Capture the 390x844 portrait state.
- Confirm 48px directional targets, 62px A/B targets, 160px circular housing,
  viewport containment, control-to-dialogue non-overlap, and expected symmetry.
- Generate and inspect annotated grid images.
- Use the QA specialist for an independent final review before commit.

## Validation results

Accepted on 2026-07-11 with two non-blocking findings.

- The `$validate-game-screenshots` skill passes `quick_validate.py` and includes
  a documented layout schema plus Pillow-based analyzer.
- Synthetic analyzer testing passed a valid fixture with exit 0 and rejected a
  deliberately broken fixture with two findings and exit 1.
- All 12 game unit tests, strict TypeScript, and the production build pass.
- Named poses `mobile-controls` and `mobile-dialogue` freeze the timeline at
  0 ms, select the matchbook, and expose stable runtime state.
- Runtime bounds confirm a 160x160 circular D-pad housing, four 48x48 direction
  targets, two 62x62 action buttons, and computed 50% A/B border radii.
- Three PNGs have companion runtime-exported layout JSON. The analyzer reports
  0/38, 0/57, and 0/15 failures: 110 checks with no failures.
- Generated annotated 10% grids and JSON reports are stored under
  `docs/qa/2026-07-11-circular-mobile-controls/artifacts/`.
- An independent QA sub-agent reviewed originals, annotated grids, manifests,
  and reports and issued PASS with no blocking defects. Its dated report is
  `docs/qa/2026-07-11-circular-mobile-controls/README.md`.
- Non-blocking: the decorative D-pad housing touches the dialogue panel corner
  by roughly 27x20px, though no directional hit target, portrait, or copy does.
- Non-blocking: secondary sandbox HUD/helper text remains small and low contrast
  at 844x390; player-facing dialogue and action labels remain readable.
- Remaining limitations include nonzero device-safe-area simulation, pressed or
  multi-touch visual states, OS text scaling, and placeholder-art conclusions.
