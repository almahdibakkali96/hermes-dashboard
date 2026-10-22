// Full-page phone screenshots of arabtides.com for a Reel, plus the y offset of chosen sections.
// Usage: node brand/site-shots.mjs <outDir> <name>=<path>[|sel1,sel2,...] ...
// From Git Bash, prefix with MSYS_NO_PATHCONV=1 or the /paths get rewritten to Windows paths.
// Writes <outDir>/<name>.png (430 px wide at 2x) and <outDir>/offsets.json ({ name: { height, sel: y } } in CSS px).
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const [outDir, ...jobs] = process.argv.slice(2);
const SITE = process.env.SITE || 'https://www.arabtides.com';
const W = 430, DPR = 2, PORT = 9334;
const chrome = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
mkdirSync(resolve(outDir), { recursive: true });
const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'at-shots-'))}`,
  '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) {
  try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find(t => t.type === 'page'); } catch { await sleep(200); }
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r, { once: true }));
let id = 0; const pending = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise(r => { const n = ++id; pending.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
const evaluate = async expr => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;

const offFile = join(resolve(outDir), 'offsets.json');
const offsets = existsSync(offFile) ? JSON.parse(readFileSync(offFile, 'utf8')) : {};
await send('Page.enable');
for (const job of jobs) {
  const [name, rest] = job.split('=');
  const [path, sels = ''] = rest.split('|');
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: 900, deviceScaleFactor: DPR, mobile: true });
  await send('Page.navigate', { url: SITE + path });
  await sleep(1500);
  for (let i = 0; i < 100 && (await evaluate('document.readyState')) !== 'complete'; i++) await sleep(100);
  // Scroll through so lazy maps and images load, then back to the top
  const h0 = await evaluate('document.documentElement.scrollHeight');
  for (let y = 0; y < h0; y += 600) { await evaluate(`scrollTo(0, ${y})`); await sleep(150); }
  await evaluate('scrollTo(0, 0)'); await sleep(2500);
  const height = await evaluate('document.documentElement.scrollHeight');
  const o = { height };
  for (const s of sels.split(',').filter(Boolean)) o[s] = await evaluate(`(e => e ? Math.round(e.getBoundingClientRect().top + scrollY) : null)(document.querySelector(${JSON.stringify(s)}))`);
  offsets[name] = o;
  await send('Emulation.setDeviceMetricsOverride', { width: W, height, deviceScaleFactor: DPR, mobile: true });
  await sleep(1500);
  const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: W, height, scale: 1 } });
  writeFileSync(join(resolve(outDir), `${name}.png`), Buffer.from(shot.result.data, 'base64'));
  console.log(name, JSON.stringify(o));
}
writeFileSync(offFile, JSON.stringify(offsets, null, 2));
ws.close(); proc.kill();
