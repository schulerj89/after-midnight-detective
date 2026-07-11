# Roaming exploration screenshot QA

Date: 2026-07-11
Result: **PASS with non-blocking limitations**

## Scope

Reviewed the 1280x720 desktop overview and both 1000x560 landscape-mobile poses
at native size, together with their geometry manifests and annotated analyzer
outputs in `artifacts/`.

## Automated evidence

- Desktop overview: pass, zero geometry or pixel-activity failures.
- Mobile displaced joystick: pass, zero geometry or pixel-activity failures.
- Mobile dialogue: pass, zero geometry or pixel-activity failures.
- The circular pad remains 160x160, the inner puck is now 56x56, and A/B remain
  62x62.
- Browser inspection confirms zero directional buttons and no arrow text inside
  the joystick group.
- The displaced puck and both action buttons remain inside their declared housing
  or viewport containment zones.
- No declared control-to-character, control-to-clue, or dialogue-content overlap
  occurs in the tested poses.
- The revised joystick pose passes all 32 declared geometry and pixel checks.

## Visual review

The 3/4-view room reads as a larger navigable venue: the camera frames multiple
furniture landmarks, two full-body cutouts, a nearby red ledger, and open paths
beyond the viewport. The player, NPCs, and props retain clear contact shadows and
Y-depth cues. The palette and silhouettes remain consistent with the noir bible.

The mobile pad now reads as a flat circular analog control. Its inner puck has
visible displaced travel over subtle cross-axis guides, with no arrowheads,
direction labels, boxed sectors, or invisible directional hit zones. A/B stay
separate from the player, clue, and Miles in the captured composition. Dialogue
preserves portrait hierarchy and legible pixel text.

Independent QA compared the supplied reference, source PNG, annotated grid,
manifest/report, markup, CSS, and vector-input implementation. It reported PASS
with no blocking findings. The puck retains roughly 17px radial clearance in the
named displaced pose.

## Browser behavior checks

- Default route loaded the exploration scene and published player/camera state.
- A opened the in-range ledger dialogue and updated labels to `NEXT`/`BACK`.
- B dismissed that dialogue and restored the closed state.
- `?scene=blocking` loaded the original authored timeline sandbox.

## Limitations

- Placeholder silhouettes and primitive furniture do not prove final art readability.
- The displaced joystick image is a deterministic visual-QA pose. Unit tests verify
  normalization/deadzone logic and browser inspection verifies the housing accepts
  pointer input, but sustained held-stick timing still needs a physical touch-device pass.
- The centered radial glow makes the housing slightly fuller than a perfectly flat
  disc, but it does not obscure the puck or suggest digital direction sectors.
- These captures do not simulate nonzero notch or home-indicator safe-area insets.
- Only the initial camera region is shown; later venue sectors need named poses as
  content and collision complexity grows.

## Sign-off

The exploration and analog-control baseline is suitable for further gameplay work.
Re-run the named captures after changes to camera framing, spawn positions, furniture,
interaction ranges, dialogue geometry, control sizing, or mobile breakpoints.
