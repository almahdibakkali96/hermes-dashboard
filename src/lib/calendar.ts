/**
 * ArabTides — the 2027 fishing & tide calendar (product id tide-calendar-2027): settings for /calendar and
 * each port's headline numbers for the year, as on page 2 of its PDF.
 *
 * The numbers repeat products/tide-calendar-2027/build-data.mjs (gitignored): every day's range with that
 * day's time zone, rated with calcFish against its own month's largest range. Keep the two in step.
 */
import { dayExtremes, getTimezoneOffset, classifyTide, type Constituent } from './tides';
import { moonPhase } from './astronomy';
import { calcFish } from './fishing';

const env = import.meta.env;

export const CAL = {
  id: 'tide-calendar-2027',
  year: 2027,
  title: 'تقويم الصيد والمد والجزر 2027',
  pages: 19,
  /** false: the page is noindex and left out of the sitemap. Public since 17 Nov 2026 (it replaced the guide in the CTAs). */
  public: true,
  /** Set after the price poll; null → no price shown. */
  price: null as number | null,
  launchPrice: null as number | null,
  currency: 'USD',
  /** Stripe Payment Links (their own, never the guide's 2.99 link). Empty → waitlist mode. */
  launchLink: (env.PUBLIC_STRIPE_CALENDAR_LAUNCH_URL as string | undefined) || '',
  link: (env.PUBLIC_STRIPE_CALENDAR_URL as string | undefined) || '',
  launchPriceEnd: '2026-11-24T23:59:00+03:00',
};

export const CAL_SALES_OPEN = Boolean(CAL.launchLink || CAL.link);

/** Stripe link with the product and port, so the dashboard shows which port sold. */
export function calendarBuyUrl(link: string, portId?: string): string {
  if (!link) return '';
  const ref = portId ? `${CAL.id}-${portId}` : CAL.id;
  return `${link}${link.includes('?') ? '&' : '?'}client_reference_id=${encodeURIComponent(ref.replace(/[^A-Za-z0-9_-]/g, '_'))}`;
}

/** "for <port>": ل attached to the name, and ل + ال → لل (للدار البيضاء, لدبي). */
export const forPort = (name: string) => (name.startsWith('ال') ? 'لل' + name.slice(2) : 'ل' + name);

/** "41 يوماً ممتازاً" with Arabic number agreement: [number, words] so the number can be set in Latin digits. */
export const excellentDaysAr = (n: number): [string, string] =>
  n === 1 ? ['', 'يوم واحد ممتاز'] : n === 2 ? ['', 'يومان ممتازان'] : n <= 10 ? [String(n), 'أيام ممتازة'] : [String(n), 'يوماً ممتازاً'];

export const monthsAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export interface YearSummary {
  yearMax: number;     // largest daily range of the year, cm
  maxMonth: number;    // 0-based month of that range
  n5: number;          // days rated 5/5
  n4: number;          // days rated 4/5
  bestMonth: number;   // 0-based, most 5/5 (×2) and 4/5 days
  tideType: string;    // Arabic tide type
  microTidal: boolean; // largest range under 50 cm: the rating leans on the moon
}

const DAY = 86400000;

// On globalThis so /calendar and every port page of one build share each port's computation (~200 ms a port)
const g = globalThis as unknown as { __arabtidesYearSummary?: Map<string, YearSummary> };
const summaries = (g.__arabtidesYearSummary ??= new Map<string, YearSummary>());

/** yearSummary for a port, computed once per build. */
export function portYearSummary(id: string, constituents: Record<string, Constituent>, timezone: string, year = CAL.year): YearSummary {
  const key = `${id}-${year}`;
  if (!summaries.has(key)) summaries.set(key, yearSummary(constituents, timezone, year));
  return summaries.get(key)!;
}

export function yearSummary(constituents: Record<string, Constituent>, timezone: string, year = CAL.year): YearSummary {
  const days: { m: number; range: number; age: number; r?: number }[] = [];
  for (let t = Date.UTC(year, 0, 1, 12); new Date(t).getUTCFullYear() === year; t += DAY) {
    const d = new Date(t);
    const ex = dayExtremes(constituents, d, getTimezoneOffset(timezone, d));
    const hs = ex.filter(e => e.type === 'high'), ls = ex.filter(e => e.type === 'low');
    const range = hs.length && ls.length ? Math.max(...hs.map(e => e.height)) - Math.min(...ls.map(e => e.height)) : 0;
    days.push({ m: d.getUTCMonth(), range, age: moonPhase(d).age });
  }
  const score = Array(12).fill(0);
  for (let m = 0; m < 12; m++) {
    const md = days.filter(x => x.m === m), max = Math.max(...md.map(x => x.range), 1);
    md.forEach(x => { x.r = calcFish(x.range, x.age, max); score[m] += x.r === 5 ? 2 : x.r === 4 ? 1 : 0; });
  }
  const top = days.reduce((a, b) => (b.range > a.range ? b : a));
  const yearMax = Math.round(top.range);
  return {
    yearMax, maxMonth: top.m,
    n5: days.filter(x => x.r === 5).length,
    n4: days.filter(x => x.r === 4).length,
    bestMonth: score.indexOf(Math.max(...score)),
    tideType: classifyTide(constituents).typeAr,
    microTidal: yearMax < 50,
  };
}
