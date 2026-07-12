from __future__ import annotations

import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
IMAGE_PATH = ROOT / "public/assets/images/characters/level-one-characters-atlas.png"
JSON_PATH = ROOT / "public/assets/images/characters/level-one-characters-atlas.json"
REPORT_PATH = ROOT / "docs/qa/2026-07-11-level-one-pixel-characters/atlas-validation.report.json"

CHARACTERS = ("detective", "vera", "miles", "officer")
POSES = ("neutral", "speaking", "suspicious", "alarmed")
EXPECTED = [f"{character}-{pose}" for character in CHARACTERS for pose in POSES]
EXPECTED += [f"portrait-{character}" for character in CHARACTERS]


def main() -> None:
    atlas = Image.open(IMAGE_PATH).convert("RGBA")
    manifest = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    frames = manifest["frames"]
    failures: list[str] = []
    metrics: dict[str, object] = {}

    if atlas.size != (1792, 720):
        failures.append(f"atlas size {atlas.size} != (1792, 720)")
    if list(frames) != EXPECTED:
        failures.append("frame names or order do not match the canonical 20-frame cast")

    for character in CHARACTERS:
        bottoms: list[int] = []
        tops: list[int] = []
        character_colors: set[tuple[int, int, int]] = set()
        for pose in POSES:
            name = f"{character}-{pose}"
            frame = frames[name]["frame"]
            if (frame["w"], frame["h"]) != (224, 280):
                failures.append(f"{name} has wrong body frame size")
                continue
            crop = atlas.crop((frame["x"], frame["y"], frame["x"] + frame["w"], frame["y"] + frame["h"]))
            alpha = crop.getchannel("A")
            alpha_values = set(alpha.getdata())
            if not alpha_values.issubset({0, 255}):
                failures.append(f"{name} alpha is not binary")
            bbox = alpha.getbbox()
            if bbox is None:
                failures.append(f"{name} is blank")
                continue
            tops.append(bbox[1])
            bottoms.append(bbox[3])
            if bbox[0] < 4 or bbox[2] > 220 or bbox[1] < 4 or bbox[3] > 276:
                failures.append(f"{name} foreground violates safe padding: {bbox}")
            corners = [alpha.getpixel((0, 0)), alpha.getpixel((223, 0)), alpha.getpixel((0, 279)), alpha.getpixel((223, 279))]
            if any(corners):
                failures.append(f"{name} has a nontransparent corner")

            pixels = crop.load()
            for y in range(0, 280, 4):
                for x in range(0, 224, 4):
                    block = {pixels[x + dx, y + dy] for dx in range(4) for dy in range(4)}
                    if len(block) != 1:
                        failures.append(f"{name} is not aligned to the 4x4 pixel grid at {x},{y}")
                        break
                else:
                    continue
                break

            for red, green, blue, opaque in crop.getdata():
                if not opaque:
                    continue
                character_colors.add((red, green, blue))
                if green > red + 24 and green > blue + 24:
                    failures.append(f"{name} contains a likely green fringe pixel")
                    break

        if bottoms and max(bottoms) - min(bottoms) > 4:
            failures.append(f"{character} foot baselines drift by more than four pixels")
        if tops and max(tops) - min(tops) > 12:
            failures.append(f"{character} pose height varies by more than twelve pixels")
        if len(character_colors) > 24:
            failures.append(f"{character} uses {len(character_colors)} colors, over the 24-color budget")
        metrics[character] = {
            "topRange": [min(tops), max(tops)] if tops else None,
            "bottomRange": [min(bottoms), max(bottoms)] if bottoms else None,
            "opaqueColorCount": len(character_colors),
        }

        portrait = frames[f"portrait-{character}"]["frame"]
        if (portrait["w"], portrait["h"]) != (160, 160):
            failures.append(f"portrait-{character} has wrong dimensions")

    report = {
        "status": "pass" if not failures else "fail",
        "atlasSize": list(atlas.size),
        "frameCount": len(frames),
        "decodedBytes": atlas.width * atlas.height * 4,
        "metrics": metrics,
        "failures": failures,
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
