# Level 1 construction and lower-control QA

Date: 2026-07-11
Result: **PASS with non-blocking construction notes**

## Scope

Reviewed the text-authored lounge, bedroom, kitchen, and manager office; the
1000x560 traversal and dialogue control states; and the 844x390 short-landscape
control state. Original PNGs, companion manifests, annotated grids, and reports
are stored under `docs/screenshots/` and this directory's `artifacts/`.

## Automated evidence

- 1000x560 traversal controls: pass, 0 failures across 37 checks.
- 1000x560 dialogue controls: pass, 0 failures across 31 checks.
- 844x390 short landscape: pass, 0 failures across 18 checks.
- Lounge overview, bedroom, kitchen, and office: pass with zero geometry or
  pixel-activity failures.
- The text parser/test suite confirms four rooms, accepted dimensions, three
  links, stable IDs, normalized bounds, malformed-row rejection, door validation,
  and disconnected-aperture rejection.

## Proportional mobile placement

At 1000x560, the 160px joystick begins at `(16,384)`, placing its center at
82.9% of viewport height with 16px bottom clearance. A/B are 62px circles at
`(922,466)` and `(846,448)`, with a 14px gap and 16px right clearance. Their
combined center remains within the QA specialist's 24px balance tolerance from
the joystick center.

At 844x390, the joystick remains 16px above the bottom, A remains 32px above it,
and B remains 50px above it. All controls remain fully visible and above the
48px touch minimum. The fixed 160px disc necessarily occupies more height on this
short viewport but reads as a bottom anchor rather than mid-screen UI.

The displaced 56px puck remains wholly contained. Declared controls do not cover
the player, Miles, or the focused clue in the traversal pose.

## Dialogue state

Opening dialogue applies `is-dialogue-open`; the joystick becomes invisible and
non-interactive. A/B remain low and stay clear of portrait, copy, and continue
marker by at least 72px. A extends beyond the panel's right outline but remains
inside the viewport safe zone and is not clipped.

## Level construction review

The 20x20 lounge reads as the public hub. The 12x10 kitchen, 8x8 bedroom, and
10x8 manager office have visibly distinct boundaries, door adjacency, placeholder
furniture, stable clue markers, and room-aware HUD labels. The captures prove
that the `.lvl.txt` drives room scale and placement; they are not final-art review.

## Independent specialist review

The design specialist and screenshot-QA specialist both reported PASS with no
blocking findings. Their measured placement matches the implemented CSS and
runtime geometry.

## Non-blocking notes and limitations

- A/B are slightly farther from the bottom than the QA specialist's preliminary
  band, but remain visibly low, balanced, and more comfortable at 844x390.
- A straddles the dialogue frame edge; a future panel-art pass may add an explicit
  action-rail divider.
- Rooms are intentionally sparse. Some labels sit behind props/cutouts and some
  adjacent-room silhouettes appear at camera edges.
- Deterministic room poses prove construction but not a complete manual traversal
  through every door on physical touch hardware.
- Safe-area math is present, but nonzero notch/home-indicator hardware remains to
  be tested on real devices.

## Sign-off

The lower mobile placement and text-authored Level 1 construction baseline are
approved for further room dressing, mystery staging, and physical-device testing.
