/**
 * The homepage hero's tide board: one port's water level over its local day, drawn from its highs and lows
 * (a cosine between each pair, which is how the water moves between extremes). Shared by the build
 * (src/pages/index.astro, the default port) and the browser (src/scripts/hero-board.ts, the visitor's own port).
 */

/** One extreme: [UTC ms, 1 high | 0 low, local "HH:MM", height cm] */
export type Ex = [number, 0 | 1, string, number];

export const BOARD = { W: 320, H: 128, PAD: 22 };
const DAY = 86400000;

function levelAt(ex: Ex[], t: number): number {
  let i = ex.findIndex(e => e[0] > t) - 1;
  if (i < 0) i = ex[0][0] > t ? 0 : ex.length - 2; // before the first or after the last: continue the nearest swing
  const [t1, , , h1] = ex[i], [t2, , , h2] = ex[i + 1];
  return (h1 + h2) / 2 + ((h1 - h2) / 2) * Math.cos((Math.PI * (t - t1)) / (t2 - t1));
}

/** The local day (UTC ms of its 00:00) that contains `now` at UTC offset `offsetMin` */
export const localDayStart = (now: number, offsetMin: number) => Math.floor((now + offsetMin * 60000) / DAY) * DAY - offsetMin * 60000;

export function boardShape(ex: Ex[], dayStart: number) {
  const { W, H, PAD } = BOARD;
  const ts: number[] = [];
  for (let k = 0; k <= 144; k++) ts.push(dayStart + (k * DAY) / 144);
  const hs = ts.map(t => levelAt(ex, t));
  const lo = Math.min(...hs), hi = Math.max(...hs), span = hi - lo || 1;
  const x = (t: number) => ((t - dayStart) / DAY) * W;
  const y = (h: number) => PAD + ((hi - h) / span) * (H - 2 * PAD);
  const line = ts.map((t, k) => `${k ? 'L' : 'M'}${x(t).toFixed(1)} ${y(hs[k]).toFixed(1)}`).join('');
  const marks = ex.filter(e => e[0] >= dayStart && e[0] < dayStart + DAY)
    .map(e => ({ x: +x(e[0]).toFixed(1), y: +y(e[3]).toFixed(1), high: e[1] === 1, time: e[2], cm: Math.round(e[3]) }));
  return { line, area: `${line}L${W} ${H}L0 ${H}Z`, marks, x, y, level: (t: number) => levelAt(ex, t) };
}

/** Rising or falling at `now`, and the next extreme */
export function boardNow(ex: Ex[], now: number) {
  const next = ex.find(e => e[0] > now);
  return next ? { rising: next[1] === 1, next, mins: Math.round((next[0] - now) / 60000) } : null;
}
