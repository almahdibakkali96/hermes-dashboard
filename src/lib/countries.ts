/**
 * ArabTides — shared country names and coordinate formatting
 */

export const countryNames: Record<string, string> = {
  AE: 'الإمارات', BH: 'البحرين', DJ: 'جيبوتي', DZ: 'الجزائر',
  EG: 'مصر', IQ: 'العراق', JO: 'الأردن', KM: 'جزر القمر',
  KW: 'الكويت', LB: 'لبنان', LY: 'ليبيا', MA: 'المغرب',
  MR: 'موريتانيا', OM: 'عُمان', PS: 'فلسطين', QA: 'قطر',
  SA: 'السعودية', SD: 'السودان', SO: 'الصومال', SY: 'سوريا',
  TN: 'تونس', YE: 'اليمن',
};

export function countryName(code: string): string {
  return countryNames[code] || code;
}

/** "33.60°N, 7.62°W" — hemisphere letters instead of signed degrees */
export function formatCoords(lat: number, lon: number): string {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${ns}, ${Math.abs(lon).toFixed(2)}°${ew}`;
}
