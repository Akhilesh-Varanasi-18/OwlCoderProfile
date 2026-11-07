# Myna reference analysis

Source: https://mynaprofile.toriiminds.com/ — analysed 15 Oct 2026 from live
`index.html` (308 KB), `assets/js/site.js` (379 KB), `assets/css/site.css` (523 KB).
Written for whoever builds the OwlCoder promo site. Reference only, not a spec to copy.

---

## 1. The stack is not what it looks like

There is **no GSAP, no Three.js, no React, no scroll library**. Zero third-party
runtime dependencies. The whole site is one hand-written JS file and one CSS file,
compiled from `src/scripts/` by a local `build.mjs`. Plain ES5-flavoured JS,
`IntersectionObserver`, CSS custom properties, and CSS 3D transforms.

Every 3D object on the page is **CSS 3D**, not WebGL. There is exactly one
`<canvas>` and it is `2d`. Counts in the stylesheet:

| Feature | Uses |
|---|---|
| `perspective` | 19 |
| `transform-style: preserve-3d` | 6 |
| `rotateX` / `rotateY` / `rotateZ` | 14 / 14 / 5 |
| `@keyframes` | 138 |
| `box-shadow` | 362 |
| `linear-gradient` | 212 |
| `cubic-bezier` | 92 |

The sophistication is in the choreography, not the renderer.

---

## 2. The spine: a scene/beat engine

This is the single most important idea to carry forward.

Each `[data-scene]` section declares `data-beats="N"`. On load, JS **inflates the
section's height** to `pinHeight + (pinHeight x PACE x N)`, where `PACE = 0.58`
viewports of scroll per beat. Inside sits a `position: sticky` `.scene-pin`.

Scroll position across that inflated range becomes a normalised `p`, floored into a
beat index `i`. Changing `i` toggles `.is-on` / `.is-past` on two parallel lists:
`.beat` (the words) and `.screen` (the visual). A beat can also re-tint its whole
section via a `data-accent` attribute.

So one section equals one pinned stage scrubbed through N discrete states. `#prompt`
runs 8 beats, `#test` and `#aimyna` 4 each, `#rise` 5. Painting is rAF-throttled
through a single `paintAll(scrollY)`.

---

## 3. The signature move: handoffs

A device mockup in section A is flown to the **exact pixel** where section B's
mockup will sit, across the last viewport before B pins. A fades out as B fades in
on the identical pixel, so the crossfade is invisible and it reads as one physical
object moving down the page.

- `LAND = 0.84` — the fraction of the range the flight occupies.
- `HANDOFF_ARC = 74px` — mid-flight vertical sag, so it *falls* rather than slides.
- Source and destination fades are written to **separate CSS variables and
  multiplied**, because one stage is both a destination and a source.

Chain on the live site: `hero (right) -> #what (left) -> #skills (right)`.

### The scroll hijack

Across the hero flight the wheel does **not** scroll — it *asks*. One notch down
starts a timed eased glide (480–1150 ms, scaled by distance) all the way to the
destination, and the remainder of the flick plus trackpad momentum is swallowed via
`preventDefault`. Rationale in their own comment: a flight that stalls halfway looks
broken. Any other scroll that comes to rest mid-flight is carried to the end by a
160 ms `settle()` timer.

`scroll-behavior: smooth` is deliberately unused — the browser's duration is not
controllable and is far too quick to read.

### Stops

Every section top, plus every beat inside a scene, is a "stop". Rail links and
arrow keys glide between them. Forward they hop over the middle and land one
viewport short so the flight plays in full; backward they land directly, because
backwards there is no flight to reverse.

---

## 4. birdGate — sequencing, not just triggering

Section entrances do **not** fire on intersection. They wait until the Myna mascot
has landed in that section. `birdGate(el, fn)` runs `fn` immediately when no bird is
inbound (mobile, already perched, or not a stop) and otherwise queues it until
landing. The words and screens go up at once; the typing, zoom, cursor and pops wait.

The payoff: the reader is never asked to watch two things at the same time.

---

## 5. Live video, not screenshots

One single `<video class="vslot">` element exists in the document. Its `src` is
swapped per module, with a poster still preloaded from `assets/img/clips/{id}.jpg`.
Real screen recordings of the production app play inside a CSS-built device frame.
Clips are served from a separate origin, `myna.toriiminds.com:3001/hoot-app-videos/`.

This is the right call and we should repeat it: **the app UI stays in the DOM**.
It is sharper, lighter and more accessible than texturing it onto a WebGL plane.

---

## 6. The actual 3D objects

1. **Phone** — `aspect-ratio: 9/19.51`. One variable `--pw-k` scales every phone on
   the page at once, stepping down at `max-height` 900 / 820 / 740 px so a section
   never outgrows a short window.
2. **Card deck** (`#skills`) — `perspective: 1600px`, draggable, cards fan with
   alternating `--tilt` (`+1.15deg` / `-1.3deg`), thrown out of frame on dismiss.
3. **Laptop** (`#test`) — lid opens on a hinge, `perspective-origin: 50% 80%`
   set just above the hinge line. On leaving, the lid shuts first, then the body goes.
4. **Isometric heat map** (`#rise`) — grid at `rotateX(56deg) rotateZ(-36deg)` with
   `preserve-3d` and per-cell `translateZ(var(--z))` extrusion.
5. **Flipping phone** — enters on `rotateY(-180deg) rotateZ(-8deg) scale(.86)`.

---

## 7. Palette and type

Warm near-black stage, described in their comment as reading "as film, not tech".

```
--stage      #0a0709      --coral      #e2544c   (primary)
--stage-2    #120d10      --coral-lit  #ff6f62
--hairline   #2a2126      --amber      #ed9035
--on         #f7f2f0      --mint       #4cc9a0
--on-2       #a6979b      --violet     #8b7cf0
--paper      #fbf8f6   <- light band, used exactly ONCE as a contrast beat
--ease       cubic-bezier(.22,.61,.36,1)
--ease-out   cubic-bezier(.16,1,.3,1)
```

Five families: Public Sans (UI), Newsreader italic (editorial accents),
IBM Plex Mono, Poppins, Plus Jakarta Sans. Zero `mix-blend-mode`.

---

## 8. Narrative arc

Product tour that turns into an enterprise pitch:

`hero -> what it is -> four skills (deck) -> Prime -> Prompt Mastery (8 beats) ->
Test (4) -> AI coach (4) -> Rise / gamification (5) -> Organizations (6 alternating
left/right subsections) -> cost comparison -> colleges trusted-by`

43 `<section>` elements total. The Organizations block alternates sides via an
`oz-flip` class on every second panel.

---

## 9. Discipline worth stealing

- `prefers-reduced-motion` disables handoffs entirely at construction time.
- A single rAF-throttled scroll painter; never raw scroll handlers doing layout.
- `getBoundingClientRect` used 71 times — measure, never assume.
- Scenes are measured **before** handoffs, because inflating scene heights moves
  every document position a handoff depends on.
- Images fall back across extensions; clip stills preload before they are needed.
