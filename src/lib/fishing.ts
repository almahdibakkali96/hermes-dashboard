/**
 * ArabTides — the 1–5 fishing rating shown on port pages, the homepage and country pages.
 *
 * Moon score from the lunar age (narrow windows around new and full moon), tide score from the
 * day's range relative to the largest range of the month at that port. The product calendars
 * (products/tide-calendar-2027/build-data.mjs) carry a copy of calcFish: keep the two in step,
 * and the Dart port in app/lib/engine/.
 */
import { dayExtremes, type Constituent, type TideExtreme } from './tides';
import { moonPhase } from './astronomy';

// 700 shades: 4.5:1 on white as text. Index = rating.
export const fishColors = ['', '#dc2626', '#c2410c', '#b45309', '#0f766e', '#15803d'];
export const fishLabels = ['', 'ضعيف', 'دون المتوسط', 'متوسط', 'جيد', 'ممتاز'];
export const fishAdvice = ['', 'يوم غير مناسب للصيد', 'صيد ضعيف — يفضل التأجيل', 'صيد متوسط — قد تحصل على شيء', 'يوم جيد للصيد', 'يوم ممتاز — أفضل وقت للصيد'];

/** Moon score 0–3: new moon (age 0–2 or 28–29.5) and full moon (13.5–16) score highest. */
export function moonScoreFromAge(age: number): number {
  const a = ((age % 29.53) + 29.53) % 29.53;
  if (a <= 2 || a >= 28.0) return 3;
  if (a <= 3.5 || a >= 27.0) return 2;
  if (a <= 5 || a >= 25.5) return 1;
  if (a >= 13.5 && a <= 16.0) return 3;
  if (a >= 12.5 && a <= 17.0) return 2;
  if (a >= 11.5 && a <= 18.0) return 1;
  return 0;
}

/** Rating 1–5 for a day with tide `range` (cm) and `moonAge` (days), against the month's largest range. */
export function calcFish(range: number, moonAge: number, maxRange: number): number {
  const pct = range / (maxRange || 1);
  const tideScore = pct >= 0.8 ? 2 : pct >= 0.5 ? 1 : 0;
  return Math.max(1, Math.min(5, 1 + moonScoreFromAge(moonAge) + tideScore));
}

export interface RangeDay {
  date: Date;        // noon UTC of the day
  day: number;       // day of month
  month: number;     // 0-based
  range: number;     // highest high − lowest low, cm
  moon: ReturnType<typeof moonPhase>;
  extremes: TideExtreme[];
}

/** Every day of a month at a port: its extremes, range and moon. */
export function monthDays(constituents: Record<string, Constituent>, year: number, month: number, tz: number): RangeDay[] {
  return Array.from({ length: new Date(Date.UTC(year, month + 1, 0)).getUTCDate() }, (_, i) => {
    const date = new Date(Date.UTC(year, month, i + 1, 12));
    const extremes = dayExtremes(constituents, date, tz);
    const hs = extremes.filter(e => e.type === 'high'), ls = extremes.filter(e => e.type === 'low');
    const range = hs.length && ls.length ? Math.max(...hs.map(h => h.height)) - Math.min(...ls.map(l => l.height)) : 0;
    return { date, day: i + 1, month, range, moon: moonPhase(date), extremes };
  });
}

export const maxRangeOf = (days: { range: number }[]) => Math.max(...days.map(d => d.range), 1);

/**
 * Ratings for `count` days from `start` (noon UTC of the port's local day), each rated against its
 * own month's largest range — the same numbers as the port page's 7-day list and calendar.
 */
export function ratingsFrom(constituents: Record<string, Constituent>, start: Date, count: number, tz: number): { date: Date; rating: number }[] {
  const months = new Map<string, { days: RangeDay[]; max: number }>();
  const monthOf = (y: number, m: number) => {
    const key = `${y}-${m}`;
    if (!months.has(key)) { const days = monthDays(constituents, y, m, tz); months.set(key, { days, max: maxRangeOf(days) }); }
    return months.get(key)!;
  };
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start.getTime() + i * 86400000);
    const mo = monthOf(d.getUTCFullYear(), d.getUTCMonth());
    const day = mo.days[d.getUTCDate() - 1];
    return { date: d, rating: calcFish(day.range, day.moon.age, mo.max) };
  });
}
