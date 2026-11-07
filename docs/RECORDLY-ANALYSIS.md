# Recordly, measured — and how the deck reproduces it

Source: `screen_recordings/sample_recordly.mp4` (a Loop walkthrough exported
from Recordly). 832 × 464, 60 fps, 86.35 s, no audio.
Measured 22 Oct 2026 by streaming every frame through a small analyser
(`tools/` holds the working version; the numbers below are what it found).

---

## 1. The frame

| thing | measured |
|---|---|
| background | vertical gradient, cool grey-blue `#B4C2CD` at the top to about `#A4A6A6` at the bottom |
| window | the recording, corners rounded ≈ 0.7 % of the width, dark soft shadow: a `#333` rim directly under the bottom edge fading over ≈ 14 px, lighter ambient darkening above the top edge |
| padding | ≈ 4 % top and bottom, none at the sides — the window is fitted to the width |
| cursor | the system arrow exactly as recorded (white, black outline), scaling with the picture. No ring, no spotlight, no trail. |
| intro | 3 s of the Loop logo drawing itself on black, then a hard cut. That is Loop's own splash screen captured, not a Recordly feature. |
| outro | none; the video ends on the last frame |

## 2. The zoom

**Level.** Always **1.5×**. Nine zoom events were measured by tracking the
width of the app's sidebar; every one peaked at ×1.49. There is no 2×, no
1.2×, no variation by target size.

**Anchor.** The click point goes to the centre of the frame, clamped so the
picture never shows an edge. While zoomed the view **holds still** — it does
not drift after the cursor.

**Timing, for a click at time C.**

| phase | when |
|---|---|
| zoom-in begins | **C − 1.0 to 1.15 s** — it anticipates the click, which only a post-process that knows the future can do |
| reaches 1.5× | about 0.75 s later, so it is settled ≈ 0.3 s before the click |
| hold | through the click |
| zoom-out begins | within 0.1 s after the click |
| zoom-out complete | ≈ 0.7 s later |
| chained clicks | if the next click is within ≈ 1.5 s there is **no zoom-out**: the view pans to the new point in 0.25–0.4 s while staying at 1.5× |
| a modal or page change | zoom goes **out** so the new thing is seen whole |

**Curve.** Starts from zero velocity, no overshoot:

| time into the move | progress |
|---|---|
| 0.05 s | 9 % |
| 0.10 s | 22 % |
| 0.20 s | 52 % |
| 0.40 s | 85 % |
| 0.65 s | 98 % |

That is a critically damped spring, ω ≈ 9 s⁻¹ (`x(t) = 1 − (1 + ωt)·e^(−ωt)`
gives 54 / 87 / 98 % at the same points). Zoom-out follows the same curve.

**Motion blur.** During the fast middle of a move the whole picture is blurred
by several pixels, rising and falling with the speed of the move. It is a
plain blur, not a directional streak.

---

## 3. How the deck does the same thing

Nothing is re-encoded. The recording you send plays as-is; the camera work
happens live in the browser from a small cue file.

### `tools/cues.js` — recording → cue track

```
node tools/cues.js screen_recordings/02-dashboard-01-overview.mp4
```

Reads the clip at 10 fps, half size, greyscale, and finds two things:

- **The cursor**, by continuity. Between quiet frames the only pixels that
  change are where the cursor was and where it is now; following those small
  clusters frame to frame gives its position without a template or a DPI
  guess. On the test clip it was found on 598 of 600 frames.
- **UI change bursts.** A burst after a quiet stretch is a click landing. A
  small burst → `focus` cue at the cursor (or at the centre of the change if
  the cursor is unknown). A burst covering ≥ 45 % of the frame → `nav` cue
  (page change or scroll) → the player shows it whole.

Writes `<clip>.cues.json`: `{ t, x, y, z, kind }` per cue, coordinates
normalised 0–1, plus the cursor track for debugging. The file is plain JSON
and meant to be hand-corrected when a cue lands wrong.

### `assets/js/recordly.js` + `assets/css/recordly.css` — the player

```js
Recordly.load(hostEl, 'clip.mp4', 'clip.cues.json', { autoplay: true });
```

Builds the gradient, the rounded shadowed window and a `<video>` inside it,
then runs a critically damped spring (ω = 9) toward the camera the cues ask
for at the current time: 1.5× on a focus cue from 1.0 s before it until 0.2 s
after, pan instead of zoom-out when the next cue is within 1.5 s, 1× on a nav
cue or when nothing is near. Blur is proportional to on-screen speed, capped
at 7 px. Honours `prefers-reduced-motion` by never zooming.

Numbers live in `Recordly.defaults` and can be passed per mount.

### `recordly-test.html` — harness

`http://localhost:8080/recordly-test.html?clip=screen_recordings/_test/owlcoder-60s`
(path without extension). Space pauses, arrows seek, `0` restarts; the HUD
shows time, current and goal zoom, and pan. Used for checking a cue file
before it goes into the deck.

### Verified

On the first 60 s of `owlcoder_data/owlcodervideo.mp4` (transcoded to
1280 wide for the test): 32 change events → 22 cues, headless Chrome at
1600 × 900 showed 1.50× landing on the cursor, 7 px blur mid-move, 1.00× on
a navigation, and the zoom held through a 6.8 s → 8.0 s chained pair. No
console errors.

---

## 4. Recording the modules so the pipeline lands cleanly

The detector reads clicks from what changes on screen, so the recording
habits matter more than the tool.

1. **Browser maximised at 1920 × 1080**, page zoom 100 %, bookmarks bar
   hidden, no extension icons. Product in light theme.
2. **Keep the system cursor visible.** Xbox Game Bar (`Win + Alt + R`) does by
   default; in OBS tick *Capture cursor*.
3. **Move, pause half a second, click.** The pause is what makes the zoom
   land on the right spot. Do not click while still moving.
4. **Leave about two seconds between clicks** unless you want the camera to
   pan straight from one to the next.
5. **Scroll in short deliberate steps.** A scroll reads as a page change and
   the camera pulls out to show it; a long continuous scroll keeps it out.
6. **Start a second before your first move, stop two seconds after your
   last click.** That gives the lead-in room at both ends.
7. 30 fps is enough; 60 fps draws the cursor more smoothly. Audio is not used.
8. Name clips as in `RUNNING-ORDER.md`, e.g. `02-dashboard-01-overview.mp4`,
   and drop them in `screen_recordings/`.

Plain, flat, full-window captures. No zoom, no effects, no cropping — the
deck adds all of that, and if it is already baked in it cannot be undone.

---

## 5. Where the recordings sit in the deck

Three ways, in order of preference.

**A. Inside the device frames already built.** The coded screen becomes the
poster; when the step opens, the recording plays on the monitor / laptop /
tablet glass with the camera work above. The hardware vocabulary and the
reflections stay; the content becomes real. Recommended.

**B. Full-bleed Recordly window.** Each step is the gradient and the window,
edge to edge, exactly like the reference. Largest picture, least Owl Coder
around it.

**C. Hybrid.** The first step of each section full-bleed (B) to show the
screen large, the detail steps inside devices (A).

In all three the arrows stay in charge: a step's recording plays when the
step is reached and pauses when it is left.


## Segment control (added 23 Oct 2026)

A scene that plays only a stretch of a clip passes `to` (seconds): when
playback reaches it the player loops back to `loopFrom` (default 0) or,
with `freeze: true`, pauses on that frame. `mark` with `onMark(api)` fires
once per run when playback crosses that time; `api.restart()` rewinds,
resets the camera and arms the mark again. A run can start at `from` and
play at `rate` until the mark, then at normal speed (`api.rewind()` parks
the video at `from`, paused). Prefer cutting the clip so `from` is 0: a
seek into a long GOP costs a second or two of decoding in the browser;
if a clip must be seeked into, encode it with frequent keyframes (`-g 15`). The Courses projector trims
each recording to the stretch it needs and uses the mark as the moment the
view has opened — the cue before it is the opening click, the nav cue after
it the page appearing, and the loop point sits after the nav so the camera
never replays the click while the opened view scrolls behind the
projection.


## Smoothing a captured video player (added 24 Oct 2026)

The Sliding Window intro inside the Courses projector is a recording of the
platform's own player, about 11 effective fps. Motion interpolation makes the
gentle stretches (arrows drawing, boxes stepping) smooth, but it ghosts
badly through the module video's fast slide transitions, where whole
elements move further per frame than the block matcher can follow;
`minterpolate` scene-change thresholds cannot separate the two because the
frames are mostly static background, and blend mode double-exposes the
text. The working method is a hybrid (`scratchpad/hybrid_encode.js`): make
a graded, de-duplicated 15 fps base; read the per-frame `scene` score;
flag frames at or above 0.0055 as fast, widened by one frame and merged
across short gaps; cut the base on frame boundaries; interpolate the
gentle segments (umh / 128 / mb 8) and plain-duplicate the fast ones; encode
the segments in parallel and concatenate. The slides stay choppy for a few
tenths of a second but carry no artefacts, and everything else is 60 fps.
The better fix remains the original module video file from the platform.
