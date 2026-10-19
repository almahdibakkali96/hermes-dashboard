/**
 * ArabTides — Prayer Times & Hijri Calendar
 * Local computation, no API. Uses Umm al-Qura method (default for Arab ports).
 */

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface HijriDate {
  year: number;
  month: number;
  day: number;
  monthAr: string;
  monthEn: string;
  formatted: string;
}

// Hijri month names
const HIJRI_MONTHS_AR = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
];

const HIJRI_MONTHS_EN = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Ula', 'Jumada al-Akhirah', 'Rajab', 'Shaban',
  'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah',
];

/**
 * Calculate prayer times using Umm al-Qura method.
 * Reference: http://praytimes.org
 */
export function calculatePrayerTimes(
  date: Date,
  lat: number,
  lon: number,
  tzOffset: number,
  method: string = 'UmmAlQura'
): PrayerTimes {
  const jd = toJulian(date) - lon / (15 * 24);
  const d = jd - 2451545.0;

  // Solar declination
  const g = (357.529 + 0.98560028 * d) % 360;
  const q = (280.459 + 0.98564736 * d) % 360;
  const L = (q + 1.915 * Math.sin(g * RAD) + 0.020 * Math.sin(2 * g * RAD)) % 360;
  const e = 23.439 - 0.00000036 * d;
  const delta = Math.asin(Math.sin(e * RAD) * Math.sin(L * RAD)) * DEG;
  const RA = Math.atan2(Math.cos(e * RAD) * Math.sin(L * RAD), Math.cos(L * RAD)) * DEG;

  // Equation of time
  const EqT = q / 15 - RA / 15;

  // Dhuhr (solar noon in local time)
  const dhuhrTime = 12 + tzOffset / 60 - lon / 15 - EqT;

  // Asr shadow factor (Shafi: 1, Hanafi: 2)
  const asrFactor = 1;
  const asrAlt = Math.atan(1 / (asrFactor + Math.tan(Math.abs(lat - delta) * RAD))) * DEG;

  // Prayer angle configurations
  const methods: Record<string, { fajr: number; isha: number }> = {
    UmmAlQura: { fajr: 18.5, isha: 90 }, // 90 min after maghrib
    MWL: { fajr: 18, isha: 17 },
    Egyptian: { fajr: 19.5, isha: 17.5 },
    Karachi: { fajr: 18, isha: 18 },
  };

  const angles = methods[method] || methods.UmmAlQura;

  // Helper: compute time for a given sun altitude
  const computeTime = (alt: number, isAsr = false): number => {
    const targetAlt = isAsr ? asrAlt : -alt;
    const cosH = (Math.sin(targetAlt * RAD) - Math.sin(lat * RAD) * Math.sin(delta * RAD)) /
      (Math.cos(lat * RAD) * Math.cos(delta * RAD));
    if (Math.abs(cosH) > 1) return isAsr ? dhuhrTime + 1 : dhuhrTime - 1;
    const H = Math.acos(cosH) * DEG / 15;
    return isAsr ? dhuhrTime + H : dhuhrTime - H;
  };

  const fmt = (hours: number): string => {
    const h = ((Math.floor(hours) % 24) + 24) % 24;
    const m = Math.round((hours % 1) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const fajr = computeTime(angles.fajr);
  const sunrise = computeTime(0.833);
  const dhuhr = dhuhrTime;
  const asr = computeTime(0, true);
  const maghrib = computeTime(0.833 + 0.0347 * Math.sqrt(0)); // sea level
  // Isha: Umm al-Qura uses fixed 90 min after maghrib
  const ishaTime = method === 'UmmAlQura' ? maghrib + 1.5 : computeTime(angles.isha);

  return {
    fajr: fmt(fajr),
    sunrise: fmt(sunrise),
    dhuhr: fmt(dhuhr),
    asr: fmt(asr),
    maghrib: fmt(maghrib - 1/60), // -1 min safety margin
    isha: fmt(ishaTime),
  };
}

/**
 * Convert Gregorian date to Hijri (approximate, Umm al-Qura).
 * Accuracy: ±1 day. Uses Kuwaiti algorithm.
 */
export function gregorianToHijri(date: Date): HijriDate {
  const jd = Math.floor(toJulian(date)) + 0.5;
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  return {
    year,
    month: month + 1,
    day,
    monthAr: HIJRI_MONTHS_AR[month],
    monthEn: HIJRI_MONTHS_EN[month],
    formatted: `${day} ${HIJRI_MONTHS_AR[month]} ${year} هـ`,
  };
}

function toJulian(date: Date): number {
  let y = date.getUTCFullYear();
  let m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + date.getUTCHours() / 24 + date.getUTCMinutes() / 1440;
  if (m <= 2) { y--; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}