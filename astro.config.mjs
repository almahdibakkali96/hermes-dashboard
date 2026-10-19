// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Site URL resolution order:
// 1. SITE_URL env var (set this once you buy a domain, e.g. https://arabtides.com)
// 2. Vercel auto URL
// 3. GitHub Pages
const isVercel = !!process.env.VERCEL;
const customDomain = process.env.SITE_URL;
const site = customDomain
  || (isVercel
    ? 'https://prompt-tempest-on6uicu.vercel.app'
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
