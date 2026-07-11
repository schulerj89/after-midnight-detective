# Mobile Sandbox Screenshot QA

Captured: 2026-07-11  
Scene: `sandbox` / Lantern Room  
Renderer: Phaser 4.2.1 WebGL

## Capture poses

### Landscape controls

![Landscape mobile controls](sandbox-mobile-landscape-controls.png)

- Viewport: 844x390
- Timeline: loop 1, paused at approximately 133 ms
- Focus: matchbook
- Expected labels: A / ACT and B / PLAY
- Result: Pass

The D-pad and action buttons remain inside the viewport, preserve the lightly
transparent treatment, and do not cover either character or the focused clue.
The dim-yellow reticle is visible beneath the matchbook and does not rely on
color alone because it adds a distinct oval and pointer shape.

### Landscape dialogue

![Landscape mobile dialogue](sandbox-mobile-landscape-dialogue.png)

- Viewport: 844x390
- Timeline: loop 1, paused at approximately 133 ms
- Dialogue: `sandbox-matchbook`, page 1
- Expected labels: A / NEXT and B / BACK
- Result: Pass

The portrait, speaker, two-line body copy, and advance marker remain readable.
The D-pad and action buttons stay visible without covering dialogue content.
The focused clue remains identifiable behind the panel.

### Portrait orientation

![Portrait rotate-device presentation](sandbox-mobile-portrait-rotate.png)

- Viewport: 390x844
- Gameplay controls: hidden
- Rotate-device presentation: visible
- Result: Pass

The orientation instruction is centered, high contrast, and visually consistent
with the noir palette. Gameplay and translucent controls are not visible behind
the presentation.

## Review summary

- Scale: Pass. Characters remain full-body and readable at landscape phone size.
- HUD: Pass. No controls, debug labels, portrait, or dialogue text overlap.
- Input state: Pass. Focus, pause, inspect, next, and back states match labels.
- Camera: Pass. The fixed 16:9 stage fits vertically with expected side gutters.
- Assets: Pass. Placeholder faces and silhouettes render without broken textures.
- Browser errors: None during final capture route.
- Blocking defects: None.

The top sandbox timeline labels are intentionally small debug UI and are not a
production HUD approval. Reassess their size when the player-facing timeline is
designed.

