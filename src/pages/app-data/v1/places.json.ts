// /app-data/v1/places.json: everything the ArabTides app needs to compute tides, sun, moon and fishing ratings on the
// phone, offline, for every place: names for search, country, region, coordinates, tidal constants and each time
// zone's UTC-offset changes. The app (private repo arabtides-app) runs verbatim copies of src/lib's engine on it.
// Built on every deploy (Vercel's Node has current tz data: an old Node puts Morocco 1 h off).
// v1 is a contract with installed apps: add fields freely, but never rename or remove one; make /v2 for that.
import { createHash } from 'node:crypto';
import { allPlaces, zoneOf, zoneNames } from '../../../lib/regions';
import { countryName } from '../../../lib/countries';
import { altNamesAr, frenchName, countryAltName } from '../../../lib/portNames';

const FROM = Date.UTC(2025, 0, 1), TO = Date.UTC(2041, 0, 1), DAY = 86400000;

/** Minutes east of UTC in a zone at `ms` (same method as getTimezoneOffset in src/lib/tides.ts) */
function offset(fmt: Intl.DateTimeFormat, ms: number): number {
  const v = fmt.formatToParts(new Date(ms)).find(p => p.type === 'timeZoneName')!.value;
  if (v === 'GMT') return 0;
  const sign = v[3] === '-' ? -1 : 1;
  const [h, m] = v.slice(4).split(':').map(Number);
  return sign * (h * 60 + (m || 0));
}

/** [[utcMs, minutes], …]: the offset in force from each instant on. Daily scan, then bisection to the minute. */
function transitions(tz: string): [number, number][] {
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' });
  const out: [number, number][] = [[FROM, offset(fmt, FROM)]];
  for (let t = FROM + DAY; t < TO; t += DAY) {
    const cur = out[out.length - 1][1];
    if (offset(fmt, t) === cur) continue;
    let lo = t - DAY, hi = t; // the change is in (lo, hi]
    while (hi - lo > 60000) {
      const mid = lo + Math.floor((hi - lo) / 120000) * 60000;
      if (offset(fmt, mid) === cur) lo = mid; else hi = mid;
    }
    out.push([hi, offset(fmt, hi)]);
  }
  return out;
}

export async function GET() {
  const zones: Record<string, [number, number][]> = {};
  const places = [];
  for (const p of allPlaces) {
    const full = (await import(`../../../data/places/${p.id}.json`)).default;
    zones[full.timezone] ??= transitions(full.timezone);
    const c: Record<string, [number, number]> = {};
    for (const [k, v] of Object.entries(full.constituents as Record<string, { amp: number; phase: number }>)) c[k] = [v.amp, v.phase];
    const world = p.region === 'world';
    places.push({
      id: p.id,
      name_ar: p.name_ar,
      name_en: p.name_en,
      name_fr: frenchName(p.id) ?? null,
      alt_ar: altNamesAr(p.id, p.name_ar),
      country: p.country,
      country_ar: countryName(p.country),
      country_alt_ar: countryAltName(p.country) ?? null,
      region: world ? 'world' : 'arab',
      zone: world ? zoneOf(p) : null,
      lat: p.lat,
      lon: p.lon,
      tz: full.timezone,
      c,
    });
  }
  const data = { zones, places };
  const version = createHash('sha256').update(JSON.stringify(data)).digest('hex').slice(0, 16);
  const body = {
    format: 1,
    version, // changes only when the data changes: the app downloads the file again only then
    generated_utc: new Date().toISOString(),
    tzdata: process.versions.tz ?? null,
    zones_from_utc: new Date(FROM).toISOString(),
    zones_to_utc: new Date(TO).toISOString(),
    zone_names_ar: zoneNames,
    units: 'c: {constituent: [amplitude cm, phase degrees]}; Z0 = mean sea level above LAT (chart datum), cm. zones: {tz: [[utc ms, minutes east of UTC], …]}',
    source: 'EOT20 ocean tide model, Hart-Davis et al. 2021, doi:10.17882/79489, CC BY 4.0 — computed by ArabTides',
    ...data,
  };
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
