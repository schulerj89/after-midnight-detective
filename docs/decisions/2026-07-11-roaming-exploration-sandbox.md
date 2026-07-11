# Decision: Roaming 2D exploration sandbox

- Date: 2026-07-11
- Status: Accepted
- Discipline: Cross-discipline
- Owner: Game direction, mechanics, and visual direction
- Supersedes: The fixed-stage-only and free-roaming non-goal in the foundation bible

## Context

The player needs a larger 2D level and direct character movement closer to a
pixel RPG. The existing sandbox proves observation, theatrical NPC movement,
and dialogue, but the player cannot explore space. The mobile circle must also
behave as a real analog joystick with a movable inner knob.

## Options considered

### Replace the diorama with a top-down tile RPG

This most literally matches conventional pixel RPGs, but top-down sprites and
walk cycles would discard the full-body noir cutout language and much of the
existing staging work.

### Add horizontal side-scrolling only

This preserves full-body cutouts but makes the analog joystick and larger room
layout feel unnecessarily constrained.

### Use a 3/4-view exploration diorama

Move the detective freely across an authored X/Y floor plane while retaining
full-body cutouts, shadows, foreground occlusion, depth sorting, pose swaps,
and no walk cycle. Follow the player with a bounded camera across a venue larger
than the viewport.

## Decision

Build a separate 2400x1350 exploration scene and make it the default sandbox.
Keep the current fixed-stage room available with `?scene=blocking` for timeline
and UI regression work.

The exploration baseline will include:

- keyboard movement with arrows or WASD;
- a circular analog mobile pad with draggable center knob and normalized X/Y;
- a full-body detective cutout that slides, bobs, leans, and casts a soft shadow;
- camera follow and bounded world movement;
- simple rectangle collision against walls, counters, furniture, and planters;
- Y-based depth sorting and foreground occlusion;
- two placeholder NPCs and one clue that can be activated by proximity/A or tap;
- portrait dialogue using the existing dialogue component;
- a fixed HUD showing current district, interaction prompt, and control help;
- debug state exported for player position, input vector, nearest target, and camera.

No combat, inventory, or case progression is added in this pass.

## Rationale

The 3/4 view provides the spatial freedom expected from a 2D RPG while keeping
the game's distinctive noir theatre. A separate scene avoids destabilizing the
deterministic timeline sandbox. Simple collision rectangles and authored props
are enough to validate traversal before adopting a level editor or tile map.

## Tradeoffs

- Free movement weakens the original stage-mark simplicity and introduces
  collision, camera, and navigation testing.
- Placeholder geometry cannot prove final room readability or path quality.
- A DOM joystick and Phaser scene still share a semantic event bridge.
- Smooth cutout motion must look intentional without a walk cycle.
- The larger scene increases the chance of missing offscreen timeline events;
  later mystery design must ensure the notebook and replay systems compensate.

## State model

- `PlayerPawn`: world position, body offset, facing/lean, movement state, and bounds.
- `MovementVector`: normalized keyboard/mobile intent with deadzone.
- Scene collisions: authored rectangles independent of render objects.
- Interactables: stable ID, world position, range, action, and optional pointer target.
- Camera: bounded follow state derived from the player.
- Fixed-stage timeline remains isolated in the existing sandbox scene.

## Failure cases and recovery

- Releasing or cancelling the joystick immediately emits a zero vector and resets the knob.
- Losing window focus clears mobile movement.
- Diagonal input is normalized so it is not faster than cardinal movement.
- X and Y collision resolve separately to allow sliding along furniture.
- Dialogue suppresses movement and restores control on close.
- Player position is clamped to world bounds even if a frame delta spikes.

## Dependencies

- Phaser camera, pointer, geometry, tween, and keyboard input systems.
- Existing dialogue box, mobile action buttons, pixel font, and placeholder art approach.
- Existing screenshot-QA skill and runtime layout/debug hooks.

## Player impact

The player can roam a larger noir venue, approach people and objects, and use
the same investigation interactions through keyboard, touch, or the analog
mobile controller. Movement remains deliberate and non-reflexive.

## Scope impact

This supersedes free-roaming movement as an explicit non-goal. It does not
supersede the short-mystery scope, authored timelines, no-walk-cycle direction,
or observation-first gameplay.

## Mobile considerations

- Keep the 160px outer circle and use a visible center knob with at least 44px
  diameter and bounded travel.
- Use pointer capture and handle pointer cancel, blur, and multi-touch safely.
- Retain 62px A/B buttons and portrait orientation gate.
- Keep critical NPCs, clues, prompts, and dialogue clear of controller regions.

## Performance considerations

- Render the level from simple graphics and bounded atmospheric effects.
- Avoid tilemap or physics dependencies until the traversal contract is proven.
- Use one player container, simple rectangle collision, and camera culling.
- Keep QA/debug overlays outside production asset loading.

## Validation plan

- Unit-test deadzone, normalization, and diagonal speed.
- Validate keyboard and analog movement, joystick release/cancel, collisions,
  camera bounds, depth sorting, proximity interaction, and dialogue movement lock.
- Capture desktop overview, landscape joystick movement, near-NPC prompt, dialogue,
  and portrait orientation poses with layout manifests.
- Run programmatic visual geometry checks and independent screenshot review.
- Confirm the blocking sandbox remains reachable and its existing tests pass.

## Validation results

Passed on 2026-07-11:

- 19 Vitest checks cover dialogue, focus, timeline, movement-vector, deadzone,
  world-bounds, and collision-axis behavior.
- TypeScript and the Vite production build pass. The existing Phaser bundle-size
  advisory remains non-blocking.
- Browser smoke checks confirmed the exploration scene exports ready/player/
  camera/proximity state, A opens the nearby ledger, B dismisses dialogue, and
  the mobile labels change to `NEXT`/`BACK`.
- The original scene remains reachable at `?scene=blocking` and reports ready.
- Desktop overview, mobile displaced-joystick, and mobile dialogue captures each
  pass their geometry manifests with zero failures.
- The analog housing now receives pointer input, uses pointer capture, and resets
  on pointer release, cancellation, lost capture, or window blur. Vector math is
  unit-tested; held-stick timing still needs confirmation on physical touch hardware.
