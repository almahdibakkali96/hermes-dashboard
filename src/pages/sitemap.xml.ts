import placesIndex from '../data/places/places_index.json';
import { articles } from '../lib/articles';

const BASE = (import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL);

export async function GET({ site }: { site: URL | undefined }) {
  const origin = site?.origin || 'https://arabtides.com';
  const today = new Date().toISOString().slice(0, 10);

  const urls: { loc: string; lastmod?: string; priority?: number; changefreq?: string }[] = [
    { loc: `${origin}${BASE}/`, priority: 1.0, changefreq: 'daily', lastmod: today },
  ];

  const countries = [...new Set(placesIndex.map((p: { country: string }) => p.country))];
  countries.forEach((code) => {
    urls.push({ loc: `${origin}${BASE}/country/${code}`, priority: 0.7, changefreq: 'weekly' });
  });

  placesIndex.forEach((p: { id: string }) => {
    urls.push({ loc: `${origin}${BASE}/ports/${p.id}`, priority: 0.9, changefreq: 'daily', lastmod: today });
  });

  // Articles
  urls.push({ loc: `${origin}${BASE}/articles`, priority: 0.8, changefreq: 'weekly', lastmod: today });
  articles.forEach((a) => {
    urls.push({ loc: `${origin}${BASE}/articles/${a.slug}`, priority: 0.8, changefreq: 'monthly', lastmod: a.updated });
  });

  // Static pages
  urls.push({ loc: `${origin}${BASE}/methodology`, priority: 0.6, changefreq: 'monthly' });
  urls.push({ loc: `${origin}${BASE}/about`, priority: 0.5, changefreq: 'monthly' });
  urls.push({ loc: `${origin}${BASE}/disclaimer`, priority: 0.3, changefreq: 'yearly' });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}${u.changefreq ? `\n    <changefreq>${u.changefreq}</changefreq>` : ''}${u.priority ? `\n    <priority>${u.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
