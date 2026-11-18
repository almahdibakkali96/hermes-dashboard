// /map/now.json: the homepage map's live dots (today's tides and rating for every place), fetched by
// src/scripts/ports-map.ts when the map scrolls near the screen. Rebuilt with the site, like the pages.
import { mapPorts, mapRegions } from '../../lib/mapData';
import { PROJ } from '../../lib/mapProjection';

export async function GET() {
  const BASE = import.meta.env.BASE_URL === '/' ? '/' : import.meta.env.BASE_URL + '/';
  const body = { ports: await mapPorts(), regions: mapRegions(), base: BASE, size: [PROJ.W, PROJ.H] };
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
