/**
 * The homepage ports map (src/components/PortsMap.astro), in the browser: fits and animates the view to a sea, keeps the
 * dots and labels a constant size on screen, places port names so they never overlap, colours each dot by the tide right
 * now (rising/falling, from each port's extremes) or by today's fishing rating, and shows a card for the tapped port.
 */
interface Port { id: string; name: string; country: string; sea: string; x: number; y: number; r: number; pr: number; ex: [number, number, string][] }
interface Cfg { ports: Port[]; regions: Record<string, number[]>; base: string }

const RISE = '#2dd4bf', FALL = '#fb7185';
// Rating colours, lighter than the site's 700 shades so they read on the dark map
const RATE = ['', '#f87171', '#fb923c', '#fbbf24', '#2dd4bf', '#4ade80'];
const RATE_WORD = ['', 'ضعيف', 'دون المتوسط', 'متوسط', 'جيد', 'ممتاز'];
const UP = 'M-2.8 1.4L0-1.6L2.8 1.4', DOWN = 'M-2.8-1.4L0 1.6L2.8-1.4';
const NS = 'http://www.w3.org/2000/svg';
const latin = (s: string | number) => `<span class="latin">${s}</span>`;

function track(name: string, data: Record<string, string | number>) {
  const w = window as unknown as { va?: (...a: unknown[]) => void; gtag?: (...a: unknown[]) => void };
  try { w.va?.('event', { name, data }); } catch { /* optional */ }
  try { w.gtag?.('event', name, data); } catch { /* optional */ }
}

function init(root: HTMLElement) {
  const cfg = JSON.parse(root.querySelector('script[type="application/json"]')!.textContent || '{}') as Cfg;
  const svg = root.querySelector<SVGSVGElement>('.pmap-svg')!;
  const labels = root.querySelector<SVGGElement>('.pmap-labels')!;
  const card = root.querySelector<HTMLElement>('.pmap-card')!;
  const byId = new Map(cfg.ports.map(p => [p.id, p]));
  const dots = new Map<string, SVGAElement>();
  root.querySelectorAll<SVGAElement>('.pmap-dot').forEach(a => dots.set(a.dataset.id!, a));
  const seaLabels = Array.from(root.querySelectorAll<SVGTextElement>('.pmap-sea'));
  seaLabels.forEach(t => { t.dataset.x = t.getAttribute('x')!; t.dataset.y = t.getAttribute('y')!; t.dataset.rot = (t.getAttribute('transform') || '').match(/rotate\(([-\d.]+)/)?.[1] || '0'; });

  let vb = svg.getAttribute('viewBox')!.split(' ').map(Number);
  let region = 'all', mode: 'tide' | 'fish' = 'tide', selected: string | null = null, anim = 0;

  const px = () => svg.clientWidth || 1;
  const scale = () => vb[2] / px(); // map units per screen pixel
  // Zoomed far out (the whole region on a phone), dots shrink so crowded coasts stay readable
  const dotSize = () => { const k = scale(); return k > 1.2 ? 0.7 : k > 0.8 ? 0.85 : 1; };

  function fitBox([x0, y0, x1, y1]: number[]) {
    const aspect = px() / (svg.clientHeight || 1);
    const pad = (svg.clientWidth < 640 ? 10 : 14) + 0.06 * Math.max(x1 - x0, y1 - y0);
    let w = x1 - x0 + 2 * pad, h = y1 - y0 + 2 * pad;
    if (w / h < aspect) w = h * aspect; else h = w / aspect;
    return [(x0 + x1) / 2 - w / 2, (y0 + y1) / 2 - h / 2, w, h];
  }

  // Dots, arrows and sea names keep their screen size at any zoom
  function sizeMarks() {
    const s = scale();
    const f = dotSize();
    dots.forEach((a, id) => { const p = byId.get(id)!; a.setAttribute('transform', `translate(${p.x} ${p.y}) scale(${(s * f * (id === selected ? 1.35 : 1)).toFixed(4)})`); });
    seaLabels.forEach(t => {
      const x = t.dataset.x, y = t.dataset.y;
      t.setAttribute('transform', `rotate(${t.dataset.rot} ${x} ${y}) translate(${x} ${y}) scale(${s.toFixed(4)}) translate(${-Number(x)} ${-Number(y)})`);
    });
  }
  function setView(v: number[]) { vb = v; svg.setAttribute('viewBox', v.map(n => n.toFixed(2)).join(' ')); sizeMarks(); }

  function zoomTo(target: number[], animate = true) {
    cancelAnimationFrame(anim);
    labels.textContent = '';
    if (!animate || matchMedia('(prefers-reduced-motion: reduce)').matches) { setView(target); placeLabels(); return; }
    const from = vb.slice(), t0 = performance.now(), D = 550;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / D), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      setView(from.map((v, i) => v + (target[i] - v) * e));
      if (k < 1) anim = requestAnimationFrame(step); else placeLabels();
    };
    anim = requestAnimationFrame(step);
  }

  // Port names: biggest ports first, to the left or right of the dot, skipped where they'd overlap a name or a dot
  const ctx = document.createElement('canvas').getContext('2d')!;
  function placeLabels() {
    labels.textContent = '';
    const s = scale(), W = px(), H = svg.clientHeight;
    ctx.font = `600 12px ${getComputedStyle(svg).fontFamily}`;
    const scr = (p: Port) => [(p.x - vb[0]) / s, (p.y - vb[1]) / s];
    const visible = cfg.ports.filter(p => { const [x, y] = scr(p); return x > -5 && x < W + 5 && y > -5 && y < H + 5; });
    const d = 5.5 * dotSize(), g = 2.5 + d;
    const dotsAt: number[][] = visible.map(p => { const [x, y] = scr(p); return [x - d, y - d, x + d, y + d]; });
    // Very crowded (zoomed far out): names only where nothing is underneath
    const taken: number[][] = [];
    const over = (b: number[], list: number[][]) => list.some(t => b[0] < t[2] && b[2] > t[0] && b[1] < t[3] && b[3] > t[1]);
    // Names sit under the dots, so a main port's name may cross a neighbour's dot when no spot is free; never another name
    const hit = (b: number[], major: boolean) => over(b, taken) || (!major && over(b, dotsAt));
    // The selected port, then the places of the chosen tab (a sea or a continent), then by size
    const order = [...visible].sort((a, b) => Number(b.id === selected) - Number(a.id === selected) || Number(b.sea === region) - Number(a.sea === region) || a.pr - b.pr);
    // On a wide view only the main ports get a name
    const max = vb[2] > 500 ? (W < 640 ? 6 : 16) : vb[2] > 250 ? 24 : 99;
    let n = 0;
    for (const p of order) {
      if (n >= max && p.id !== selected) break;
      const [x, y] = scr(p), w = ctx.measureText(p.name).width + 6;
      // Right, left, above, below the dot: the first spot that is free
      const spots: [number[], string][] = [
        [[x + g, y - 8, x + g + w, y + 8], 'start'], [[x - g - w, y - 8, x - g, y + 8], 'end'],
        [[x - w / 2, y - g - 16, x + w / 2, y - g], 'middle'], [[x - w / 2, y + g, x + w / 2, y + g + 16], 'middle'],
      ];
      const major = (p.pr < 12 && s <= 1.2) || p.id === selected;
      const free = spots.find(([b]) => !hit(b, false) && b[0] >= 2 && b[2] <= W - 2 && b[1] >= 2 && b[3] <= H - 2);
      for (const [b, anchor] of free ? [free] : major ? spots : []) {
        if (b[0] < 2 || b[2] > W - 2 || b[1] < 2 || b[3] > H - 2 || hit(b, true)) continue;
        taken.push(b);
        const t = document.createElementNS(NS, 'text');
        t.setAttribute('x', String(vb[0] + (anchor === 'start' ? b[0] + 3 : anchor === 'end' ? b[2] - 3 : x) * s));
        t.setAttribute('y', String(vb[1] + ((b[1] + b[3]) / 2 + 4.2) * s));
        t.setAttribute('text-anchor', anchor);
        t.setAttribute('font-size', String(12 * s));
        t.setAttribute('stroke-width', String(3 * s));
        t.setAttribute('class', 'pmap-label' + (p.id === selected ? ' is-on' : ''));
        t.textContent = p.name;
        labels.appendChild(t);
        n++;
        break;
      }
    }
  }

  // --- Colours: rising/falling now, or today's rating ---
  function tideNow(p: Port, nowMin: number) {
    const i = p.ex.findIndex(e => e[0] > nowMin);
    if (i < 0) return null;
    const next = p.ex[i];
    const nextHi = p.ex.slice(i).find(e => e[1] === 1), nextLo = p.ex.slice(i).find(e => e[1] === 0);
    return { rising: next[1] === 1, mins: next[0] - nowMin, next, nextHi, nextLo };
  }
  function paint() {
    const nowMin = Date.now() / 60000;
    dots.forEach((a, id) => {
      const p = byId.get(id)!, pt = a.querySelector('.pmap-pt')!, arrow = a.querySelector('.pmap-arrow')!;
      if (mode === 'tide') {
        const t = tideNow(p, nowMin);
        (pt as SVGElement).style.fill = t ? (t.rising ? RISE : FALL) : '#cbd5e1';
        arrow.setAttribute('d', t ? (t.rising ? UP : DOWN) : '');
      } else {
        (pt as SVGElement).style.fill = RATE[p.r];
        arrow.setAttribute('d', '');
      }
      a.classList.toggle('is-on', id === selected);
    });
    root.querySelector<HTMLElement>('[data-legend="tide"]')!.hidden = mode !== 'tide';
    root.querySelector<HTMLElement>('[data-legend="fish"]')!.hidden = mode !== 'fish';
  }

  // --- The tapped port's card ---
  function select(id: string | null, how = 'tap') {
    selected = id;
    paint(); sizeMarks(); placeLabels();
    if (!id) return;
    const p = byId.get(id)!, t = tideNow(p, Date.now() / 60000);
    const hrs = t ? Math.floor(t.mins / 60) : 0, mins = t ? Math.round(t.mins % 60) : 0;
    const left = t ? (hrs ? `${latin(hrs)} س ${latin(mins)} د` : `${latin(mins)} د`) : '';
    card.innerHTML = `<div class="pmap-info">
      <div class="pmap-info-head"><a class="pmap-name" href="${cfg.base}ports/${p.id}">${p.name}</a><span class="pmap-country">${p.country}</span>
        <span class="pmap-rate" style="--c:${RATE[p.r]}">الصيد اليوم ${latin(p.r + '/5')} ${RATE_WORD[p.r]}</span></div>
      ${t ? `<p class="pmap-now"><b style="color:${t.rising ? RISE : FALL}">${t.rising ? '↑ يرتفع الماء' : '↓ ينخفض الماء'}</b> الآن · ${t.rising ? 'المد العالي' : 'الجزر المنخفض'} بعد ${left}</p>
      <p class="pmap-next">${t.nextHi ? `<span>▲ المد العالي ${latin(t.nextHi[2])}</span>` : ''}${t.nextLo ? `<span>▼ الجزر المنخفض ${latin(t.nextLo[2])}</span>` : ''}</p>` : ''}
    </div><a class="pmap-go" href="${cfg.base}ports/${p.id}">جدول ${p.name} ←</a>`;
    if (how !== 'saved') track('map_port', { port: id, how });
  }

  // A tap picks the nearest dot on screen (dense coasts have dots a few pixels apart); keyboard Enter follows the link
  svg.addEventListener('click', e => {
    if (e.detail === 0) return;
    e.preventDefault();
    const r = svg.getBoundingClientRect(), s = scale();
    const cx = e.clientX - r.left, cy = e.clientY - r.top;
    let best: Port | null = null, bd = 26;
    for (const p of cfg.ports) {
      const d = Math.hypot((p.x - vb[0]) / s - cx, (p.y - vb[1]) / s - cy);
      if (d < bd) { bd = d; best = p; }
    }
    select(best ? best.id : null);
  });
  dots.forEach((a, id) => a.addEventListener('focus', () => { if (selected !== id) select(id, 'keyboard'); }));

  root.querySelectorAll<HTMLButtonElement>('.pmap-tab').forEach(b => b.addEventListener('click', () => {
    region = b.dataset.region!;
    root.querySelectorAll('.pmap-tab').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    zoomTo(fitBox(cfg.regions[region]));
    track('map_region', { region });
  }));
  root.querySelectorAll<HTMLButtonElement>('.pmap-mode').forEach(b => b.addEventListener('click', () => {
    mode = b.dataset.mode as 'tide' | 'fish';
    root.querySelectorAll('.pmap-mode').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    paint();
  }));

  // Start: the visitor's port (saved with "اجعله ميناءي") and its sea, else every port
  let mine: string | null = null;
  try { const s = JSON.parse(localStorage.getItem('arabtides.myPort') || 'null'); if (s && byId.has(s.id)) mine = s.id; } catch { /* private mode */ }
  if (mine) {
    region = byId.get(mine)!.sea;
    root.querySelectorAll('.pmap-tab').forEach(x => x.setAttribute('aria-pressed', String((x as HTMLElement).dataset.region === region)));
  }
  setView(fitBox(cfg.regions[region]));
  paint();
  if (mine) select(mine, 'saved'); else placeLabels();
  new ResizeObserver(() => { cancelAnimationFrame(anim); setView(fitBox(cfg.regions[region])); placeLabels(); }).observe(svg);
  setInterval(paint, 60000);
}

function start() { document.querySelectorAll<HTMLElement>('[data-ports-map]').forEach(init); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
