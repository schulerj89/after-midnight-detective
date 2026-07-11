# Screenshot layout manifest

Store one JSON manifest beside each captured PNG. Coordinates use screenshot pixels with the origin at the upper-left. Rectangles use `x`, `y`, `width`, and `height`.

```json
{
  "schemaVersion": 1,
  "screenshot": {
    "name": "sandbox-mobile-landscape-dialogue",
    "file": "sandbox-mobile-landscape-dialogue.png",
    "pose": "dialogue-open"
  },
  "viewport": {
    "width": 844,
    "height": 390,
    "deviceScaleFactor": 1
  },
  "elements": [
    {
      "id": "action-a",
      "role": "touch-control",
      "x": 758,
      "y": 298,
      "width": 62,
      "height": 62,
      "minWidth": 48,
      "minHeight": 48
    }
  ],
  "containmentZones": [
    {
      "id": "safe-area",
      "x": 16,
      "y": 12,
      "width": 812,
      "height": 366,
      "contains": ["action-a"]
    }
  ],
  "forbiddenOverlaps": [
    { "a": "action-a", "b": "dialogue-text" }
  ],
  "alignmentPairs": [
    {
      "a": "action-a",
      "b": "action-b",
      "axis": "centerY",
      "tolerance": 4
    }
  ],
  "expectedPixelActivity": [
    {
      "id": "dialogue-copy",
      "x": 176,
      "y": 274,
      "width": 490,
      "height": 78,
      "minLuminance": 12,
      "maxLuminance": 230,
      "minVariance": 20,
      "maxVariance": 8000
    }
  ]
}
```

## Fields

- `schemaVersion`: Use `1`.
- `screenshot`: Supply a stable `name`, PNG `file`, and named `pose`.
- `viewport`: Supply captured pixel `width` and `height`; record `deviceScaleFactor` for context.
- `elements`: Give every testable rectangle a unique `id`, semantic `role`, geometry, and optional `minWidth` and `minHeight`. The analyzer defaults `touch-control` roles to 48 by 48 pixels when minimums are omitted.
- `containmentZones`: Define safe areas or panels. `contains` lists element IDs that must fit wholly within the zone.
- `forbiddenOverlaps`: List pairs that must have zero positive-area intersection. Edge contact is allowed.
- `alignmentPairs`: Compare `left`, `right`, `top`, `bottom`, `centerX`, or `centerY` values within a nonnegative pixel `tolerance`.
- `expectedPixelActivity`: Define image regions and any of `minLuminance`, `maxLuminance`, `minVariance`, or `maxVariance`. Luminance and variance use grayscale values from 0 through 255.

All collections except `elements` may be empty. Keep geometry authoritative: export it from the game/runtime test hook whenever possible.
