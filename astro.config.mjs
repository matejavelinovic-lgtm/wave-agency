// @ts-check
import { defineConfig } from 'astro/config';
import copyEditor from './src/dev/copy-editor.mjs';

// Plain HTML + CSS — no Tailwind, no UI framework. Styling lives in
// src/styles/main.css as class-based rules. https://astro.build/config
//
// copyEditor only registers an astro:server:setup hook, so it exists during
// `astro dev` and disappears from `astro build`. Editing that file needs a dev
// server restart — an integration loads once, at startup.
export default defineConfig({
  integrations: [copyEditor()],
});
