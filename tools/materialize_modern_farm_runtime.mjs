import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = resolve(root, "asset-source/modern-farm-runtime-package");
const publicRoot = resolve(root, "public");
const assetsRoot = resolve(publicRoot, "modern-farm/assets");

const metadata = JSON.parse(await readFile(resolve(packageRoot, "metadata.json"), "utf8"));
const partNames = (await readdir(packageRoot))
  .filter((name) => /^part-\d{3}\.b64$/.test(name))
  .sort();

if (partNames.length !== metadata.parts) {
  throw new Error(`Expected ${metadata.parts} Modern Farm package parts, found ${partNames.length}.`);
}

const encoded = (await Promise.all(
  partNames.map((name) => readFile(resolve(packageRoot, name), "utf8")),
)).join("");
const compressed = Buffer.from(encoded, "base64");
const compressedDigest = createHash("sha256").update(compressed).digest("hex");
if (compressed.length !== metadata.gzipBytes || compressedDigest !== metadata.sha256Gzip) {
  throw new Error("Modern Farm compressed package checksum mismatch.");
}

const raw = gunzipSync(compressed);
const rawDigest = createHash("sha256").update(raw).digest("hex");
if (raw.length !== metadata.rawBytes || rawDigest !== metadata.sha256Raw) {
  throw new Error("Modern Farm runtime package checksum mismatch.");
}

const payload = JSON.parse(raw.toString("utf8"));
if (payload.version !== "modern-farm-v1.2-iraya-runtime-2" || !Array.isArray(payload.files)) {
  throw new Error("Unexpected Modern Farm runtime package format.");
}

await rm(assetsRoot, { recursive: true, force: true });

for (const entry of payload.files) {
  if (typeof entry.path !== "string" || !entry.path.startsWith("modern-farm/assets/")) {
    throw new Error(`Unsafe Modern Farm runtime path: ${String(entry.path)}`);
  }

  const output = resolve(publicRoot, entry.path);
  if (!output.startsWith(`${assetsRoot}${sep}`)) {
    throw new Error(`Modern Farm runtime path escaped public assets: ${entry.path}`);
  }

  const bytes = Buffer.from(entry.base64, "base64");
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (bytes.length !== entry.bytes || digest !== entry.sha256) {
    throw new Error(`Modern Farm runtime checksum mismatch: ${entry.path}`);
  }

  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, bytes);
}

console.log(`Materialized ${payload.files.length} verified Modern Farm package assets.`);
