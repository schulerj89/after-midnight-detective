#!/usr/bin/env python3
"""Validate screenshot geometry and pixel activity; emit annotated and JSON reports."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

try:
    from PIL import Image, ImageDraw, ImageStat
except ImportError:  # pragma: no cover - environment dependent
    Image = ImageDraw = ImageStat = None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate a PNG against its companion layout JSON and draw a 10% grid."
    )
    parser.add_argument("png", type=Path, help="Captured PNG screenshot")
    parser.add_argument("layout", type=Path, help="Companion layout JSON manifest")
    parser.add_argument(
        "--output-dir", type=Path, default=Path("qa-output"), help="Output directory (default: qa-output)"
    )
    return parser.parse_args()


def rect(item: dict[str, Any]) -> tuple[float, float, float, float]:
    return tuple(float(item[key]) for key in ("x", "y", "width", "height"))  # type: ignore[return-value]


def overlap(a: tuple[float, float, float, float], b: tuple[float, float, float, float]) -> bool:
    ax, ay, aw, ah = a
    bx, by, bw, bh = b
    return min(ax + aw, bx + bw) > max(ax, bx) and min(ay + ah, by + bh) > max(ay, by)


def aligned_value(box: tuple[float, float, float, float], axis: str) -> float:
    x, y, width, height = box
    values = {
        "left": x, "right": x + width, "top": y, "bottom": y + height,
        "centerX": x + width / 2, "centerY": y + height / 2,
    }
    if axis not in values:
        raise ValueError(f"unsupported alignment axis: {axis}")
    return values[axis]


def result(level: str, check: str, message: str) -> dict[str, str]:
    return {"level": level, "check": check, "message": message}


def main() -> int:
    args = parse_args()
    if Image is None:
        print("Pillow is required: python -m pip install Pillow", file=sys.stderr)
        return 2

    try:
        manifest = json.loads(args.layout.read_text(encoding="utf-8"))
        image = Image.open(args.png).convert("RGB")
    except (OSError, json.JSONDecodeError) as exc:
        print(f"Unable to load input: {exc}", file=sys.stderr)
        return 2

    findings: list[dict[str, str]] = []
    checks_run = 1
    viewport = manifest.get("viewport", {})
    width, height = image.size
    expected_size = (viewport.get("width"), viewport.get("height"))
    if expected_size != (width, height):
        findings.append(result("failure", "dimensions", f"PNG is {width}x{height}; manifest expects {expected_size[0]}x{expected_size[1]}"))

    elements_list = manifest.get("elements", [])
    elements = {item["id"]: item for item in elements_list}
    for item in elements_list:
        checks_run += 2
        try:
            x, y, box_width, box_height = rect(item)
        except (KeyError, TypeError, ValueError) as exc:
            findings.append(result("failure", "element-schema", f"{item.get('id', '<unknown>')}: {exc}"))
            continue
        if box_width < 0 or box_height < 0 or x < 0 or y < 0 or x + box_width > width or y + box_height > height:
            findings.append(result("failure", "bounds", f"{item['id']} lies outside the screenshot"))
        default_minimum = 48 if item.get("role") == "touch-control" else 0
        min_width = float(item.get("minWidth", default_minimum))
        min_height = float(item.get("minHeight", default_minimum))
        if box_width < min_width or box_height < min_height:
            findings.append(result("failure", "minimum-size", f"{item['id']} is {box_width:g}x{box_height:g}, below {min_width:g}x{min_height:g}"))

    for zone in manifest.get("containmentZones", []):
        checks_run += len(zone.get("contains", []))
        try:
            zx, zy, zw, zh = rect(zone)
            for element_id in zone.get("contains", []):
                ex, ey, ew, eh = rect(elements[element_id])
                if ex < zx or ey < zy or ex + ew > zx + zw or ey + eh > zy + zh:
                    findings.append(result("failure", "containment", f"{element_id} is not wholly inside {zone['id']}"))
        except (KeyError, TypeError, ValueError) as exc:
            findings.append(result("failure", "containment-schema", f"{zone.get('id', '<unknown>')}: {exc}"))

    for pair in manifest.get("forbiddenOverlaps", []):
        checks_run += 1
        try:
            if overlap(rect(elements[pair["a"]]), rect(elements[pair["b"]])):
                findings.append(result("failure", "forbidden-overlap", f"{pair['a']} overlaps {pair['b']}"))
        except (KeyError, TypeError, ValueError) as exc:
            findings.append(result("failure", "overlap-schema", str(exc)))

    for pair in manifest.get("alignmentPairs", []):
        checks_run += 1
        try:
            tolerance = float(pair.get("tolerance", 0))
            delta = abs(aligned_value(rect(elements[pair["a"]]), pair["axis"]) - aligned_value(rect(elements[pair["b"]]), pair["axis"]))
            if tolerance < 0 or delta > tolerance:
                findings.append(result("failure", "alignment", f"{pair['a']} and {pair['b']} {pair['axis']} differ by {delta:g}px (tolerance {tolerance:g}px)"))
        except (KeyError, TypeError, ValueError) as exc:
            findings.append(result("failure", "alignment-schema", str(exc)))

    gray = image.convert("L")
    for region in manifest.get("expectedPixelActivity", []):
        checks_run += 1
        try:
            x, y, rw, rh = rect(region)
            if rw <= 0 or rh <= 0 or x < 0 or y < 0 or x + rw > width or y + rh > height:
                raise ValueError("region is empty or outside screenshot")
            stats = ImageStat.Stat(gray.crop((round(x), round(y), round(x + rw), round(y + rh))))
            luminance, variance = stats.mean[0], stats.var[0]
            for key, value, comparison in (
                ("minLuminance", luminance, "min"), ("maxLuminance", luminance, "max"),
                ("minVariance", variance, "min"), ("maxVariance", variance, "max"),
            ):
                if key in region and ((comparison == "min" and value < region[key]) or (comparison == "max" and value > region[key])):
                    findings.append(result("failure", "pixel-activity", f"{region['id']} {key} failed: measured {value:.2f}, expected {region[key]}"))
        except (KeyError, TypeError, ValueError) as exc:
            findings.append(result("failure", "pixel-schema", f"{region.get('id', '<unknown>')}: {exc}"))

    annotated = image.copy()
    draw = ImageDraw.Draw(annotated, "RGBA")
    for step in range(1, 10):
        gx, gy = round(width * step / 10), round(height * step / 10)
        draw.line((gx, 0, gx, height), fill=(255, 225, 128, 90), width=1)
        draw.line((0, gy, width, gy), fill=(255, 225, 128, 90), width=1)
    for item in elements_list:
        try:
            x, y, rw, rh = rect(item)
            draw.rectangle((x, y, x + rw, y + rh), outline=(255, 90, 90, 220), width=2)
            draw.text((x + 3, y + 2), item["id"], fill=(255, 245, 210, 255))
        except (KeyError, TypeError, ValueError):
            pass

    args.output_dir.mkdir(parents=True, exist_ok=True)
    stem = args.png.stem
    annotated_path = args.output_dir / f"{stem}.annotated.png"
    report_path = args.output_dir / f"{stem}.report.json"
    annotated.save(annotated_path)
    failures = [item for item in findings if item["level"] == "failure"]
    report = {
        "status": "fail" if failures else "pass",
        "screenshot": str(args.png),
        "layout": str(args.layout),
        "annotated": str(annotated_path),
        "imageSize": {"width": width, "height": height},
        "findings": findings,
        "summary": {"failures": len(failures), "checksRun": checks_run},
        "limitations": [
            "Pixel activity is a heuristic and does not establish readability or composition quality.",
            "Geometry is trustworthy only when the manifest is exported from authoritative runtime bounds.",
            "Human review of the original and annotated screenshot remains mandatory."
        ]
    }
    report_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(f"{report['status'].upper()}: {len(failures)} failure(s)")
    print(f"Annotated: {annotated_path}")
    print(f"Report: {report_path}")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
