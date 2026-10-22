# ArabTides brand kit

| What | File |
|---|---|
| Brand guide (logo, colours, fonts, voice, Instagram rules) | `brand-guide.png` · source `src/brand-guide.html` |
| Logo mark (SVG, on navy tile) | `logo/arabtides-mark.svg` |
| Logo mark (SVG, transparent, for light backgrounds) | `logo/arabtides-mark-transparent.svg` |
| Logo mark PNG 1024×1024 | `logo/arabtides-mark-1024.png` |
| Horizontal logo on navy / on white | `logo/arabtides-logo-on-navy.png`, `logo/arabtides-logo-on-white.png` |
| Instagram profile picture 1080×1080 | `instagram/00-profile-picture.png` |
| Launch carousel, 7 slides 1080×1350 | `instagram/01-launch/` |
| Full-moon carousel, 7 slides 1080×1350 | `instagram/02-full-moon/` |
| Full-moon Reel, 1080×1920, 29 s, Arabic voiceover + music | `video/video-01-full-moon.mp4` |
| Reel cover image | `video/video-01-cover.png` |
| "How tides affect fishing" Reel, 29 s, voice + music | `video/video-02-tides-fishing.mp4` (cover `video/video-02-cover.png`) |
| "Solunar fishing hours" Reel, 33 s, voice + music | `video/video-03-solunar.mp4` (cover `video/video-03-cover.png`) |
| "Strongest tides in the Arab world" Reel, 38 s, voice + music | `video/video-04-strongest-tides.mp4` (cover `video/video-04-cover.png`) |
| "How to read a tide table" Reel, 34 s, voice + music | `video/video-05-tide-table.mp4` (cover `video/video-05-cover.png`) |
| "Where to fish by tide" Reel (beach, port, rocks), 39 s, voice + music | `video/video-06-where-to-fish.mp4` (cover `video/video-06-cover.png`, caption `video/video-06-caption.txt`) |
| "Fish of the week" Reel: 6 fish, local names with flags, facts, comment prompt; 48 s, voice + music | `video/video-07-fish-of-week.mp4` (cover `video/video-07-cover.png`, caption `video/video-07-caption.txt`) |
| "Full moon night" Reel: moon rises at sunset on 26 Oct, night high tides at Muscat/Kuwait/Dubai/Casablanca, night safety; 43 s, voice + music | `video/video-08-full-moon-night.mp4` (cover `video/video-08-cover.png`, caption `video/video-08-caption.txt`) |
| "3 shore-fishing mistakes" Reel (beach, port), 39 s, voice + music | `video/video-09-mistakes.mp4` (cover `video/video-09-cover.png`, caption `video/video-09-caption.txt`) |
| "Fish of the week 2" Reel: 6 more fish, local names with flags, facts, where and when to fish each; 1 min 43 s, voice + music | `video/video-10-fish-of-week-2.mp4` (cover `video/video-10-cover.png`, caption `video/video-10-caption.txt`) |
| "Dawn and dusk" Reel: light change, tide + dawn/dusk, mosque on the shore; 33 s, voice + music | `video/video-11-dawn-dusk.mp4` (cover `video/video-11-cover.png`, caption `video/video-11-caption.txt`) |
| "Meet the website" Reel: real arabtides.com screenshots on a phone (36 ports, tides, 7-day and monthly ratings, sun/moon/solunar/prayer, fish guide); 56 s, voice + music | `video/video-12-website.mp4` (cover `video/video-12-cover.png`, caption `video/video-12-caption.txt`; screenshots in `video/video-12-website/shots/`, retake with `MSYS_NO_PATHCONV=1 node brand/site-shots.mjs ...`) |
| Captions, alt text, bio | `instagram/captions.md` |

## Colours

| Name | Hex | Use |
|---|---|---|
| Deep Sea (كحلي) | `#0B2540` | primary background |
| Open Water | `#0F3D5C` | gradients |
| Tide Teal | `#0D9488` | accent on light |
| Lagoon | `#2DD4BF` | accent on dark, high tide |
| Moon Sand | `#FDE68A` | the moon only, sparingly |
| Low-Tide Coral | `#F43F5E` | low tide only |
| Sea Foam | `#F4F8F9` | light background |
| Ink | `#0F172A` | text on light |

Fonts (Google Fonts, free): **Reem Kufi** for headlines, **Noto Naskh Arabic** for body text, **Inter** for numbers and times.

## Editing and re-exporting

Every PNG is rendered from the HTML in `src/`. Edit the text there, then run from Git Bash:

```
bash brand/render.sh
```

It uses your installed Chrome.

Voiceover and music come from ElevenLabs (key read from `arabtides-videos/arabtides-video/.env`). Generated audio is cached in `video/<name>/`, so re-running costs nothing unless you delete a file:

```
node brand/voiceover.mjs video-01-full-moon
```

Videos render frame by frame from `src/video-*.html` (each exposes `renderAt(seconds)`), then ffmpeg encodes them:

```
node brand/render-video.mjs video-01-full-moon
```

This needs Node 22+ and ffmpeg on PATH. To preview one moment in the browser, open for example `src/video-01-full-moon.html?t=10`. To preview all the slides of a post in the browser, open for example `src/ig-02-full-moon.html?all`.
