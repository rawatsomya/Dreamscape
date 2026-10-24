#!/usr/bin/env python3
"""
Clean sprites with rembg + alpha crop.
Repo: https://github.com/danielgatis/rembg

Usage:
  python scripts/clean_sprites.py <input_dir> [output_dir]
  python scripts/clean_sprites.py <input_file>
  python scripts/clean_sprites.py
  defaults: ./frontend/public/mock/sprites -> ./sessions/demo/clean
"""
import sys
from pathlib import Path

try:
    from rembg import remove
    from PIL import Image
except ImportError:
    print('Install: pip install "rembg[cpu]" pillow')
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_IN = ROOT / "frontend" / "public" / "mock" / "sprites"
DEFAULT_OUT = ROOT / "sessions" / "demo" / "clean"


def clean_and_crop(
    img_path: Path,
    out_path: Path,
    alpha_threshold: int = 10,
    skip_background: bool = True,
) -> bool:
    try:
        img = Image.open(img_path).convert("RGBA")
    except Exception as e:
        print(f"  SKIP {img_path.name}: {e}")
        return False

    name = img_path.name.lower()
    if skip_background and (
        "background" in name or name.endswith("bg.png") or "ch00_bg" in name or name.startswith("bg")
    ):
        out_path.parent.mkdir(parents=True, exist_ok=True)
        img.save(out_path)
        print(f"  COPIED (no rembg): {img_path.name}")
        return True

    cleaned = remove(img)
    mask = cleaned.getchannel("A").point(lambda a: 255 if a > alpha_threshold else 0)
    bbox = mask.getbbox()
    if bbox:
        cleaned = cleaned.crop(bbox)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    cleaned.save(out_path)
    print(f"  CLEANED: {img_path.name} -> {out_path} size={cleaned.size}")
    return True


def main():
    in_arg = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_IN
    out_arg = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUT

    if not in_arg.exists():
        print(f"Input missing: {in_arg}")
        print("Put hero.png enemy.png platform.png npc.png there (white bg).")
        sys.exit(1)

    if in_arg.is_file():
        out_path = out_arg / in_arg.name if out_arg.suffix == "" else out_arg
        if out_path.is_dir() or out_arg.suffix == "":
            out_path = Path(out_arg) / in_arg.name
        clean_and_crop(in_arg, out_path)
        return

    out_dir = out_arg
    out_dir.mkdir(parents=True, exist_ok=True)
    exts = {".png", ".jpg", ".jpeg", ".webp"}
    files = [f for f in in_arg.iterdir() if f.is_file() and f.suffix.lower() in exts]
    if not files:
        print(f"No images in {in_arg}")
        sys.exit(1)

    print(f"Cleaning {len(files)} image(s): {in_arg} -> {out_dir}")
    ok = 0
    for f in sorted(files):
        if clean_and_crop(f, out_dir / f.with_suffix(".png").name):
            ok += 1
    print(f"Done. {ok}/{len(files)}")


if __name__ == "__main__":
    main()
