/**
 * The Rebuilds section on the homepage. Everything the cards show comes from
 * this file, and nothing here is real until you measure it.
 *
 * TODO: replace every null below with a real measurement. Do not estimate.
 *
 * How to measure, so the before and after can be compared:
 *   - pageSpeed: the Performance score on the Mobile tab of pagespeed.web.dev.
 *   - lcpSeconds: Largest Contentful Paint from that same report, in seconds.
 *   - jsKb: JavaScript transferred on page load, in KB. The DevTools Network
 *     tab, filtered to JS, shows it in the status bar.
 *   - before is the live public site. after is your rebuild. Run both on the
 *     same day, and run the same page on each.
 *
 * An entry with any null left in it shows in `astro dev` with a TODO badge and
 * stays out of `astro build`, the way a draft blog post does. Until one entry is
 * complete, the production site has no Rebuilds section and no link to it, so a
 * deploy can never show a buyer the word TODO or a made-up number.
 *
 * Add or remove entries freely. The grid lays out one, two or three cards.
 */

/** A number from before the rebuild and the same number after it. */
export interface Figures {
  before: number | null;
  after: number | null;
}

export interface Rebuild {
  /** The public name of the site you rebuilt. */
  name: string | null;
  /** Where the rebuild is live, as a full https:// URL. */
  demoUrl: string | null;
  /** Mobile PageSpeed score, 0 to 100. */
  pageSpeed: Figures;
  /** Largest Contentful Paint on mobile, in seconds. */
  lcpSeconds: Figures;
  /** JavaScript shipped on page load, in KB. */
  jsKb: Figures;
}

export const rebuilds: Rebuild[] = [
  {
    name: null, // TODO: site name
    demoUrl: null, // TODO: live demo URL
    pageSpeed: { before: null, after: null }, // TODO: mobile PageSpeed score
    lcpSeconds: { before: null, after: null }, // TODO: LCP in seconds
    jsKb: { before: null, after: null }, // TODO: JS shipped in KB
  },
  {
    name: null, // TODO: site name
    demoUrl: null, // TODO: live demo URL
    pageSpeed: { before: null, after: null }, // TODO: mobile PageSpeed score
    lcpSeconds: { before: null, after: null }, // TODO: LCP in seconds
    jsKb: { before: null, after: null }, // TODO: JS shipped in KB
  },
  {
    name: null, // TODO: site name
    demoUrl: null, // TODO: live demo URL
    pageSpeed: { before: null, after: null }, // TODO: mobile PageSpeed score
    lcpSeconds: { before: null, after: null }, // TODO: LCP in seconds
    jsKb: { before: null, after: null }, // TODO: JS shipped in KB
  },
];

const hasBoth = ({ before, after }: Figures) => before !== null && after !== null;

/** True once an entry has a name, a demo link and all six numbers. */
export function isComplete(rebuild: Rebuild): boolean {
  return (
    rebuild.name !== null &&
    rebuild.demoUrl !== null &&
    hasBoth(rebuild.pageSpeed) &&
    hasBoth(rebuild.lcpSeconds) &&
    hasBoth(rebuild.jsKb)
  );
}

/** Finished entries only. This is what crawlers and llms.txt are allowed to see. */
export const completeRebuilds = rebuilds.filter(isComplete);

/**
 * What the page renders: placeholders too while you work in `astro dev`, finished
 * entries only in a build. The header and footer read this as well, so their link
 * to the section exists exactly when the section does.
 */
export const visibleRebuilds = import.meta.env.DEV ? rebuilds : completeRebuilds;

/** Card text for a pageSpeed number, or TODO while it is still null. */
export const formatScore = (value: number | null) => (value === null ? 'TODO' : String(value));

/** Card text for an lcpSeconds number. */
export const formatSeconds = (value: number | null) => (value === null ? 'TODO' : `${value}s`);

/** Card text for a jsKb number. */
export const formatKb = (value: number | null) => (value === null ? 'TODO' : `${value} KB`);
