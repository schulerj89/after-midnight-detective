"""Validate dimensions, frame coordinates, and alpha coverage of the prop atlas."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
IMAGE = ROOT / "public/assets/images/props/level-one-props-atlas.png"
MANIFEST = ROOT / "public/assets/images/props/level-one-props-atlas.json"
EXPECTED_SIZE = (1536, 1536)
EXPECTED_FRAMES = 31


def main() -> None:
    image = Image.open(IMAGE).convert("RGBA")
    payload = json.loads(MANIFEST.read_text(encoding="utf-8"))
    frames = payload["frames"]
    failures: list[str] = []
    coverage: dict[str, float] = {}

    if image.size != EXPECTED_SIZE:
        failures.append(f"atlas size {image.size} != {EXPECTED_SIZE}")
    if len(frames) != EXPECTED_FRAMES:
        failures.append(f"frame count {len(frames)} != {EXPECTED_FRAMES}")
    if image.getpixel((0, 0))[3] != 0:
        failures.append("top-left atlas corner is not transparent")

    for name, record in frames.items():
        frame = record["frame"]
        x, y, width, height = frame["x"], frame["y"], frame["w"], frame["h"]
        if x < 0 or y < 0 or x + width > image.width or y + height > image.height:
            failures.append(f"{name}: frame is out of bounds")
            continue
        alpha = image.crop((x, y, x + width, y + height)).getchannel("A")
        opaque = sum(1 for value in alpha.getdata() if value > 20)
        ratio = opaque / (width * height)
        coverage[name] = round(ratio, 4)
        if ratio < 0.12:
            failures.append(f"{name}: alpha coverage {ratio:.3f} is suspiciously low")

    report = {
        "status": "pass" if not failures else "fail",
        "image": str(IMAGE.relative_to(ROOT)).replace("\\", "/"),
        "manifest": str(MANIFEST.relative_to(ROOT)).replace("\\", "/"),
        "size": list(image.size),
        "frameCount": len(frames),
        "alphaCoverage": coverage,
        "failures": failures,
    }
    output = ROOT / "docs/qa/2026-07-11-level-one-prop-atlas/atlas-validation.report.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()

