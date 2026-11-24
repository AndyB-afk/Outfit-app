#!/usr/bin/env python3
"""List closet items and attach photos from the server filesystem."""

import argparse
import shutil
import sqlite3
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATABASE_PATH = PROJECT_ROOT / "outfit.db"
UPLOADS_PATH = PROJECT_ROOT / "uploads"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def list_clothes(connection):
    rows = connection.execute(
        """
        SELECT id, name, category, image_filename
        FROM clothes
        ORDER BY category, id
        """
    ).fetchall()

    for row in rows:
        image_state = row["image_filename"] or "no photo"
        print(
            f'{row["id"]:>2}  {row["category"]:<8} '
            f'{row["name"]} [{image_state}]'
        )


def attach_photo(connection, item_id, source_path, replace):
    source = source_path.expanduser().resolve()
    if not source.is_file():
        raise SystemExit(f"Photo file not found: {source}")

    extension = source.suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise SystemExit("Use a JPG, JPEG, PNG, or WebP photo.")

    item = connection.execute(
        "SELECT id, name, image_filename FROM clothes WHERE id = ?",
        (item_id,),
    ).fetchone()
    if item is None:
        raise SystemExit(f"No closet item has ID {item_id}. Run --list to check IDs.")

    if item["image_filename"] and not replace:
        raise SystemExit(
            f'{item["name"]} already has {item["image_filename"]}; '
            "use --replace to change its photo."
        )

    UPLOADS_PATH.mkdir(parents=True, exist_ok=True)
    filename = f"{item_id}{extension}"
    destination = UPLOADS_PATH / filename
    shutil.copy2(source, destination)

    try:
        connection.execute(
            "UPDATE clothes SET image_filename = ? WHERE id = ?",
            (filename, item_id),
        )
        connection.commit()
    except Exception:
        destination.unlink(missing_ok=True)
        raise

    print(f'Attached {source.name} to {item["name"]} as uploads/{filename}')


def main():
    parser = argparse.ArgumentParser(
        description="Attach a server-side photo to a closet item."
    )
    parser.add_argument("--list", action="store_true", help="List closet item IDs.")
    parser.add_argument(
        "--replace",
        action="store_true",
        help="Replace an item's existing photo.",
    )
    parser.add_argument("item_id", nargs="?", type=int)
    parser.add_argument("photo", nargs="?", type=Path)
    args = parser.parse_args()

    if not DATABASE_PATH.is_file():
        raise SystemExit(
            f"Closet database not found: {DATABASE_PATH}. "
            "Start the app once to create it."
        )

    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    try:
        if args.list:
            list_clothes(connection)
            return

        if args.item_id is None or args.photo is None:
            parser.error("provide ITEM_ID PHOTO, or use --list")

        attach_photo(connection, args.item_id, args.photo, args.replace)
    finally:
        connection.close()


if __name__ == "__main__":
    main()
