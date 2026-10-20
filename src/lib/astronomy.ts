/**
 * ArabTides — Astronomical Engine
 * Moon phase, sun/moon rise/set, solunar periods
 * All calculations are local (no API), using Meeus algorithms
 */

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

/**
 * Approximate moon phase (0-1), illumination (0-1), and age in days.
 * Accuracy: ~1-2 hours. Based on simplified Meeus algorithm.
 */
export function moonPhase(date: Date): {
  phase: number;        // 0 = new, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter
  illumination: number; // 0-1 fraction illuminated
  age: number;         // days since last new moon (0-29.53)
  phaseNameAr: string;
  phaseNameEn: string;
  emoji: string;
} {
  const jd = toJulian(date);
  // Days since J2000.0
  const d = jd - 2451545.0;

  // Mean longitude of sun
  const L = (280.460 + 0.9856474 * d) % 360;
  // Mean anomaly of sun
  const M = (357.528 + 0.9856003 * d) % 360;
  // Mean longitude of moon
  const Lp = (218.316 + 13.176396 * d) % 360;
  // Mean anomaly of moon
  const Mp = (134.963 + 13.064993 * d) % 360;
  // Moon's mean elongation
  const F = (93.272 + 13.229350 * d) % 360;

  // Normalize to 0-360
  const norm = (x: number) => ((x % 360) + 360) % 360;

  // Age in days (approximate)
  let age = norm(Lp - L) * (29.53 / 360);

  // More accurate: use elongation
  const elong = norm(Lp - L);
  age = elong * 29.53058867 / 360;

  // Phase: 0-1 (0=new, 0.5=full)
  const phase = (age / 29.53058867) % 1;

  // Illumination: fraction of moon lit
  const illumination = (1 - Math.cos(elong * RAD)) / 2;

  // Phase name
  let phaseNameAr: string, phaseNameEn: string, emoji: string;
  if (phase < 0.03 || phase > 0.97) {
    phaseNameAr = 'محاق'; phaseNameEn = 'New Moon'; emoji = '🌑';
  } else if (phase < 0.22) {
    phaseNameAr = 'هلال متزايد'; phaseNameEn = 'Waxing Crescent'; emoji = '🌒';
  } else if (phase < 0.28) {
    phaseNameAr = 'تربيع أول'; phaseNameEn = 'First Quarter'; emoji = '🌓';
  } else if (phase < 0.47) {
    phaseNameAr = 'أحدب متزايد'; phaseNameEn = 'Waxing Gibbous'; emoji = '🌔';
  } else if (phase < 0.53) {
    phaseNameAr = 'بدر'; phaseNameEn = 'Full Moon'; emoji = '🌕';
  } else if (phase < 0.72) {
    phaseNameAr = 'أحدب متناقص'; phaseNameEn = 'Waning Gibbous'; emoji = '🌖';
  } else if (phase < 0.78) {
    phaseNameAr = 'تربيع أخير'; phaseNameEn = 'Last Quarter'; emoji = '🌗';
  } else {
    phaseNameAr = 'هلال متناقص'; phaseNameEn = 'Waning Crescent'; emoji = '🌘';
  }

  return { phase, illumination, age, phaseNameAr, phaseNameEn, emoji };
}

function toJulian(date: Date): number {
  let y = date.getUTCFullYear();
  let m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + date.getUTCHours() / 24 + date.getUTCMinutes() / 1440 + date.getUTCSeconds() / 86400;

  if (m <= 2) { y--; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}

// --- Low-precision sun & moon positions (Astronomical Almanac / Meeus ch. 47 main terms) ---

function sunRaDec(jd: number): { ra: number; dec: number } {
  const n = jd - 2451545.0;
  const L = 280.460 + 0.9856474 * n;
  const g = (357.528 + 0.9856003 * n) * RAD;
  const lambda = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * RAD;
  const eps = (23.439 - 0.0000004 * n) * RAD;
  return {
    ra: Math.atan2(Math.cos(eps) * Math.sin(lambda), Math.cos(lambda)) * DEG,
    dec: Math.asin(Math.sin(eps) * Math.sin(lambda)) * DEG,
  };
}

function moonRaDec(jd: number): { ra: number; dec: number } {
  const d = jd - 2451545.0;
  const Lp = 218.316 + 13.176396 * d;
  const Mp = (134.963 + 13.064993 * d) * RAD;
  const F = (93.272 + 13.229350 * d) * RAD;
  const D = (297.850 + 12.190749 * d) * RAD;
  const Ms = (357.529 + 0.985600 * d) * RAD;
  const lambda = (Lp + 6.289 * Math.sin(Mp) + 1.274 * Math.sin(2 * D - Mp) + 0.658 * Math.sin(2 * D)
    + 0.214 * Math.sin(2 * Mp) - 0.186 * Math.sin(Ms) - 0.114 * Math.sin(2 * F)) * RAD;
  const beta = (5.128 * Math.sin(F) + 0.281 * Math.sin(Mp + F) + 0.278 * Math.sin(Mp - F)) * RAD;
  const eps = 23.439 * RAD;
  return {
    ra: Math.atan2(Math.sin(lambda) * Math.cos(eps) - Math.tan(beta) * Math.sin(eps), Math.cos(lambda)) * DEG,
    dec: Math.asin(Math.sin(beta) * Math.cos(eps) + Math.cos(beta) * Math.sin(eps) * Math.sin(lambda)) * DEG,
  };
}

function altitude(body: (jd: number) => { ra: number; dec: number }, jd: number, lat: number, lon: number): number {
  const { ra, dec } = body(jd);
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0);
  const H = (gmst + lon - ra) * RAD;
  return Math.asin(Math.sin(lat * RAD) * Math.sin(dec * RAD) + Math.cos(lat * RAD) * Math.cos(dec * RAD) * Math.cos(H)) * DEG;
}

/** JD of local midnight for the calendar date `date` falls on in the port's timezone */
function localMidnightJD(date: Date, tzOffset: number): number {
  const local = new Date(date.getTime() + tzOffset * 60000);
  const midnightUtcMs = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - tzOffset * 60000;
  return midnightUtcMs / 86400000 + 2440587.5;
}

/**
 * Scan the local day in 5-minute steps for horizon crossings (altitude = h0)
 * and the highest point (transit). Returns hours after local midnight.
 */
function scanDay(body: (jd: number) => { ra: number; dec: number }, jd0: number, lat: number, lon: number, h0: number) {
  const STEP = 5 / 1440;
  let rise: number | null = null, set: number | null = null, transit = 0, maxAlt = -Infinity;
  let prev = altitude(body, jd0, lat, lon) - h0;
  for (let i = 1; i <= 288; i++) {
    const alt = altitude(body, jd0 + i * STEP, lat, lon) - h0;
    if (prev < 0 && alt >= 0 && rise === null) rise = (i - 1 + prev / (prev - alt)) * STEP * 24;
    if (prev >= 0 && alt < 0 && set === null) set = (i - 1 + prev / (prev - alt)) * STEP * 24;
    if (alt > maxAlt) { maxAlt = alt; transit = i * STEP * 24; }
    prev = alt;
  }
  return { rise, set, transit };
}

function hhmm(hours: number | null): string | null {
  if (hours === null) return null;
  const mins = ((Math.round(hours * 60) % 1440) + 1440) % 1440;
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
}

/**
 * Sunrise/sunset for the local calendar day.
 * Accuracy: ~1-2 minutes (standard -0.833° altitude for refraction + solar disc).
 */
/**
 * Exact time of a principal moon phase (Meeus, Astronomical Algorithms ch. 49, main periodic terms;
 * accurate to a few minutes). k = lunations since 2000-01-06, with .0 new, .25 first quarter, .5 full, .75 last quarter.
 */
function principalPhaseTime(k: number): Date {
  const T = k / 1236.85, s = (x: number) => Math.sin(x * RAD), c = (x: number) => Math.cos(x * RAD);
  let jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T * T - 0.00000015 * T ** 3 + 0.00000000073 * T ** 4;
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;
  const M = 2.5534 + 29.1053567 * k - 0.0000014 * T * T;
  const Mp = 201.5643 + 385.81693528 * k + 0.0107582 * T * T + 0.00001238 * T ** 3;
  const F = 160.7108 + 390.67050284 * k - 0.0016118 * T * T - 0.00000227 * T ** 3;
  const Om = 124.7746 - 1.56375588 * k + 0.0020672 * T * T;
  const q = ((k % 1) + 1) % 1;
  if (q === 0 || q === 0.5) {
    const full = q === 0.5;
    jde += (full ? -0.40614 : -0.4072) * s(Mp) + (full ? 0.17302 : 0.17241) * E * s(M) + (full ? 0.01614 : 0.01608) * s(2 * Mp)
      + (full ? 0.01043 : 0.01039) * s(2 * F) + (full ? 0.00734 : 0.00739) * E * s(Mp - M) - (full ? 0.00515 : 0.00514) * E * s(Mp + M)
      + (full ? 0.00209 : 0.00208) * E * E * s(2 * M) - 0.00111 * s(Mp - 2 * F) - 0.00057 * s(Mp + 2 * F) + 0.00056 * E * s(2 * Mp + M)
      - 0.00042 * s(3 * Mp) + 0.00042 * E * s(M + 2 * F) + 0.00038 * E * s(M - 2 * F) - 0.00024 * E * s(2 * Mp - M) - 0.00017 * s(Om);
  } else {
    jde += -0.62801 * s(Mp) + 0.17172 * E * s(M) - 0.01183 * E * s(Mp + M) + 0.00862 * s(2 * Mp) + 0.00804 * s(2 * F)
      + 0.00454 * E * s(Mp - M) + 0.00204 * E * E * s(2 * M) - 0.0018 * s(Mp - 2 * F) - 0.0007 * s(Mp + 2 * F) - 0.0004 * s(3 * Mp)
      - 0.00034 * E * s(2 * Mp - M) + 0.00032 * E * s(M + 2 * F) + 0.00032 * E * s(M - 2 * F) - 0.00028 * E * E * s(Mp + 2 * M)
      + 0.00027 * E * s(2 * Mp + M) - 0.00017 * s(Om);
    const W = 0.00306 - 0.00038 * E * c(M) + 0.00034 * c(Mp) - 0.00002 * c(Mp - M) + 0.00002 * c(Mp + M) + 0.00002 * c(2 * F);
    jde += q === 0.25 ? W : -W;
  }
  return new Date((jde - 2440587.5 - 69 / 86400) * 86400000); // TT → UTC (ΔT ≈ 69 s)
}

/** The next principal phases (new moon, first quarter, full moon, last quarter) after `from`, with their exact times. */
export function nextPrincipalPhases(from: Date, count: number): { date: Date; target: number; nameAr: string; emoji: string }[] {
  const NAMES: Record<number, [string, string]> = { 0: ['محاق', '🌑'], 0.25: ['تربيع أول', '🌓'], 0.5: ['بدر', '🌕'], 0.75: ['تربيع أخير', '🌗'] };
  const yearsSince2000 = (from.getTime() - Date.UTC(2000, 0, 6)) / (365.25 * 86400000);
  let k = Math.floor(yearsSince2000 * 12.3685) - 1; // start a lunation early, then skip past phases
  const out: { date: Date; target: number; nameAr: string; emoji: string }[] = [];
  while (out.length < count) {
    for (const t of [0, 0.25, 0.5, 0.75]) {
      const date = principalPhaseTime(k + t);
      if (date > from && out.length < count) out.push({ date, target: t, nameAr: NAMES[t][0], emoji: NAMES[t][1] });
    }
    k++;
  }
  return out;
}

export function sunTimes(date: Date, lat: number, lon: number, tzOffset: number): {
  sunrise: string | null;
  sunset: string | null;
  solarNoon: string | null;
  dayLength: number | null; // minutes
} {
  const { rise, set, transit } = scanDay(sunRaDec, localMidnightJD(date, tzOffset), lat, lon, -0.833);
  return {
    sunrise: hhmm(rise),
    sunset: hhmm(set),
    solarNoon: hhmm(transit),
    dayLength: rise !== null && set !== null ? Math.round((set - rise) * 60) : null,
  };
}

/**
 * Moonrise/moonset/upper transit for the local calendar day.
 * Accuracy: ~5 minutes. Rise or set can be null — the moon skips one roughly every 29 days.
 */
export function moonTimes(date: Date, lat: number, lon: number, tzOffset: number): {
  moonrise: string | null;
  moonset: string | null;
  lunarTransit: string | null;
} {
  // h0 = +0.125° accounts for lunar parallax minus refraction
  const { rise, set, transit } = scanDay(moonRaDec, localMidnightJD(date, tzOffset), lat, lon, 0.125);
  return {
    moonrise: hhmm(rise),
    moonset: hhmm(set),
    lunarTransit: hhmm(transit),
  };
}

/**
 * Solunar periods for fishing.
 * Major: ~2h around lunar transit and opposite transit
 * Minor: ~1h around moonrise and moonset
 */
export interface SolunarPeriod {
  type: 'major' | 'minor';
  typeAr: string;
  start: string;
  end: string;
  quality: string; // 'excellent', 'good', 'fair', 'poor'
}

export function solunarPeriods(
  moonriseTime: string | null,
  moonsetTime: string | null,
  transitTime: string | null,
  moonPhaseVal: number,
  date: Date
): { periods: SolunarPeriod[]; rating: string; ratingAr: string } {
  const periods: SolunarPeriod[] = [];

  // Opposite transit (12h after transit)
  const oppositeTransit = transitTime ? addHours(transitTime, 12) : null;

  // Major periods: 1h before to 1h after transit and opposite transit
  if (transitTime) {
    periods.push({
      type: 'major',
      typeAr: 'فترة كبرى',
      start: addHours(transitTime, -1),
      end: addHours(transitTime, 1),
      quality: getQuality(moonPhaseVal, 'major'),
    });
  }
  if (oppositeTransit) {
    periods.push({
      type: 'major',
      typeAr: 'فترة كبرى',
      start: addHours(oppositeTransit, -1),
      end: addHours(oppositeTransit, 1),
      quality: getQuality(moonPhaseVal, 'major'),
    });
  }

  // Minor periods: 30min before to 30min after moonrise/moonset
  if (moonriseTime) {
    periods.push({
      type: 'minor',
      typeAr: 'فترة صغرى',
      start: addHours(moonriseTime, -0.5),
      end: addHours(moonriseTime, 0.5),
      quality: getQuality(moonPhaseVal, 'minor'),
    });
  }
  if (moonsetTime) {
    periods.push({
      type: 'minor',
      typeAr: 'فترة صغرى',
      start: addHours(moonsetTime, -0.5),
      end: addHours(moonsetTime, 0.5),
      quality: getQuality(moonPhaseVal, 'minor'),
    });
  }

  // Daily rating based on moon phase
  // Best: new moon and full moon (spring tides → more fish activity)
  let ratingAr: string, rating: string;
  const p = moonPhaseVal;
  if (p < 0.05 || p > 0.95 || (p > 0.45 && p < 0.55)) {
    rating = 'excellent'; ratingAr = 'ممتاز';
  } else if (p < 0.15 || p > 0.85 || (p > 0.35 && p < 0.65)) {
    rating = 'good'; ratingAr = 'جيد';
  } else if (p < 0.25 || p > 0.75) {
    rating = 'fair'; ratingAr = 'متوسط';
  } else {
    rating = 'poor'; ratingAr = 'ضعيف';
  }

  return { periods, rating, ratingAr };
}

function addHours(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h + hours;
  const newH = ((Math.round(total * 2) / 2) % 24 + 24) % 24;
  const newM = Math.round((newH % 1) * 60);
  return `${String(Math.floor(newH)).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

function getQuality(moonPhaseVal: number, periodType: string): string {
  const p = moonPhaseVal;
  // Major periods are best during new/full moon
  if (periodType === 'major') {
    if (p < 0.05 || p > 0.95 || (p > 0.45 && p < 0.55)) return 'excellent';
    if (p < 0.15 || p > 0.85) return 'good';
    return 'fair';
  }
  // Minor periods
  if (p < 0.05 || p > 0.95 || (p > 0.45 && p < 0.55)) return 'good';
  return 'fair';
}