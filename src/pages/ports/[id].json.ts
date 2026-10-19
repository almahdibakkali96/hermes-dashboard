// /ports/{id}.json — machine-readable 7-day forecast for agents and tools
import placesIndex from '../../data/places/places_index.json';
import { dayExtremes, getTimezoneOffset, classifyTide, formatTime, type Constituent } from '../../lib/tides';
import { moonPhase } from '../../lib/astronomy';
import { countryName } from '../../lib/countries';

export function getStaticPaths() {
  return placesIndex.map((p: { id: string }) => ({ params: { id: p.id } }));
}

const BASE = (import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL);

export async function GET({ params, site }: { params: { id: string }; site: URL | undefined }) {
  const port = (await import(`../../data/places/${params.id}.json`)).default;
  const cons = port.constituents as Record<string, Constituent>;
  const now = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() + i * 86400000);
    const tz = getTimezoneOffset(port.timezone, d);
    const ex = dayExtremes(cons, d, tz);
    const m = moonPhase(d);
    return {
      date: new Date(d.getTime() + tz * 60000).toISOString().slice(0, 10),
      utc_offset_minutes: tz,
      tides: ex.map(e => ({ type: e.type, time_local: formatTime(e.time, tz), time_utc: e.time.toISOString(), height_cm: Math.round(e.height) })),
      moon: { phase_ar: m.phaseNameAr, phase_en: m.phaseNameEn, illumination: +m.illumination.toFixed(2) },
    };
  });
  const body = {
    port: { id: port.id, name_ar: port.name_ar, name_en: port.name_en, country: port.country, country_ar: countryName(port.country), lat: port.lat, lon: port.lon, timezone: port.timezone },
    page: `${site?.origin || 'https://www.arabtides.com'}${BASE}/ports/${port.id}`,
    generated_utc: now.toISOString(),
    tide_type_ar: classifyTide(cons).typeAr,
    datum: 'mean sea level (heights in cm; negative = below MSL)',
    source: 'EOT20 ocean tide model, Hart-Davis et al. 2021, doi:10.17882/79489, CC BY 4.0 — computed by ArabTides',
    disclaimer: 'Astronomical estimate. Not official harbour predictions. Not for navigation.',
    days,
  };
  return new Response(JSON.stringify(body, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
