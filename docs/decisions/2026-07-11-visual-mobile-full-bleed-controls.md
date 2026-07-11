# Decision: Full-bleed mobile canvas with smaller joystick

- Date: 2026-07-11
- Status: Accepted
- Discipline: Visuals
- Owner: Noir visual direction
- Supersedes: mobile framing portions of `2026-07-11-visual-smaller-cutouts-and-isolated-rooms.md`

## Context

Very wide landscape phones display the fixed 16:9 game canvas with large black
side bars. The 160px joystick then occupies most of the left bar instead of
reading as a light overlay on the stage.

## Options considered

### Keep FIT and shrink only the joystick

This reduces control weight but leaves much of the phone unused.

### Stretch the canvas with CSS

This fills the screen but distorts circles, characters, and pointer mapping.

### Use Phaser EXPAND and scale the joystick to 70 percent

EXPAND fills the available parent while preserving the designed game scale. A
112px joystick and 39px knob retain the same proportions with less obstruction.

## Decision

Use `Phaser.Scale.EXPAND` with centered scaling. On landscape phones, keep the
HTML controls fixed over the full viewport. Reduce only the joystick artwork and
touch region from 160px to 112px and its knob from 56px to 39px. Keep A/B at
62px so their touch targets remain comfortably above 48px. Calculate knob travel
from the rendered pad size rather than a fixed pixel constant.

## Rationale

The player sees more of the room, controls read as translucent glass over the
stage, and circular artwork stays circular. Action buttons remain forgiving.

## Tradeoffs

- Extra-wide phones reveal more horizontal stage area than desktop 16:9.
- Fixed-coordinate HUD panels will not stretch across the extra width; they
  remain anchored to the designed 1280-unit composition.
- The smaller joystick requires phone testing for comfort, though its 112px
  target remains well above the accessibility minimum.

## Mobile considerations

- Respect safe-area insets and keep controls in the lower corners.
- Validate at 1280x433, 1000x560, and 844x390 landscape sizes.
- Dialogue mode still hides the joystick.
- Full-black room transitions still hide all HTML controls.

## Performance considerations

EXPAND may render a wider canvas on ultrawide phones. The current placeholder
scene remains lightweight; monitor fill rate when weather and lighting arrive.

## Validation

- Canvas bounds fill the available landscape viewport without side bars.
- Joystick measures 112x112 and knob approximately 39x39.
- A/B remain 62x62 and all controls stay inside safe areas.
- Controls overlay active scene pixels and do not resize the game area.
- Original and annotated screenshots pass programmatic layout review.

## Validation results

- Browser measurements confirmed a full-viewport canvas at 1280x433 and
  844x390 with no document overflow.
- The rendered joystick is 112x112, its knob is 39x39, and both action buttons
  remain 62x62.
- Both screenshot manifests passed the automated bounds, containment,
  non-overlap, minimum-size, and edge pixel-activity checks.
- Human review of the original and 10 percent grid captures confirmed the
  controls sit over active scene pixels in the lower corners.
