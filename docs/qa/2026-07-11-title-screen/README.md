# Pixel title screen QA

## Scope

Validated the new default title route, responsive pixel-noir composition, Start
transition, compact audio settings, pointer hit geometry, keyboard navigation,
and persisted music/SFX levels.

## Named poses

- `title-desktop-main.png` — 1280x720 title and primary choices.
- `title-mobile-main.png` — 844x390 landscape title.
- `title-mobile-settings.png` — 844x390 landscape audio settings.

Each PNG has a companion runtime-derived layout manifest. Analyzer reports and
10 percent grid annotations are stored in `artifacts/`.

## Automated results

- All title controls remain inside their declared safe area.
- The two-line title block reports `0.00` horizontal and vertical center delta
  at both 1280x720 desktop and 844x390 landscape mobile.
- Every mobile control renders 270.83x52 CSS pixels, exceeding the 48x48
  minimum.
- Button columns align within one pixel and adjacent controls do not overlap.
- Unit coverage verifies wrapped navigation and main/settings state changes.
- Audio tests verify independent volume persistence and clamping.

## Browser interaction results

- Tapping `SETTINGS` opens the settings panel rather than starting the game.
- Music toggle changed `false` to `true`; music volume cycled from 62% to 80%;
  SFX volume cycled from 82% to 100%; Back returned to the main panel.
- Arrow Down selected Settings and Enter opened it.
- `START CASE` completed its black fade and opened the Level 1 lounge with
  `explorationReady=true`.
- Gameplay mobile controls and the global music HUD are hidden on the title.

## Human visual review

The cream/red title now straddles the exact landscape viewport midpoint and
reads first, followed by the active dim-yellow plate. Rain
and hard shadow planes establish noir atmosphere without obscuring copy. The
mobile settings screen uses the full landscape width, keeps four evenly spaced
single-tap rows, and avoids title-copy overlap.

## Limitations

Canvas controls use explicit keyboard selection and visible focus rather than
native HTML button semantics. Screenshot geometry can prove target size and
placement, but not subjective comfort for every device or font rasterizer.
