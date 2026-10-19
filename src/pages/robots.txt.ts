import placesIndex from '../data/places/places_index.json';

const BASE = (import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL);

export async function GET({ site }: { site: URL | undefined }) {
  const origin = site?.origin || 'https://arabtides.com';
  const sitemap = `${origin}${BASE}/sitemap.xml`;
  const body = `User-agent: *
Allow: /

Sitemap: ${sitemap}
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
