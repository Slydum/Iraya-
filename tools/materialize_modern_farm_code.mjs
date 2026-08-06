import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = resolve(root, "asset-source/modern-farm-code-package");
const metadata = JSON.parse(await readFile(resolve(packageRoot, "metadata.json"), "utf8"));
const partNames = (await readdir(packageRoot)).filter((name) => /^part-\d{3}\.b64$/.test(name)).sort();

if (partNames.length !== metadata.parts) {
  throw new Error(`Expected ${metadata.parts} Modern Farm code parts, found ${partNames.length}.`);
}

const encoded = (await Promise.all(partNames.map((name) => readFile(resolve(packageRoot, name), "utf8")))).join("");
const compressed = Buffer.from(encoded, "base64");
const compressedDigest = createHash("sha256").update(compressed).digest("hex");
if (compressed.length !== metadata.gzipBytes || compressedDigest !== metadata.sha256Gzip) {
  throw new Error("Modern Farm code package checksum mismatch.");
}

const raw = gunzipSync(compressed);
const rawDigest = createHash("sha256").update(raw).digest("hex");
if (raw.length !== metadata.rawBytes || rawDigest !== metadata.sha256Raw) {
  throw new Error("Modern Farm code package checksum mismatch after decompression.");
}

const payload = JSON.parse(raw.toString("utf8"));
if (payload.version !== "iraya-modern-farm-code-1" || !Array.isArray(payload.files)) {
  throw new Error("Unexpected Modern Farm code package format.");
}

await rm(resolve(root, "source/src/modern-farm/ModernFarmRuntime.ts"), { force: true });

for (const entry of payload.files) {
  if (typeof entry.path !== "string" || !(entry.path.startsWith("source/src/") || entry.path.startsWith("public/modern-farm/"))) {
    throw new Error(`Unsafe Modern Farm code path: ${String(entry.path)}`);
  }

  const output = resolve(root, entry.path);
  if (!output.startsWith(`${root}${sep}`)) {
    throw new Error(`Modern Farm code path escaped repository root: ${entry.path}`);
  }

  const bytes = Buffer.from(entry.base64, "base64");
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (bytes.length !== entry.bytes || digest !== entry.sha256) {
    throw new Error(`Modern Farm code checksum mismatch: ${entry.path}`);
  }

  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, bytes);
}

console.log(`Materialized ${payload.files.length} verified Modern Farm integration files.`);
