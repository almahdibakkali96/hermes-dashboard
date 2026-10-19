/**
 * ArabTides — Harmonic Tide Prediction Engine
 * Implements h(t) = Σ f·A·cos(ωt + V + u − g) for EOT20 constituents
 */

// Angular speeds in degrees per mean solar hour (Schureman)
const SPEEDS: Record<string, number> = {
  '2N2': 27.8953548,
  J1: 15.5854433,
  K1: 15.0410686,
  K2: 30.0821373,
  M2: 28.9841042,
  M4: 57.9682084,
  MF: 1.0980331,
  MM: 0.5443747,
  N2: 28.4397295,
  O1: 13.9430356,
  P1: 14.9589314,
  Q1: 13.3986609,
  S1: 15.0,
  S2: 30.0,
  SA: 0.0410686,
  SSA: 0.0821373,
  T2: 29.9589333,
};

// Equilibrium arguments V0 at epoch (approximate, 2026-01-01 00:00 UTC)
// Derived from astronomical longitudes for 2026
const V0_EPOCH: Record<string, number> = {
  '2N2': 310.2,
  J1: 198.7,
  K1: 219.3,
  K2: 345.8,
  M2: 235.4,
  M4: 110.8,
  MF: 178.5,
  MM: 142.6,
  N2: 197.1,
  O1: 143.2,
  P1: 341.6,
  Q1: 82.4,
  S1: 180.0,
  S2: 0.0,
  SA: 280.0,
  SSA: 140.0,
  T2: 15.6,
};

// Nodal factor f (approximate for 2026 — varies slowly over 18.6 years)
const NODAL_F: Record<string, number> = {
  '2N2': 0.97,
  J1: 1.06,
  K1: 0.92,
  K2: 0.88,
  M2: 1.04,
  M4: 1.04,
  MF: 1.08,
  MM: 0.94,
  N2: 0.97,
  O1: 1.12,
  P1: 0.92,
  Q1: 1.12,
  S1: 1.0,
  S2: 1.0,
  SA: 1.0,
  SSA: 1.0,
  T2: 0.97,
};

// Nodal angle u in degrees (approximate for 2026)
const NODAL_U: Record<string, number> = {
  '2N2': 3.2,
  J1: -8.1,
  K1: 8.5,
  K2: 11.3,
  M2: -2.8,
  M4: -5.6,
  MF: -4.2,
  MM: 1.5,
  N2: 3.2,
  O1: -10.4,
  P1: 8.5,
  Q1: -10.4,
  S1: 0.0,
  S2: 0.0,
  SA: 0.0,
  SSA: 0.0,
  T2: 3.2,
};

export interface Constituent {
  amp: number;   // amplitude in cm
  phase: number; // phase lag in degrees (g)
}

export interface TidePoint {
  time: Date;
  hours: number;     // hours from start
  height: number;    // tide height in cm (relative)
}

export interface TideExtreme {
  time: Date;
  hours: number;
  height: number;
  type: 'high' | 'low';
}

/**
 * Predict tide height at a given time using harmonic constituents.
 * h(t) = Σ f·A·cos(ωt + V + u − g)
 */
export function predictHeight(
  constituents: Record<string, Constituent>,
  time: Date,
  refTime: Date
): number {
  const tHours = (time.getTime() - refTime.getTime()) / (1000 * 60 * 60);
  let height = 0;

  for (const [name, c] of Object.entries(constituents)) {
    const speed = SPEEDS[name];
    const v0 = V0_EPOCH[name];
    const f = NODAL_F[name] || 1;
    const u = NODAL_U[name] || 0;

    if (!speed && v0 === undefined) continue;

    const angle = (speed * tHours + v0 + u - c.phase) * (Math.PI / 180);
    height += f * c.amp * Math.cos(angle);
  }

  return height;
}

/**
 * Generate a tide curve at 5-minute intervals for a given date.
 */
export function generateTideCurve(
  constituents: Record<string, Constituent>,
  date: Date,
  timezoneOffset: number = 0
): TidePoint[] {
  const points: TidePoint[] = [];
  // Start at midnight local time
  const localDate = new Date(date);
  localDate.setHours(0, 0, 0, 0);
  const refTime = new Date(localDate.getTime() - timezoneOffset * 60 * 1000);

  for (let min = 0; min < 24 * 60; min += 5) {
    const t = new Date(refTime.getTime() + min * 60 * 1000);
    points.push({
      time: t,
      hours: min / 60,
      height: predictHeight(constituents, t, refTime),
    });
  }

  return points;
}

/**
 * Find high and low tide extremes from a tide curve.
 */
export function findExtremes(points: TidePoint[]): TideExtreme[] {
  const extremes: TideExtreme[] = [];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1].height;
    const curr = points[i].height;
    const next = points[i + 1].height;

    if (curr > prev && curr > next) {
      extremes.push({
        time: points[i].time,
        hours: points[i].hours,
        height: curr,
        type: 'high',
      });
    } else if (curr < prev && curr < next) {
      extremes.push({
        time: points[i].time,
        hours: points[i].hours,
        height: curr,
        type: 'low',
      });
    }
  }

  return extremes;
}

/**
 * Format time as HH:MM (24-hour).
 */
export function formatTime(date: Date, timezoneOffset: number = 0): string {
  const local = new Date(date.getTime() + timezoneOffset * 60 * 1000);
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