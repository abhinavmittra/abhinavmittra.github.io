import assert from 'node:assert/strict';
import { Timer } from 'three';
import { createFrameTimer } from '../lib/frameTimer.mjs';

let timestamp = performance.now();
const clock = createFrameTimer(Timer, () => timestamp);
assert.equal(clock.getDelta(), 0);
for (let i = 0; i < 60; i++) { timestamp += 1000 / 60; clock.getDelta(); }
assert(Math.abs(clock.elapsedTime - 1) < 1e-9);
timestamp += 250;
assert(Math.abs(clock.getElapsedTime() - 1.25) < 1e-9);
clock.stop();
timestamp += 5000;
assert.equal(clock.getDelta(), 0);
assert(Math.abs(clock.elapsedTime - 1.25) < 1e-9);
clock.start();
assert.equal(clock.elapsedTime, 0);
timestamp += 16;
assert(Math.abs(clock.getDelta() - .016) < 1e-9);
// R3F sets elapsedTime directly when switching frame loops / advancing manually.
clock.elapsedTime = 4;
timestamp += 16;
assert(Math.abs(clock.getElapsedTime() - 4.016) < 1e-9);
const { readFile, readdir } = await import('node:fs/promises');
const entry = await readFile(new URL('../node_modules/@react-three/fiber/package.json', import.meta.url), 'utf8');
assert.equal(JSON.parse(entry).version, '9.8.2');
const dist = new URL('../node_modules/@react-three/fiber/dist/', import.meta.url);
for (const name of (await readdir(dist)).filter(name => /^events-.*\.(esm|cjs\.dev|cjs\.prod)\.js$/.test(name))) {
  const bundle = await readFile(new URL(name, dist), 'utf8');
  assert.match(bundle, /clock: createFrameTimer\(THREE(?:__namespace)?\.Timer\),/, 'Run npm install to apply the R3F Timer compatibility patch.');
  assert.doesNotMatch(bundle, /new THREE(?:__namespace)?\.Clock\(/);
}
console.log('PASS: Timer frame deltas, elapsed time, pause/restart and manual elapsed state.');
