/**
 * ArabTides — Harmonic Tide Prediction Engine
 * h(t) = Σ f·A·cos(V + u − g) for EOT20 constituents, where
 *   V  = equilibrium argument at time t (Greenwich, from Doodson numbers)
 *   f,u = nodal amplitude factor and phase correction (Schureman formulas)
 *   A,g = EOT20 amplitude (cm) and Greenwich phase lag (degrees)
 * All times are absolute (UTC); EOT20 phases are referenced to Greenwich.
 */

const RAD = Math.PI / 180;

// Doodson multipliers [τ, s, h, p, N', p1] and phase offset (degrees)
const DOODSON: Record<string, { k: number[]; off: number }> = {
  M2:   { k: [2, 0, 0, 0, 0, 0], off: 0 },
  S2:   { k: [2, 2, -2, 0, 0, 0], off: 0 },
  N2:   { k: [2, -1, 0, 1, 0, 0], off: 0 },
  K2:   { k: [2, 2, 0, 0, 0, 0], off: 0 },
  '2N2': { k: [2, -2, 0, 2, 0, 0], off: 0 },
  T2:   { k: [2, 2, -3, 0, 0, 1], off: 0 },
  K1:   { k: [1, 1, 0, 0, 0, 0], off: 90 },
  O1:   { k: [1, -1, 0, 0, 0, 0], off: -90 },
  P1:   { k: [1, 1, -2, 0, 0, 0], off: -90 },
  Q1:   { k: [1, -2, 0, 1, 0, 0], off: -90 },
  J1:   { k: [1, 2, 0, -1, 0, 0], off: 90 },
  S1:   { k: [1, 1, -1, 0, 0, 0], off: 180 },
  M4:   { k: [4, 0, 0, 0, 0, 0], off: 0 },
  MF:   { k: [0, 2, 0, 0, 0, 0], off: 0 },
  MM:   { k: [0, 1, 0, -1, 0, 0], off: 0 },
  SA:   { k: [0, 0, 1, 0, 0, -1], off: 0 },
  SSA:  { k: [0, 0, 2, 0, 0, 0], off: 0 },
};

/** Mean astronomical longitudes (degrees) at time t — Meeus / Simon et al. */
function astroArgs(time: Date) {
  const jd = time.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525;
  const utHours = ((time.getTime() / 3600000) % 24 + 24) % 24;
  const s = 218.3164477 + 481267.88123421 * T;   // moon mean longitude
  const h = 280.46646 + 36000.76983 * T;         // sun mean longitude
  const p = 83.3532465 + 4069.0137287 * T;       // lunar perigee
  const N = 125.04452 - 1934.136261 * T;         // moon ascending node
  const p1 = 282.93768 + 1.71946 * T;            // solar perigee
  const tau = 15 * utHours + h - s;              // mean lunar time at Greenwich
  return { tau, s, h, p, N, p1 };
}

/** f and u from the vector form term2 + i·term1 */
function vec(term1: number, term2: number): { f: number; u: number } {
  return { f: Math.hypot(term1, term2), u: Math.atan2(term1, term2) / RAD };
}

/** Nodal factor f and angle u (degrees) for a constituent, given node N and lunar perigee P longitudes */
function nodal(name: string, N: number, P: number): { f: number; u: number } {
  const n = N * RAD, p2 = 2 * P * RAD;
  const c1 = Math.cos(n), c2 = Math.cos(2 * n), c3 = Math.cos(3 * n);
  const s1 = Math.sin(n), s2 = Math.sin(2 * n), s3 = Math.sin(3 * n);
  const m2 = { f: 1.0004 - 0.0373 * c1 + 0.0002 * c2, u: -2.14 * s1 };
  switch (name) {
    case 'M2': case 'N2': case '2N2': return m2;
    case 'M4': return { f: m2.f * m2.f, u: 2 * m2.u };
    case 'K1': return { f: 1.0060 + 0.1150 * c1 - 0.0088 * c2 + 0.0006 * c3, u: -8.86 * s1 + 0.68 * s2 - 0.07 * s3 };
    case 'O1': case 'Q1': return { f: 1.0089 + 0.1871 * c1 - 0.0147 * c2 + 0.0014 * c3, u: 10.80 * s1 - 1.34 * s2 + 0.19 * s3 };
    case 'K2': return { f: 1.0241 + 0.2863 * c1 + 0.0083 * c2 - 0.0015 * c3, u: -17.74 * s1 + 0.68 * s2 - 0.04 * s3 };
    case 'J1': return vec(-0.227 * s1, 1.0 + 0.169 * c1);
    case 'MF': return vec(-0.04324 * Math.sin(p2) - 0.41465 * s1 - 0.03873 * s2,
                          1.0 + 0.04324 * Math.cos(p2) + 0.41465 * c1 + 0.03873 * c2);
    case 'MM': return vec(-0.0534 * Math.sin(p2) - 0.0219 * Math.sin(p2 - n),
                          1.0 - 0.1308 * c1 - 0.0534 * Math.cos(p2) - 0.0219 * Math.cos(p2 - n));
    default: return { f: 1, u: 0 }; // S2, T2, P1, S1, SA, SSA
  }
}

export interface Constituent {
  amp: number;   // amplitude in cm
  phase: number; // Greenwich phase lag in degrees (g)
}

export interface TidePoint {
  time: Date;
  hours: number;     // hours from local midnight
  height: number;    // tide height in cm relative to mean sea level
}

export interface TideExtreme {
  time: Date;
  hours: number;
  height: number;
  type: 'high' | 'low';
}

/**
 * Predict tide height (cm, relative to mean sea level) at an absolute time.
 */
export function predictHeight(constituents: Record<string, Constituent>, time: Date): number {
  const a = astroArgs(time);
  const args = [a.tau, a.s, a.h, a.p, -a.N, a.p1]; // N' = −N
  let height = 0;
  for (const [name, c] of Object.entries(constituents)) {
    const d = DOODSON[name];
    if (!d) continue;
    let V = d.off;
    for (let i = 0; i < 6; i++) V += d.k[i] * args[i];
    const { f, u } = nodal(name, a.N, a.p);
    height += f * c.amp * Math.cos((V + u - c.phase) * RAD);
  }
  return height;
}

/** UTC instant of local midnight for the calendar day `date` falls on at `timezoneOffset` (minutes east of UTC) */
export function localMidnight(date: Date, timezoneOffset: number): Date {
  const local = new Date(date.getTime() + timezoneOffset * 60000);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - timezoneOffset * 60000);
}

/**
 * Tide curve at 5-minute intervals over the local calendar day (00:00–24:00 inclusive).
 */
export function generateTideCurve(
  constituents: Record<string, Constituent>,
  date: Date,
  timezoneOffset: number = 0
): TidePoint[] {
  const start = localMidnight(date, timezoneOffset).getTime();
  const points: TidePoint[] = [];
  for (let min = 0; min <= 24 * 60; min += 5) {
    const t = new Date(start + min * 60000);
    points.push({ time: t, hours: min / 60, height: predictHeight(constituents, t) });
  }
  return points;
}

/**
 * High and low waters within the curve, refined by parabolic interpolation
 * between the 5-minute samples.
 */
export function findExtremes(points: TidePoint[]): TideExtreme[] {
  const extremes: TideExtreme[] = [];
  for (let i = 1; i < points.length - 1; i++) {
    const y0 = points[i - 1].height, y1 = points[i].height, y2 = points[i + 1].height;
    const isHigh = y1 > y0 && y1 >= y2;
    const isLow = y1 < y0 && y1 <= y2;
    if (!isHigh && !isLow) continue;
    const denom = y0 - 2 * y1 + y2;
    const dx = denom !== 0 ? 0.5 * (y0 - y2) / denom : 0; // offset in samples, within ±0.5
    const stepMs = points[i + 1].time.getTime() - points[i].time.getTime();
    const stepH = points[i + 1].hours - points[i].hours;
    const hours = points[i].hours + dx * stepH;
    if (hours < 0 || hours >= 24) continue;
    extremes.push({
      time: new Date(points[i].time.getTime() + dx * stepMs),
      hours,
      height: y1 - 0.25 * (y0 - y2) * dx,
      type: isHigh ? 'high' : 'low',
    });
  }
  return extremes;
}

/**
 * High and low waters for the local calendar day. Samples 10 minutes past each
 * end of the day so a turn right at midnight is still detected.
 */
export function dayExtremes(
  constituents: Record<string, Constituent>,
  date: Date,
  timezoneOffset: number = 0
): TideExtreme[] {
  const start = localMidnight(date, timezoneOffset).getTime();
  const points: TidePoint[] = [];
  for (let min = -10; min <= 24 * 60 + 10; min += 5) {
    const t = new Date(start + min * 60000);
    points.push({ time: t, hours: min / 60, height: predictHeight(constituents, t) });
  }
  return findExtremes(points);
}

/**
 * Format time as HH:MM (24-hour).
 */
export function formatTime(date: Date, timezoneOffset: number = 0): string {
  const local = new Date(Math.round(date.getTime() / 60000) * 60000 + timezoneOffset * 60 * 1000);
  return local.toISOString().slice(11, 16);
}

/**
 * Get timezone offset in minutes from IANA timezone name.
 * Falls back to UTC if the timezone can't be resolved at build time.
 */
export function getTimezoneOffset(tz: string, date: Date): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    });
    const parts = formatter.formatToParts(date);
    const offsetPart = parts.find(p => p.type === 'timeZoneName');
    if (offsetPart && offsetPart.value.startsWith('GMT')) {
      const sign = offsetPart.value[3] === '-' ? -1 : 1;
      const [h, m] = offsetPart.value.slice(4).split(':').map(Number);
      return sign * (h * 60 + (m || 0));
    }
  } catch {
    // Fallback
  }
  return 0;
}

/**
 * Classify tidal pattern using form factor F = (K1 + O1) / (M2 + S2).
 */
export function classifyTide(constituents: Record<string, Constituent>): {
  type: string;
  typeAr: string;
  formFactor: number;
} {
  const k1 = constituents.K1?.amp || 0;
  const o1 = constituents.O1?.amp || 0;
  const m2 = constituents.M2?.amp || 0;
  const s2 = constituents.S2?.amp || 0;

  const f = m2 + s2 > 0 ? (k1 + o1) / (m2 + s2) : 0;

  let type = 'semidiurnal';
  let typeAr = 'نصف يومي';

  if (f <= 0.25) {
    type = 'semidiurnal';
    typeAr = 'نصف يومي';
  } else if (f <= 1.5) {
    type = 'mixed, mainly semidiurnal';
    typeAr = 'مختلط، نصف يومي غالباً';
  } else if (f <= 3.0) {
    type = 'mixed, mainly diurnal';
    typeAr = 'مختلط، يومي غالباً';
  } else {
    type = 'diurnal';
    typeAr = 'يومي';
  }

  return { type, typeAr, formFactor: parseFloat(f.toFixed(2)) };
}

/**
 * Classify spring/neap condition based on lunar age (0-29.53 days).
 * Spring: new/full moon (±2 days). Neap: first/last quarter (±2 days).
 */
export function classifySpringNeap(lunarAge: number): {
  condition: string;
  conditionAr: string;
} {
  const age = ((lunarAge % 29.53) + 29.53) % 29.53;

  if (age <= 2 || age >= 27.53 || (age >= 13.5 && age <= 15.5)) {
    return { condition: 'spring', conditionAr: 'مد ربيعي (مرتفع)' };
  } else if ((age >= 6.5 && age <= 8.5) || (age >= 20.5 && age <= 22.5)) {
    return { condition: 'neap', conditionAr: 'مد محاقي (منخفض)' };
  }
  return { condition: 'moderate', conditionAr: 'مد معتدل' };
}
