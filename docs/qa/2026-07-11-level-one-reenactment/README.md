# Level 1 detective reconstruction QA

## Gameplay-expert recommendation

The gameplay expert approved a 25–30 second, skippable detective reconstruction
with explicit evidence provenance. The sequence must not depict the weapon,
exact killing, motive, caller, key disposal, or Vera as accomplice because the
current case does not establish those facts.

## Programmable proof

Run:

```powershell
npm run debug:reenact-level-one
```

The command verifies the solved unlock, six deterministic beats, 28-second
duration, evidence basis for every beat, pause/skip/replay behavior, and all
screenshot reports. The live debug route is `/?debugReenactment=level-one`.

## Browser validation

- PAUSE changed playback to `paused` and its label to RESUME.
- First SKIP changed to CONFIRM SKIP; the second activation returned to CASE
  CLOSED without changing the solved outcome.
- REPLAY RECONSTRUCTION started playback with `replayCount=1`.
- A full unskipped run reached `reconstruction.finale`, changed status to
  `completed`, and returned to the solved board.
- Gameplay controls were visually hidden, pointer-disabled, and removed from the
  accessibility tree during playback.

## Captures

- Desktop inferred Room 317 doorway.
- Desktop final Miles/Hale tableau.
- Mobile recorded key tableau.
- Mobile observed office-deviation tableau.
- Mobile reduced-motion inferred doorway.
- Mobile solved board with replay control.

Every PNG has a companion runtime-bounds manifest plus machine report and
annotated 10 percent grid image in `artifacts/`.

## Automated results

All six layouts pass viewport containment, 48px touch-target minimums,
forbidden-overlap checks, control alignment, and expected pixel-activity checks.

## Human review

- Provenance is always printed beside the time and does not rely on color.
- The inferred doorway uses lower-opacity shadow treatment and explicitly says
  that events beyond the door remain unproven.
- The mobile key and office-tell stages retain large silhouettes and readable
  captions with both controls above the scene.
- The finale contains one Miles and one Hale cutout, with no duplicate cast.
- The replay control fits the 844x390 solved board without scrolling.

## Limitations

Placeholder art limits emotional acting, and browser screenshots cannot prove
player comprehension. Audio remains optional and is not used as evidence.
