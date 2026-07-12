# Textured rooms and mobile spacing QA

## Scope

This pass validates the generated Level 1 room-surface atlas, removal of the
construction grid, the short-landscape camera pullback, compact-room centering,
and the responsive top HUD.

## Named captures

- `textured-lounge-mobile.png` — `level-room-lounge`, 844x390
- `textured-kitchen-mobile.png` — `level-room-kitchen`, 844x390
- `textured-bedroom-mobile.png` — `level-room-bedroom`, 844x390
- `textured-office-mobile.png` — `level-room-office`, 844x390
- `textured-lounge-desktop.png` — `level-room-lounge`, 1280x720

Each screenshot has a companion layout manifest under
`docs/screenshots/textured-rooms/`. Annotated grids and machine-readable reports
are in `artifacts/`.

## Automated results

- Screenshot layout validation: 5/5 pass, zero failures.
- Texture validation: four frames present; luminance, variance, seamless-edge,
  dimensions, and decoded-memory checks pass.
- Mobile runtime state: expected frame loaded in every room, one active room,
  camera zoom `0.88`, and 58.5 FPS on the final capture route.
- HUD: all three top zones and all touch controls remain in the eight-pixel safe
  area; no forbidden overlaps; every control is at least 48x48 CSS pixels.
- Asset budget: 95.2 KiB transfer size and 4 MiB decoded texture memory.

## Visual review

- Lounge carpet, kitchen stone, bedroom burgundy carpet, and office parquet are
  distinct without competing with actors or clues.
- No floor or wall construction-cell grid remains visible.
- The lounge gains useful breathing room on short landscape phones.
- Kitchen, bedroom, and office stages remain centered when narrower than the
  mobile camera viewport instead of sticking to the left edge.
- Location, mute, and case-note panels have clear horizontal gaps at 844x390.

## Limitations

This check validates representative static named poses. It does not replace a
long-session performance profile or touch testing on every physical safe-area
notch configuration.
