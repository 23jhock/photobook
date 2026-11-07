#!/usr/bin/env python3
"""Build image-manifest.json by scanning the photobook gallery folders."""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
GALLERIES = [
    ("irl-meetup", "IRL Meetup", "irl-meetup"),
    ("pixelmon", "Pixelmon", "pixelmon"),
    ("cobblemon", "Cobblemon", "cobblemon"),
    ("uhcs", "UHCS", "uhcs"),
]
IMAGE_PATTERN = re.compile(r"^img \((\d+)\)\.(jpg|png)$", re.IGNORECASE)


def collect_images(folder_name):
    folder = ROOT / folder_name
    numbered_files = {}

    if folder.is_dir():
        for path in folder.iterdir():
            match = IMAGE_PATTERN.match(path.name)
            if not path.is_file() or not match:
                continue
            number = int(match.group(1))
            extension = match.group(2).lower()
            numbered_files.setdefault(number, {})[extension] = path.name

    images = []
    for number in sorted(numbered_files):
        files = numbered_files[number]
        preferred = files.get("jpg") or files.get("png")
        image = {"src": f"{folder_name}/{preferred}"}
        if files.get("jpg") and files.get("png"):
            image["fallback"] = f"{folder_name}/{files['png']}"
        images.append(image)
    return images


def main():
    manifest = {
        "version": 1,
        "galleries": [
            {
                "id": gallery_id,
                "title": title,
                "folder": folder,
                "images": collect_images(folder),
            }
            for gallery_id, title, folder in GALLERIES
        ],
    }
    output = ROOT / "image-manifest.json"
    output.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    total = sum(len(gallery["images"]) for gallery in manifest["galleries"])
    print(f"Wrote {output.name}: {total} images across {len(GALLERIES)} galleries.")


if __name__ == "__main__":
    main()
