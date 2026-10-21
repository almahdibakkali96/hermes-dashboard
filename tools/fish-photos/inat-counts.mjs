// Counts which marine species iNaturalist users have recorded near each port (research-grade
// observations within RADIUS km), and writes src/data/port-species.json:
//   { "<port id>": [["Scientific name", count], ...] }   sorted by count, top 150.
// Only species names and counts are stored (facts), not observation photos or text.
//
// Usage: node tools/fish-photos/inat-counts.mjs
import { readFile, writeFile } from 'node:fs/promises';

const RADIUS = 50;
// Ray-finned fish, sharks and rays, cephalopods, decapods (crabs, shrimp, lobster)
const TAXA = '47178,47273,47459,47186';
const UA = 'ArabTides/1.0 (https://www.arabtides.com)';
const ports = JSON.parse(await readFile('src/data/places/places_index.json', 'utf8'));
const sleep = ms => new Promise(r => setTimeout(r, ms));

const out = {};
for (const p of ports) {
  const url = `https://api.inaturalist.org/v1/observations/species_counts?lat=${p.lat}&lng=${p.lon}&radius=${RADIUS}`
    + `&taxon_id=${TAXA}&quality_grade=research&rank=species&per_page=150`;
  const j = await (await fetch(url, { headers: { 'User-Agent': UA } })).json();
  out[p.id] = j.results.map(r => [r.taxon.name, r.count]);
  console.log(p.id.padEnd(12), String(j.total_results).padStart(4), 'species');
  await sleep(1100); // stay well under the API's rate limit
}
await writeFile('src/data/port-species.json', JSON.stringify(out) + '\n');
