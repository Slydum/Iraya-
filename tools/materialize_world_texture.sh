#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

target_file="assets/runtime/world/farm_world.webp"
expected_base64_bytes=15728
expected_binary_bytes=11796
expected_sha256="8e20d0c43e3eef8c84a7f4ae4738fcc50355d7ae749deae0e35e07014357b3fd"

mkdir -p "$(dirname "$target_file")"

payload_file="$(mktemp)"
trap 'rm -f "$payload_file"' EXIT

for part in tools/data/farm_world_webp_chunk_{0..3}.txt; do
  test -s "$part"
  tr -d '\r\n' < "$part" >> "$payload_file"
done

actual_base64_bytes="$(wc -c < "$payload_file" | tr -d ' ')"
if [[ "$actual_base64_bytes" != "$expected_base64_bytes" ]]; then
  echo "World texture payload has $actual_base64_bytes bytes; expected $expected_base64_bytes." >&2
  exit 1
fi

base64 --decode < "$payload_file" > "$target_file"
actual_binary_bytes="$(wc -c < "$target_file" | tr -d ' ')"
if [[ "$actual_binary_bytes" != "$expected_binary_bytes" ]]; then
  echo "World texture has $actual_binary_bytes bytes; expected $expected_binary_bytes." >&2
  exit 1
fi

actual_sha256="$(sha256sum "$target_file" | cut -d ' ' -f 1)"
if [[ "$actual_sha256" != "$expected_sha256" ]]; then
  echo "World texture checksum mismatch." >&2
  exit 1
fi

riff_signature="$(head -c 4 "$target_file")"
webp_signature="$(dd if="$target_file" bs=1 skip=8 count=4 2>/dev/null)"
if [[ "$riff_signature" != "RIFF" || "$webp_signature" != "WEBP" ]]; then
  echo "World texture generation failed: invalid WebP signature." >&2
  exit 1
fi

echo "Created verified $target_file"
