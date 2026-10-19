// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Site URL resolution order:
// 1. SITE_URL env var (override)
// 2. Vercel → production domain (apex arabtides.com redirects to www)
// 3. GitHub Pages
const isVercel = !!process.env.VERCEL;
const customDomain = process.env.SITE_URL;
const site = customDomain
  || (isVercel
    ? 'https://www.arabtides.com'
    : 'https://almahdibakkali96.github.io');
const base = (isVercel || customDomain) ? '/' : '/hermes-dashboard';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
