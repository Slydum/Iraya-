import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const assets = [
  {
    name: "Farmer 1 atlas",
    payload: "asset-source/runtime/farmer_1.png.b64",
    output: "public/assets/farmer_1.png",
    bytes: 7967,
    sha256: "0cc99b2b727e7487ae7de1c6390fed5120182d030cc53f3f88b4f6a0e2bd84cc",
  },
  {
    name: "Iraya farm world",
    payloadPartsDir: "asset-source/runtime/farm_world_exact",
    output: "public/assets/farm_world.webp",
    bytes: 11796,
    sha256: "8e20d0c43e3eef8c84a7f4ae4738fcc50355d7ae749deae0e35e07014357b3fd",
  },
];

async function readEncodedPayload(asset) {
  if (asset.payloadPartsDir) {
    const partsDirectory = resolve(repoRoot, asset.payloadPartsDir);
    const partNames = (await readdir(partsDirectory))
      .filter((name) => /^part_\d+\.txt$/.test(name))
      .sort();

    if (partNames.length === 0) {
      throw new Error(`${asset.name} has no payload chunks.`);
    }

    const parts = await Promise.all(
      partNames.map((name) => readFile(resolve(partsDirectory, name), "utf8")),
    );
    return parts.join("").replace(/\s+/g, "");
  }

  if (!asset.payload) {
    throw new Error(`${asset.name} has no payload source.`);
  }

  return (await readFile(resolve(repoRoot, asset.payload), "utf8")).replace(/\s+/g, "");
}

for (const asset of assets) {
  const outputPath = resolve(repoRoot, asset.output);
  const encoded = await readEncodedPayload(asset);
  const bytes = Buffer.from(encoded, "base64");
  const canonical = bytes.toString("base64");
  const digest = createHash("sha256").update(bytes).digest("hex");

  if (canonical !== encoded) {
    throw new Error(`${asset.name} payload is not canonical base64.`);
  }
  if (bytes.length !== asset.bytes) {
    throw new Error(`${asset.name} has ${bytes.length} bytes; expected ${asset.bytes}.`);
  }
  if (digest !== asset.sha256) {
    throw new Error(`${asset.name} checksum ${digest}; expected ${asset.sha256}.`);
  }

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, bytes);
  console.log(`Materialized ${asset.name}: ${asset.bytes} bytes (${asset.sha256.slice(0, 12)}…)`);
}
