// Downloads the fish photos from Wikimedia Commons (original files, not third-party copies),
// converts them to WebP in public/fish/, and writes author/license metadata to
// src/data/fish-photos.json for the credits page.
//
// Usage: node tools/fish-photos/fetch.mjs   (re-run after adding a species to FILES)
import { writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const FILES = {
  hamour: 'Epinephelus_coioides_Thailand.jpg',
  kanad: 'Scomberomorus_commerson_Pakistan.jpg',
  sobaity: 'Sparidentex_hasta.png',
  shaem: 'Acanthopagrus_latus_01.jpg',
  safi: 'Siganus_canaliculatus,_Kampuan.jpg',
  nuwaibi: 'OtolithRuberDinhDTran.jpg',
  nagroor: 'PomadasKaakanffish.asia_(1).jpg',
  sheri: 'Lethrinus_nebulosus_287497294_(cropped).jpg',
  queenfish: 'Scomberoides_commersonnianus.jpg',
  jesh: 'Jurel_lentejuela_(Carangoides_bajad),_Yeda,_Arabia_Saudita,_2025-05-21,_DD_28.jpg',
  gt: 'Caranx_ignobilis.jpg',
  tuna: 'Banc_de_thons_albacores_(Thunnus_albacares)_(Ifremer_00568-68027_-_25174).jpg',
  longtail: 'Thunnus_tonggol.jpg',
  dorado: 'Common_Dolphinfish_Monterey_Bay.jpg',
  sailfish: 'Istiophorus_platypterus_101956558.jpg',
  coraltrout: 'Plectropomus_pessuliferus.jpg',
  parrot: 'Rusty_Parrotfish-DMS_(cropped).jpg',
  hamra: '13-08-06-abu-dhabi-marina-mall-64.jpg',
  cobia: 'Rachycentron_canadum_Robertson.jpg',
  barracuda: 'Gran_barracuda_(Sphyraena_barracuda),_Yeda,_Arabia_Saudita,_2025-05-20,_DD_118.jpg',
  zubaidi: 'Pampus_argenteus_1.jpg',
  seabass: 'Sealife,_Bray,_Ireland._(6985874908).jpg',
  dorade: 'Sparus_aurata,_Alpes-Maritimes,_Provence-Alpes-Côte_d\'Azur,_FR_imported_from_iNaturalist_photo_207799710.jpg',
  sar: 'Sargo_común_(Diplodus_sargus),_Madeira,_Portugal,_2019-05-31,_DD_29.jpg',
  marmar: 'Mormora.jpg',
  boori: 'Mújol_(Mugil_cephalus),_Parque_natural_de_la_Arrábida,_Portugal,_2021-09-09,_DD_25.jpg',
  wagar: 'Mero_(Epinephelus_marginatus),_Cabo_de_Palos,_España,_2022-07-15,_DD_34.jpg',
  meagre: 'Lisbon,_Oceanarium,_Argyrosomus_regius.JPG',
  leerfish: 'Lichia_amia.jpg',
  dentex: 'Dentex_dentex_Canary.jpg',
  amberjack: 'Pez_limón_(Seriola_dumerili),_Madeira,_Portugal,_2019-05-31,_DD_31.jpg',
  squid: 'Loligo_vulgaris.jpg',
  sepia: 'Acanthosepion_pharaonis.jpg',
};

const UA = 'ArabTides/1.0 (https://www.arabtides.com; fish photo credits)';
const strip = (html = '') => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

await mkdir('public/fish', { recursive: true });
const meta = {};
for (const [id, file] of Object.entries(FILES)) {
  const api = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo'
    + '&iiprop=url|extmetadata&iiurlwidth=900&titles=' + encodeURIComponent('File:' + file);
  const j = await (await fetch(api, { headers: { 'User-Agent': UA } })).json();
  const page = Object.values(j.query.pages)[0];
  const info = page.imageinfo?.[0];
  if (!info) { console.error('missing', id, file); continue; }
  const em = info.extmetadata || {};
  const img = Buffer.from(await (await fetch(info.thumburl, { headers: { 'User-Agent': UA } })).arrayBuffer());
  const out = await sharp(img).resize({ width: 800, withoutEnlargement: true }).webp({ quality: 78 })
    .toFile(`public/fish/${id}.webp`);
  meta[id] = {
    w: out.width, h: out.height,
    artist: strip(em.Artist?.value) || 'Unknown',
    license: strip(em.LicenseShortName?.value),
    licenseUrl: em.LicenseUrl?.value || '',
    source: info.descriptionurl,
  };
  console.log(id, meta[id].license, '·', meta[id].artist);
}
await writeFile('src/data/fish-photos.json', JSON.stringify(meta, null, 1) + '\n');
