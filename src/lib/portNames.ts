/**
 * Other ways people write each port's name in search: spellings without hamza or with ه for ة,
 * local and older names, and French names on the Maghreb and Mauritanian coasts (Search Console
 * shows French queries such as "marée basse agadir"). Shown as a visible line on the port page
 * and used in its meta description — never as hidden text.
 */
const ALT_AR: Record<string, string[]> = {
  casablanca: ['كازابلانكا'],
  tangier: ['طنجه'],
  'al-hoceima': ['الحسيمه'],
  'el-jadida': ['الجديده'],
  safi: ['أسفي'],
  essaouira: ['الصويره'],
  dakhla: ['الداخله'],
  algiers: ['الجزائر'],
  'tripoli-ly': ['طرابلس الغرب'],
  'port-sudan': ['بور سودان'],
  hodeidah: ['الحديده'],
  'kuwait-city': ['الكويت'],
  jeddah: ['جده'],
  latakia: ['اللاذقيه'],
  hurghada: ['الغردقه'],
  gaza: ['غزه'],
  sousse: ['سوسه'],
  djerba: ['جربه'],
  zuwara: ['زواره', 'زوارا'],
  misrata: ['مصراته'],
  'abu-dhabi': ['أبو ظبي'],
  'ras-al-khaimah': ['راس الخيمه'],
  mahdia: ['المهديه'],
  'port-said': ['بور سعيد'],
  'umm-al-quwain': ['أم القوين'],
  kaec: ['مدينة الملك عبد الله الاقتصادية'],
  'bandar-abbas': ['بندرعباس'],
};

const FR: Record<string, string> = {
  casablanca: 'Casablanca', agadir: 'Agadir', tangier: 'Tanger', rabat: 'Rabat',
  'el-jadida': 'El Jadida', safi: 'Safi', essaouira: 'Essaouira', dakhla: 'Dakhla', 'al-hoceima': 'Al Hoceïma',
  nouadhibou: 'Nouadhibou', nouakchott: 'Nouakchott',
  algiers: 'Alger', oran: 'Oran', tunis: 'La Goulette', sfax: 'Sfax',
  bizerte: 'Bizerte', sousse: 'Sousse', gabes: 'Gabès', djerba: 'Djerba', mahdia: 'Mahdia',
};

/** How each country is also written in searches */
const COUNTRY_ALT: Record<string, string> = { OM: 'سلطنة عمان', AE: 'الإمارات العربية المتحدة', KM: 'جزر القمر' };

const stripHamza = (s: string) => s.replace(/[أإآ]/g, 'ا');

/** Arabic spellings other than the main name, without duplicates */
export function altNamesAr(id: string, nameAr: string): string[] {
  const out = new Set<string>();
  const plain = stripHamza(nameAr);
  if (plain !== nameAr) out.add(plain);
  for (const n of ALT_AR[id] ?? []) if (!nameAr.includes(n)) out.add(n);
  return [...out];
}

export const frenchName = (id: string): string | undefined => FR[id];

export const countryAltName = (code: string): string | undefined => COUNTRY_ALT[code];

/** "تونس (حلق الوادي، Tunis)", "أم قصر (ام قصر، Umm Qasr)": the name with its other spellings */
export function nameWithAlts(nameAr: string, alts: string[]): string {
  if (!alts.length) return nameAr;
  return nameAr.endsWith(')') ? `${nameAr.slice(0, -1)}، ${alts.join('، ')})` : `${nameAr} (${alts.join('، ')})`;
}

/** "مسقط وصلالة", "الدار البيضاء وأكادير وطنجة" */
export function joinAr(names: string[]): string {
  return names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(' و')} و${names[names.length - 1]}`;
}

/** Port count with correct Arabic number agreement: ميناء واحد / ميناءان / 3 موانئ */
export function portCountAr(n: number): string {
  return n === 1 ? 'ميناء واحد' : n === 2 ? 'ميناءان' : `${n} موانئ`;
}
