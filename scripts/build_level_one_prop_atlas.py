"""Normalize a keyed 6x6 GPT Image prop sheet into a deterministic Phaser atlas."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image


FRAMES = [
    "front-desk", "piano", "sofa", "low-table", "grand-clock", "coat-rack",
    "folding-screen", "sink-counter", "counter", "stove", "prep-table", "pantry-crates",
    "bin", "bed", "nightstand", "wardrobe", "luggage-rack", "chair",
    "safe", "desk", "manager-chair", "switchboard", "filing-cabinets", "visitor-chair",
    "coat-stand", "wet-footprints", "torn-ledger", "damp-matchbook", "stopped-watch", "switchboard-log",
    "room-317-key-card",
]

GRID = 6
FRAME_SIZE = 256
SUBJECT_SIZE = 224

# GPT Image honored the six rows but used content-aware column widths. These
# source-pixel valleys isolate every requested object without cutting a sprite.
ROW_BOUNDS = [0, 260, 474, 686, 894, 1078, 1254]
COLUMN_BOUNDS = [
    [0, 242, 457, 731, 938, 1082, 1254],
    [0, 240, 436, 713, 869, 1070, 1254],
    [0, 183, 454, 642, 834, 1055, 1254],
    [0, 187, 457, 636, 844, 1059, 1254],
    [0, 194, 417, 627, 851, 1041, 1254],
    [0, 242, 457, 731, 938, 1082, 1254],
]


def build(source_path: Path, image_path: Path, json_path: Path) -> None:
    source = Image.open(source_path).convert("RGBA")
    if source.size != (ROW_BOUNDS[-1], ROW_BOUNDS[-1]):
        raise ValueError(f"source dimensions changed; review crop valleys: {source.size}")
    atlas = Image.new("RGBA", (GRID * FRAME_SIZE, GRID * FRAME_SIZE), (0, 0, 0, 0))
    frames: dict[str, dict[str, object]] = {}

    for index, name in enumerate(FRAMES):
        column = index % GRID
        row = index // GRID
        cell = source.crop((
            COLUMN_BOUNDS[row][column],
            ROW_BOUNDS[row],
            COLUMN_BOUNDS[row][column + 1],
            ROW_BOUNDS[row + 1],
        ))
        alpha_box = cell.getchannel("A").getbbox()
        if alpha_box is None:
            raise ValueError(f"frame {name} is empty")
        subject = cell.crop(alpha_box)
        scale = min(SUBJECT_SIZE / subject.width, SUBJECT_SIZE / subject.height)
        size = (max(1, round(subject.width * scale)), max(1, round(subject.height * scale)))
        subject = subject.resize(size, Image.Resampling.LANCZOS)
        frame_x = column * FRAME_SIZE
        frame_y = row * FRAME_SIZE
        paste_x = frame_x + (FRAME_SIZE - subject.width) // 2
        paste_y = frame_y + (FRAME_SIZE - subject.height) // 2
        atlas.alpha_composite(subject, (paste_x, paste_y))
        frames[name] = {
            "frame": {"x": paste_x, "y": paste_y, "w": subject.width, "h": subject.height},
            "rotated": False,
            "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": subject.width, "h": subject.height},
            "sourceSize": {"w": subject.width, "h": subject.height},
        }

    image_path.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(image_path, optimize=True)
    payload = {
        "frames": frames,
        "meta": {
            "app": "After Midnight, Detective atlas normalizer",
            "version": "1",
            "image": image_path.name,
            "format": "RGBA8888",
            "size": {"w": atlas.width, "h": atlas.height},
            "scale": "1",
        },
    }
    json_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="6x6 source PNG after chroma-key removal")
    parser.add_argument("image", type=Path, help="output atlas PNG")
    parser.add_argument("json", type=Path, help="output Phaser atlas JSON")
    args = parser.parse_args()
    build(args.source, args.image, args.json)


if __name__ == "__main__":
    main()
