/**
 * Site-wide constants. Everything that appears in more than one place, or that
 * feeds JSON-LD, lives here so there is one line to edit.
 *
 * TODO before launch: SITE_URL.
 */

export const SITE_URL = 'https://waveweb.io';

export const SITE_NAME = 'WaveWeb';

/**
 * The portrait ships through astro:assets, so Astro emits a resized, hashed
 * webp instead of the 776 KB camera original. The original lives in
 * src/assets and never reaches the network.
 */
export { default as PERSON_PHOTO } from './assets/matej-avelinovic.jpg';

/*
 * Identity, not copy. Visible sentences live in src/content/copy.json so the
 * inline editor can write to them; these values feed JSON-LD and image alt text
 * where an editable element does not exist.
 */
export const PERSON = {
  name: 'Mateja Velinovic',
  jobTitle: 'Web performance and AEO consultant',
  linkedin: 'https://www.linkedin.com/in/mateja-velinovic/',
};

/** Service pages one level down. The homepage links out, never explains them. */
export const SERVICE_PATHS = {
  audit: '/audit',
  speed: '/speed',
  aeo: '/aeo',
  toWebflow: '/migrate-to-webflow',
  fromWebflow: '/migrate-from-webflow',
};
