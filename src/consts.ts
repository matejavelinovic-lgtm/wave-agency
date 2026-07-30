/**
 * Site-wide constants. Everything that appears in more than one place, or that
 * feeds JSON-LD, lives here so there is one line to edit.
 */

/*
 * The www host, not the apex: waveweb.agency answers with a 308 to
 * www.waveweb.agency, and a canonical that points at a redirect makes crawlers
 * resolve one more hop to find the page they were already on.
 */
export const SITE_URL = 'https://www.waveweb.agency';

export const SITE_NAME = 'WaveWeb';

/*
 * Every other outfit trading on this name spells it "Wave Web", and a search
 * for the brand returns all of them. Declaring the spaced form as an
 * alternateName is how the markup says the two strings are one entity.
 */
export const SITE_ALT_NAME = 'Wave Web';

/*
 * Profiles that belong to the company, for Organization.sameAs — the property
 * Google uses to decide that "WaveWeb" the string and this domain are the same
 * thing. Six other outfits trade under some spelling of the name, so this list
 * is what settles which of them owns it here.
 *
 * Add a URL only once it answers 200: a sameAs pointing at a 404 is worse than
 * no sameAs at all. The obvious ones still missing are a Crunchbase profile, a
 * Google Business Profile, and any client or directory page that names WaveWeb
 * and links back — each is another vote, and this is the cheapest SEO work
 * available to this site.
 *
 * The founder's personal LinkedIn is NOT one of these. It hangs off PERSON
 * below, and the two schema nodes are already wired together by
 * founder/worksFor, so the entity graph joins them without muddling a person's
 * profile into the company's.
 *
 * The link must point both ways to count for much: the LinkedIn page's own
 * website field has to carry https://www.waveweb.agency back.
 */
export const ORG_PROFILES: string[] = ['https://www.linkedin.com/company/waveweb3'];

/*
 * Where the work is done, for Organization.address. Locality and country only —
 * there is no shopfront to put a street outside of, and a made-up street is a
 * worse signal than none. No GeoCoordinates either: a lat/long would claim a
 * precise point this business does not occupy. What this earns is the entity
 * signal ("the WaveWeb in Serbia", which none of the six namesakes are) rather
 * than a place in the local pack, which needs a verified Google Business
 * Profile and a real address regardless of what the markup says.
 */
export const LOCATION = {
  locality: 'Sombor',
  region: 'Vojvodina',
  country: 'RS',
};

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
