/**
 * The website cost calculator at /website-cost-calculator/: its fields, its
 * formula and its number formats.
 *
 * Both halves of the page read this file. The frontmatter renders the fields
 * and the results for the default inputs at build time, so the numbers are in
 * the HTML before any script runs, and the page script imports calculate() to
 * redo them in the browser. One formula, so what a crawler reads and what a
 * visitor sees cannot drift apart.
 *
 * With every default below, the page must read $40,536 today ($24,936 platform
 * and retainer, $15,600 time), $240 on Astro and $40,296 freed up. Those are
 * the numbers in the LinkedIn post the page goes with: change a default and the
 * page stops matching it.
 */

export type FieldKey =
  | 'plan'
  | 'seats'
  | 'seatPrice'
  | 'retainer'
  | 'hours'
  | 'rate'
  | 'hosting'
  | 'ai'
  | 'hoursAfter';

export type Values = Record<FieldKey, number>;

export interface Field {
  key: FieldKey;
  /** Query parameter in a shared link. Short, since the link gets pasted into posts and DMs. */
  param: string;
  label: string;
  /**
   * Read by a screen reader after the label. The $ and the unit beside the
   * number are decoration, hidden from assistive tech, so a field whose label
   * does not already name its unit says it here.
   */
  spoken?: string;
  optional?: boolean;
  hint?: string;
  prefix?: string;
  suffix?: string;
  value: number;
  /** What one press of − or +, or one arrow key, moves the value by. */
  step: number;
  max: number;
  integer?: boolean;
  /**
   * Webflow's list price, written back into the field whenever the platform is
   * set to Webflow. Only the prices: the seat count, the retainer and the hours
   * belong to the visitor's team, not to the platform.
   */
  webflow?: number;
}

export const PLATFORM_PARAM = 'platform';

/*
 * Only Webflow carries prices (the `webflow` values on the fields below).
 * Picking any other platform keeps whatever is in the fields: those platforms
 * price by plan, hosting or not at all, so there is no one number to fill in.
 */
export const PLATFORMS = [
  { value: 'webflow', label: 'Webflow' },
  { value: 'wordpress', label: 'WordPress' },
  { value: 'framer', label: 'Framer' },
  { value: 'squarespace', label: 'Squarespace' },
  { value: 'wix', label: 'Wix' },
  { value: 'drupal', label: 'Drupal' },
  { value: 'other', label: 'Other' },
] as const;

export const todayFields: Field[] = [
  {
    key: 'plan',
    param: 'plan',
    label: 'Site plan',
    spoken: 'dollars per month',
    prefix: '$',
    suffix: '/ month',
    value: 39,
    step: 1,
    max: 100_000,
    webflow: 39,
  },
  {
    key: 'seats',
    param: 'seats',
    label: 'Number of editor/designer seats',
    value: 1,
    step: 1,
    max: 1_000,
    integer: true,
  },
  {
    key: 'seatPrice',
    param: 'seat',
    label: 'Price per seat',
    spoken: 'dollars per month',
    prefix: '$',
    suffix: '/ month',
    value: 39,
    step: 1,
    max: 10_000,
    webflow: 39,
  },
  {
    key: 'retainer',
    param: 'retainer',
    label: 'Agency retainer for edits and new pages',
    spoken: 'dollars per month',
    prefix: '$',
    suffix: '/ month',
    value: 2000,
    step: 100,
    max: 1_000_000,
  },
  {
    key: 'hours',
    param: 'hours',
    label: 'Hours per week your team spends briefing, waiting on and reviewing changes',
    suffix: 'h / week',
    value: 3,
    step: 0.5,
    max: 168,
  },
  {
    key: 'rate',
    param: 'rate',
    label: 'What one hour of your time is worth',
    spoken: 'in dollars',
    prefix: '$',
    suffix: '/ hour',
    value: 100,
    step: 10,
    max: 10_000,
  },
];

export const astroFields: Field[] = [
  {
    key: 'hosting',
    param: 'hosting',
    label: 'Hosting',
    spoken: 'dollars per month',
    hint: 'Vercel Pro',
    prefix: '$',
    suffix: '/ month',
    value: 20,
    step: 1,
    max: 100_000,
  },
  {
    key: 'ai',
    param: 'ai',
    label: 'AI tools',
    spoken: 'dollars per month',
    optional: true,
    hint: 'e.g. Claude seats your team uses to request changes',
    prefix: '$',
    suffix: '/ month',
    value: 0,
    step: 5,
    max: 100_000,
  },
  {
    key: 'hoursAfter',
    param: 'after',
    label: 'Hours per week on changes after the switch',
    suffix: 'h / week',
    value: 0,
    step: 0.5,
    max: 168,
  },
];

export const defaults = Object.fromEntries(
  [...todayFields, ...astroFields].map((f) => [f.key, f.value]),
) as Values;

/**
 * Every line is rounded to whole dollars before it is added up, so the totals
 * on the page are always the sum of the lines printed above them, even when an
 * input carries cents or half hours.
 */
export function calculate(v: Values) {
  const platform = Math.round((v.plan + v.seats * v.seatPrice) * 12);
  const retainer = Math.round(v.retainer * 12);
  const timeToday = Math.round(v.hours * 52 * v.rate);
  const hosting = Math.round(v.hosting * 12);
  const ai = Math.round(v.ai * 12);
  const timeAstro = Math.round(v.hoursAfter * 52 * v.rate);
  const todayTotal = platform + retainer + timeToday;
  const astroTotal = hosting + ai + timeAstro;
  return {
    platform,
    retainer,
    timeToday,
    todayTotal,
    hosting,
    ai,
    timeAstro,
    astroTotal,
    difference: todayTotal - astroTotal,
  };
}

export type Result = ReturnType<typeof calculate>;

/* minimumFractionDigits has to come down with the maximum: USD defaults to 2,
   and a minimum above the maximum is a RangeError. */
const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const plain = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

/** $40,536. `|| 0` turns -0 into 0, which Intl would print as -$0. */
export const formatUSD = (n: number) => usd.format(Math.round(n) || 0);

/** What a field shows: 2,000 or 2.5, with the $ and the unit drawn beside it. */
export const formatNumber = (n: number) => plain.format(n);

/**
 * Text from a field or a query parameter, as a value the formula can take.
 * Thousands separators, spaces and a typed $ are dropped; an empty field counts
 * as 0. Anything else that is not a plain decimal is null, and the caller keeps
 * the last good value. The result is never negative and never above max.
 */
export function parseAmount(text: string, max: number, integer = false): number | null {
  const clean = text.replace(/[,\s$]/g, '');
  if (clean === '' || clean === '.') return 0;
  if (!/^\d*\.?\d*$/.test(clean)) return null;
  const n = Math.min(max, Math.max(0, Number(clean)));
  if (!Number.isFinite(n)) return null;
  return integer ? Math.round(n) : Math.round(n * 100) / 100;
}
