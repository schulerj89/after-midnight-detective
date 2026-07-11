---
name: direct-noir-visuals
description: Direct and review the visual presentation of After Midnight, Detective. Use for scene composition, character cutouts and poses, theatrical movement, lighting, weather, VFX, palettes, UI art direction, asset briefs, visual polish, or any material change to the game's rendered appearance.
---

# Direct Noir Visuals

## Record the decision first

Before making any material visual change, create `docs/decisions/YYYY-MM-DD-visual-<topic>.md`. Treat a change as material when it establishes or alters the palette, composition, character presentation, animation language, lighting, effects, camera, UI style, asset pipeline, or visual performance strategy.

Include these headings:

1. `Context`
2. `Options considered`
3. `Decision`
4. `Rationale`
5. `Tradeoffs`
6. `Mobile considerations`
7. `Performance considerations`
8. `Validation`

State observable validation criteria before implementation. Update the record after validation with results and any follow-up. For a minor correction that follows an existing decision, cite that decision in the work summary instead of creating a duplicate record.

## Preserve the visual identity

- Use black, charcoal, cream, muted red, and dim yellow as the core palette. Reserve saturated accents for evidence, danger, or a decisive story beat.
- Build readable silhouettes first. Ensure characters, interactables, and exits remain legible in grayscale and at phone scale.
- Compose each location as a shallow stage: background architecture, fixed movement lanes, character plane, foot-hiding foreground, and restrained atmospheric overlays.
- Favor hard graphic shapes, selective texture, and paper-cutout depth over painterly detail or literal realism.
- Use light as narrative blocking. Direct attention with pools of dim yellow, passing headlights, and motivated flicker; preserve large areas of shadow.
- Use rain, smoke, and light motion to make still scenes breathe. Keep effects sparse, layered, and subordinate to clues and faces.
- Keep full-body characters as transparent cutouts with a consistent perspective, scale system, grounding point, and lighting direction.
- Provide a small pose vocabulary per character: neutral, speaking, suspicious, and alarmed. Preserve silhouette and costume continuity between poses.
- Hide feet selectively behind desks, railings, booths, or other foreground shapes to reinforce the theatrical diorama.

## Direct theatrical movement

- Move characters horizontally between authored scene marks; do not create walk cycles.
- Ease movement in and out, add a subtle vertical bob only while traveling, and lean slightly toward the destination.
- Keep lean and bob proportional to travel speed; avoid elastic, comic, or puppet-like exaggeration unless a character-specific beat requires it.
- Ground every character with a soft oval shadow that tracks position and subtly reacts to nearby light.
- Swap static poses at motivated beats, preferably during pauses, occlusion, or directional changes.
- Let foreground occluders briefly mask feet or pose swaps, but never conceal essential evidence or dialogue focus.
- Restore a stable upright pose and settled shadow at every destination mark.

## Design for mobile and performance

- Compose for landscape first, then verify narrow viewports, safe areas, touch targets, subtitles, and notebook overlays.
- Maintain readable values and silhouettes after downscaling; avoid clues that depend on tiny texture detail or color alone.
- Prefer atlases, compressed textures, pooled particles, bounded weather layers, and reusable effect primitives.
- Limit full-screen blending, oversized transparent sprites, simultaneous lights, and unique high-resolution textures.
- Reduce effect density and expensive post-processing gracefully without changing clue visibility or narrative blocking.

## Review every visual change

- Confirm the scene reads as noir at a glance without crushing interactive detail.
- Confirm attention lands on the current dramatic subject, then on relevant interactables.
- Confirm character scale, baseline, shadow, pose, and light direction remain coherent.
- Confirm movement feels intentionally staged: smooth easing, restrained bob, destination lean, clean settling, no walk-cycle expectation.
- Confirm weather, smoke, flicker, and headlights add life without obscuring dialogue, clues, or touch input.
- Confirm foreground occlusion improves depth and does not create confusing disappearances.
- Confirm cream text, muted-red accents, and dim-yellow highlights meet practical contrast needs.
- Confirm desktop and representative mobile layouts, reduced-effects behavior, frame pacing, and memory impact.
- Capture validation evidence in the decision record and identify unresolved risks.
