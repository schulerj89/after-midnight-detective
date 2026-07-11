# Level 1 solvability QA

## Scope

Prove that Level 1 can progress from authored interactions through an altered
loop observation to a complete, reasoned accusation, and that the case board is
usable on desktop and landscape mobile.

## Programmable proof

Run:

```powershell
npm run debug:solve-level-one
```

The command executes the real case interaction resolver, timeline, and
accusation tests, then verifies the browser-exported seven-step solve trace and
all three screenshot analyzer reports. The deterministic browser route is
`/?debugSolve=level-one`.

## Browser interaction proof

At `/?qaPose=case-accusation-ready`, browser automation selected Miles, the torn
ledger, Miles's Room 317 denial, and the witnessed office check through the
visible case-board buttons. Every selection retained its selected state.
Submitting produced `CASE CLOSED`, `caseOutcome=solved`,
`lastInteraction=level-one-solved`, and `timelinePaused=true`.

## Captures

- `level-1-case-closed-desktop.png` at 1281x720.
- `level-1-case-closed-mobile.png` at 844x390.
- `level-1-altered-timeline-mobile.png` at 844x390.

Each PNG has an authoritative runtime-bounds manifest, an analyzer report, and
an annotated 10 percent grid image under `artifacts/`.

## Automated results

All three layouts pass viewport containment, 48px touch-target minimums,
forbidden-overlap checks, tab alignment, and expected pixel-activity checks.

## Human review

- Desktop case closed: the outcome stamp and Miles explanation dominate without
  obscuring navigation or the close control.
- Mobile case closed: the full ending fits without scrolling; tabs and close
  remain 48px or larger.
- Mobile timeline: the observed office deviation and replay button are visible
  together, provenance labels remain distinct in text, and the board fits inside
  the safe viewport.

## Limitations

Pixel activity cannot prove reading comprehension. Placeholder actor art and the
short timeline still need later player testing for dramatic clarity. Save/resume
is not part of this vertical-slice milestone.
