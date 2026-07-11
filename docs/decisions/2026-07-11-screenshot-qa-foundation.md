# Screenshot QA foundation

Date: 2026-07-11

## Decision

Validate stable named screenshot poses with a companion layout manifest, a deterministic geometry-first analyzer, annotated 10% grids, and mandatory human visual review. Store the workflow as the project-local `validate-game-screenshots` skill.

## Why

Screenshots alone cannot reliably prove touch-target size, safe-area containment, or exact overlap. Runtime-authored rectangles make those claims testable. Geometry checks are deterministic, while simple luminance and variance checks can flag blank or unexpectedly flat regions without pretending to understand composition. A grid and labeled element bounds make manual review faster and repeatable.

## Principles

- Capture reproducible named poses across desktop, mobile landscape, portrait, dialogue, and active controls.
- Test dimensions, bounds, minimum sizes, containment, forbidden overlaps, and alignment before pixel heuristics.
- Default touch targets to at least 48 by 48 CSS pixels.
- Treat pixel activity as an alert, never as proof of visual correctness.
- Require a dated QA report containing machine results, visual findings, artifact paths, and limitations.

## Alternatives considered

- Pure screenshot diffing was rejected as the foundation because atmospheric rain, smoke, and flicker can produce noisy differences without identifying layout intent.
- Computer vision element detection was deferred because it adds dependencies and is less accurate than bounds exported by the game.
- Manual-only review was rejected because it cannot enforce numeric regression contracts consistently.

## Tradeoffs

The manifest adds capture/test plumbing and can become misleading if hand-maintained. The analyzer therefore documents that authoritative runtime export and human review remain mandatory. Pillow is the only non-standard dependency; without it, image statistics and annotation cannot run.

## Validation plan

Run the analyzer against synthetic passing and failing fixtures, validate the skill package with `quick_validate.py`, and then integrate named-pose manifests into browser capture tests. Review every generated original and annotated image before sign-off.
