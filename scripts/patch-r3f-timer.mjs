import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createFrameTimer } from '../lib/frameTimer.mjs';

// R3F 9.8.2 still constructs deprecated THREE.Clock. Keep this narrow patch
// reproducible on npm ci; fail loudly on dependency changes instead of hiding warnings.
const root = new URL('../node_modules/@react-three/fiber/', import.meta.url);
const { version } = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
if (version !== '9.8.2') throw new Error(`Review/remove the R3F Timer patch for version ${version}.`);
const marker = '// Systems Desk: R3F 9 Timer compatibility';
const files = (await readdir(new URL('dist/', root))).filter(name => /^events-.*\.(esm|cjs\.dev|cjs\.prod)\.js$/.test(name));
if (files.length !== 3) throw new Error('R3F distribution changed: expected three event bundles.');
for (const name of files) {
  const file = new URL(`dist/${name}`, root);
  const installed = await readFile(file, 'utf8');
  const source = installed.split(marker)[0].trimEnd();
  if (installed.includes(marker)) {
    if (!/clock: createFrameTimer\(THREE(?:__namespace)?\.Timer\),/.test(source))
      throw new Error(`R3F Timer patch changed in ${name}.`);
    const refreshed = `${source}\n${marker}\n${createFrameTimer.toString()}\n`;
    if (installed !== refreshed) await writeFile(file, refreshed);
    continue;
  }
  const pattern = /clock: new (THREE(?:__namespace)?)\.Clock\(\),/g;
  const matches = [...source.matchAll(pattern)];
  if (matches.length !== 1) throw new Error(`R3F clock constructor changed in ${name}.`);
  const patched = source.replace(pattern, (_, namespace) => `clock: createFrameTimer(${namespace}.Timer),`);
  await writeFile(file, `${patched}\n${marker}\n${createFrameTimer.toString()}\n`);
}
console.log('R3F 9.8.2: THREE.Timer compatibility applied (ESM and CJS).');
