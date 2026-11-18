/**
 * ArabTides — which sea each port is on, and year-long tide statistics per port.
 */
import { allPlaces, isWorld } from './regions';
import { dayExtremes, getTimezoneOffset, classifyTide, type Constituent } from './tides';

import { seas, portSea, type SeaId } from './seaNames';
export { seas, portSea, type SeaId };

export interface PortYearStats {
  id: string;
  name_ar: string;
  name_en: string;
  country: string;
  sea: SeaId;
  maxRange: number;      // cm — largest daily (highest high − lowest low) in the year
  maxRangeDate: string;  // YYYY-MM-DD
  minRange: number;      // cm — smallest daily range (deep neap)
  tideTypeAr: string;
  world: boolean;        // a worldwide place (src/lib/regions.ts), not an Arab port
}

// On globalThis so every page chunk of the build shares one computation
const g = globalThis as unknown as { __arabtidesYearStats?: Map<string, Promise<PortYearStats[]>> };
const cache = (g.__arabtidesYearStats ??= new Map<string, Promise<PortYearStats[]>>());

/** Arab ports only: for articles and rankings about the Arab world */
export async function arabYearStats(year: number): Promise<PortYearStats[]> {
  return (await yearStats(year)).filter(r => !r.world);
}

/** Year-long stats for every place, computed once per build (pages rendering in parallel share the promise). */
export function yearStats(year: number): Promise<PortYearStats[]> {
  const key = String(year);
  if (!cache.has(key)) cache.set(key, computeYearStats(year));
  return cache.get(key)!;
}

async function computeYearStats(year: number): Promise<PortYearStats[]> {
  const rows: PortYearStats[] = [];
  for (const p of allPlaces) {
    const port = (await import(`../data/places/${p.id}.json`)).default;
    const cons = port.constituents as Record<string, Constituent>;
    let maxRange = 0, minRange = Infinity, maxRangeDate = '';
    // Noon UTC: the same local date for every offset from −12 to +12 (midnight UTC is the previous day west of UTC)
    for (let d = new Date(Date.UTC(year, 0, 1, 12)); d.getUTCFullYear() === year; d = new Date(d.getTime() + 86400000)) {
      const tz = getTimezoneOffset(port.timezone, d);
      const ex = dayExtremes(cons, d, tz);
      const hs = ex.filter(e => e.type === 'high'), ls = ex.filter(e => e.type === 'low');
      if (!hs.length || !ls.length) continue;
      const r = Math.max(...hs.map(h => h.height)) - Math.min(...ls.map(l => l.height));
      if (r > maxRange) { maxRange = r; maxRangeDate = d.toISOString().slice(0, 10); }
      if (r < minRange) minRange = r;
    }
    rows.push({
      id: p.id, name_ar: p.name_ar, name_en: p.name_en, country: p.country, sea: portSea[p.id] ?? 'world',
      maxRange: Math.round(maxRange), maxRangeDate, minRange: Math.round(minRange),
      tideTypeAr: classifyTide(cons).typeAr, world: isWorld(p.id),
    });
  }
  rows.sort((a, b) => b.maxRange - a.maxRange);
  return rows;
}
