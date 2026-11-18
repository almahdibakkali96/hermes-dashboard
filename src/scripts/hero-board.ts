/**
 * Homepage hero tide board in the browser: redraws the build's port for the viewer's real time (the "now" line and
 * "rising/falling" text), or switches to the visitor's saved port ("اجعله ميناءي" on a port page) from its JSON.
 */
import { BOARD, boardNow, boardShape, localDayStart, type Ex } from '../lib/heroBoard';

interface Data { id: string; name: string; country: string; offset: number; ex: Ex[] }
const latin = (s: string | number) => `<span class="latin">${s}</span>`;

function draw(root: HTMLElement, d: Data, mine: boolean, base: string) {
  const now = Date.now(), day = localDayStart(now, d.offset);
  const s = boardShape(d.ex, day), n = boardNow(d.ex, now);
  const q = (k: string) => root.querySelector<HTMLElement>(`[data-${k}]`)!;
  q('label').textContent = mine ? 'ميناؤك' : 'الآن في';
  const name = q('name') as HTMLAnchorElement;
  name.textContent = d.name; name.href = `${base}ports/${d.id}`;
  q('country').textContent = d.country;
  const go = q('go') as HTMLAnchorElement;
  go.href = `${base}ports/${d.id}`; go.textContent = `جدول ${d.name} كاملاً ←`;
  if (n) {
    const h = Math.floor(n.mins / 60), m = n.mins % 60;
    const left = h ? `${latin(h)} س ${latin(m)} د` : `${latin(m)} د`;
    q('now').className = 'tb-now ' + (n.rising ? 'is-rising' : 'is-falling');
    q('now').innerHTML = `<i aria-hidden="true">${n.rising ? '↑' : '↓'}</i><b>${n.rising ? 'يرتفع الماء الآن' : 'ينخفض الماء الآن'}</b>`
      + `<span>${n.rising ? 'المد العالي' : 'الجزر المنخفض'} ${latin(n.next[2])}، بعد ${left}</span>`;
  }
  const svg = q('chart');
  const nx = s.x(now), ny = s.y(s.level(now));
  svg.innerHTML = `<path class="tb-area" d="${s.area}"/><path class="tb-line" d="${s.line}"/>`
    + `<line class="tb-nowline" x1="${nx.toFixed(1)}" x2="${nx.toFixed(1)}" y1="0" y2="${BOARD.H}"/>`
    + s.marks.map(k => `<g class="${k.high ? 'tb-hi' : 'tb-lo'}"><circle cx="${k.x}" cy="${k.y}" r="3.5"/>`
      + `<text x="${Math.min(BOARD.W - 18, Math.max(18, k.x))}" y="${k.high ? k.y - 9 : k.y + 17}" text-anchor="middle">${k.time}</text></g>`).join('')
    + `<circle class="tb-nowdot ${n?.rising ? 'is-rising' : 'is-falling'}" cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="5"/>`;
}

function start() {
  const root = document.querySelector<HTMLElement>('[data-hero-board]');
  if (!root) return;
  const base = root.dataset.base || '/';
  const d = JSON.parse(root.querySelector('script[type="application/json"]')!.textContent || '{}') as Data;
  let cur = d, mine = false;
  draw(root, cur, mine, base);
  setInterval(() => draw(root, cur, mine, base), 60000);
  let saved: { id?: string } | null = null;
  try { saved = JSON.parse(localStorage.getItem('arabtides.myPort') || 'null'); } catch { /* private mode */ }
  if (saved?.id === d.id) { mine = true; draw(root, cur, mine, base); return; }
  if (!saved?.id || !/^[a-z0-9-]+$/.test(saved.id)) return;
  fetch(`${base}ports/${saved.id}.json`).then(r => r.json()).then(j => {
    const ex: Ex[] = [];
    for (const day of j.days) for (const t of day.tides) ex.push([Date.parse(t.time_utc), t.type === 'high' ? 1 : 0, t.time_local, t.height_cm]);
    if (ex.length < 3) return;
    cur = { id: j.port.id, name: j.port.name_ar, country: j.port.country_ar, offset: j.days[0].utc_offset_minutes, ex };
    mine = true;
    draw(root, cur, mine, base);
  }).catch(() => { /* keep the default port */ });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
