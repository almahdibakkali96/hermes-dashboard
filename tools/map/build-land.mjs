// The site's map background: public/map/land.svg, the world's land in the brand's map style (detailed from the Atlantic
// to the Gulf and the Mediterranean, coarser elsewhere to keep the file small)
// (the same look as the Reels' maps, brand/arab-map.mjs). The ports are drawn on top of it by src/components/PortsMap.astro,
// in the projection of src/lib/mapProjection.ts (keep the two in step).
//
// Input: Natural Earth 1:50m countries (public domain) as TopoJSON, world-atlas@2.0.2 countries-50m.json, e.g.
//   https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json
// Morocco is drawn with its Sahara and Somalia with Somaliland, each as one shape with no inner border (as in the Reels).
// Usage:  node tools/map/build-land.mjs path/to/countries-50m.json
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { PROJ, project } from '../../src/lib/mapProjection.ts';

const topo = JSON.parse(readFileSync(process.argv[2], 'utf8'));

// ISO 3166 numeric → our country codes; 732 (Sahara) joins Morocco, Somaliland (no id) joins Somalia
const ARAB = { '504': 'MA', '732': 'MA', '478': 'MR', '012': 'DZ', '788': 'TN', '434': 'LY', '818': 'EG', '729': 'SD',
  '262': 'DJ', '706': 'SO', '887': 'YE', '512': 'OM', '784': 'AE', '634': 'QA', '048': 'BH', '414': 'KW', '682': 'SA',
  '400': 'JO', '368': 'IQ', '760': 'SY', '422': 'LB', '275': 'PS', '174': 'KM' };

const { scale: [sx, sy], translate: [tx, ty] } = topo.transform;
const arcs = topo.arcs.map(a => { let x = 0, y = 0; return a.map(([dx, dy]) => [(x += dx) * sx + tx, (y += dy) * sy + ty]); });
const arcPts = i => (i < 0 ? [...arcs[~i]].reverse() : arcs[i]);
const polysOf = g => (g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : []);

const groups = new Map();
for (const g of topo.objects.countries.geometries) {
  const code = g.properties.name === 'Somaliland' ? 'SO' : ARAB[g.id];
  const key = code || 'x' + (g.id || g.properties.name);
  if (!groups.has(key)) groups.set(key, { arab: !!code, rings: [] });
  for (const p of polysOf(g)) for (const r of p) groups.get(key).rings.push(r);
}

// A group's rings: arcs used twice inside the group are inner borders; stitch the rest into closed rings
function merge(rings) {
  const use = new Map();
  for (const r of rings) for (const i of r) { const k = i < 0 ? ~i : i; use.set(k, (use.get(k) || 0) + 1); }
  const outer = rings.flatMap(r => r.filter(i => use.get(i < 0 ? ~i : i) === 1));
  const key = p => p[0].toFixed(6) + ',' + p[1].toFixed(6);
  const byStart = new Map(outer.map(i => [key(arcPts(i)[0]), i]));
  const done = new Set(), out = [];
  for (const i of outer) {
    if (done.has(i)) continue;
    let pts = [], j = i;
    while (j !== undefined && !done.has(j)) { done.add(j); const a = arcPts(j); pts = pts.concat(pts.length ? a.slice(1) : a); j = byStart.get(key(a[a.length - 1])); }
    out.push(pts);
  }
  return out;
}
const ringsOf = g => (g.arab && g.rings.length > 1 ? merge(g.rings) : g.rings.map(r => r.flatMap((i, k) => (k ? arcPts(i).slice(1) : arcPts(i)))));

// Clip a ring to the map rectangle (Sutherland–Hodgman; fine for filled shapes), in projected units
const M = 2; // margin outside the frame, so no edge shows
function clip(pts) {
  const edges = [[p => p[0] >= -M, (a, b) => cut(a, b, 0, -M)], [p => p[0] <= PROJ.W + M, (a, b) => cut(a, b, 0, PROJ.W + M)],
    [p => p[1] >= -M, (a, b) => cut(a, b, 1, -M)], [p => p[1] <= PROJ.H + M, (a, b) => cut(a, b, 1, PROJ.H + M)]];
  function cut(a, b, k, v) { const t = (v - a[k]) / (b[k] - a[k]); return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]; }
  let out = pts;
  for (const [inside, at] of edges) {
    const src = out; out = [];
    for (let i = 0; i < src.length; i++) {
      const a = src[i], b = src[(i + 1) % src.length];
      if (inside(a)) { out.push(a); if (!inside(b)) out.push(at(a, b)); } else if (inside(b)) out.push(at(a, b));
    }
    if (!out.length) break;
  }
  return out;
}

// Tolerance in projected units by where a point is: 0.12 (≈1.3 km) around the Arab ports and the Mediterranean, where
// port mini-maps zoom in; 0.55 elsewhere; 1.6 in the far north (long coasts, no ports)
const tolAt = ([x, y]) => {
  const lon = x / (PROJ.K * PROJ.C) + PROJ.L0, lat = PROJ.B1 - y / PROJ.K;
  return lon > -30 && lon < 75 && lat > -25 && lat < 50 ? 0.12 : lat > 60 ? 1.6 : 0.8;
};

// Douglas–Peucker with a tolerance that depends on the point's place (tolAt)
function simplify(pts) {
  // A closed ring repeats its first point at the end: drop it, or the start–end chord has no length and the ring collapses
  const n = pts.length;
  if (n > 1 && pts[0][0] === pts[n - 1][0] && pts[0][1] === pts[n - 1][1]) pts = pts.slice(0, -1);
  if (pts.length < 4) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop();
    const [ax, ay] = pts[s], [bx, by] = pts[e], dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
    let max = 0, idx = -1;
    for (let i = s + 1; i < e; i++) { const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / len; if (d > max) { max = d; idx = i; } }
    if (idx > 0 && max > tolAt(pts[idx])) { keep[idx] = 1; stack.push([s, idx], [idx, e]); }
  }
  return pts.filter((_, i) => keep[i]);
}

function pathOf(rings) {
  let d = '';
  for (const r of rings) {
    // Rings across the 180° meridian (Fiji, eastern Russia) would draw a line across the map: move their west part east
    const lons = r.map(p => p[0]), wrap = Math.max(...lons) - Math.min(...lons) > 180;
    const pts = simplify(clip(r.map(([lon, lat]) => project(wrap && lon < 0 ? lon + 360 : lon, lat))));
    if (pts.length < 3) continue;
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), speck = tolAt(pts[0]) > 0.2 ? 1.5 : 0.4;
    if (Math.max(...xs) - Math.min(...xs) < speck && Math.max(...ys) - Math.min(...ys) < speck) continue; // specks
    // Relative moves between points rounded to 0.1 (no drift: each delta is taken between rounded positions)
    const r1 = v => Math.round(v * 10);
    let [px0, py0] = [r1(pts[0][0]), r1(pts[0][1])];
    d += `M${px0 / 10} ${py0 / 10}l`;
    let first = true;
    for (const p of pts.slice(1)) {
      const x = r1(p[0]), y = r1(p[1]), dx = x - px0, dy = y - py0;
      if (!dx && !dy) continue;
      const n = v => (v / 10).toString().replace(/^(-?)0\./, '$1.');
      const sx = n(dx), sy = n(dy);
      d += (first || sx.startsWith('-') ? '' : ' ') + sx + (sy.startsWith('-') ? '' : ' ') + sy;
      first = false; px0 = x; py0 = y;
    }
    d += 'z';
  }
  return d.replace(/(\d)\.0(?=\D)/g, '$1');
}

let other = '', arab = '';
for (const g of groups.values()) { if (g.arab) arab += `<path d="${pathOf(ringsOf(g))}"/>`; else other += pathOf(ringsOf(g)); }

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PROJ.W} ${PROJ.H}">`
  + `<!-- Natural Earth 1:50m (public domain); ArabTides map style -->`
  + `<path fill="#1e4a5e" stroke="#1e4a5e" stroke-width=".4" stroke-linejoin="round" d="${other}"/>`
  + `<g fill="#2f6f73" stroke="#7dd3c8" stroke-opacity=".55" stroke-width=".55" stroke-linejoin="round">${arab}</g></svg>`;
mkdirSync('public/map', { recursive: true });
writeFileSync('public/map/land.svg', svg);
console.log(`public/map/land.svg: ${(svg.length / 1024).toFixed(0)} KB, ${PROJ.W}×${PROJ.H}`);
