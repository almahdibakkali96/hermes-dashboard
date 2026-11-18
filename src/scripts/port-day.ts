/**
 * Port page, in the browser: the day viewer (today's chart and tiles, re-drawn for any day of this month and next),
 * a scrubbable chart (touch or hover shows the time and height), and the "water rising now" line in the hero.
 *
 * It runs the site's own engine (src/lib/tides.ts, astronomy.ts, fishing.ts), so a day drawn here matches what
 * the build would print. Today's chart stays the server-rendered SVG (search engines and no-JS visitors see it);
 * other days are drawn with the same geometry as src/pages/ports/[id].astro — keep the two in step.
 * Config comes from <script type="application/json" id="port-engine"> on the page.
 */
import { generateTideCurve, dayExtremes, formatTime, predictHeight, tideCoefficient, coefficientLabelAr, type Constituent, type TidePoint, type TideExtreme } from '../lib/tides';
import { moonPhase, sunTimes, moonTimes, solunarPeriods } from '../lib/astronomy';
import { monthDays, maxRangeOf, calcFish, fishColors, fishLabels, type RangeDay } from '../lib/fishing';

interface Cfg {
  cons: Record<string, Constituent>;
  lat: number;
  lon: number;
  today: string;               // the port's local date of the build, YYYY-MM-DD
  min: string;                 // first and last day the viewer may show
  max: string;
  offsets: number[];           // UTC offset (minutes) of each day from min to max, from the build's time-zone data
  tz: number;                  // offset at build time, fallback
  yearMax: Record<string, number>; // largest daily range per year, for the tide coefficient
  calYear: number;             // the year the calendar product covers
}

const DAY = 86400000;
// Chart geometry: same numbers as the port page's frontmatter
const W = 600, H = 310, PL = 52, PR = 18, PT = 40, PB = 58, PW = W - PL - PR, PH = H - PT - PB;
const WEEKDAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const NS = 'http://www.w3.org/2000/svg';

const noon = (key: string) => new Date(key + 'T12:00:00Z');
const keyOf = (d: Date) => d.toISOString().slice(0, 10);
const latin = (s: string | number) => `<span class="latin">${s}</span>`;

function track(name: string, data: Record<string, string | number>) {
  const w = window as unknown as { va?: (...a: unknown[]) => void; gtag?: (...a: unknown[]) => void };
  try { w.va?.('event', { name, data }); } catch { /* analytics optional */ }
  try { w.gtag?.('event', name, data); } catch { /* analytics optional */ }
}

interface DayInfo {
  key: string;
  date: Date;
  tz: number;
  curve: TidePoint[];
  extremes: TideExtreme[];
  rating: number;
  coef: number | null;
  moon: ReturnType<typeof moonPhase>;
  sun: ReturnType<typeof sunTimes>;
  majors: { start: string; end: string }[];
}

function init() {
  const src = document.getElementById('port-engine');
  const svg = document.getElementById('tide-chart') as unknown as SVGSVGElement | null;
  if (!src || !svg) return;
  const cfg = JSON.parse(src.textContent || '{}') as Cfg;
  const card = document.getElementById('chart-card');
  const title = document.getElementById('chart-title');
  const dateEl = document.getElementById('chart-date');
  const tiles = document.getElementById('tide-tiles');
  const facts = document.getElementById('day-facts');
  const more = document.getElementById('day-more');
  const input = document.getElementById('day-input') as HTMLInputElement | null;
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('.day-tab[data-day]'));
  const pick = input?.closest('.day-pick') ?? null;
  const pickLabel = pick?.querySelector('[data-pick-label]') ?? null;
  // "Today" is the port's real local date. The build's date (cfg.today) can be a day behind for places far from the
  // rebuild hours (UTC+0…+4, e.g. the Americas or the Pacific): then the page moves itself to the real day below.
  const tzFor0 = (key: string) => cfg.offsets[Math.round((noon(key).getTime() - noon(cfg.min).getTime()) / DAY)] ?? cfg.tz;
  const approx = keyOf(new Date(Date.now() + cfg.tz * 60000));
  let today = keyOf(new Date(Date.now() + tzFor0(approx) * 60000));
  if (today < cfg.min || today > cfg.max) today = cfg.today;
  const tomorrow = keyOf(new Date(noon(today).getTime() + DAY));
  const todayMarkup = svg.innerHTML;

  const tzFor = (key: string) => cfg.offsets[Math.round((noon(key).getTime() - noon(cfg.min).getTime()) / DAY)] ?? cfg.tz;

  const months = new Map<string, { days: RangeDay[]; max: number }>();
  function month(y: number, m: number, tz: number) {
    const k = `${y}-${m}-${tz}`;
    if (!months.has(k)) { const days = monthDays(cfg.cons, y, m, tz); months.set(k, { days, max: maxRangeOf(days) }); }
    return months.get(k)!;
  }

  function dayInfo(key: string): DayInfo {
    const date = noon(key), tz = tzFor(key);
    const mo = month(date.getUTCFullYear(), date.getUTCMonth(), tz);
    const md = mo.days[date.getUTCDate() - 1];
    const moon = moonPhase(date);
    const mt = moonTimes(date, cfg.lat, cfg.lon, tz);
    const yMax = cfg.yearMax[String(date.getUTCFullYear())];
    return {
      key, date, tz,
      curve: generateTideCurve(cfg.cons, date, tz),
      extremes: dayExtremes(cfg.cons, date, tz),
      rating: calcFish(md.range, md.moon.age, mo.max),
      coef: yMax ? tideCoefficient(md.range, yMax) : null,
      moon,
      sun: sunTimes(date, cfg.lat, cfg.lon, tz),
      majors: solunarPeriods(mt.moonrise, mt.moonset, mt.lunarTransit, moon.phase, date).periods
        .filter(p => p.type === 'major').sort((a, b) => a.start.localeCompare(b.start)),
    };
  }

  // --- Drawing (mirrors the server-rendered chart and tiles) ---
  function chartMarkup(d: DayInfo): string {
    const hs = d.curve.map(p => p.height), lo = Math.min(...hs), span = Math.max(...hs) - lo || 1;
    const y = (h: number) => PT + PH - ((h - lo) / span) * PH;
    const x = (hr: number) => PL + (hr / 24) * PW;
    const path = d.curve.map((p, i) => `${i ? 'L' : 'M'}${x(p.hours).toFixed(1)},${y(p.height).toFixed(1)}`).join(' ');
    let s = '<defs><linearGradient id="tideFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#14b8a6" stop-opacity="0.28"/><stop offset="100%" stop-color="#14b8a6" stop-opacity="0.02"/></linearGradient></defs>';
    for (const f of [0, 1 / 3, 2 / 3, 1]) {
      const v = lo + span * f;
      s += `<line x1="${PL}" y1="${y(v)}" x2="${W - PR}" y2="${y(v)}" stroke="#e8ecf0" stroke-width="1"/><text x="${PL - 8}" y="${y(v) + 4}" text-anchor="end" class="tick">${v.toFixed(0)}</text>`;
    }
    for (const h of [0, 3, 6, 9, 12, 15, 18, 21]) {
      s += `<text x="${x(h)}" y="${H - 8}" text-anchor="middle" class="${h % 6 ? 'tick tick-minor' : 'tick'}">${String(h).padStart(2, '0')}:00</text>`;
    }
    s += `<path d="${path} L${x(24).toFixed(1)},${PT + PH} L${x(0).toFixed(1)},${PT + PH} Z" fill="url(#tideFill)"/>`;
    s += `<path d="${path}" fill="none" stroke="#0d9488" stroke-width="2.5" stroke-linejoin="round"/>`;
    for (const ex of d.extremes) {
      const cx = x(ex.hours), cy = y(ex.height), hi = ex.type === 'high';
      const anchor = cx > W - PR - 40 ? 'end' : cx < PL + 40 ? 'start' : 'middle';
      s += `<circle cx="${cx}" cy="${cy}" r="5" fill="${hi ? '#0d9488' : '#e11d48'}" stroke="#fff" stroke-width="2"/>`;
      s += `<text x="${cx}" y="${hi ? cy - 13 : cy + 24}" text-anchor="${anchor}" class="ex-label" fill="${hi ? '#0f766e' : '#be123c'}">${formatTime(ex.time, d.tz)}</text>`;
    }
    // "Now" line when this is the real today drawn here (the build's today keeps its own server-drawn line)
    if (d.key === today) {
      const loc = new Date(Date.now() + d.tz * 60000), nx = x(loc.getUTCHours() + loc.getUTCMinutes() / 60);
      s += `<g id="now-marker"><line x1="${nx}" x2="${nx}" y1="${PT - 6}" y2="${PT + PH}" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 3"/><text x="${nx}" y="${PT - 12}" text-anchor="middle" class="now-label">الآن</text></g>`;
    }
    return s;
  }

  const tilesMarkup = (d: DayInfo) => d.extremes.map(ex => {
    const hi = ex.type === 'high';
    return `<div class="rounded-xl px-3 py-2.5 ${hi ? 'bg-teal-50' : 'bg-rose-50'}"><div class="text-xs font-medium ${hi ? 'text-teal-700' : 'text-rose-700'}">${hi ? '▲ مد عالٍ' : '▼ جزر منخفض'}</div><div class="text-xl font-bold latin mt-0.5">${formatTime(ex.time, d.tz)}</div><div class="text-xs text-[var(--text-muted)]">${latin(ex.height.toFixed(0))} سم</div></div>`;
  }).join('');

  function factsMarkup(d: DayInfo): string {
    const r = d.rating;
    let s = `<span class="rating-badge rating-sm" style="--rating:${fishColors[r]}" role="img" aria-label="تقييم الصيد ${r} من 5، ${fishLabels[r]}"><span class="rating-num latin" aria-hidden="true">${r}<span class="rating-of">/5</span></span><span class="rating-word" aria-hidden="true">${fishLabels[r]}</span></span>`;
    if (d.majors.length) s += `<span class="day-fact">🎣 أفضل وقت ${d.majors.map(p => latin(`${p.start}–${p.end}`)).join(' و')}</span>`;
    s += `<span class="day-fact">الشروق ${latin(d.sun.sunrise ?? '—')} · الغروب ${latin(d.sun.sunset ?? '—')}</span>`;
    s += `<span class="day-fact">${d.moon.emoji} ${d.moon.phaseNameAr} ${latin(Math.round(d.moon.illumination * 100) + '%')}</span>`;
    if (d.coef !== null) s += `<span class="day-fact">معامل المد ${latin(d.coef)} · ${coefficientLabelAr(d.coef)}</span>`;
    return s;
  }

  // --- Scrubbing: touch or hover shows the time and the height ---
  let cur: DayInfo = dayInfo(cfg.today);
  let scrub: SVGGElement;
  function addScrub() {
    scrub = document.createElementNS(NS, 'g') as SVGGElement;
    scrub.setAttribute('class', 'scrub');
    scrub.style.display = 'none';
    scrub.innerHTML = `<line y1="${PT - 4}" y2="${PT + PH}" class="scrub-line"/><circle r="6" class="scrub-dot"/><rect class="scrub-box" rx="8" height="34" y="${PT - 38}"/><text class="scrub-text" text-anchor="middle" y="${PT - 13}"></text>`;
    svg!.appendChild(scrub);
  }
  function scrubAt(clientX: number) {
    const m = svg!.getScreenCTM();
    if (!m) return;
    const pt = svg!.createSVGPoint();
    pt.x = clientX; pt.y = 0;
    const px = pt.matrixTransform(m.inverse()).x;
    const hr = Math.max(0, Math.min(24 - 1 / 60, ((px - PL) / PW) * 24));
    const i = hr * 12, a = cur.curve[Math.floor(i)], b = cur.curve[Math.min(cur.curve.length - 1, Math.floor(i) + 1)];
    const h = a.height + (b.height - a.height) * (i - Math.floor(i));
    const hs = cur.curve.map(p => p.height), lo = Math.min(...hs), span = Math.max(...hs) - lo || 1;
    const x = PL + (hr / 24) * PW, y = PT + PH - ((h - lo) / span) * PH;
    const mins = Math.round(hr * 60);
    const text = scrub.querySelector('text')!, box = scrub.querySelector('rect')!;
    text.textContent = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')} · ${Math.round(h)} سم`;
    scrub.style.display = '';
    const w = text.getComputedTextLength() + 22;
    const tx = Math.max(PL + w / 2, Math.min(W - PR - w / 2, x));
    text.setAttribute('x', String(tx));
    box.setAttribute('x', String(tx - w / 2));
    box.setAttribute('width', String(w));
    const line = scrub.querySelector('line')!;
    line.setAttribute('x1', String(x)); line.setAttribute('x2', String(x));
    const dot = scrub.querySelector('circle')!;
    dot.setAttribute('cx', String(x)); dot.setAttribute('cy', String(y));
    svg!.classList.add('is-scrubbing');
  }
  function hideScrub() { scrub.style.display = 'none'; svg!.classList.remove('is-scrubbing'); }
  let scrubbed = false;
  svg.addEventListener('pointerdown', e => {
    scrubAt(e.clientX);
    if (!scrubbed) { scrubbed = true; track('chart_scrub', { day: cur.key === cfg.today ? 0 : 1 }); }
  });
  svg.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' || e.buttons) scrubAt(e.clientX); });
  svg.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hideScrub(); });
  addScrub();

  // --- Choosing a day ---
  // A day outside the window: say which days the chart shows and, for a day of the calendar's year, where to find it
  const moreHtml = more?.innerHTML ?? '';
  const calLink = more?.querySelector('a')?.outerHTML ?? '';
  const dayLabel = (key: string) => { const d = noon(key); return `${latin(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]} ${latin(d.getUTCFullYear())}`; };
  function outOfRange(key: string) {
    if (!more) return;
    const inCal = key.startsWith(String(cfg.calYear)) && calLink;
    more.innerHTML = `يعرض المنحنى هنا الأيام من ${dayLabel(cfg.min)} إلى ${dayLabel(cfg.max)}. `
      + (inCal ? `تجد ${dayLabel(key)} وكل أيام سنة ${latin(cfg.calYear)} في ${calLink}.` : 'اختر يوماً بينهما.');
    more.classList.add('is-alert');
    more.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    track('day_out_of_range', { year: Number(key.slice(0, 4)) });
  }
  function select(key: string, how: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || isNaN(noon(key).getTime())) return;
    if (key < cfg.min || key > cfg.max) { outOfRange(key); return; }
    if (more?.classList.contains('is-alert')) { more.innerHTML = moreHtml; more.classList.remove('is-alert'); }
    cur = dayInfo(key);
    const d = cur.date;
    svg!.innerHTML = key === cfg.today && today === cfg.today ? todayMarkup : chartMarkup(cur);
    svg!.classList.remove('is-scrubbing');
    addScrub();
    const label = key === today ? 'اليوم' : key === tomorrow ? 'غداً' : `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
    svg!.setAttribute('aria-label', `منحنى المد والجزر ${label}`);
    if (title) title.textContent = key === today || key === tomorrow ? `منحنى المد والجزر ${label}` : `منحنى المد والجزر — ${label}`;
    if (dateEl) dateEl.textContent = d.toLocaleDateString('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' });
    if (tiles) tiles.innerHTML = tilesMarkup(cur);
    if (facts) facts.innerHTML = factsMarkup(cur);
    tabs.forEach(t => t.setAttribute('aria-pressed', String(t.dataset.day === key)));
    if (input) input.value = key;
    // The picker shows the day it chose when that day isn't one of the tabs
    const custom = !tabs.some(t => t.dataset.day === key);
    pick?.classList.toggle('is-on', custom);
    if (pickLabel) pickLabel.textContent = custom ? `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}` : 'يوم آخر';
    try {
      const u = new URL(location.href);
      if (key === today) u.searchParams.delete('d'); else u.searchParams.set('d', key);
      history.replaceState(history.state, '', u);
    } catch { /* file:// or old browser */ }
    if (how !== 'auto') track('day_view', { how, ahead: Math.round((noon(key).getTime() - noon(cfg.today).getTime()) / DAY) });
  }
  tabs.forEach(t => t.addEventListener('click', () => select(t.dataset.day!, 'tab')));
  input?.addEventListener('change', () => { if (input.value) select(input.value, 'picker'); });
  // Desktop browsers open the calendar only from its icon: open it on any click of the (transparent) field
  input?.addEventListener('click', () => { try { (input as HTMLInputElement & { showPicker?: () => void }).showPicker?.(); } catch { /* not allowed here */ } });
  // "Curve of this day" in the month calendar's day details
  document.addEventListener('port:day', e => {
    select((e as CustomEvent<string>).detail, 'calendar');
    card?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  // The build is a day behind here: relabel the tabs from the real today and show it
  if (today !== cfg.today) {
    tabs.forEach(t => {
      const diff = Math.round((noon(t.dataset.day!).getTime() - noon(today).getTime()) / DAY);
      const name = t.querySelector('.d-name');
      if (name) name.textContent = diff === 0 ? 'اليوم' : diff === 1 ? 'غداً' : diff === -1 ? 'أمس' : WEEKDAYS[noon(t.dataset.day!).getUTCDay()];
    });
  }
  const asked = new URLSearchParams(location.search).get('d');
  if (asked && asked !== today) select(asked, 'link');
  else if (today !== cfg.today) select(today, 'auto');

  // --- Hero: is the water rising or falling right now, and when is the next turn ---
  const status = document.getElementById('now-status');
  function nowStatus() {
    if (!status) return;
    const now = Date.now();
    const local = keyOf(new Date(now + cfg.tz * 60000)), base = noon(local);
    const tz = tzFor(local);
    const exs = [-1, 0, 1].flatMap(i => dayExtremes(cfg.cons, new Date(base.getTime() + i * DAY), tz));
    const next = exs.find(e => e.time.getTime() > now);
    const prev = [...exs].reverse().find(e => e.time.getTime() <= now);
    if (!next) return;
    const h = Math.round(predictHeight(cfg.cons, new Date(now)));
    const toNext = Math.round((next.time.getTime() - now) / 60000);
    const fromPrev = prev ? Math.round((now - prev.time.getTime()) / 60000) : Infinity;
    const turn = toNext <= 15 ? next : fromPrev <= 15 ? prev! : null;
    let html: string;
    if (turn) {
      const hi = turn.type === 'high';
      html = `<span class="now-main"><span class="now-arrow ${hi ? 'is-up' : 'is-down'}" aria-hidden="true">●</span> ${hi ? 'ذروة المد' : 'أدنى الجزر'} الآن · ${latin(h)} سم</span>`
        + `<span class="now-next">ثم ${hi ? 'يبدأ الماء بالانخفاض' : 'يبدأ الماء بالارتفاع'}</span>`;
    } else {
      const rising = next.type === 'high';
      const hrs = Math.floor(toNext / 60), mins = toNext % 60;
      const left = hrs ? `${latin(hrs)} س ${latin(mins)} د` : `${latin(mins)} د`;
      html = `<span class="now-main"><span class="now-arrow ${rising ? 'is-up' : 'is-down'}" aria-hidden="true">${rising ? '↑' : '↓'}</span> الماء ${rising ? 'يرتفع' : 'ينخفض'} الآن · ${latin(h)} سم</span>`
        + `<span class="now-next">${rising ? 'المد العالي' : 'الجزر المنخفض'} بعد ${left} (${latin(formatTime(next.time, tz))})</span>`;
    }
    status.innerHTML = html;
    status.classList.add('is-ready');
  }
  nowStatus();
  setInterval(nowStatus, 60000);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
