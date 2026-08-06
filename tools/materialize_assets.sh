#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"
mkdir -p public/assets

verify_file() {
  local output="$1"
  local expected_bytes="$2"
  local expected_sha="$3"
  local actual_bytes actual_sha
  actual_bytes="$(wc -c < "$output" | tr -d ' ')"
  actual_sha="$(sha256sum "$output" | cut -d ' ' -f 1)"
  if [[ "$actual_bytes" != "$expected_bytes" ]]; then
    echo "$output has $actual_bytes bytes; expected $expected_bytes." >&2
    exit 1
  fi
  if [[ "$actual_sha" != "$expected_sha" ]]; then
    echo "$output checksum mismatch: $actual_sha" >&2
    exit 1
  fi
  echo "Created verified $output"
}

farmer_payload="$(mktemp)"
world_payload="$(mktemp)"
trap 'rm -f "$farmer_payload" "$world_payload"' EXIT

for part in asset-source/farmer/part_*.txt; do
  test -s "$part"
  tr -d '\r\n' < "$part" >> "$farmer_payload"
done
base64 --decode < "$farmer_payload" > public/assets/farmer_1.png
verify_file public/assets/farmer_1.png 7967 0cc99b2b727e7487ae7de1c6390fed5120182d030cc53f3f88b4f6a0e2bd84cc

for part in asset-source/world/part_*.txt; do
  test -s "$part"
  tr -d '\r\n' < "$part" >> "$world_payload"
done
base64 --decode < "$world_payload" > public/assets/farm_world.webp
verify_file public/assets/farm_world.webp 11796 8e20d0c43e3eef8c84a7f4ae4738fcc50355d7ae749deae0e35e07014357b3fd
