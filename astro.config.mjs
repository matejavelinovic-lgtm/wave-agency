// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import copyEditor from './src/dev/copy-editor.mjs';

// Plain HTML + CSS — no Tailwind, no UI framework. Styling lives in
// src/styles/main.css as class-based rules. https://astro.build/config
//
// copyEditor only registers an astro:server:setup hook, so it exists during
// `astro dev` and disappears from `astro build`. Editing that file needs a dev
// server restart — an integration loads once, at startup.
export default defineConfig({
  /*
   * The www host, matching SITE_URL in src/consts.ts — the apex answers 308 to
   * this one, and a sitemap listing the redirecting host would make a crawler
   * resolve an extra hop per URL. Keep the two in step; the sitemap builds off
   * this value, everything else reads consts.
   *
   * sitemap() only emits URLs for pages that exist at build time, so the four
   * service routes named in consts appear the day their .astro files do —
   * there is nothing to remember to update here.
   */
  site: 'https://www.waveweb.agency',
  integrations: [sitemap(), copyEditor()],
});
