# Level One gameplay and room QA

- Date: 2026-07-11
- Scope: text-authored room dressing, clue approachability, mobile dialogue, and the first evidence-to-testimony unlock ladder
- Final status: Pass for the placeholder milestone

## Automated validation

- `npm run validate`: 35 tests across 8 files plus a production TypeScript/Vite build.
- `npm run validate:visual:level-one-gameplay`: 11 deterministic screenshots, all with zero containment, forbidden-overlap, and pixel-activity failures.
- Room flood-fill: every walkable tile is reachable in lounge, kitchen, bedroom, and office.
- Interaction grid: every clue has at least two reachable cardinal approach tiles; every actor has at least one.
- Dialogue boundary: dismissal applies no effects; final-page completion applies effects once.

The analyzer reports and annotated grids are stored in `artifacts/`. Source captures and companion layout manifests are in `docs/screenshots/level-1-gameplay/`.

## Evidence set

- Full 20x20 lounge overview plus a closer staging shot.
- Current kitchen, bedroom, and office dressing shots.
- Ledger inspection at 1000x560 and compact 844x390 landscape.
- Miles confrontation, Vera follow-up, missing-key response, and post-unlock state.
- Post-unlock HUD explicitly reads `MILES CHECKS OFFICE NEXT LOOP`.

## Independent reviews

- Spatial/grid QA: initial fail for incomplete room evidence and an invalid kitchen pose. Resolved with all-room captures, a full lounge overview, cardinal approach assertions, and a reachable kitchen staging tile.
- Mobile/gameplay QA: initial fail for missing post-unlock and UI-boundary proof. Resolved with the post-unlock capture, consistent `CLOSE` labeling, compact-landscape evidence, and controller tests.
- Code review A: initial fail because effect-free repeat text cleared the last unlock. Resolved with state preservation and a regression test.
- Code review B: initial fail for overview centering, actor cardinal access, and incomplete QA records. Resolved before sign-off.

## Non-blocking follow-up

- Compact-landscape case-note text is near the minimum comfortable reading size; revisit responsive HUD typography with the notebook UI.
- Add an unobstructed full-body suspect reference pose when placeholder character art becomes production cutout art.
- Case knowledge intentionally persists for the current scene session so later loops can reuse it; a separate new-game reset path is still required.
