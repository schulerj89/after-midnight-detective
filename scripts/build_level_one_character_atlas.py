from __future__ import annotations

import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "art-source/images/characters/pose-sheets"
OUTPUT_DIR = ROOT / "public/assets/images/characters"

SOURCE_FILES = {
    "detective": SOURCE_DIR / "detective-a-alpha.png",
    "vera": SOURCE_DIR / "vera-alpha.png",
    "miles": SOURCE_DIR / "miles-alpha.png",
    "officer": SOURCE_DIR / "officer-alpha.png",
}
POSES = ("neutral", "speaking", "suspicious", "alarmed")
POSE_CELLS = ((0, 0), (1, 0), (0, 1), (1, 1))

LOGICAL_WIDTH = 56
LOGICAL_HEIGHT = 70
RUNTIME_SCALE = 4
FRAME_WIDTH = LOGICAL_WIDTH * RUNTIME_SCALE
FRAME_HEIGHT = LOGICAL_HEIGHT * RUNTIME_SCALE
PORTRAIT_SIZE = 160
ATLAS_WIDTH = FRAME_WIDTH * 8
ATLAS_HEIGHT = FRAME_HEIGHT * 2 + PORTRAIT_SIZE
OPAQUE_THRESHOLD = 128


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    alpha = image.getchannel("A").point(lambda value: 255 if value >= 28 else 0)
    bbox = alpha.getbbox()
    if bbox is None:
        raise ValueError("Pose cell has no foreground pixels")
    return bbox


def split_source(source: Image.Image) -> list[Image.Image]:
    if source.width % 2 or source.height % 2:
        raise ValueError(f"Expected an even 2x2 source sheet, got {source.size}")
    cell_width = source.width // 2
    cell_height = source.height // 2
    return [
        source.crop((column * cell_width, row * cell_height, (column + 1) * cell_width, (row + 1) * cell_height))
        for column, row in POSE_CELLS
    ]


def normalize_pose(cell: Image.Image) -> Image.Image:
    cropped = cell.crop(alpha_bbox(cell))
    target_width = LOGICAL_WIDTH - 4
    target_height = LOGICAL_HEIGHT - 4
    scale = min(target_width / cropped.width, target_height / cropped.height)
    width = max(1, round(cropped.width * scale))
    height = max(1, round(cropped.height * scale))
    resized = cropped.resize((width, height), Image.Resampling.LANCZOS)
    resized.putalpha(resized.getchannel("A").point(lambda value: 255 if value >= OPAQUE_THRESHOLD else 0))

    logical = Image.new("RGBA", (LOGICAL_WIDTH, LOGICAL_HEIGHT), (0, 0, 0, 0))
    logical.alpha_composite(resized, ((LOGICAL_WIDTH - width) // 2, LOGICAL_HEIGHT - height - 1))
    return logical


def shared_palette(frames: list[Image.Image]) -> list[Image.Image]:
    strip = Image.new("RGBA", (LOGICAL_WIDTH * len(frames), LOGICAL_HEIGHT), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        strip.alpha_composite(frame, (index * LOGICAL_WIDTH, 0))
    rgb = Image.new("RGB", strip.size, (9, 10, 13))
    rgb.paste(strip.convert("RGB"), mask=strip.getchannel("A"))
    quantized = rgb.quantize(colors=24, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")

    output: list[Image.Image] = []
    for index, frame in enumerate(frames):
        colors = quantized.crop((index * LOGICAL_WIDTH, 0, (index + 1) * LOGICAL_WIDTH, LOGICAL_HEIGHT)).convert("RGBA")
        colors.putalpha(frame.getchannel("A"))
        output.append(colors)
    return output


def runtime_frame(logical: Image.Image) -> Image.Image:
    return logical.resize((FRAME_WIDTH, FRAME_HEIGHT), Image.Resampling.NEAREST)


def portrait_from_neutral(cell: Image.Image) -> Image.Image:
    cropped = cell.crop(alpha_bbox(cell))
    head_shoulders = cropped.crop((0, 0, cropped.width, max(1, round(cropped.height * 0.32))))
    logical_size = PORTRAIT_SIZE // RUNTIME_SCALE
    target = logical_size - 4
    scale = min(target / head_shoulders.width, target / head_shoulders.height)
    width = max(1, round(head_shoulders.width * scale))
    height = max(1, round(head_shoulders.height * scale))
    resized = head_shoulders.resize((width, height), Image.Resampling.LANCZOS)
    resized.putalpha(resized.getchannel("A").point(lambda value: 255 if value >= OPAQUE_THRESHOLD else 0))
    portrait = Image.new("RGBA", (logical_size, logical_size), (18, 19, 24, 255))
    portrait.alpha_composite(resized, ((logical_size - width) // 2, logical_size - height))
    rgb = portrait.convert("RGB").quantize(colors=32, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGBA")
    return rgb.resize((PORTRAIT_SIZE, PORTRAIT_SIZE), Image.Resampling.NEAREST)


def frame_entry(x: int, y: int, width: int, height: int) -> dict[str, object]:
    return {
        "frame": {"x": x, "y": y, "w": width, "h": height},
        "rotated": False,
        "trimmed": False,
        "spriteSourceSize": {"x": 0, "y": 0, "w": width, "h": height},
        "sourceSize": {"w": width, "h": height},
    }


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    atlas = Image.new("RGBA", (ATLAS_WIDTH, ATLAS_HEIGHT), (0, 0, 0, 0))
    frames: dict[str, object] = {}
    character_rows = (("detective", "vera"), ("miles", "officer"))
    neutral_cells: dict[str, Image.Image] = {}

    for row, characters in enumerate(character_rows):
        for character_offset, character in enumerate(characters):
            source = Image.open(SOURCE_FILES[character]).convert("RGBA")
            cells = split_source(source)
            neutral_cells[character] = cells[0]
            normalized = shared_palette([normalize_pose(cell) for cell in cells])
            for pose_index, (pose, logical) in enumerate(zip(POSES, normalized, strict=True)):
                column = character_offset * 4 + pose_index
                x = column * FRAME_WIDTH
                y = row * FRAME_HEIGHT
                atlas.alpha_composite(runtime_frame(logical), (x, y))
                frames[f"{character}-{pose}"] = frame_entry(x, y, FRAME_WIDTH, FRAME_HEIGHT)

    portrait_y = FRAME_HEIGHT * 2
    for index, character in enumerate(("detective", "vera", "miles", "officer")):
        x = index * PORTRAIT_SIZE
        atlas.alpha_composite(portrait_from_neutral(neutral_cells[character]), (x, portrait_y))
        frames[f"portrait-{character}"] = frame_entry(x, portrait_y, PORTRAIT_SIZE, PORTRAIT_SIZE)

    atlas_path = OUTPUT_DIR / "level-one-characters-atlas.png"
    json_path = OUTPUT_DIR / "level-one-characters-atlas.json"
    atlas.save(atlas_path, optimize=True)
    json_path.write_text(json.dumps({
        "frames": frames,
        "meta": {
            "app": "after-midnight-detective character atlas builder",
            "version": "1.0",
            "image": atlas_path.name,
            "format": "RGBA8888",
            "size": {"w": ATLAS_WIDTH, "h": ATLAS_HEIGHT},
            "scale": "1",
        },
    }, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {atlas_path.relative_to(ROOT)} ({ATLAS_WIDTH}x{ATLAS_HEIGHT})")
    print(f"Wrote {json_path.relative_to(ROOT)} ({len(frames)} frames)")


if __name__ == "__main__":
    main()
