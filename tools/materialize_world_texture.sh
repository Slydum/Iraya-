#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

source_file="tools/data/farm_world.webp.b64"
target_file="assets/runtime/world/farm_world.webp"

mkdir -p "$(dirname "$target_file")"
test -s "$source_file"
tr -d '\r\n' < "$source_file" | base64 --decode > "$target_file"
test -s "$target_file"

riff_signature="$(head -c 4 "$target_file")"
webp_signature="$(dd if="$target_file" bs=1 skip=8 count=4 2>/dev/null)"
if [[ "$riff_signature" != "RIFF" || "$webp_signature" != "WEBP" ]]; then
  echo "World texture generation failed: invalid WebP signature." >&2
  exit 1
fi

echo "Created $target_file"
