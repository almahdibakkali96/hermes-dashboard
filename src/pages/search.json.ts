// /search.json: every place for the homepage search box (names, country, other spellings), fetched on the
// search box's first focus so the homepage HTML stays small.
import { allPlaces } from '../lib/regions';
import { countryName } from '../lib/countries';
import { altNamesAr, frenchName } from '../lib/portNames';

export function GET() {
  const list = allPlaces.map(p => ({
    id: p.id, name_ar: p.name_ar, name_en: p.name_en, countryName: countryName(p.country),
    // other spellings and French names, so «مارتيل», «هرهورة» or «Tanger» find their port
    alt: [...altNamesAr(p.id, p.name_ar), frenchName(p.id) || ''].filter(Boolean).join(' '),
  }));
  return new Response(JSON.stringify(list), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
