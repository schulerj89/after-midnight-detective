# Visual Direction Foundation

## Context

After Midnight, Detective is a small 2D mystery built around observation, dialogue, and deduction. Its scenes must stay visually alive during repeated timelines without requiring frame-by-frame character animation. The presentation also needs to scale to mobile hardware and preserve clue readability on small screens.

## Options considered

### Traditional sprite animation

Use walk cycles and conventional animated character sheets. This gives familiar motion but increases asset volume, makes pose continuity expensive, and works against the intended stage-play character.

### Painterly cinematic realism

Use detailed backgrounds, soft realistic lighting, and richly rendered characters. This can be atmospheric but risks weak silhouettes, costly assets, and muddy mobile readability.

### Graphic-novel cutout diorama

Use full-body transparent character cutouts, authored stage marks, shallow visual layers, graphic shadows, limited poses, and restrained environmental motion. This turns the animation constraint into a deliberate theatrical language.

## Decision

Adopt a graphic-novel, paper-cutout noir diorama built from a black, charcoal, cream, muted-red, and dim-yellow palette. Compose locations as shallow stages with clear movement lanes and foreground occluders. Move characters between fixed marks with eased horizontal slides, subtle travel bob, directional lean, soft grounding shadows, and motivated static-pose swaps. Animate the world primarily through rain, smoke, flicker, and passing headlights.

Require a visual decision record before material visual changes so new assets and effects remain coherent with this foundation.

## Rationale

The approach makes limited animation feel authored rather than absent. Strong silhouettes support both noir drama and rapid observation of who is where. Fixed scene marks make repeated timelines easier to reason about, author, and test. A small pose vocabulary concentrates art effort on expressive story beats. Layered environmental motion gives rooms life without competing with deduction or demanding reflexes.

The constrained palette creates a stable visual hierarchy: cream for readable information, dim yellow for motivated attention, and muted red for danger, evidence, or decisive emphasis. Shallow staging also makes foreground occlusion, character tracking, and mobile composition predictable.

## Tradeoffs

- Character performance depends on pose selection, timing, composition, and sound rather than fluid body animation.
- Fixed marks reduce freeform movement and require careful blocking to avoid repetition.
- Heavy shadows can hide clues unless value contrast is reviewed deliberately.
- Atmospheric transparent layers can become fill-rate expensive or visually noisy.
- A limited palette requires disciplined exceptions to prevent important moments from blending together.

## Mobile considerations

Judge silhouettes and clue visibility at the smallest supported viewport, not only on desktop. Keep evidence readable through shape, value, position, and interaction feedback rather than fine detail or color alone. Preserve safe areas for dialogue, notebook, and timeline UI. Use foreground occlusion carefully so cropped or narrow layouts do not hide characters unexpectedly. Provide effect-density reduction without removing narrative cues.

## Performance considerations

Prefer texture atlases, compressed and appropriately sized cutouts, pooled particles, bounded rain and smoke emitters, and reusable lighting effects. Avoid stacking large transparent full-screen layers and excessive real-time post-processing. Establish mobile budgets for texture memory, overdraw, particle counts, and concurrent light effects once representative scene art exists.

## Validation

Validate the foundation with a representative crime-scene slice containing:

- At least two full-body characters moving between authored marks.
- Neutral, speaking, suspicious, and alarmed pose changes.
- A foreground object that masks feet without hiding an interaction.
- Rain, smoke, light flicker, and one passing-headlight event.
- One clue readable by silhouette or value at desktop and representative phone sizes.
- Stable frame pacing with full and reduced effect-density settings on target mobile hardware.

Review still frames in grayscale and at phone resolution. Review movement at normal speed for clean easing, restrained bob and lean, grounded shadows, and stable settling. Record screenshots, frame-time observations, memory notes, and any deviations in the implementation decision record.
