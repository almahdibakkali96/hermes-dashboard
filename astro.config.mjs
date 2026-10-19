// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

const isVercel = !!process.env.VERCEL;
const site = isVercel
  ? 'https://prompt-tempest-on6uicu.vercel.app'
  : 'https://almahdibakkali96.github.io';
const base = isVercel ? '/' : '/hermes-dashboard';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});