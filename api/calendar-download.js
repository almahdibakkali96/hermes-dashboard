// Vercel Function for the 2027 calendar's delivery (used by /calendar/thanks after Stripe redirects a buyer there).
//   GET /api/calendar-download?session_id=cs_...         → { ok, port } once Stripe says the session is a paid calendar purchase
//   GET /api/calendar-download?session_id=cs_...&file=1  → 302 to a 10-minute signed link for that port's PDF only
// The PDFs sit in a PRIVATE S3-compatible bucket (Cloudflare R2 recommended), named ArabTides-2027-<port-id>.pdf.
// Nothing is public: no folder link, and each buyer can only fetch the port in their own payment.
// Environment variables (Vercel → Settings → Environment Variables; server-side, never PUBLIC_):
//   STRIPE_SECRET_KEY       restricted key (rk_live_…) with "Checkout Sessions: Read" only
//   S3_ENDPOINT             e.g. https://<account-id>.r2.cloudflarestorage.com
//   S3_BUCKET               bucket name, e.g. arabtides-calendar-2027
//   S3_ACCESS_KEY_ID        an R2 API token with "Object Read only" on that bucket
//   S3_SECRET_ACCESS_KEY
//   S3_REGION               optional, 'auto' for R2 (default)
//   CALENDAR_PAYMENT_LINKS  optional comma-separated Payment Link ids (plink_…): only sessions from these count
import { createHash, createHmac } from 'node:crypto';

const PRODUCT = 'tide-calendar-2027';
const LINK_SECONDS = 600;                 // signed link lifetime
const VALID_DAYS = 30;                    // a purchase can be downloaded again for 30 days from the thanks page link

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');
  const send = (status, body) => res.status(status).json(body);
  const q = req.query || {};

  const id = String(q.session_id || '');
  if (!/^cs_(live|test)_[A-Za-z0-9]{10,200}$/.test(id)) return send(400, { ok: false, error: 'bad_session' });
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return send(503, { ok: false, error: 'not_configured' });

  let s;
  try {
    const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${id}`, { headers: { Authorization: `Bearer ${key}` } });
    if (r.status === 404) return send(404, { ok: false, error: 'not_found' });
    if (!r.ok) return send(502, { ok: false, error: 'stripe_error' });
    s = await r.json();
  } catch {
    return send(502, { ok: false, error: 'stripe_unreachable' });
  }

  const ref = String(s.client_reference_id || '');
  const links = (process.env.CALENDAR_PAYMENT_LINKS || '').split(',').map(x => x.trim()).filter(Boolean);
  if (!ref.startsWith(PRODUCT + '-') || (links.length && !links.includes(s.payment_link))) return send(403, { ok: false, error: 'not_calendar' });
  if (s.payment_status !== 'paid' && s.payment_status !== 'no_payment_required') return send(402, { ok: false, error: 'unpaid' });
  if (s.created && Date.now() / 1000 - s.created > VALID_DAYS * 86400) return send(410, { ok: false, error: 'expired' });

  const port = ref.slice(PRODUCT.length + 1);
  if (!/^[a-z0-9-]{2,40}$/.test(port)) return send(403, { ok: false, error: 'bad_port' });
  if (!q.file) return send(200, { ok: true, port });

  const url = presign(`ArabTides-2027-${port}.pdf`);
  if (!url) return send(503, { ok: false, error: 'storage_not_configured' });
  res.setHeader('Location', url);
  return res.status(302).end();
}

// AWS Signature V4 query-string presigned GET (works with R2, S3, B2, …), path-style URL
export function presign(objectKey, now = new Date(), env = process.env, extra = {}) {
  const { S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = env;
  if (!S3_ENDPOINT || !S3_BUCKET || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) return '';
  const region = env.S3_REGION || 'auto';
  const enc = (v) => encodeURIComponent(v).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
  const endpoint = new URL(S3_ENDPOINT);
  const host = endpoint.host;
  const path = '/' + [S3_BUCKET, ...objectKey.split('/')].map(enc).join('/');
  const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');   // YYYYMMDDTHHMMSSZ
  const day = amzDate.slice(0, 8);
  const scope = `${day}/${region}/s3/aws4_request`;
  const params = {
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD',
    'X-Amz-Credential': `${S3_ACCESS_KEY_ID}/${scope}`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': String(LINK_SECONDS),
    'X-Amz-SignedHeaders': 'host',
    'response-content-disposition': `attachment; filename="${objectKey}"`,
    ...extra,
  };
  const query = Object.keys(params).sort().map(k => `${enc(k)}=${enc(params[k])}`).join('&');
  const canonical = ['GET', path, query, `host:${host}\n`, 'host', 'UNSIGNED-PAYLOAD'].join('\n');
  const toSign = ['AWS4-HMAC-SHA256', amzDate, scope, createHash('sha256').update(canonical).digest('hex')].join('\n');
  const hmac = (k, d) => createHmac('sha256', k).update(d).digest();
  const kSigning = hmac(hmac(hmac(hmac('AWS4' + S3_SECRET_ACCESS_KEY, day), region), 's3'), 'aws4_request');
  const signature = createHmac('sha256', kSigning).update(toSign).digest('hex');
  return `${endpoint.protocol}//${host}${path}?${query}&X-Amz-Signature=${signature}`;
}
