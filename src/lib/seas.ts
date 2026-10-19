/**
 * ArabTides — which sea each port is on, and year-long tide statistics per port.
 */
import placesIndex from '../data/places/places_index.json';
import { dayExtremes, getTimezoneOffset, classifyTide, type Constituent } from './tides';

export type SeaId = 'atlantic' | 'med' | 'red' | 'gulf' | 'indian';

export const seas: Record<SeaId, { name: string; color: string }> = {
  atlantic: { name: 'المحيط الأطلسي', color: '#0ea5e9' },
  med: { name: 'البحر الأبيض المتوسط', color: '#8b5cf6' },
  red: { name: 'البحر الأحمر', color: '#f43f5e' },
  gulf: { name: 'الخليج العربي', color: '#0d9488' },
  indian: { name: 'بحر العرب وخليج عدن والمحيط الهندي', color: '#f59e0b' },
};

export const portSea: Record<string, SeaId> = {
  casablanca: 'atlantic', agadir: 'atlantic', tangier: 'atlantic', nouadhibou: 'atlantic', nouakchott: 'atlantic',
  algiers: 'med', oran: 'med', tunis: 'med', sfax: 'med', 'tripoli-ly': 'med', benghazi: 'med', alexandria: 'med',
  gaza: 'med', beirut: 'med', 'tripoli-lb': 'med', latakia: 'med', tartus: 'med',
  hurghada: 'red', 'port-sudan': 'red', aqaba: 'red', jeddah: 'red', hodeidah: 'red',
  dammam: 'gulf', dubai: 'gulf', doha: 'gulf', manama: 'gulf', 'kuwait-city': 'gulf', 'umm-qasr': 'gulf',
  aden: 'indian', muscat: 'indian', salalah: 'indian', fujairah: 'indian', djibouti: 'indian',
  berbera: 'indian', mogadishu: 'indian', moroni: 'indian',
};

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
}

// On globalThis so every page chunk of the build shares one computation
const g = globalThis as unknown as { __arabtidesYearStats?: Map<string, Promise<PortYearStats[]>> };
const cache = (g.__arabtidesYearStats ??= new Map<string, Promise<PortYearStats[]>>());

/** Year-long stats for every port, computed once per build (pages rendering in parallel share the promise). */
export function yearStats(year: number): Promise<PortYearStats[]> {
  const key = String(year);
  if (!cache.has(key)) cache.set(key, computeYearStats(year));
  return cache.get(key)!;
}

async function computeYearStats(year: number): Promise<PortYearStats[]> {
  const rows: PortYearStats[] = [];
  for (const p of placesIndex as { id: string; name_ar: string; name_en: string; country: string }[]) {
    const port = (await import(`../data/places/${p.id}.json`)).default;
    const cons = port.constituents as Record<string, Constituent>;
    let maxRange = 0, minRange = Infinity, maxRangeDate = '';
    for (let d = new Date(Date.UTC(year, 0, 1)); d.getUTCFullYear() === year; d = new Date(d.getTime() + 86400000)) {
      const tz = getTimezoneOffset(port.timezone, d);
      const ex = dayExtremes(cons, d, tz);
      const hs = ex.filter(e => e.type === 'high'), ls = ex.filter(e => e.type === 'low');
      if (!hs.length || !ls.length) continue;
      const r = Math.max(...hs.map(h => h.height)) - Math.min(...ls.map(l => l.height));
      if (r > maxRange) { maxRange = r; maxRangeDate = d.toISOString().slice(0, 10); }
      if (r < minRange) minRange = r;
    }
    rows.push({
      id: p.id, name_ar: p.name_ar, name_en: p.name_en, country: p.country, sea: portSea[p.id],
      maxRange: Math.round(maxRange), maxRangeDate, minRange: Math.round(minRange),
      tideTypeAr: classifyTide(cons).typeAr,
    });
  }
  rows.sort((a, b) => b.maxRange - a.maxRange);
  return rows;
}
