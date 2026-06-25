# Taksim Döner & Burger — bilingual photo-menu site (v2 · "alive")

A polished, fast, **single-page static site** with a premium motion layer. Bilingual **TR / EN**
with a remembered toggle, looping hero video (poster fallback), sticky mobile action bar, photo
menu + gallery with lightbox, marquee, animated count-ups, FAQ, floating WhatsApp, and rich
`Restaurant` JSON-LD. No framework, no backend, no build step.

```
.
├── index.html            ← markup + all sections
├── 404.html
├── site.webmanifest
├── css/styles.css        ← design system + components
├── js/
│   ├── main.js           ← i18n, tabs, lightbox, open-now, prices, toast (works with NO libs)
│   └── motion.js         ← GSAP + ScrollTrigger + Lenis layer (optional, guarded)
├── assets/
│   ├── img/  (+ README)  ← photo slots; themed SVG fallbacks live here
│   ├── video/            ← hero-1080.mp4 / .webm (built by fetch-media.sh)
│   ├── *.svg             ← hero + per-category placeholder art (instant, on-topic)
│   ├── og.svg  favicon.svg
├── scripts/fetch-media.sh ← localize photos + build hero video
├── MEDIA-CREDITS.md       ← every stock source + license (no AI imagery)
└── README.md
```

---

## Run locally — DO NOT open via `file://`

Video autoplay, fetch, and module scripts only work over `http://`. Serve it:

```bash
cd "very final taksim doner"
python -m http.server 8000      # or:  npx serve .
# open http://localhost:8000
```

> If `localhost:8000` ever looks dead, it's almost always because the file was opened directly
> (`file://…/index.html`) instead of through the server above.

## Deploy (free, no build step)

Drag the folder into **Netlify** / **Vercel** / **Cloudflare Pages** / **GitHub Pages**, or connect
the repo. Build command: *none*. Publish directory: repo root.

---

## How the media works (important)

To make the demo **alive immediately**, real stock photos are **hotlinked** from Unsplash and the
motion libraries from a CDN. Every external dependency degrades gracefully:

- **Photos** that fail to load fall back to a themed local **SVG** (`img[data-fallback]`) — nothing
  ever renders broken.
- **Motion** (GSAP/Lenis) is feature-detected; if the CDN is blocked or `prefers-reduced-motion`
  is set, the page is fully functional with simple fades only.
- **Hero video** plays only on desktop, with data-saver off, reduced-motion off, and the files
  present; otherwise the **poster image is shown** (and is the intended LCP). It pauses off-screen.

### Localize for production (real perf + offline)
On your own machine (has internet + ffmpeg):

```bash
bash scripts/fetch-media.sh                 # download photos → assets/img + make WebP/AVIF
bash scripts/fetch-media.sh --localize-html # also repoint index.html to local files
```

Then overwrite the downloaded JPGs with the **owner's real photos** (same filename / aspect ratio)
— see [assets/img/README.md](assets/img/README.md) for the slot table + a 12-shot phone list.
For the hero video, drop a clip at `scripts/hero-raw.mp4` and re-run the script.

---

## ⚠️ Placeholders the owner MUST fill

Search `index.html` for each and replace everywhere:

| What | Placeholder | Where |
|---|---|---|
| Phone | `+90XXXXXXXXXX` / `+90 XXX XXX XX XX` | top bar, find us, footer, action bar |
| WhatsApp | `https://wa.me/90XXXXXXXXXX` | footer, floating button, links |
| Instagram | `https://instagram.com/` | footer, JSON-LD `sameAs` |
| Menu items + prices | `data-price` + `₺…` in each `.card` | Menu |
| Real photos + hero video | `assets/img/*` , `assets/video/*` | see media swap above |
| Address | `Taksim Meydanı, Beyoğlu, 34435 İstanbul` | find us, JSON-LD |
| Google rating + reviews | `4.5`, `1200` (count-up `data-count`) | hero, trust, reviews, JSON-LD |
| Halal | "Helal (doğrulanacak)" | trust strip, FAQ, JSON-LD `servesCuisine` |
| Domain | `https://taksimdonerburger.com/` | canonical, OG, JSON-LD |
| € / $ rate | `TRY_PER_EUR = 45`, `TRY_PER_USD = 42` | `js/main.js` |

---

## The "alive" layer (motion)

Built on **GSAP + ScrollTrigger + Lenis**, all behind `prefers-reduced-motion` and feature
detection. Includes: hero headline word-stagger + Ken-Burns poster, scroll-reveal with stagger,
clip-path image wipes, parallax accents, sticky-header shrink + hide-on-scroll, scroll-progress
bar, count-ups, infinite marquee, magnetic buttons + button sheen, hover lift/zoom, animated
TR/EN pill, FLIP-style lightbox (Esc / tap-out / arrow keys / focus-trap), copy-phone toast, and a
desktop custom cursor. Mobile drops the cursor/tilt, reduces parallax, and uses the poster instead
of the video.

## Design system (Bright & Modern)

`bg #FFFFFF` · `surface #FAF7F2` · `ink #181818` · `ink-soft #5B5B5B` · `brand #E23744`
(large/bold only) · `action #C81E2D` (buttons) · `amber #F5A623` (price/Popular chips) ·
`success #1E8E3E` (open-now) · `border #ECE6DE`. Type: **Poppins** 600–800 + **Inter** 400–600,
`tabular-nums` for prices.

### Notes on the locked design system (what changed & why)
- **Tailwind → hand-written token CSS.** Same tokens as the `tailwind.config`; chosen for a true
  zero-build static deploy and the Lighthouse target (the Play CDN ships a large runtime).
- **Fonts via Google Fonts CDN** (not yet self-hosted woff2). Self-host for the last few perf
  points: download the woff2 into `assets/fonts/` and swap the `<link>` for `@font-face`.
- **Real images are hotlinked stock** with SVG fallbacks until `fetch-media.sh` localizes them —
  required because this is a demo that must look alive before the owner's photos exist. **No AI
  imagery** anywhere (see MEDIA-CREDITS.md).
