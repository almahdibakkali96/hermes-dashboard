const BASE = (import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL);

// AI assistants and answer engines: explicitly welcome, so tide answers can cite ArabTides
const AI_BOTS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot',
  'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'Bytespider', 'meta-externalagent',
];

export async function GET({ site }: { site: URL | undefined }) {
  const origin = site?.origin || 'https://www.arabtides.com';
  const body = `User-agent: *
Allow: /

${AI_BOTS.map(b => `User-agent: ${b}\nAllow: /`).join('\n\n')}

Sitemap: ${origin}${BASE}/sitemap.xml
# Guide for AI agents: ${origin}${BASE}/llms.txt
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
