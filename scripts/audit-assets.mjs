import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import assert from "node:assert/strict";
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map(async (entry) => {
        const path = join(dir, entry.name);
        return entry.isDirectory()
          ? walk(path)
          : [{ path, bytes: (await stat(path)).size }];
      }),
    )
  ).flat();
}
const assets = (await walk("public")).sort((a, b) => b.bytes - a.bytes);
for (const asset of assets)
  assert(
    asset.bytes <= 25 * 1024 * 1024,
    `Hosting asset limit exceeded: ${asset.path}`,
  );
const models = assets.filter((asset) => /\.(obj|gltf|glb)$/i.test(asset.path));
console.log(
  `Public: ${assets.length} files, ${(assets.reduce((sum, a) => sum + a.bytes, 0) / 1024 / 1024).toFixed(2)} MiB; imported 3D models: ${models.length}`,
);
for (const asset of assets.slice(0, 5))
  console.log(`${(asset.bytes / 1024).toFixed(0)} KiB  ${asset.path}`);
for (const model of models.filter((asset) => asset.bytes > 1024 * 1024))
  console.warn(`Review model delivery budget: ${model.path}`);
