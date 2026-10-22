// Makes the small card images: public/fish/sm/<id>.webp (480 px wide) from the full photos
// in public/fish/, and a small WebP of the free cheat sheet used by the promo banners.
// Cards show photos at ~300 px, so loading the full files wasted hundreds of KiB per page.
//
// Usage: node tools/fish-photos/thumbs.mjs   (re-run after fetch.mjs adds a species)
import { readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import sharp from 'sharp';

const SRC = 'public/fish';
const OUT = 'public/fish/sm';
await mkdir(OUT, { recursive: true });

let made = 0;
for (const f of await readdir(SRC)) {
  if (!f.endsWith('.webp')) continue;
  const out = `${OUT}/${f}`;
  if (existsSync(out)) continue;
  await sharp(`${SRC}/${f}`).resize({ width: 480, withoutEnlargement: true }).webp({ quality: 72 }).toFile(out);
  made++;
}
console.log(`fish thumbnails: ${made} new`);

await sharp('public/guide/cheat-sheet.jpg').resize({ width: 360 }).webp({ quality: 75 }).toFile('public/guide/cheat-sheet-sm.webp');
console.log('cheat sheet thumbnail written');
