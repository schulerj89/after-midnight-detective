"""Normalize a generated 2x2 room-material source into seamless atlas frames."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image, ImageOps


FRAMES = ["lounge", "kitchen", "bedroom", "office"]
FRAME_SIZE = 512
PATCH_SIZE = FRAME_SIZE // 2


def seamless_frame(source: Image.Image) -> Image.Image:
    patch = source.resize((PATCH_SIZE, PATCH_SIZE), Image.Resampling.LANCZOS)
    frame = Image.new("RGB", (FRAME_SIZE, FRAME_SIZE))
    frame.paste(patch, (0, 0))
    frame.paste(ImageOps.mirror(patch), (PATCH_SIZE, 0))
    frame.paste(ImageOps.flip(patch), (0, PATCH_SIZE))
    frame.paste(ImageOps.flip(ImageOps.mirror(patch)), (PATCH_SIZE, PATCH_SIZE))
    return frame


def build(source_path: Path, image_path: Path, json_path: Path) -> None:
    source = Image.open(source_path).convert("RGB")
    half_width = source.width // 2
    half_height = source.height // 2
    atlas = Image.new("RGB", (FRAME_SIZE * 2, FRAME_SIZE * 2))
    records: dict[str, dict[str, object]] = {}

    for index, name in enumerate(FRAMES):
        column = index % 2
        row = index // 2
        quadrant = source.crop((
            column * half_width,
            row * half_height,
            source.width if column else half_width,
            source.height if row else half_height,
        ))
        frame = seamless_frame(quadrant)
        x = column * FRAME_SIZE
        y = row * FRAME_SIZE
        atlas.paste(frame, (x, y))
        records[name] = {
            "frame": {"x": x, "y": y, "w": FRAME_SIZE, "h": FRAME_SIZE},
            "rotated": False,
            "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": FRAME_SIZE, "h": FRAME_SIZE},
            "sourceSize": {"w": FRAME_SIZE, "h": FRAME_SIZE},
        }

    image_path.parent.mkdir(parents=True, exist_ok=True)
    if image_path.suffix.lower() == ".webp":
        atlas.save(image_path, format="WEBP", quality=82, method=6)
    else:
        atlas.save(image_path, optimize=True)
    json_path.write_text(json.dumps({
        "frames": records,
        "meta": {
            "app": "After Midnight, Detective room-texture normalizer",
            "version": "1",
            "image": image_path.name,
            "format": "RGB888",
            "size": {"w": atlas.width, "h": atlas.height},
            "scale": "1",
        },
    }, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("image", type=Path)
    parser.add_argument("json", type=Path)
    args = parser.parse_args()
    build(args.source, args.image, args.json)


if __name__ == "__main__":
    main()
