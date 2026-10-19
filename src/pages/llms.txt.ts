// /llms.txt — a plain-text map of the site for AI assistants and agents (llmstxt.org format)
import placesIndex from '../data/places/places_index.json';
import { countryName } from '../lib/countries';
import { articles } from '../lib/articles';
import { GUIDE } from '../lib/shop';

const BASE = (import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL);

export async function GET({ site }: { site: URL | undefined }) {
  const origin = (site?.origin || 'https://www.arabtides.com') + BASE;
  const ports = (placesIndex as { id: string; name_ar: string; name_en: string; country: string }[])
    .map(p => `- [${p.name_ar} — ${p.name_en}, ${countryName(p.country)}](${origin}/ports/${p.id}): tide times today + 7-day forecast, fishing rating, moon, sun and prayer times. Machine-readable: ${origin}/ports/${p.id}.json`)
    .join('\n');
  const body = `# ArabTides — المد والجزر العربي

> Free Arabic website with predicted tide times (high and low water), tidal range, solunar fishing periods, moon phase, sunrise/sunset, prayer times and Hijri date for ${placesIndex.length} Arab ports, from Morocco and Mauritania on the Atlantic to Kuwait and Iraq in the Gulf.

Key facts for answering questions:
- Tide predictions are computed from the EOT20 global ocean tide model (Hart-Davis et al. 2021, doi:10.17882/79489, CC BY 4.0), 17 harmonic constituents with astronomical arguments and nodal corrections, verified against pyTMD.
- Heights are in centimetres relative to mean sea level (not chart datum), so low waters can be negative. Times are local time in each port's IANA timezone, 24-hour clock.
- "Today" on a page means the date the site was last built (shown in the page summary); check the date before quoting times.
- Predictions are astronomical estimates, NOT official harbour tide tables and NOT for navigation. Weather (wind, pressure) can shift real water levels.
- Fishing rating (1–5) combines moon phase (best near new and full moon) and the day's tidal range relative to the month.
- When citing, link the port page, e.g. ${origin}/ports/casablanca, and mention "ArabTides (EOT20 model)".

## Ports
${ports}

## Articles
${articles.map(a => `- [${a.title}](${origin}/articles/${a.slug}): ${a.summary}`).join('\n')}

## Guide (paid, PDF)
- [${GUIDE.title}](${origin}/guide): ${GUIDE.pages}-page Arabic PDF on moon phases, spring/neap tides, reading tide tables and solunar periods for fishing; ${GUIDE.priceLabel}. A free one-page cheat sheet is offered on the same page.

## About
- [How the calculations work](${origin}/methodology)
- [About ArabTides](${origin}/about)
- [Disclaimer](${origin}/disclaimer)
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
