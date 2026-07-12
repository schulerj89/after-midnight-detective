# Case-closed finale QA

## Scope

Validated the clean reconstruction presentation, transition into the separate
arrest tableau, press-flash treatment, reduced-motion pose, and return to the
retained solved case.

## Named poses

- `reconstruction-clean-hud-desktop.png` — the reconstruction contains only its
  cinematic card and pause/skip controls; exploration location, evidence, prompt,
  joystick, and action HUD are absent.
- `case-closed-arrest-desktop.png` — 1280x720 settled arrest tableau.
- `case-closed-arrest-mobile.png` — 844x390 settled arrest tableau with a 184x50
  CSS-pixel return target inside the safe area.
- `case-closed-arrest-wide-mobile.png` — 1280x512 extra-wide landscape capture;
  the charcoal stage fills the viewport and the jail spans 768 CSS pixels.
- `case-closed-flash-mobile.png` — deterministic press-flash frame.
- `case-closed-reduced-motion-mobile.png` — stable tableau with zero flash events.

## Automated results

- 73 Vitest tests pass, including solved-state gating, zero-knowledge-mutation,
  and standard/extra-wide responsive layout checks for the finale.
- All five layout manifests pass containment, 48-pixel minimum target,
  forbidden-overlap, and pixel-activity checks.
- Production typecheck and build pass.

## Browser flow results

- Confirming `SKIP` in the reconstruction launches the case-closed scene with
  `caseClosedSolved=true`.
- An uninterrupted 35.3-second reconstruction launched the arrest animation, settled
  the bars, emitted exactly two flashes, and reached `caseClosedStatus=settled`.
- The scene retained 23 knowledge flags from entry through return.
- Enter returned to Exploration with `caseOutcome=solved`, the case board open,
  and `lastInteraction=case-closed-returned`.
- Mobile controls reported `aria-hidden=true` and computed opacity `0` during the
  finale.
- At 1280x512 the Phaser viewport measured 1800 logical pixels, the stage center
  was 900, the jail width was capped at 1080, and both the settled prisoner and
  spotlight reported x=900 with a 0.0 alignment delta. During the entrance, both
  reported x=672.5 with the same 0.0 delta.

## Human visual review

The central full-body silhouette reads behind the foreground bars at desktop,
standard phone, and extra-wide phone scale. The backdrop now fills every tested
landscape width without exposing a narrow fixed stage. Red title, yellow custody label, cream evidence payoff, and the
large bordered return action establish a clear hierarchy. The flash preserves
the bars and silhouette instead of bleaching them away. Negative space at the
landscape edges feels intentional and does not reserve space for controls.

## Limitations

The placeholder prisoner remains a graphic cutout rather than final character
art. Pixel heuristics establish activity and geometry, not subjective legibility
or photosensitivity comfort; the low-count flash and reduced-motion alternative
remain necessary safeguards.
