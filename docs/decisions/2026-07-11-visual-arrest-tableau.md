# Decision: Stage the arrest as a graphic-novel jail tableau

- Date: 2026-07-11
- Status: Accepted
- Discipline: Visuals
- Owner: Noir visual direction
- Supersedes: none

## Context

Level 1 needs a visually separate ending that reads instantly on a phone while
remaining consistent with the paper-cutout stage language.

## Options considered

1. Police-car exterior with animated rain.
2. Newspaper montage.
3. Full-body Miles silhouette behind descending foreground bars with press flashes.

## Decision

Use a near-black separate stage with Miles centered in a narrow cream spotlight.
Slide the static cutout into position, settle it upright, and drop thick foreground
bars into place. Two restrained white press-camera flashes punctuate the arrest.
Muted red identifies `CASE CLOSED`; dim yellow identifies `IN CUSTODY`. The normal
HUD, joystick, and action buttons are absent.

## Rationale

Bars are readable through silhouette and shape rather than text or color alone.
The descending foreground plane preserves the theatrical diorama vocabulary, and
brief flashes create a noir press-photo finish without requiring new frame art.

## Tradeoffs

The placeholder figure remains intentionally abstract. Full-screen flashes can
be uncomfortable, so they stay brief, low-count, and are replaced by a static
highlight when reduced motion is requested.

## Mobile considerations

Keep Miles and the bars in the central 50% of the landscape frame. Place the
48-pixel return target inside safe-area insets and keep all ending copy above it.

## Performance considerations

Use Phaser rectangles, text, one cutout texture, and a single reusable flash
overlay. No particles, shaders, large raster assets, or persistent animation.

## Validation

Capture named desktop, mobile, flash, and reduced-motion poses. Check safe-area
containment, text/control overlap, silhouette visibility, contrast, and a stable
post-animation frame.

Validation completed: desktop, 844x390 mobile, flash, and reduced-motion captures
were inspected. All four geometry manifests pass, including the 184x50 mobile
return target and safe-area containment. The first pass exposed title/rail crowding
and a three-pixel safe-area violation; both were corrected before acceptance.

Responsive correction: a 1280x512 phone capture exposed the original fixed-width
stage. The scene now derives its center and background width from the live Phaser
viewport, scales the jail to 62% with a 1080-unit cap, and binds the spotlight x
position to the prisoner throughout the entrance. Five manifests now pass; the
extra-wide settled and moving samples both report a 0.0 light/actor alignment delta.
