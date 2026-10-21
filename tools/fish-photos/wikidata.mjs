// Looks up species on Wikidata by scientific name: main image (P18, a Commons file) and Arabic label.
// Used to choose photos for FILES in fetch.mjs and to cross-check Arabic names.
// Usage: node tools/fish-photos/wikidata.mjs "Pterois miles" "Octopus vulgaris" ...
const names = process.argv.slice(2);
const q = `SELECT ?sci ?img ?ar WHERE { VALUES ?sci { ${names.map(n => JSON.stringify(n)).join(' ')} }
  ?item wdt:P225 ?sci . OPTIONAL { ?item wdt:P18 ?img } OPTIONAL { ?item rdfs:label ?ar FILTER(lang(?ar) = "ar") } }`;
const res = await fetch('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(q),
  { headers: { 'User-Agent': 'ArabTides/1.0 (https://www.arabtides.com)' } });
const rows = (await res.json()).results.bindings;
for (const n of names) {
  const r = rows.filter(x => x.sci.value === n);
  const imgs = [...new Set(r.map(x => x.img && decodeURIComponent(x.img.value.split('/').pop())).filter(Boolean))];
  const ar = [...new Set(r.map(x => x.ar?.value).filter(Boolean))];
  console.log(JSON.stringify({ sci: n, ar, imgs }));
}
