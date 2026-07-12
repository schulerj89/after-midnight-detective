# Decision: Pixel title screen and compact settings

- Date: 2026-07-11
- Status: Accepted
- Discipline: Cross-discipline
- Owner: Noir visual direction and game direction
- Supersedes: none

## Player-facing problem

The game currently opens directly into the lounge, and its unused title scene
has no controls and uses a serif treatment inconsistent with the pixel HUD. The
player needs a clear entry point and a small place to manage audio before play.

## Constraints

- Preserve the black, charcoal, cream, muted-red, and dim-yellow palette.
- Use the loaded Press Start 2P font and code-native Phaser shapes.
- Support mouse, touch, keyboard, landscape mobile, safe areas, and reduced
  motion.
- Touch targets must render at least 48 by 48 CSS pixels on the representative
  844 by 390 viewport.
- Keep settings limited to the audio controls already supported by the game.

## Options considered

### Option A: DOM overlay

This offers conventional accessibility semantics but introduces a second visual
layout system over the canvas and additional responsive synchronization.

### Option B: Phaser title stage with interactive plates

This keeps the title inside the same scaling and visual language as the game,
with pointer and keyboard input authored together.

## Decision

Make the Phaser title scene the default boot destination. Present the title as
a restrained pixel-noir poster with rain, a red title accent, and two large
plates: `START CASE` and `SETTINGS`. Settings contains four large choices:
music on/off, cycling music volume, cycling SFX volume, and back. Persist audio
levels through the existing audio manager. Direct QA scene URLs continue to
bypass the title.

## Rationale

The compact canvas menu feels like the opening card of the same stage play and
avoids placing app-like chrome over the composition. Cycling volume values keeps
every setting a forgiving single tap rather than a precision slider.

## Tradeoffs and risks

Canvas controls do not inherit native HTML button semantics. Keyboard focus,
visible selection, pointer targets, and runtime geometry hooks are therefore
implemented explicitly. Volume steps are coarser than a slider, favoring touch
clarity over precision.

## Implementation consequences

- Route normal preload completion to `TitleScene`.
- Add a small testable title-menu state model.
- Persist music and SFX bus levels.
- Hide gameplay mobile controls and the global music HUD while the title is
  active; expose equivalent music settings inside the menu.
- Publish named title QA poses and geometry through canvas data attributes.

## Mobile considerations

The menu is centered in the safe middle of the landscape viewport. Logical
button height is sized to remain at least 48 CSS pixels at 844 by 390. Portrait
continues to use the established rotate-device screen.

## Performance considerations

The scene uses only text, rectangles, lines, and a small bounded rain field. No
new bitmap or shader assets are required.

## Validation

- Unit-test menu navigation, settings transitions, clamping, and persistence.
- Browser-test Start, Settings, music toggle, volume cycling, Back, and keyboard
  selection.
- Capture desktop main, mobile-landscape main, and mobile-landscape settings
  named poses with layout manifests.
- Run geometry analysis for bounds, safe-area containment, 48-pixel targets,
  alignment, and forbidden overlap; then visually inspect originals and grids.

## Validation results

The desktop main, mobile main, and mobile settings manifests all pass automated
geometry analysis with zero failures. At 844x390 each interactive row is
270.83x52 CSS pixels. Browser checks prove pointer Settings, mute, both volume
cycles, Back, keyboard navigation, and Start-to-lounge behavior. Original and
annotated grid review found no title/settings overlap or unsafe placement.

## Follow-up

Additional graphics, save-slot selection, and non-audio settings remain outside
this first title-screen pass.
