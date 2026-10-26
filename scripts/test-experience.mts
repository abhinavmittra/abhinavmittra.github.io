import assert from "node:assert/strict";
import {
  lowerQuality,
  qualitySettings,
  damp,
  mailDraft,
} from "../components/experience/performance.ts";
assert.equal(lowerQuality("high"), "balanced");
assert.equal(lowerQuality("balanced"), "low");
assert.equal(lowerQuality("low"), "low");
assert.equal(qualitySettings.low.antialias, true);
assert.equal(qualitySettings.low.shadows, false);
assert(qualitySettings.low.maxDpr >= 1.65);
assert.equal(qualitySettings.balanced.maxDpr, qualitySettings.high.maxDpr);
for (const step of [1 / 30, 1 / 60, 1 / 120]) {
  let position = 0;
  for (let t = 0; t < 2; t += step) position = damp(position, 1, step);
  assert(Math.abs(position - 1) < 0.00001);
}
assert(Number.isFinite(damp(0, 1, 5)));
const url = new URL(
  mailDraft(
    "me.abhinav.mittra@gmail.com",
    "A&B? #idea",
    "Hi\r\n\r\n<hello> & coffee ☕",
  ),
);
assert.equal(url.pathname, "me.abhinav.mittra@gmail.com");
assert.equal(url.searchParams.get("subject"), "A&B? #idea");
assert.equal(url.searchParams.get("body"), "Hi\r\n\r\n<hello> & coffee ☕");
console.log(
  "PASS: adaptive shadows preserve antialiasing and detail, damping and email encoding.",
);

const {readLook, readAtmosphere, defaultLook, accentText} = await import('../components/experience/preferences.ts');
assert.equal(readAtmosphere(undefined), 'daylight');
assert.equal(readAtmosphere('studio'), 'studio');
assert.deepEqual(readLook(null), defaultLook);
assert.equal(readLook({speed: Infinity, light: -1, separation: 250, accent: 'url(x)'}).speed, 100);
assert.equal(readLook({light: -1}).light, 50);
assert.equal(readLook({separation: 250}).separation, 100);
assert.equal(readLook({separation: 0}).separation, 0);
assert.equal(readLook({gentle: false}, true).gentle, true);
assert.equal(readLook({angle: 'overhead', accent: '#FFFFFF'}).accent, '#ffffff');
assert.notEqual(accentText('#ffffff', 'daylight'), 'rgb(255 255 255)');
assert.notEqual(accentText('#000000', 'studio'), 'rgb(0 0 0)');
console.log('PASS: restored settings validation, bounded sliders, reduced-motion preference and visible custom accents.');
