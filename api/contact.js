/*
 * POST /api/contact — takes the contact form and mails it on through Resend.
 *
 * This file sits in /api at the repo root, not in src/pages, on purpose. The
 * site builds as pure static Astro with no adapter, and Vercel picks up a root
 * /api directory as serverless functions regardless of the framework in front
 * of it. Doing it the Astro way instead would mean installing @astrojs/vercel,
 * which changes the build output from dist/ to .vercel/output and breaks the
 * local preview. One endpoint is not worth that.
 *
 * Nothing here runs on `astro dev` — the dev server knows nothing about /api.
 * To exercise it locally run `vercel dev` instead, or just test on the deploy.
 *
 * Env vars, set in the Vercel dashboard (Project → Settings → Environment
 * Variables), then redeploy:
 *
 *   RESEND_API_KEY  required. From resend.com/api-keys.
 *   CONTACT_TO      optional. Defaults to the address below.
 *   CONTACT_FROM    optional. Defaults to Resend's shared onboarding sender,
 *                   which may only deliver to the address that owns the Resend
 *                   account. Once wavewebstudio's own domain is verified in
 *                   Resend, set this to something like "WaveWeb
 *                   <hello@yourdomain.com>" and mail can go anywhere.
 */

const TO = process.env.CONTACT_TO || 'matejavelinovic@gmail.com';
const FROM = process.env.CONTACT_FROM || 'WaveWeb <onboarding@resend.dev>';

// Long enough for a real enquiry, short enough that nobody pastes a novel into
// the inbox. The client caps the textarea at the same numbers.
const LIMITS = { name: 100, email: 200, site: 300, need: 120, message: 4000 };

const clean = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

// Submissions are attacker-controlled text landing in an HTML email. Escaping
// keeps a message body from rewriting the mail around it.
const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('contact: RESEND_API_KEY is not set');
    return response.status(500).json({ error: 'Mail is not configured' });
  }

  const body = typeof request.body === 'string' ? safeParse(request.body) : request.body || {};

  /*
   * "company" is the honeypot: hidden from people, irresistible to the bots
   * that fill every input they find. A filled one gets a 200 and no email —
   * telling a spammer it failed only teaches it to try again differently.
   */
  if (clean(body.company, 200)) {
    return response.status(200).json({ ok: true });
  }

  const name = clean(body.name, LIMITS.name);
  const email = clean(body.email, LIMITS.email);
  const site = clean(body.site, LIMITS.site);
  const need = clean(body.need, LIMITS.need);
  const message = clean(body.message, LIMITS.message);

  // Deliberately loose: the browser already ran type="email", and a stricter
  // pattern here would reject valid addresses rather than catch fake ones.
  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return response.status(400).json({ error: 'Name, a valid email and a message are required' });
  }

  const lines = [
    `Name:    ${name}`,
    `Email:   ${email}`,
    site ? `Site:    ${site}` : null,
    need ? `Need:    ${need}` : null,
    '',
    message,
  ].filter((line) => line !== null);

  try {
    const sent = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        // So hitting reply in Gmail answers the person, not the robot sender.
        reply_to: email,
        subject: `WaveWeb enquiry — ${name}${need ? ` (${need})` : ''}`,
        text: lines.join('\n'),
        html: `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5">
          <p><strong>Name:</strong> ${escapeHtml(name)}<br />
          <strong>Email:</strong> ${escapeHtml(email)}${site ? `<br /><strong>Site:</strong> ${escapeHtml(site)}` : ''}${need ? `<br /><strong>Need:</strong> ${escapeHtml(need)}` : ''}</p>
          <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
        </div>`,
      }),
    });

    if (!sent.ok) {
      // Resend explains refusals (unverified sender, bad key) in the body, and
      // that text is the only way to tell those apart in the Vercel logs.
      console.error(`contact: resend returned ${sent.status}`, await sent.text());
      return response.status(502).json({ error: 'Could not send the message' });
    }

    /*
     * A 2xx from Resend means accepted for delivery, not delivered, so log the
     * id it hands back: without it a submission that never reaches the inbox
     * leaves nothing to trace, and there is no way to tell "Resend dropped it"
     * apart from "the key belongs to some other Resend account".
     */
    console.log(`contact: resend accepted as`, await sent.text(), `from=${FROM} to=${TO}`);

    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error('contact: request to resend failed', error);
    return response.status(502).json({ error: 'Could not send the message' });
  }
}

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
