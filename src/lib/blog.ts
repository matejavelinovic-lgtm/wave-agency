/**
 * The three things both blog routes need, in one place so the listing and the
 * post page cannot disagree about which posts exist or how a date is spelled.
 */
import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/**
 * Every post that should be visible, newest first.
 *
 * Drafts are kept in `astro dev` and dropped from `astro build`: a post in
 * progress is previewable at its real URL, and nothing half-written reaches a
 * crawler. import.meta.env.DEV is a compile-time constant, so the check costs
 * nothing in the built output.
 */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

/**
 * "1 August 2026" — day first, month spelled out, no comma. The <time> element
 * that shows this always carries the ISO date in its datetime attribute, so the
 * machine-readable form never depends on this string.
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Minutes to read, at 220 words per minute, from the raw markdown body.
 *
 * Syntax characters inflate the count a little and code blocks read slower than
 * prose, so the two roughly cancel. Never returns 0 — "0 min read" reads like a
 * bug, and any post at all takes a moment.
 */
export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
