/**
 * Content collections.
 *
 * One collection, `blog`, loaded from src/content/blog/*.md. Posts are markdown
 * files rather than entries in copy.json for one reason: copy.json holds single
 * sentences the dev editor writes back into, and an article is not a sentence —
 * it is headings, lists, links, and code that markdown already spells better
 * than JSON ever will. Everything else on the site keeps its contract; the blog
 * body is the one place prose lives in a file of its own.
 *
 * The filename is the URL. content/blog/core-web-vitals.md serves at
 * /blog/core-web-vitals/, and @astrojs/sitemap picks it up on the next build
 * because getStaticPaths in src/pages/blog/[...slug].astro declares it.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  /*
   * The schema is the contract, and it is strict on purpose: a post missing a
   * description or a date fails the build instead of shipping a page with no
   * meta description and no datePublished in its JSON-LD.
   *
   * The function form is what makes `image()` available — a cover declared that
   * way runs through astro:assets, so the file gets resized and hashed and the
   * camera original never reaches dist.
   */
  schema: ({ image }) =>
    z.object({
      /** The H1 and the card title on /blog/. Length is free here. */
      title: z.string(),
      /**
       * The <title>, when the H1 is too long for one. Google truncates around
       * 60 characters and " | WaveWeb" spends 10 of them, so a headline written
       * for a reader usually wants a shorter twin written for the SERP. Falls
       * back to `title`.
       */
      metaTitle: z.string().optional(),
      /** Meta description, OG description, and the card text on /blog/. */
      description: z.string(),
      pubDate: z.coerce.date(),
      /** Set this when the post changes materially — it feeds dateModified. */
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      /**
       * The summary block above the article. Answer-engine bait, and the reason
       * it lives here rather than as a list at the top of the body: a model
       * lifting an answer wants the claims separated from the prose that argues
       * them, and a reader who bounced off a search result wants the same.
       */
      takeaways: z.array(z.string()).default([]),
      /**
       * Questions and answers, out of the body and into structured data.
       *
       * A "## FAQ" heading with bold questions under it is invisible to a
       * crawler looking for FAQPage markup. Declared here, the same pairs render
       * as the site's accordion and emit the schema, so the questions cannot say
       * one thing to a reader and another to a machine.
       */
      faq: z
        .array(
          z.object({
            q: z.string(),
            a: z.string(),
          })
        )
        .default([]),
      /** Optional cover. Put the file next to the post or in src/assets. */
      cover: image().optional(),
      coverAlt: z.string().optional(),
      /*
       * Drafts render in `astro dev` and disappear from `astro build`, so a post
       * in progress is previewable at its real URL without ever being crawled.
       */
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
