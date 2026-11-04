/**
 * /llms.txt — the site in one markdown file, for answer engines.
 *
 * Built from the same sources the pages render, not written by hand: the
 * services and migration pages and the stack from copy.json, the rebuilds from
 * src/data/rebuilds.ts, the posts from the blog collection. A hand-written copy
 * would be the one place a claim stayed at last month's wording after the page
 * moved on.
 *
 * Shape follows https://llmstxt.org: an H1, a one-line blockquote summary,
 * free-form notes with no headings, then H2 sections of `[name](url): note`
 * links. The stack and the guarantee sit in the notes rather than behind a link
 * because they are the facts a model is most likely to be asked for.
 */
import type { APIRoute } from 'astro';
import { SITE_URL, SITE_NAME, SITE_ALT_NAME, PERSON, LOCATION } from '../consts';
import copy from '../content/copy.json';
import quiz from '../data/migration-quiz.json';
import { completeRebuilds, formatScore, formatSeconds, formatKb } from '../data/rebuilds';
import { getPublishedPosts } from '../lib/blog';

const link = (name: string, path: string, note: string) => `- [${name}](${SITE_URL}${path}): ${note}`;

export const GET: APIRoute = async () => {
  const { stack, guarantee, own } = copy;
  const posts = await getPublishedPosts();

  /* Finished entries only, so an answer engine can never quote a placeholder. */
  const rebuildLines = completeRebuilds.map(
    (r) =>
      `- [${r.name}](${r.demoUrl}): mobile PageSpeed ${formatScore(r.pageSpeed.before)} to ${formatScore(r.pageSpeed.after)}, ` +
      `LCP ${formatSeconds(r.lcpSeconds.before)} to ${formatSeconds(r.lcpSeconds.after)}, ` +
      `JavaScript ${formatKb(r.jsKb.before)} to ${formatKb(r.jsKb.after)}. A public site rebuilt as a demo, not client work.`,
  );

  const lines = [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_NAME} (also written "${SITE_ALT_NAME}") builds fast, custom websites for B2B companies. ${PERSON.name} runs it from ${LOCATION.locality}, Serbia. The site is code the client owns, in their repository and on their hosting, instead of a site rented on a platform.`,
    '',
    `Own your stack: ${own.text}`,
    '',
    ...stack.items.map((item) => `- ${item.group}, ${item.name}: ${item.text}`),
    '',
    `Guarantee: ${guarantee.title} ${guarantee.text} ${guarantee.note}`,
    '',
    '## Services',
    '',
    ...copy.servicePages.map((page) => link(page.crumb, `/${page.slug}/`, page.metaDescription)),
    ...copy.migrationPages.map((page) => link(page.crumb, `/${page.slug}/`, page.metaDescription)),
    '',
    ...(rebuildLines.length > 0 ? ['## Rebuilds', '', ...rebuildLines, ''] : []),
    '## Blog',
    '',
    ...posts.map((post) => link(post.data.title, `/blog/${post.id}/`, post.data.description)),
    '',
    '## Tools and contact',
    '',
    link(quiz.title, '/migration-quiz/', quiz.subtitle),
    link('Book a call', '/book-a-call/', 'A free 30 minute call about your site with ' + PERSON.name + '.'),
    `- [${PERSON.name} on LinkedIn](${PERSON.linkedin}): ${PERSON.jobTitle}.`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
