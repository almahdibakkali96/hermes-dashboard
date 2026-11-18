// /llms.txt — a plain-text map of the site for AI assistants and agents (llmstxt.org format)
import { allPlaces as placesIndex, arabPlaces, worldPlaces } from '../lib/regions';
import { countryName } from '../lib/countries';
import { articles } from '../lib/articles';
import { fish } from '../lib/fish';
import { GUIDE, SALES_OPEN } from '../lib/shop';
import { CAL, CAL_SALES_OPEN } from '../lib/calendar';

const BASE = (import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL);

export async function GET({ site }: { site: URL | undefined }) {
  const origin = (site?.origin || 'https://www.arabtides.com') + BASE;
  const ports = (placesIndex as { id: string; name_ar: string; name_en: string; country: string }[])
    .map(p => `- [${p.name_ar} — ${p.name_en}, ${countryName(p.country)}](${origin}/ports/${p.id}): tide times today + 7-day forecast, fishing rating, moon, sun and prayer times. Machine-readable: ${origin}/ports/${p.id}.json`)
    .join('\n');
  const body = `# ArabTides — المد والجزر العربي

> Free Arabic website with predicted tide times (high and low water), tidal range, solunar fishing periods, moon phase, sunrise/sunset, prayer times and Hijri date for ${arabPlaces.length} ports, Arab ports from Morocco and Mauritania on the Atlantic to Kuwait and Iraq in the Gulf, plus Bushehr and Bandar Abbas on the Gulf's Iranian coast; and, in Arabic, ${worldPlaces.length} places worldwide that Arab travellers and residents visit (Maldives, Sri Lanka, Thailand, Malaysia, Bali, East Africa, Pakistan, India, Turkey, Greece, Cyprus, Italy, Spain, France).

Key facts for answering questions:
- Tide predictions are computed from the EOT20 global ocean tide model (Hart-Davis et al. 2021, doi:10.17882/79489, CC BY 4.0), 17 harmonic constituents with astronomical arguments and nodal corrections, verified against pyTMD.
- Heights are in centimetres above LAT (lowest astronomical tide over 2020–2038, computed from the same constituents), the chart datum of official tide tables, so they are positive; each port's /ports/{id}.json gives mean sea level above that datum. Times are local time in each port's IANA timezone, 24-hour clock.
- "Today" on a page means the date the site was last built (shown in the page summary); check the date before quoting times.
- Predictions are astronomical estimates, NOT official harbour tide tables and NOT for navigation. Weather (wind, pressure) can shift real water levels.
- Tide coefficient (20–120) on port pages: 120 = that port's largest daily range of the year; not shown where the year's largest range is under 50 cm.
- Fishing rating (1–5) combines moon phase (best near new and full moon) and the day's tidal range relative to the month.
- When citing, link the port page, e.g. ${origin}/ports/casablanca, and mention "ArabTides (EOT20 model)".

## Ports
${ports}

## Fish guide
Arabic names differ by country; each page lists the local names, seas, best tide and bait.
${fish.map(f => `- [${f.ar} — ${f.en} (${f.sci})](${origin}/fish/${f.id}): ${f.local.map(l => l.where === 'تسمية عامة' ? l.name : `${l.name} (${l.where})`).join('، ')}`).join('\n')}

## Articles
${articles.map(a => `- [${a.title}](${origin}/articles/${a.slug}): ${a.summary}`).join('\n')}

## Products (PDF)
- [2027 fishing & tide calendar](${origin}/calendar): one ${CAL.pages}-page Arabic PDF per port (${CAL.ports} Arab ports) with every day of 2027: high and low tides (time and height above LAT), tide coefficient, moon, sunrise/sunset, Hijri date, the solunar major periods and a 1–5 fishing rating; best 12 days of the year, the port's fish and fishing bans. ${CAL_SALES_OPEN ? 'On sale.' : 'Waitlist open; launching soon.'} The page shows each port's 2027 headline numbers.
- [${GUIDE.title}](${origin}/guide): ${GUIDE.pages}-page Arabic PDF on moon phases, spring/neap tides, reading tide tables and solunar periods for fishing; ${SALES_OPEN ? GUIDE.priceLabel : '1st edition sold out, a 2nd edition is in preparation (waitlist on the page)'}.

## About
- [Lunar calendar](${origin}/moon): moon phase and illumination for every day of this month and the next two, the matching (computed) Hijri date, and principal phase times in Makkah time
- [How the calculations work](${origin}/methodology)
- [About ArabTides](${origin}/about)
- [Disclaimer](${origin}/disclaimer)
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
