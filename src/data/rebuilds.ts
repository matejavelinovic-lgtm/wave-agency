/**
 * The Rebuilds section on the homepage. Everything the cards show comes from
 * this file, and nothing here is real until you measure it.
 *
 * TODO: replace every null below with a real measurement. Do not estimate.
 *
 * How to measure, so the before and after can be compared:
 *   - pageSpeed: the Performance score on the Mobile tab of pagespeed.web.dev.
 *   - lcpSeconds: Largest Contentful Paint from that same report, in seconds.
 *   - before is the live public site. after is your rebuild. Run both on the
 *     same day, and run the same page on each.
 *
 * An entry with any null left in it shows in `astro dev` with a TODO badge and
 * stays out of `astro build`, the way a draft blog post does. Until one entry is
 * complete, the production site has no Rebuilds section and no link to it, so a
 * deploy can never show a buyer the word TODO or a made-up number.
 *
 * Screenshots go in src/assets/rebuilds/ and are imported below, so Astro
 * resizes them to WebP at build time. A browser-width capture of the top of the
 * page works best: the card crops from the bottom, never the top.
 *
 * Add or remove entries freely. Each one is a full-width row.
 */
import type { ImageMetadata } from 'astro';
import latticeShot from '../assets/rebuilds/lattice.png';

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
  /** The platform the live site runs on, e.g. Webflow. */
  from: string | null;
  /** What the rebuild is built in, e.g. Astro. */
  to: string | null;
  /** A screenshot of the rebuild, imported from src/assets/rebuilds/. */
  screenshot: ImageMetadata | null;
  /** Mobile PageSpeed score, 0 to 100. */
  pageSpeed: Figures;
  /** Largest Contentful Paint on mobile, in seconds. */
  lcpSeconds: Figures;
}

export const rebuilds: Rebuild[] = [
  {
    // lattice.com
    name: 'Lattice',
    demoUrl: 'https://lattice-puce-eight.vercel.app/',
    from: 'Webflow',
    to: 'Astro',
    screenshot: latticeShot,
    pageSpeed: { before: 47, after: 99 },
    lcpSeconds: { before: 4, after: 2.1 },
  },
];

const hasBoth = ({ before, after }: Figures) => before !== null && after !== null;

/** True once an entry has a name, a demo link, both platforms, a screenshot and all four numbers. */
export function isComplete(rebuild: Rebuild): boolean {
  return (
    rebuild.name !== null &&
    rebuild.demoUrl !== null &&
    rebuild.from !== null &&
    rebuild.to !== null &&
    rebuild.screenshot !== null &&
    hasBoth(rebuild.pageSpeed) &&
    hasBoth(rebuild.lcpSeconds)
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
