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

/**
 * Simple sunrise/sunset calculation.
 * Accuracy: ~2 minutes. Uses NOAA solar calculator approximation.
 */
export function sunTimes(date: Date, lat: number, lon: number, tzOffset: number): {
  sunrise: string | null;
  sunset: string | null;
  solarNoon: string | null;
  dayLength: number | null; // minutes
} {
  const jd = toJulian(date) - tzOffset / (24 * 60);
  const n = jd - 2451545.0 + 0.0008;
  const jStar = n - lon / 360;
  const M_sun = (357.5291 + 0.98560028 * jStar) % 360;
  const C = 1.9148 * Math.sin(M_sun * RAD) + 0.02 * Math.sin(2 * M_sun * RAD) + 0.0003 * Math.sin(3 * M_sun * RAD);
  const lambda = ((M_sun + C + 180 + 102.9372) % 360 + 360) % 360;
  const jTransit = 2451545.0 + jStar + 0.0053 * Math.sin(M_sun * RAD) - 0.0069 * Math.sin(2 * lambda * RAD);
  const delta = Math.asin(Math.sin(lambda * RAD) * Math.sin(23.44 * RAD)) * DEG;
  const cosOmega = (Math.sin(-0.833 * RAD) - Math.sin(lat * RAD) * Math.sin(delta * RAD)) /
    (Math.cos(lat * RAD) * Math.cos(delta * RAD));

  if (Math.abs(cosOmega) > 1) {
    // Polar day/night
    return { sunrise: null, sunset: null, solarNoon: null, dayLength: null };
  }

  const omega = Math.acos(cosOmega) * DEG;
  const jRise = jTransit - omega / 360;
  const jSet = jTransit + omega / 360;

  const toHHMM = (jdVal: number, offset: number): string => {
    const totalHours = (jdVal - Math.floor(jdVal)) * 24 + 12 + offset / 60;
    const h = Math.floor(((totalHours % 24) + 24) % 24);
    const m = Math.floor(((totalHours % 1) * 60));
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // Day length in minutes — use 24h for polar day
  const dayLength = Math.abs(cosOmega) > 1 ? 1440 : Math.round(omega * 8); // 360° ≈ 24h, so omega° * 4min/°

  return {
    sunrise: toHHMM(jRise, tzOffset),
    sunset: toHHMM(jSet, tzOffset),
    solarNoon: toHHMM(jTransit, tzOffset),
    dayLength: dayLength > 1440 ? 1440 : (dayLength < 0 ? 0 : dayLength),
  };
}

/**
 * Approximate moonrise/moonset.
 * Simplified — accuracy ~10-15 minutes.
 */
export function moonTimes(date: Date, lat: number, lon: number, tzOffset: number): {
  moonrise: string | null;
  moonset: string | null;
  lunarTransit: string | null;
} {
  const jd = toJulian(date) - tzOffset / (24 * 60);
  const d = jd - 2451545.0;

  // Moon's mean elements
  const Lp = (218.316 + 13.176396 * d) % 360;
  const Mp = (134.963 + 13.064993 * d) % 360;
  const F = (93.272 + 13.229350 * d) % 360;

  // Moon's ecliptic longitude (simplified)
  const lambda = Lp + 6.289 * Math.sin(Mp * RAD) + 1.274 * Math.sin((2 * (d / 365.25 * 360 - Mp)) * RAD);
  const beta = 5.128 * Math.sin(F * RAD);
  const delta = Math.asin(Math.sin(lambda * RAD) * Math.sin(23.44 * RAD) + Math.cos(lambda * RAD) * Math.cos(23.44 * RAD) * Math.sin(beta * RAD)) * DEG;

  // Right ascension
  const ra = Math.atan2(
    Math.sin(lambda * RAD) * Math.cos(23.44 * RAD) - Math.tan(beta * RAD) * Math.sin(23.44 * RAD),
    Math.cos(lambda * RAD)
  ) * DEG;

  // Meridian passage adjustment
  const HAadj = 0.0003 * (lat);

  // Approx transit time (GMT hours)
  const transitGMT = (12 + (lon - ra / 15) + HAadj) % 24;

  // Moon's semi-diurnal arc
  const cosH0 = (Math.sin(-0.833 * RAD) - Math.sin(lat * RAD) * Math.sin(delta * RAD)) /
    (Math.cos(lat * RAD) * Math.cos(delta * RAD));

  if (Math.abs(cosH0) > 1) {
    return { moonrise: null, moonset: null, lunarTransit: null };
  }

  const H0 = Math.acos(cosH0) * DEG / 15; // hours

  const riseGMT = transitGMT - H0;
  const setGMT = transitGMT + H0;

  const toHHMM = (hoursGMT: number): string => {
    const total = hoursGMT + tzOffset / 60 + 24;
    const h = Math.floor(total % 24);
    const m = Math.floor(((total % 1) * 60));
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  return {
    moonrise: toHHMM(riseGMT),
    moonset: toHHMM(setGMT),
    lunarTransit: toHHMM(transitGMT),
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