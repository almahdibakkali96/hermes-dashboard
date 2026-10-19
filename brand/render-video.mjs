// Render brand/src/<name>.html into an MP4 (1080×1920, 30 fps) using installed Chrome + ffmpeg.
// The page must expose window.renderAt(seconds) and window.DURATION.
// Usage:  node brand/render-video.mjs video-01-full-moon   → brand/video/video-01-full-moon.mp4
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const name = process.argv[2] || 'video-01-full-moon';
const FPS = 30, W = 1080, H = 1920, PORT = 9333;
const chrome = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const page = pathToFileURL(resolve(here, 'src', `${name}.html`)).href;
const frames = mkdtempSync(join(tmpdir(), 'arabtides-frames-'));
const profile = mkdtempSync(join(tmpdir(), 'arabtides-chrome-'));
const outDir = resolve(here, 'video');
mkdirSync(outDir, { recursive: true });

const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--hide-scrollbars', `--window-size=${W},${H}`, '--force-device-scale-factor=1', 'about:blank'], { stdio: 'ignore' });

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

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: page });
for (let i = 0; i < 100 && !(await evaluate('typeof window.renderAt === "function" && document.readyState === "complete"')); i++) await sleep(100);
await evaluate('document.fonts.ready.then(() => true)');
await sleep(800); // let images and fonts settle

const duration = await evaluate('window.DURATION');
const total = Math.round(duration * FPS);
for (let f = 0; f < total; f++) {
  await evaluate(`window.renderAt(${(f / FPS).toFixed(4)}); new Promise(r => requestAnimationFrame(() => r(true)))`);
  const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: W, height: H, scale: 1 } });
  writeFileSync(join(frames, `f${String(f).padStart(4, '0')}.png`), Buffer.from(shot.result.data, 'base64'));
  if (f % 60 === 0) process.stdout.write(`frame ${f}/${total}\n`);
}
ws.close(); proc.kill();

const out = join(outDir, `${name}.mp4`);
// Silent AAC track so every app treats it as a normal video; add music in Instagram.
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(frames, 'f%04d.png'),
  '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100', '-shortest',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-crf', '18', '-preset', 'slow', '-movflags', '+faststart',
  '-c:a', 'aac', '-b:a', '128k', out], { stdio: 'inherit' });
rmSync(frames, { recursive: true, force: true });
try { rmSync(profile, { recursive: true, force: true }); } catch {}
console.log('wrote', out);
