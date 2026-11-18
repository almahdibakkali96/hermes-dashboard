/**
 * ArabTides — Arab ports vs places worldwide. World places (places_index entries with "region": "world") get port and
 * country pages and appear in search, but not in Arab-only lists: the homepage map and port list, the 2027 calendar,
 * Arab-sea articles and the "63 Arab ports" counts. They have no fish list (the fish guide covers Arab seas only).
 */
import placesIndex from '../data/places/places_index.json';

export interface Place { id: string; name_ar: string; name_en: string; country: string; lat: number; lon: number; region?: string; timezone?: string }

export const allPlaces = placesIndex as Place[];
export const arabPlaces = allPlaces.filter(p => p.region !== 'world');
export const worldPlaces = allPlaces.filter(p => p.region === 'world');
const worldIds = new Set(worldPlaces.map(p => p.id));
export const isWorld = (id: string) => worldIds.has(id);
/** Arab ports only, as in the copy and the Reels (Bushehr and Bandar Abbas are on the site but not counted) */
export const arabPortCount = arabPlaces.filter(p => p.country !== 'IR').length;

/** Continent tab of a world place on the homepage map and in the «حول العالم» section */
export type Zone = 'europe' | 'africa' | 'asia' | 'americas' | 'oceania';
export const zoneNames: Record<Zone, string> = { europe: 'أوروبا', africa: 'أفريقيا', asia: 'آسيا', americas: 'الأمريكتان', oceania: 'أستراليا والمحيط الهادئ' };
const ZONE: Record<string, Zone> = {};
for (const c of 'GB IE FR ES PT IT MT GR HR ME AL TR CY UA BG RO GE NL BE DE DK SE NO FI PL EE IS'.split(' ')) ZONE[c] = 'europe';
for (const c of 'SN GM GN SL LR CI GH TG BJ NG CM GQ ST GA CG AO NA ZA MZ MG TZ KE CV RE ER SC MU'.split(' ')) ZONE[c] = 'africa';
for (const c of 'MV LK TH MY ID IN PK BD SG PH VN KH HK CN TW KR JP'.split(' ')) ZONE[c] = 'asia';
for (const c of 'US CA MX CU DO PR BS BB PA CR CO VE BR AR UY CL PE EC'.split(' ')) ZONE[c] = 'americas';
for (const c of 'AU NZ FJ NC PF'.split(' ')) ZONE[c] = 'oceania';
export function zoneOf(p: { country: string; lon: number }): Zone {
  if (p.country === 'RU') return p.lon > 60 ? 'asia' : 'europe';
  if (p.country === 'US' && p.lon < -140) return 'oceania'; // Hawaii
  return ZONE[p.country] ?? 'asia';
}
