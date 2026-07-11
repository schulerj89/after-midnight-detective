# Mobile full-bleed controls QA

## Scope

Validate that landscape phones show the room edge-to-edge while the joystick
and action buttons remain translucent overlays in the lower corners.

## Authoritative measurements

Bounds were exported from `getBoundingClientRect()` in the running browser at
1280x433 and 844x390. The source screenshots and companion layout manifests are
stored in `docs/screenshots/mobile-full-bleed/`.

## Acceptance criteria

- The canvas fills the viewport with no reserved side gutters.
- The joystick is 112x112, exactly 70 percent of its former 160px size.
- The joystick knob is 39x39 and remains centered at rest.
- A and B remain 62x62 touch targets.
- All controls remain inside the viewport and opposite-side control groups do
  not overlap.
- Both far scene edges contain rendered pixels rather than solid black bars.

## Human review

The 10 percent grid confirms the controls occupy the lower corners rather than
the middle of the scene. The smaller joystick remains easy to distinguish, and
the full-width room makes the player and NPC spacing readable on both aspect
ratios.
