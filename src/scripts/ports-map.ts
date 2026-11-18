/**
 * The homepage ports map (src/components/PortsMap.astro), in the browser: fits and animates the view to a sea, keeps the
 * dots and labels a constant size on screen, places port names so they never overlap, colours each dot by the tide right
 * now (rising/falling, from each port's extremes) or by today's fishing rating, and shows a card for the tapped port.
 * The view can be dragged (mouse or one finger), zoomed with two fingers, the +/− buttons, a double click, or the wheel
 * (once the map has been clicked, or with Ctrl, so the page still scrolls past it).
 */
interface Port { id: string; name: string; country: string; sea: string; x: number; y: number; r: number; pr: number; ex: [number, number, string][] }
interface Cfg { ports: Port[]; regions: Record<string, number[]>; base: string; size: [number, number] }

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

  // Free view: never wider than the world, never closer than ~2.5° across (the coastline's detail), centre on the map
  const [MW, MH] = cfg.size;
  const widthIn = (w: number, aspect: number) => Math.min(Math.max(MW, MH * aspect) * 1.05, Math.max(24, w));
  function clampView([x, y, w, h]: number[]) {
    const aspect = w / h, cx0 = x + w / 2, cy0 = y + h / 2;
    w = widthIn(w, aspect); h = w / aspect;
    const cx = Math.min(MW, Math.max(0, cx0)), cy = Math.min(MH, Math.max(0, cy0));
    return [cx - w / 2, cy - h / 2, w, h];
  }
  // Zoom by f (< 1 closer) keeping the map point under screen point (sx, sy) in place
  function zoomedAt(v: number[], sx: number, sy: number, f: number) {
    const s = v[2] / px(), mx = v[0] + sx * s, my = v[1] + sy * s, aspect = v[2] / v[3];
    const w = widthIn(v[2] * f, aspect), s2 = w / px();
    return clampView([mx - sx * s2, my - sy * s2, w, w / aspect]);
  }
  let relabel = 0;
  const relabelSoon = () => { clearTimeout(relabel); relabel = window.setTimeout(placeLabels, 120); };

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
    // No names under the zoom buttons
    const zb = root.querySelector('.pmap-zoom')?.getBoundingClientRect(), sb = svg.getBoundingClientRect();
    if (zb) taken.push([zb.left - sb.left - 4, zb.top - sb.top - 4, zb.right - sb.left + 4, zb.bottom - sb.top + 4]);
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

  // --- Drag, pinch, wheel and buttons ---
  const pointers = new Map<number, [number, number]>();
  let dragged = false, travel = 0, engaged = false, moved = false; // moved: the visitor's own view, not a tab's
  svg.addEventListener('dragstart', e => e.preventDefault()); // no native drag of the links or the land image
  const local = (e: { clientX: number; clientY: number }): [number, number] => { const r = svg.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  svg.addEventListener('pointerdown', e => {
    if (e.button > 0) return;
    pointers.set(e.pointerId, local(e));
    if (pointers.size === 1) { dragged = false; travel = 0; }
    engaged = true; cancelAnimationFrame(anim);
  });
  svg.addEventListener('pointermove', e => {
    const prev = pointers.get(e.pointerId);
    if (!prev) return;
    const cur = local(e);
    if (pointers.size === 1) {
      const dx = cur[0] - prev[0], dy = cur[1] - prev[1];
      travel += Math.abs(dx) + Math.abs(dy);
      if (!dragged && travel < 6) return; // a tap, not a drag (yet)
      if (!dragged) { dragged = moved = true; svg.setPointerCapture(e.pointerId); labels.textContent = ''; svg.classList.add('is-dragging'); }
      const s = scale();
      setView(clampView([vb[0] - dx * s, vb[1] - dy * s, vb[2], vb[3]]));
    } else if (pointers.size === 2) {
      // Two fingers: zoom by the change in their distance, about their midpoint, and follow the midpoint
      const other = [...pointers.entries()].find(([id]) => id !== e.pointerId)![1];
      const d0 = Math.hypot(prev[0] - other[0], prev[1] - other[1]), d1 = Math.hypot(cur[0] - other[0], cur[1] - other[1]);
      const m0 = [(prev[0] + other[0]) / 2, (prev[1] + other[1]) / 2], m1 = [(cur[0] + other[0]) / 2, (cur[1] + other[1]) / 2];
      if (!dragged) { dragged = moved = true; labels.textContent = ''; }
      const s = scale(), panned = [vb[0] - (m1[0] - m0[0]) * s, vb[1] - (m1[1] - m0[1]) * s, vb[2], vb[3]];
      setView(d0 > 0 && d1 > 0 ? zoomedAt(panned, m1[0], m1[1], d0 / d1) : clampView(panned));
    }
    pointers.set(e.pointerId, cur);
  });
  const lift = (e: PointerEvent) => {
    if (!pointers.delete(e.pointerId)) return;
    if (!pointers.size) { svg.classList.remove('is-dragging'); if (dragged) placeLabels(); }
  };
  svg.addEventListener('pointerup', lift);
  svg.addEventListener('pointercancel', lift);
  svg.addEventListener('mouseleave', () => { engaged = false; });
  svg.addEventListener('wheel', e => {
    if (!engaged && !e.ctrlKey) return; // let the page scroll until the map is used
    e.preventDefault(); cancelAnimationFrame(anim);
    const [sx, sy] = local(e), unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
    labels.textContent = ''; moved = true;
    setView(zoomedAt(vb, sx, sy, Math.exp(Math.max(-1, Math.min(1, e.deltaY * unit * 0.0025)))));
    relabelSoon();
  }, { passive: false });
  svg.addEventListener('dblclick', e => { e.preventDefault(); const [sx, sy] = local(e); moved = true; zoomTo(zoomedAt(vb, sx, sy, 0.5)); });
  root.querySelectorAll<HTMLButtonElement>('[data-zoom]').forEach(b => b.addEventListener('click', () => {
    const z = b.dataset.zoom!;
    moved = z !== 'fit';
    zoomTo(z === 'fit' ? fitBox(cfg.regions[region]) : zoomedAt(vb, px() / 2, svg.clientHeight / 2, z === 'in' ? 0.5 : 2));
    track('map_zoom', { how: z });
  }));

  // A tap picks the nearest dot on screen (dense coasts have dots a few pixels apart); keyboard Enter follows the link
  svg.addEventListener('click', e => {
    if (e.detail === 0) return;
    e.preventDefault();
    if (dragged) { dragged = false; return; } // the end of a drag, not a tap
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
    region = b.dataset.region!; moved = false;
    root.querySelectorAll('.pmap-tab').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    zoomTo(fitBox(cfg.regions[region]));
    track('map_region', { region });
  }));
  root.querySelectorAll<HTMLButtonElement>('.pmap-mode').forEach(b => b.addEventListener('click', () => {
    mode = b.dataset.mode as 'tide' | 'fish';
    root.querySelectorAll('.pmap-mode').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    paint();
  }));

  // The land is first an <image> (cheap, cached); then its paths are put inline so the coast line keeps a thin,
  // constant width when zoomed in (vector-effect only works on inline shapes)
  const img = svg.querySelector('image');
  if (img) fetch(img.getAttribute('href')!).then(r => r.text()).then(text => {
    const land = new DOMParser().parseFromString(text, 'image/svg+xml').documentElement;
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'pmap-land');
    for (const el of Array.from(land.children)) g.appendChild(document.importNode(el, true));
    img.replaceWith(g);
  }).catch(() => { /* keep the image */ });

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
  // On resize: refit the chosen tab, or keep the visitor's own view (same centre and width) once they moved it
  let w0 = svg.clientWidth, h0 = svg.clientHeight;
  new ResizeObserver(() => {
    if (svg.clientWidth === w0 && svg.clientHeight === h0) return;
    w0 = svg.clientWidth; h0 = svg.clientHeight;
    cancelAnimationFrame(anim);
    if (moved) { const a = px() / (svg.clientHeight || 1), cx = vb[0] + vb[2] / 2, cy = vb[1] + vb[3] / 2; setView(clampView([cx - vb[2] / 2, cy - vb[2] / a / 2, vb[2], vb[2] / a])); }
    else setView(fitBox(cfg.regions[region]));
    placeLabels();
  }).observe(svg);
  setInterval(paint, 60000);
}

function start() { document.querySelectorAll<HTMLElement>('[data-ports-map]').forEach(init); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
