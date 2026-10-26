import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {geoArea,geoContains,geoOrthographic} from 'd3-geo';
import {geographicFeatures,visitedAt,globeVector} from '../components/travel/geography.js';
const text=readFileSync('content/travel.ts','utf8');
const visits=JSON.parse(text.match(/visitedCountries = ([\s\S]*?) as const/)[1]);
const next=JSON.parse(text.match(/nextCountries = ([\s\S]*?) as const/)[1]);
const features=geographicFeatures(JSON.parse(readFileSync('public/travel/countries.json')));
assert.deepEqual(visits.map(c=>c.code),'IND USA BWA ZAF ZWE ZMB ARE GBR CHE FRA IDN THA MYS UZB KGZ KAZ KHM LAO VNM TUR ALB MNE MKD EGY MAR OMN NPL ISL FIN'.split(' '));
assert.equal(new Set(visits.map(c=>c.code)).size,29);
assert.equal((29/195*100).toFixed(1),'14.9');
for(const c of [...visits,...next])assert(existsSync(`public/travel/flags/${c.flag}.svg`),c.name+' flag');
assert(next.every(c=>!visits.some(v=>v.code===c.code)));
for(const f of features)assert(geoArea(f)>=0&&geoArea(f)<2*Math.PI,f.properties.code+' does not cover the globe');
for(const c of visits){
 const f=features.find(f=>f.properties.code===c.code);
 assert(geoContains(f,[c.longitude,c.latitude]),c.name+' focus inside boundary');
 assert.equal(visitedAt(features,visits,[c.longitude,c.latitude]),c.code);
 const p=geoOrthographic().rotate([-c.longitude,-c.latitude]).translate([0,0]).scale(1);
 const point=p([c.longitude,c.latitude]);assert(Math.hypot(...point)<1e-8);
 assert(Math.abs(Math.hypot(...globeVector(c.longitude,c.latitude))-1)<1e-10);
}
for(const point of [[-140,0],[-30,0],[80,-45]])assert.equal(visitedAt(features,visits,point),null,'Ocean not filled by an inverted island');
for(const [code,point] of [['USA',[-150,65]],['USA',[-100,40]],['FRA',[2.35,48.85]],['IDN',[106.85,-6.2]],['IND',[77.2,28.6]]])assert(geoContains(features.find(f=>f.properties.code===code),point),code+' known location');
const source=readFileSync('reference/geography/ne_50m_admin_0_countries.geojson');const provenance=JSON.parse(readFileSync('reference/geography/provenance.json'));
assert.equal(createHash('sha256').update(source).digest('hex'),provenance.sha256);
console.log('PASS: 29 countries, 53 local flags, source checksum, ring winding, label coordinates, oceans, dateline islands and projection focus.');
