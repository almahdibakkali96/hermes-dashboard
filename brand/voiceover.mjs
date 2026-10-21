// Builds the soundtrack for a Reel: one ElevenLabs voice line per scene + one instrumental bed.
// Writes brand/video/<name>/ (line-N.mp3, music.mp3, timeline.json, soundtrack.m4a).
// Already-generated files are reused, so re-running costs no credits; delete a file to regenerate it.
//
// Usage: node brand/voiceover.mjs video-01-full-moon
// Key: ELEVENLABS_API_KEY env var, or the .env of the arabtides-video project.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const name = process.argv[2] || 'video-01-full-moon';
const outDir = resolve(here, 'video', name);
mkdirSync(outDir, { recursive: true });

const VOICE_ID = 'nPczCjzI2devNBz1zQrb'; // Brian — same as arabtides-video/scripts/voice.mjs
const ENV_FILE = 'C:/Users/ULTRAPC/Documents/arabtides-videos/arabtides-video/.env';
// Scene starts and end as designed in src/<name>.html (its `var DESIGN = [...]` line, seconds)
const html = readFileSync(resolve(here, 'src', `${name}.html`), 'utf8');
const DESIGN = JSON.parse(html.match(/var DESIGN = (\[[^\]]*\])/)[1]);
// Voice starts this long after each scene starts: first scene 0.5 s, end card 0.45 s, the rest 0.35 s
const LEAD = Array.from({ length: DESIGN.length - 1 }, (_, i) => i === 0 ? 0.5 : i === DESIGN.length - 2 ? 0.45 : 0.35);
const TAIL = 0.45;                          // silence after a line before the next scene

function apiKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  const line = readFileSync(ENV_FILE, 'utf8').split(/\r?\n/).find(l => l.startsWith('ELEVENLABS_API_KEY='));
  const v = line?.slice('ELEVENLABS_API_KEY='.length).trim().replace(/^["']|["']$/g, '');
  if (!v) throw new Error('ELEVENLABS_API_KEY missing');
  return v;
}

async function eleven(url, body, out) {
  if (existsSync(out)) { console.log('reuse', out); return; }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey(), 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify(body),
  });
  if (!res.ok) { console.log('HTTP', res.status, await res.text()); process.exit(1); }
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  console.log('saved', out);
}

const duration = f => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());

// 1. Voice lines
const lines = readFileSync(resolve(here, 'src', `${name}.voice.txt`), 'utf8').replace(/\r/g, '').split('\n').map(s => s.trim()).filter(Boolean);
if (lines.length !== DESIGN.length - 1) throw new Error(`need ${DESIGN.length - 1} lines, got ${lines.length}`);
for (const [i, text] of lines.entries()) {
  await eleven(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
    { text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.6, similarity_boost: 0.75, style: 0 } },
    join(outDir, `line-${i + 1}.mp3`));
}

// 2. Timeline: each scene lasts as long as its design length or its voice line, whichever is longer
const voiceLen = lines.map((_, i) => duration(join(outDir, `line-${i + 1}.mp3`)));
const real = [0];
for (let i = 0; i < voiceLen.length; i++) {
  const need = LEAD[i] + voiceLen[i] + TAIL;
  real.push(+(real[i] + Math.max(DESIGN[i + 1] - DESIGN[i], need)).toFixed(3));
}
real[real.length - 1] += 0.8; // hold the end card
writeFileSync(join(outDir, 'timeline.json'), JSON.stringify({ design: DESIGN, real, voiceLen }, null, 2));
console.log('scene starts (s):', real.join(' · '));

// 3. Music bed (same prompt as arabtides-video/scripts/music.mjs), as long as the video
await eleven('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128', {
  model_id: 'music_v1',
  prompt: 'Instrumental only, no vocals. Calm ambient track with soft warm pads and gentle sparse piano, light ocean mood, slow tempo around 70 BPM, peaceful and steady, suitable under a spoken voiceover.',
  music_length_ms: Math.max(30000, Math.ceil(real[real.length - 1] + 1) * 1000),
  force_instrumental: true,
}, join(outDir, 'music.mp3'));

// 4. Mix: voice lines at their scene starts, music underneath at low volume with fades
const total = real[real.length - 1];
const inputs = [], filters = [];
lines.forEach((_, i) => {
  inputs.push('-i', join(outDir, `line-${i + 1}.mp3`));
  const ms = Math.round((real[i] + LEAD[i]) * 1000);
  filters.push(`[${i}:a]adelay=${ms}|${ms},aresample=44100[v${i}]`);
});
const m = lines.length;
inputs.push('-i', join(outDir, 'music.mp3'));
filters.push(`[${m}:a]atrim=0:${total},asetpts=N/SR/TB,volume=0.18,afade=t=in:d=1,afade=t=out:st=${(total - 1.5).toFixed(2)}:d=1.5,aresample=44100[mus]`);
filters.push(`${lines.map((_, i) => `[v${i}]`).join('')}[mus]amix=inputs=${m + 1}:duration=longest:normalize=0,atrim=0:${total},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=44100[out]`); // Instagram-level loudness
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', filters.join(';'), '-map', '[out]',
  '-c:a', 'aac', '-b:a', '192k', join(outDir, 'soundtrack.m4a')], { stdio: 'inherit' });
console.log('wrote', join(outDir, 'soundtrack.m4a'), `(${total.toFixed(2)} s)`);
