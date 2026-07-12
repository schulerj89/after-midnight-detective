# Solve input lock QA

## Scope

This pass validates browser selection suppression and the transition from a
correct Level 1 accusation into the reconstruction on an 844x390 landscape
viewport.

## Route

1. Load `case-accusation-ready`.
2. Select Miles Pike, the torn ledger, Miles's Room 317 denial, and the observed
   office deviation.
3. Double-click `PRESENT ACCUSATION`.
4. Inspect the immediate solved frame, the middle of the 1.1-second handoff, and
   the first reconstruction frame.

## Results

- Browser selection remains empty and computed `user-select` is `none` on the
  game, case board, and mobile controls.
- The immediate and mid-delay frames report `finaleTransitionPending=true`,
  `dialogue=closed`, and no reconstruction yet.
- The Officer Hale epilogue and replay button both compute to `display:none`
  during the automatic handoff.
- Mobile controls read `WAIT`, and the case board rejects pointer input.
- After the delay, the lock clears, the case board closes, and reconstruction
  begins once at `reconstruction.title`; dialogue remains closed.
- Screenshot geometry and pixel-activity validation passes with zero failures.

## Evidence

- `browser-proof.json` records computed styles and all transition states.
- `docs/screenshots/interaction-fixes/solve-handoff-mobile.png` is the named
  handoff capture with a companion layout manifest.
- `artifacts/` contains the analyzer report and annotated grid.

## Limitations

The automated route stresses a browser-generated double-click. Physical devices
can vary in gesture timing, so the code also gates every keyboard, touch,
pointer, dialogue, prompt, and movement entry point while the handoff is active.
