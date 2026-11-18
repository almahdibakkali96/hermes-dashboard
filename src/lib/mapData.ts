/**
 * The homepage map's data (src/components/PortsMap.astro, src/scripts/ports-map.ts): every place with today's highs and
 * lows and fishing rating, served as /map/now.json (src/pages/map/now.json.ts) so the homepage HTML stays small; the
 * script fetches it when the map scrolls near the screen. mapRegions() is cheap (positions only) and is also used by
 * the component for its first view.
 */
import { allPlaces, isWorld, zoneOf, type Zone } from './regions';
import { project } from './mapProjection';
import { portSea, type SeaId } from './seaNames';
import { countryName } from './countries';
import { dayExtremes, formatTime, getTimezoneOffset, portDay, type Constituent } from './tides';
import { ratingsFrom } from './fishing';

const DAY = 86400000;

// Bigger cities get their label first when names would overlap (Arab ports first, then world cities)
const MAJOR = ['casablanca', 'dubai', 'jeddah', 'alexandria', 'muscat', 'doha', 'kuwait-city', 'tunis', 'algiers', 'beirut',
  'dammam', 'manama', 'aden', 'tripoli-ly', 'abu-dhabi', 'agadir', 'tangier', 'nouakchott', 'djibouti', 'port-sudan', 'aqaba',
  'benghazi', 'salalah', 'hurghada', 'port-said', 'sfax', 'oran', 'latakia', 'mogadishu', 'moroni', 'hodeidah', 'mukalla',
  'istanbul', 'new-york', 'sydney', 'tokyo', 'singapore', 'mumbai', 'cape-town', 'rio-de-janeiro', 'barcelona', 'marseille',
  'miami', 'los-angeles', 'hong-kong', 'bali', 'male', 'karachi', 'lagos', 'dakar', 'lisbon', 'honolulu', 'auckland', 'piraeus',
  'naples', 'brest', 'malaga', 'antalya', 'colombo', 'phuket', 'zanzibar', 'mombasa', 'jakarta', 'manila', 'busan', 'perth',
  'cancun', 'havana', 'panama-city', 'callao', 'valparaiso', 'reykjavik', 'bergen', 'dublin', 'durban', 'kozhikode'];

export const seaOrder: SeaId[] = ['atlantic', 'med', 'red', 'gulf', 'indian'];
export const zoneOrder: Zone[] = ['europe', 'africa', 'asia', 'americas', 'oceania'];

/** Where each place sits on the map and which tab (sea or continent) it belongs to */
export const mapPlaces = allPlaces.map(p => {
  const [x, y] = project(p.lon, p.lat);
  return { p, x: +x.toFixed(1), y: +y.toFixed(1), sea: isWorld(p.id) ? zoneOf(p) : portSea[p.id] };
});

/** Each tab's bounding box (map units); "all" is the Arab world north of 8°N (Comoros left out), "world" every place */
export function mapRegions(): Record<string, number[]> {
  type P = { x: number; y: number };
  const box = (ps: P[]) => [Math.min(...ps.map(p => p.x)), Math.min(...ps.map(p => p.y)), Math.max(...ps.map(p => p.x)), Math.max(...ps.map(p => p.y))];
  const arab = mapPlaces.filter(m => !isWorld(m.p.id));
  const regions: Record<string, number[]> = { all: box(arab.filter(m => m.y < project(0, 8)[1])), world: box(mapPlaces) };
  for (const s of seaOrder) regions[s] = box(mapPlaces.filter(m => m.sea === s));
  for (const z of zoneOrder) regions[z] = box(mapPlaces.filter(m => m.sea === z));
  return regions;
}

/** Every place with today's (and tomorrow's) extremes and today's rating, for the live dots */
export async function mapPorts(now = new Date()) {
  return Promise.all(mapPlaces.map(async ({ p, x, y, sea }) => {
    const data = (await import(`../data/places/${p.id}.json`)).default;
    const cons = data.constituents as Record<string, Constituent>;
    const tz = getTimezoneOffset(data.timezone, now), day = portDay(now, tz);
    const ex = [...dayExtremes(cons, day, tz), ...dayExtremes(cons, new Date(day.getTime() + DAY), tz)];
    const pr = MAJOR.indexOf(p.id);
    return {
      id: p.id, name: p.name_ar, country: countryName(p.country), sea, x, y,
      r: ratingsFrom(cons, day, 1, tz)[0].rating, pr: pr < 0 ? 99 : pr,
      // [minutes since epoch, 1 high | 0 low, local HH:MM]
      ex: ex.map(e => [Math.round(e.time.getTime() / 60000), e.type === 'high' ? 1 : 0, formatTime(e.time, tz)]),
    };
  }));
}
