import assert from 'node:assert/strict';
import {countryColor,globePalette} from '../components/travel/geography.js';
import {readFileSync} from 'node:fs';
const visits=JSON.parse(readFileSync('content/travel.ts','utf8').match(/visitedCountries = ([\s\S]*?) as const/)[1]);
for(const selected of visits){
 const fills=visits.map(c=>countryColor(c.code,selected.code,visits));
 assert.equal(fills.filter(c=>c===globePalette.selected).length,1,'Exactly one yellow country');
 assert.equal(fills.filter(c=>c===globePalette.visited).length,28,'All other visits share the legend purple');
 assert.equal(countryColor('JPN',selected.code,visits),globePalette.land,'Unvisited follows the legend');
}
console.log('PASS: one selected country and consistent visited/unvisited colours.');
