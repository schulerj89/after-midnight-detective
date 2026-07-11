# After Midnight, Detective — Agent Rules

Read [docs/game-bible.md](docs/game-bible.md) before proposing or implementing
player-facing work. Treat it as the current source of truth unless the user
explicitly changes the vision.

## Required specialists

Consult the matching project skill before material decisions:

- `.agents/skills/direct-noir-visuals/` for art direction, character staging,
  lighting, effects, UI composition, and sprite movement.
- `.agents/skills/design-mystery-mechanics/` for timelines, clues, dialogue
  gates, notebook behavior, deductions, and accusations.
- `.agents/skills/direct-noir-game/` for player experience, pacing, scope,
  feature priority, accessibility, and cross-discipline tradeoffs.
- `.agents/skills/validate-game-screenshots/` for named-pose screenshot capture,
  layout manifests, programmatic geometry checks, annotated grids, and visual
  regression review.

Use more than one specialist when a change crosses disciplines. Reconcile
conflicts in favor of player comprehension and the game bible rather than
silently choosing one opinion.

## Decision records are mandatory

Before implementing a material visual, mechanics, or game-design decision,
create a new Markdown decision record under `docs/decisions/` using
`DECISION-TEMPLATE.md`. Never overwrite an earlier decision to hide a change;
add a superseding record and link the previous one.

Small bug fixes, formatting, dependency maintenance, and exact execution of an
already documented decision do not require a new record.

Every specialist recommendation must explain:

1. What player-facing problem is being solved.
2. Which options were considered.
3. Why the chosen option fits this game.
4. What tradeoffs and risks remain.
5. How the result will be validated on desktop and mobile.

## Production guardrails

- Preserve slow, observation-led play; do not add reflex gates by default.
- Preserve the theatrical cutout language; do not introduce walk cycles.
- Keep essential clues legible without relying only on color, audio, or timing.
- Design primarily for landscape play and provide a deliberate portrait-device
  orientation message.
- Keep scenes and systems data-driven so timelines and cases can be tested.
- Update the game bible when an approved decision changes the source of truth.
- Build and smoke-test relevant flows before declaring implementation complete.
