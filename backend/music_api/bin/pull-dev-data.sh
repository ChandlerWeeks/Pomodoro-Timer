#!/usr/bin/env bash
# Pull a small dev copy of homeserver:~/Data/music (first N tracks per theme) into ./data/music.
# Usage: bin/pull-dev-data.sh [tracks_per_theme]   (default 3)
set -euo pipefail

N="${1:-3}"
SRC="jweeks12@homeserver:Data/music/"
DEST="$(cd "$(dirname "$0")/.." && pwd)/data/music"
mkdir -p "$DEST"

# Top-level metadata, evidence, tools, and track numbers 001..N in every theme folder.
includes=(--include='/*.*' --include='/evidence/***' --include='/tools/***'
          --include='/*/' --include='/*/playlist.m3u8')
for i in $(seq -f '%03g' 1 "$N"); do includes+=(--include="/*/$i - *"); done
rsync -a --delete "${includes[@]}" --exclude='*' "$SRC" "$DEST/"

# Trim catalogs and playlists to the tracks we actually pulled.
python3 - "$DEST" <<'PY'
import csv, json, os, sys
root = sys.argv[1]
have = lambda p: os.path.exists(os.path.join(root, p))

cat = [t for t in json.load(open(f"{root}/catalog.json")) if have(t["path"])]
json.dump(cat, open(f"{root}/catalog.json", "w"), indent=2)

for name in ("catalog.csv", "review.csv"):
    with open(f"{root}/{name}", newline="") as f:
        r = csv.DictReader(f); rows = [row for row in r if have(row["path"])]
    with open(f"{root}/{name}", "w", newline="") as f:
        w = csv.DictWriter(f, r.fieldnames); w.writeheader(); w.writerows(rows)

for theme in {t["theme"] for t in cat}:
    p = f"{root}/{theme}/playlist.m3u8"
    lines = open(p).read().splitlines()
    out = [lines[0]]  # #EXTM3U
    for info, track in zip(lines[1::2], lines[2::2]):
        if have(f"{theme}/{track}"): out += [info, track]
    open(p, "w").write("\n".join(out) + "\n")

print(f"{len(cat)} tracks across {len({t['theme'] for t in cat})} themes")
PY
