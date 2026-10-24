#!/usr/bin/env python3
import sys
from pathlib import Path
from PIL import Image
from rembg import remove


def alpha_crop(img: Image.Image, threshold: int = 10) -> Image.Image:
    """Crop image to non-transparent bounding box with a minimum alpha threshold."""
    if img.mode != "RGBA":
        img = img.convert("RGBA")

    # Get alpha band
    alpha = img.split()[3]
    # Point transform: 255 if above threshold, else 0
    mask = alpha.point(lambda p: 255 if p > threshold else 0)
    bbox = mask.getbbox()
    if bbox:
        return img.crop(bbox)
    return img


def clean_file(path_in: Path, path_out: Path):
    """Run rembg remove() and alpha-threshold crop, saving as transparent PNG."""
    # Skip backgrounds
    name_lower = path_in.name.lower()
    if "background" in name_lower or "bg" in name_lower:
        print(f"Skipping background file: {path_in.name}")
        return

    print(f"Cleaning: {path_in} -> {path_out}")
    path_out.parent.mkdir(parents=True, exist_ok=True)

    img = Image.open(path_in).convert("RGBA")
    # rembg remove background
    no_bg = remove(img)
    # alpha crop to tightly frame the sprite
    cropped = alpha_crop(no_bg)
    cropped.save(path_out, format="PNG")
    print(f"Saved clean sprite: {path_out} (size: {cropped.size})")


def main():
    if len(sys.argv) < 3:
        print("Usage: python clean_sprites.py <input_folder_or_file> <output_folder_or_file>")
        sys.exit(1)

    src = Path(sys.argv[1])
    dest = Path(sys.argv[2])

    if src.is_file():
        if dest.is_dir() or not dest.suffix:
            out_file = dest / src.name
        else:
            out_file = dest
        clean_file(src, out_file)
    elif src.is_dir():
        dest.mkdir(parents=True, exist_ok=True)
        image_extensions = {".png", ".jpg", ".jpeg", ".webp"}
        for item in src.iterdir():
            if item.is_file() and item.suffix.lower() in image_extensions:
                clean_file(item, dest / f"{item.stem}.png")
    else:
        print(f"Source not found: {src}")
        sys.exit(1)


if __name__ == "__main__":
    main()
