# Level One room-scale and transition QA

- Date: 2026-07-11
- Scope: 30x30 lounge, Officer Hale, 0.72 exploration cutouts, isolated room stages, and linked black-fade transitions
- Status: Pass

## Automated validation

- `npm run validate`: parser, grid, case, transition-model, input-gate, and build validation.
- `npm run validate:visual:transitions`: ten deterministic screenshots with companion geometry manifests and annotated reports.
- Six reciprocal door endpoints resolve to their authored destination room and `ENTER` tile.
- Every room is flood-fill connected; every clue and actor retains reachable approaches.
- `TransitionInputGate` keeps held input locked through the fade and until a real idle input sample occurs.

## Browser validation

The live `transition-auto-lounge-kitchen` pose was executed at 1000x560. The
captured dataset in `browser-trace.json` proves:

- exactly one active room;
- lounge-to-kitchen link provenance;
- arrival at kitchen tile `(1,4)`;
- idle/unlocked state after fade-in;
- unchanged evidence and statement counts;
- shared character scale `0.72`.

## Screenshot evidence

- Full isolated 30x30 lounge overview.
- Officer Hale mobile dialogue.
- Lounge source framing for kitchen, bedroom, and office doors.
- Isolated mobile arrival framing for kitchen, bedroom, and office.
- Fully opaque black mobile transition frame with HTML controls hidden.
- Isolated desktop bedroom with deliberate black offstage gutter.

## Human review notes

- The large lounge floor is intentionally near-black charcoal (`#17191F`), not an empty black region; the kitchen-source manifest now asserts pixel activity across the active lounge stage and identifies the detective correctly.
- Satellite-room gutters are intentional offstage black and contain no neighboring geometry or interactables.
- Officer Hale is visually distinct from Miles and remains a witness/scene-control character rather than a suspect.

## Known follow-up

- Previous screenshot suites remain historical evidence for their commits. The current transition suite is the authoritative visual regression set for the scaled runtime.
- Production cutouts may later need character-specific height normalization while preserving the shared foot line.

## Independent sign-off

- Gameplay-transition QA: Pass after the held-input release lock was extracted into a pure tested gate.
- Spatial/screenshot QA: Pass after north-door camera padding restored the detective's full-body silhouette and all three door routes received source/destination evidence.
- TypeScript/Phaser code review: Pass after parser spawn hardening, fade-listener cleanup, persistent transition provenance, and mobile-vector preservation.
