"""Validate Level 1 room texture atlas dimensions, seams, and darkness."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageChops, ImageStat


ROOT = Path(__file__).resolve().parents[1]
IMAGE = ROOT / "public/assets/images/backgrounds/level-one-room-textures.webp"
MANIFEST = ROOT / "public/assets/images/backgrounds/level-one-room-textures.json"
EXPECTED = {"lounge", "kitchen", "bedroom", "office"}


def main() -> None:
    image = Image.open(IMAGE).convert("RGB")
    payload = json.loads(MANIFEST.read_text(encoding="utf-8"))
    failures: list[str] = []
    metrics: dict[str, dict[str, float]] = {}
    if image.size != (1024, 1024):
        failures.append(f"atlas size {image.size} != (1024, 1024)")
    if set(payload.get("frames", {})) != EXPECTED:
        failures.append("atlas frame names do not match Level 1 rooms")

    for name, record in payload.get("frames", {}).items():
        frame = record["frame"]
        x, y, width, height = frame["x"], frame["y"], frame["w"], frame["h"]
        texture = image.crop((x, y, x + width, y + height))
        gray = texture.convert("L")
        stats = ImageStat.Stat(gray)
        left = texture.crop((0, 0, 1, height))
        right = texture.crop((width - 1, 0, width, height))
        top = texture.crop((0, 0, width, 1))
        bottom = texture.crop((0, height - 1, width, height))
        horizontal_seam = ImageStat.Stat(ImageChops.difference(left, right)).mean
        vertical_seam = ImageStat.Stat(ImageChops.difference(top, bottom)).mean
        seam_max = max(horizontal_seam + vertical_seam)
        metrics[name] = {
            "meanLuminance": round(stats.mean[0], 2),
            "luminanceStdDev": round(stats.stddev[0], 2),
            "maxEdgeSeamDelta": round(seam_max, 2),
        }
        if stats.mean[0] > 72:
            failures.append(f"{name}: mean luminance is too bright ({stats.mean[0]:.2f})")
        if stats.stddev[0] < 4.5:
            failures.append(f"{name}: texture variance is too low ({stats.stddev[0]:.2f})")
        if seam_max > 3.5:
            failures.append(f"{name}: mirrored outer edges do not tile ({seam_max:.2f})")

    report = {
        "status": "pass" if not failures else "fail",
        "size": list(image.size),
        "frameCount": len(payload.get("frames", {})),
        "decodedBytes": image.width * image.height * 4,
        "metrics": metrics,
        "failures": failures,
    }
    output = ROOT / "docs/qa/2026-07-11-textured-rooms-mobile-spacing/texture-validation.report.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
