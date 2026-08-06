import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
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
    payload: "asset-source/runtime/farm_world.webp.b64",
    output: "public/assets/farm_world.webp",
    bytes: 11796,
    sha256: "8e20d0c43e3eef8c84a7f4ae4738fcc50355d7ae749deae0e35e07014357b3fd",
  },
];

for (const asset of assets) {
  const payloadPath = resolve(repoRoot, asset.payload);
  const outputPath = resolve(repoRoot, asset.output);
  const encoded = (await readFile(payloadPath, "utf8")).replace(/\s+/g, "");
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
