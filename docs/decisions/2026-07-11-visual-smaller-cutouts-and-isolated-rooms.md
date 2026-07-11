# Decision: Smaller cutouts on isolated room stages

- Date: 2026-07-11
- Status: Accepted
- Discipline: Visuals
- Owner: Noir visual direction specialist
- Supersedes: none

## Context

The 140x280 placeholder bodies dominate a 72-pixel grid and become more
pronounced once the lounge expands. Continuous neighboring geometry also weakens
the intended paper-stage framing.

## Options considered

### Regenerate smaller textures

This changes asset dimensions but duplicates placeholder generation and makes
future cutout replacement less predictable.

### Apply one shared display scale

Keep the source textures and display every full-body exploration cutout at 0.72,
including detective, Vera, Miles, and the new police officer.

## Decision

Use a shared 0.72 exploration scale. Scale body, contact shadow, bob amplitude,
and collision footprint coherently, but retain generous independent pointer and
interaction targets. Only the active room is visible against black. Dialogue
portraits remain full size.

## Rationale

The common scale restores diorama proportions without weakening character
identity or mobile interaction. Isolated black stages sharpen the silhouette and
door-frame language.

## Tradeoffs

- Placeholder labels and furniture are not rescaled.
- Smaller bodies require explicit invisible touch areas.
- Production cutouts may later need character-specific height normalization.

## Mobile considerations

Touch hit areas remain at least 48 CSS pixels even where the visible cutout is
smaller. Validate silhouettes and door framing at 1000x560 and 844x390.

## Performance considerations

Display scaling and hiding off-room objects add negligible cost. Hidden room
inputs must also be gated so invisible objects cannot receive clicks.

## Validation

- Compare detective and all three NPC baselines and displayed dimensions.
- Verify officer is visually distinct from Miles.
- Confirm off-room geometry is absent at every camera edge.
- Check pointer and proximity interaction after scale reduction.

## Validation results

Implemented and accepted. Detective, Vera, Miles, and Officer Hale use a shared
0.72 exploration scale with independent generous hit areas. Off-room geometry is
hidden, mobile controls disappear during full black, and vertical stage padding
keeps the detective's silhouette complete at the north door. Ten desktop/mobile
transition captures and their annotated geometry reports pass independent
spatial review.
