# Circular mobile controls screenshot QA

Date: 2026-07-11  
Result: **PASS with non-blocking findings**

## Scope and evidence

Reviewed each original and annotated PNG at its native captured dimensions, then checked its companion layout manifest and machine report.

| Pose | Viewport | Original and manifest | Annotated image | Machine report |
| --- | ---: | --- | --- | --- |
| Mobile controls | 844×390 | `docs/screenshots/mobile/sandbox-mobile-landscape-controls.png` and `.layout.json` | `artifacts/sandbox-mobile-landscape-controls.annotated.png` | `artifacts/sandbox-mobile-landscape-controls.report.json` |
| Mobile dialogue | 844×390 | `docs/screenshots/mobile/sandbox-mobile-landscape-dialogue.png` and `.layout.json` | `artifacts/sandbox-mobile-landscape-dialogue.annotated.png` | `artifacts/sandbox-mobile-landscape-dialogue.report.json` |
| Portrait orientation gate | 390×844 | `docs/screenshots/mobile/sandbox-mobile-portrait-rotate.png` and `.layout.json` | `artifacts/sandbox-mobile-portrait-rotate.annotated.png` | `artifacts/sandbox-mobile-portrait-rotate.report.json` |

Artifact paths in the table are relative to `docs/qa/2026-07-11-circular-mobile-controls/`, except the explicitly rooted `docs/screenshots/mobile/` sources.

## Automated evidence

- Mobile controls: pass, 0 failures across 38 recorded checks.
- Mobile dialogue: pass, 0 failures across 57 recorded checks.
- Portrait orientation gate: pass, 0 failures across 15 recorded checks.
- All PNG dimensions match their manifests.
- All declared elements remain within the 844×390 or 390×844 viewport zones.
- D-pad directions meet 48×48 minimum hit areas. A and B exceed the baseline at 62×62.
- Opposing D-pad directions align within the declared 1 px tolerance.
- Declared control/focus and control/dialogue-content forbidden-overlap pairs do not intersect.
- Dialogue portrait and text remain inside the dialogue panel.
- All declared luminance and variance regions contain expected pixel activity.

## Visual review

### Circular D-pad and action controls

Pass. The 160×160 circular D-pad housing reads as one intentional controller rather than four unrelated buttons. Its center hub, four evenly placed directions, translucent treatment, and cream outlines remain visible without overpowering the crime scene. The directional hit rectangles are coherent with their artwork. The circular 62×62 A and B buttons form a clear right-hand cluster, remain separate, and retain legible action labels.

### Mobile controls pose

Pass. The left and right control groups stay clear of the focused matchbook and its reticle. The focused clue remains identifiable, and the A button reads as the primary action. Controls sit over low-priority scene edges rather than faces or the clue. Scene silhouettes, clue focus, and controller affordances remain distinguishable at native size.

### Dialogue, portrait, and controls

Pass. The portrait is fully visible, framed, and separated from the speaker name and dialogue copy. `DETECTIVE` establishes speaker hierarchy; the two-line clue text is readable and unclipped. No semantic D-pad or A/B touch rectangle overlaps the portrait or dialogue text. The A/B labels correctly change to `NEXT` and `BACK`. The D-pad housing visually meets the upper-left dialogue border, but the directional artwork and hit boxes remain outside the portrait and copy.

### Portrait orientation

Pass. Landscape controls and gameplay UI are hidden. The red phone icon, `ROTATE DEVICE` title, and supporting copy form a centered, readable hierarchy. The diagonal dim-yellow beam supports the noir composition without obscuring the message. Title and copy are center-aligned within tolerance and fully contained.

## Defects and risks

### Blocking defects

None found.

### Non-blocking findings

1. The 160×160 decorative D-pad housing and the dialogue panel overlap by roughly 27×20 px at the panel's upper-left edge. No directional hit box, portrait, or dialogue text overlaps, so interaction and readability are unaffected. Keep this intentional edge contact under review on shorter landscape viewports.
2. The top HUD and in-scene instructional copy are small and low-contrast at 844×390. The active dialogue and control labels remain readable, so this does not block the current control validation, but later mobile typography/accessibility work should test these secondary labels on physical devices.

## Limitations

- The `viewport-safe-area` zones equal the full viewport. These captures do not prove clearance from nonzero notch, rounded-corner, or home-indicator insets.
- Only static default states were captured. Pressed, held, focus-transition, multi-touch, and OS text-scaling states were not visually validated.
- Screenshot geometry is trustworthy only if the manifests came from authoritative runtime bounds; the evidence does not independently prove that provenance.
- Pixel activity checks detect blank, flat, or out-of-range regions but cannot establish readability, contrast compliance, hierarchy, or aesthetic quality.
- Placeholder character and portrait art limit conclusions about future full-body cutout silhouettes and detailed portrait cropping.

## Sign-off

The circular mobile controller treatment is acceptable for the sandbox baseline. It may ship into further gameplay work with the two non-blocking findings tracked. Re-run these named poses after changes to control sizing, dialogue placement, safe-area handling, fonts, or mobile breakpoints.
