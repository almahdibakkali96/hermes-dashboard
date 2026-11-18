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
