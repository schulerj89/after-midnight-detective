from pathlib import Path
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[1]
SCREENSHOTS = ROOT / "docs" / "screenshots" / "level-1-transitions"
OUTPUT = ROOT / "docs" / "qa" / "2026-07-11-room-transitions" / "artifacts"
ANALYZER = ROOT / ".agents" / "skills" / "validate-game-screenshots" / "scripts" / "analyze_layout.py"


def main() -> None:
    layouts = sorted(SCREENSHOTS.glob("*.layout.json"))
    if not layouts:
        raise SystemExit("No transition layout manifests found")
    for layout in layouts:
        png = layout.with_name(layout.name.replace(".layout.json", ".png"))
        subprocess.run(
            [sys.executable, str(ANALYZER), str(png), str(layout), "--output-dir", str(OUTPUT)],
            cwd=ROOT,
            check=True,
        )


if __name__ == "__main__":
    main()
