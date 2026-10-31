// Chart datum for every port: LAT (lowest astronomical tide), the lowest level the tide reaches over
// a full 18.6-year nodal cycle — the zero of official tide tables. Writes it into each port's
// constituents as Z0 = mean sea level above LAT (cm), which src/lib/tides.ts and the app's Dart
// engine add to every height, so lows are no longer negative.
//
// Usage (repo root): node tools/datum/lat.mjs          — all ports, ~1 minute
//                    node tools/datum/lat.mjs dubai    — some ports
// Rerun after adding ports, then `npx -y -p node@22 node app/tool/sync_data.mjs` for the app.
import { readFileSync, writeFileSync } from 'node:fs';
import { createJiti } from 'jiti';

const jiti = createJiti(import.meta.url);
const { dayExtremes, DATUM_KEY } = await jiti.import('../../src/lib/tides.ts');

const DIR = 'src/data/places/';
const FROM = Date.UTC(2020, 0, 1), YEARS = 19; // one nodal cycle and a bit
const only = process.argv.slice(2);
const index = JSON.parse(readFileSync(DIR + 'places_index.json', 'utf8'));

for (const { id } of index) {
  if (only.length && !only.includes(id)) continue;
  const file = `${DIR}${id}.json`;
  const port = JSON.parse(readFileSync(file, 'utf8'));
  const { [DATUM_KEY]: _old, ...waves } = port.constituents;
  let lowest = Infinity;
  // Days in UTC: the lowest water doesn't depend on which local day it falls in
  for (let t = FROM; t < FROM + YEARS * 365.25 * 86400000; t += 86400000) {
    for (const e of dayExtremes(waves, new Date(t + 43200000), 0)) if (e.type === 'low' && e.height < lowest) lowest = e.height;
  }
  port.constituents = { ...waves, [DATUM_KEY]: { amp: Math.round(-lowest * 10) / 10, phase: 0 } };
  port.units = { ...port.units, datum: 'LAT (lowest astronomical tide 2020–2038); Z0 = mean sea level above LAT, cm' };
  // Same layout as the source files: one-space indent, CRLF, no final newline
  writeFileSync(file, JSON.stringify(port, null, 1).replace(/\n/g, '\r\n'));
  console.log(`${id.padEnd(16)} LAT = MSL − ${(-lowest).toFixed(1)} cm`);
}
