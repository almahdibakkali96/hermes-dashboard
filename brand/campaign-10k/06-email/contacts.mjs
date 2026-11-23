// Merge every sign-up / buyer export into one Brevo import file.
//
//   node brand/campaign-10k/06-email/contacts.mjs
//
// Put CSV files in brand/campaign-10k/06-email/input/ (this folder is gitignored: it holds real emails):
//   input/*.csv            → people to email: Google Sheet tabs ("Signups – guide", "Signups"), a Stripe export of
//                            guide buyers, an old Brevo export… Any CSV with a column whose name contains "email".
//   input/exclude/*.csv    → people to leave out: calendar buyers (Stripe export since 23 Nov), unsubscribes, bounces.
//
// Writes brand/campaign-10k/06-email/output/brevo-contacts.csv with:
//   EMAIL, PORT (port id), PORT_AR (الدار البيضاء), PORT_FOR (للدار البيضاء), EXCELLENT («105 يوماً ممتازاً»),
//   BEST_MONTH (أكتوبر), SOURCE (where they signed up). One row per email; the newest port wins.
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const IN = join(DIR, 'input'), EX = join(IN, 'exclude'), OUT = join(DIR, 'output');
const { months, ports } = JSON.parse(readFileSync(join(DIR, 'port-stats.json'), 'utf8'));

// --- CSV (RFC 4180: quotes, commas and newlines inside quotes; BOM; comma, semicolon or tab separated)
function parseCsv(text) {
  text = text.replace(/^﻿/, '');
  const first = text.split(/\r?\n/, 1)[0];
  const sep = [',', ';', '\t'].sort((a, b) => first.split(b).length - first.split(a).length)[0];
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
    else if (c === '"') q = true;
    else if (c === sep) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const head = (rows.shift() || []).map(h => h.trim().toLowerCase());
  return rows.filter(r => r.some(v => v.trim())).map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] || '').trim()])));
}
const csvFiles = (d) => existsSync(d) ? readdirSync(d).filter(f => /\.csv$/i.test(f)).map(f => join(d, f)) : [];
const col = (row, ...names) => { for (const k of Object.keys(row)) if (names.some(n => k.includes(n))) return row[k]; return ''; };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const emailOf = (row) => col(row, 'email', 'e-mail', 'البريد').toLowerCase().replace(/^mailto:/, '').trim();

// --- port matching: id, Arabic name, alias or Latin name, as typed in the waitlist field
const norm = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[ً-ٰٟـ]/g, '')
  .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[^a-z0-9ء-ي]+/g, ' ').trim();
const byName = new Map();
for (const [id, p] of Object.entries(ports)) {
  byName.set(norm(id.replace(/-/g, ' ')), id);
  for (const n of p.names) { byName.set(norm(n), id); byName.set(norm(n).replace(/^ال/, ''), id); }
}
const portOf = (v) => { if (!v) return ''; if (ports[v]) return v; const n = norm(v); return byName.get(n) || byName.get(n.replace(/^ال/, '')) || ''; };

const forPort = (ar) => ar.startsWith('ال') ? 'لل' + ar.slice(2) : 'ل' + ar;
const excellent = (n) => n === 1 ? 'يوم واحد ممتاز' : n === 2 ? 'يومان ممتازان' : n <= 10 ? `${n} أيام ممتازة` : `${n} يوماً ممتازاً`;

// --- read
const excluded = new Set();
for (const f of csvFiles(EX)) for (const r of parseCsv(readFileSync(f, 'utf8'))) { const e = emailOf(r); if (e) excluded.add(e); }

const people = new Map();   // email → { port, source, date, order }
let order = 0, rowsRead = 0, bad = 0, unmatched = new Map();
for (const f of csvFiles(IN)) {
  for (const r of parseCsv(readFileSync(f, 'utf8'))) {
    rowsRead++;
    const email = emailOf(r);
    if (!EMAIL_RE.test(email)) { bad++; continue; }
    const rawPort = col(r, 'port', 'ميناء');
    const port = portOf(rawPort);
    if (rawPort && !port) unmatched.set(rawPort, (unmatched.get(rawPort) || 0) + 1);
    const date = Date.parse(col(r, 'date', 'created')) || 0;
    const source = col(r, 'source') || (f.toLowerCase().includes('stripe') ? 'guide-buyer' : '');
    const prev = people.get(email);
    const rec = { port, source, date, order: order++ };
    if (!prev) people.set(email, rec);
    else {
      const newer = (rec.date || rec.order) >= (prev.date || prev.order);
      people.set(email, {
        port: (newer && port) ? port : prev.port || port,
        source: [...new Set([prev.source, source].filter(Boolean))].join('+'),
        date: Math.max(prev.date, date), order: rec.order,
      });
    }
  }
}

// --- write
const esc = (v) => /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
const lines = [['EMAIL', 'PORT', 'PORT_AR', 'PORT_FOR', 'EXCELLENT', 'BEST_MONTH', 'SOURCE'].join(',')];
let kept = 0, withPort = 0, skipped = 0;
for (const [email, p] of people) {
  if (excluded.has(email)) { skipped++; continue; }
  const s = p.port && ports[p.port];
  lines.push([email, p.port, s ? s.ar : '', s ? forPort(s.ar) : '', s ? excellent(s.n5) : '', s ? months[s.best] : '', p.source].map(v => esc(String(v))).join(','));
  kept++; if (s) withPort++;
}
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'brevo-contacts.csv'), '﻿' + lines.join('\n') + '\n');

console.log(`input files: ${csvFiles(IN).length}, rows read: ${rowsRead}, invalid emails dropped: ${bad}`);
console.log(`unique emails: ${people.size}, excluded (input/exclude): ${skipped}`);
console.log(`→ output/brevo-contacts.csv: ${kept} contacts, ${withPort} with a known port`);
if (unmatched.size) console.log('ports typed that matched nothing (fix by hand in the CSV if you like):', [...unmatched].slice(0, 30).map(([k, n]) => `${k} ×${n}`).join(', '));
