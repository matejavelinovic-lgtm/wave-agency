/**
 * /llms.txt — the site in one markdown file, for answer engines.
 *
 * Built from the same sources the pages render, not written by hand: the
 * services and migration pages from copy.json, the plans and prices from
 * copy.pricing, the posts from the blog collection. A hand-written copy would
 * be the one place a price stayed at last month's number after the pricing page
 * moved on — and an answer engine quoting a stale price is worse than one
 * quoting none.
 *
 * Shape follows https://llmstxt.org: an H1, a one-line blockquote summary,
 * free-form notes with no headings, then H2 sections of `[name](url): note`
 * links. The plans sit in the notes rather than behind a link because the
 * starting price is the single fact a model is most likely to be asked for.
 */
import type { APIRoute } from 'astro';
import { SITE_URL, SITE_NAME, SITE_ALT_NAME, PERSON, LOCATION } from '../consts';
import copy from '../content/copy.json';
import quiz from '../data/astro-quiz.json';
import { getPublishedPosts } from '../lib/blog';

const link = (name: string, path: string, note: string) => `- [${name}](${SITE_URL}${path}): ${note}`;

export const GET: APIRoute = async () => {
  const { pricing } = copy;
  const posts = await getPublishedPosts();

  const plans = pricing.groups.flatMap((group) =>
    group.plans.map((plan) => {
      const price = plan.pricePrefix ? `${plan.pricePrefix.toLowerCase()} ${plan.price}` : plan.price;
      return `- ${group.label}, ${plan.name}: ${price}. ${plan.text}`;
    }),
  );

  const lines = [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_NAME} (also written "${SITE_ALT_NAME}") is a web performance and answer engine optimization (AEO) practice run by ${PERSON.name} from ${LOCATION.locality}, Serbia. It makes Web3 and fintech sites load fast, get quoted by AI search, and rebuilds them in Astro.`,
    '',
    `Pricing is fixed and agreed before work starts. ${pricing.subtitle}`,
    '',
    ...plans,
    `- ${pricing.careLabel}, ${pricing.careName}: ${pricing.carePrice} ${pricing.carePeriod.replace(/^\/\s*/, 'per ')}. ${pricing.careText}`,
    '',
    `Guarantee: ${pricing.guaranteeTitle} ${pricing.guaranteeText}`,
    '',
    '## Services',
    '',
    ...copy.servicePages.map((page) => link(page.crumb, `/${page.slug}/`, page.metaDescription)),
    ...copy.migrationPages.map((page) => link(page.crumb, `/${page.slug}/`, page.metaDescription)),
    link('Pricing', '/pricing/', pricing.metaDescription),
    '',
    '## Blog',
    '',
    ...posts.map((post) => link(post.data.title, `/blog/${post.id}/`, post.data.description)),
    '',
    '## Tools and contact',
    '',
    link(quiz.title, '/astro-quiz/', quiz.subtitle),
    link('Book a call', '/book-a-call/', 'A free 30 minute call about your site with ' + PERSON.name + '.'),
    `- [${PERSON.name} on LinkedIn](${PERSON.linkedin}): ${PERSON.jobTitle}.`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
