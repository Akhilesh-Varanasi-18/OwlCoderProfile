# Owl Coder — the walkthrough

A presentation of the Owl Coder platform, section by section, screen by screen.
Nine sections, ten steps and three act breaks. Built as a deck, not a
scroll page: arrows walk the steps, the counter moves between sections.

Live product: https://owlcoder.technicalhub.io

---

## Running it

```bash
node serve.js          # http://localhost:8080  (optional port argument)
```

No build step, and nothing to install. GSAP loads from CDN. Deploy by copying
`index.html` and `assets/` to a web root.

---

## What ships, and what does not

`assets/` is the site: 53 MB, of which 51 MB is recordings. Everything else —
markup, styles, scripts, images, Lottie — is under 2 MB.

Two folders are **not** in the repository and are not served: `owlcoder_data/`
(the client's screenshots, brochure and logo pack) and `screen_recordings/`
(the original captures every clip was cut from). Together they are over a
gigabyte, nothing in the deck loads them, and they are the only originals —
keep a backup, and use Git LFS if they ever have to be versioned.

### The recordings as they are shipped

Every clip came off the screen recorder at about **6.9 Mbps**, which is a
bitrate for camera footage. A screen barely changes between frames, so that is
five to ten times more than the picture needs. They also carried an AAC track
nothing plays — the deck mutes everything — and their `moov` atom sat *after*
the data, so a browser had to finish the whole download before it could show a
single frame.

All three are fixed, and **251 MB became 50 MB**:

| | |
| --- | --- |
| over 1.5 Mbps | re-encoded at CRF 18, `-preset slow`, audio dropped, `+faststart`, a 2-second GOP so the camera's restarts seek quickly |
| under | remuxed only: audio dropped, `+faststart` |

Measured against the sources: **SSIM 0.9993, PSNR 55 dB**, identical frame
counts and identical durations — so every cue time in the `.cues.json` tracks
still lands where it did.

**The frame size was deliberately left alone.** Recordly zooms into these, and
sharpness in this deck is a ratio of source pixels to pane pixels, not a
property of the file — see "Why a recording looks soft" below. Shrinking the
source is the one change that would actually make them look cheap.

`scratchpad/encode_video.js` does the pass and verifies every output against
its source. To redo it, put the originals back and run it again.

---

## How it navigates

Two levels, taken from the Myna deck.

- **Arrows walk steps.** Right, down, space and Page Down go forward; left, up
  and Page Up go back. `Home` and `End` jump to the ends. `F` is fullscreen.
  The wheel and a vertical swipe also step.
- **The counter moves between sections.** It reads `NN / 09`, not the step
  number, so the audience sees progress through the product rather than through
  slides.
- **The left rail starts collapsed** — a column of icon tiles, the section
  name on hover, the active one lit. Expand it and the active section opens
  to list its steps and mark the one you are on. Any section or step is
  clickable.
- **A step rail sits along the bottom** of every multi-step slide, naming each
  step in that section, so you can see how far through it you are without
  looking left.
- **Present** goes fullscreen, hides the rail and returns to the first step.

---

## The order

| # | Section | Steps |
|---|---|---|
| 01 | Opening | 2 |
| 02 | The Dashboard | 1 (six beats) |
| 03 | Courses | 1 (six windows) |
| 04 | Practise | 1 (four cards) |
| 05 | AI Mentor | 1 (three moments) |
| 06 | Reports | 1 (four beats) |
| 07 | Coding Contest | 1 (five beats) |
| 08 | Admin Panel | 1 (six beats) |
| 09 | Get started | 1 (a wall of badges) |

Act breaks hold between them: **I · The Student** before 02, **II · The Arena**
before 07, **III · The Institution** before 08. Each is a wall in perspective
with the chapter title as solid extruded type that pushes out of it — a real
CSS extrusion of thirty stacked layers, a light sweeping the face, a shadow
growing on the wall (`assets/js/wall.js`, `assets/css/wall.css`). No owl on
these slides.

The full step list and the per-section recording brief are in
`docs/RUNNING-ORDER.md`.

---

## The opening

The first step is an assembly, about five seconds. Glowing nodes hang in a
cloud, then fly to the intersections of a 3D grid shaped like a classic
desktop — foot first, then the stand, then the display row by row — and grid
lines draw through each row as it lands, so the skeleton is a wireframe with
depth. A flash makes it solid: a thin-bezel all-in-one with a silver chin,
a plate stand and a foot sweeping forward. A scan line reads the dark
screen, the desktop turns a full circle, and as it settles the real landing
page loads into the glass. The Owl Coder mark rises into the top-right
corner, the desktop eases right, the words take the left column, and last
the watcher fades in, peeking from the bottom left.

The screen is cut to the landing recording's exact aspect (2.16:1), so the
page fills the glass edge to edge.

It lives in `assets/js/assembly.js` and `assets/css/assembly.css`, is
driven by the deck's `play()`/`stop()`, and uses `assets/video/landing-load.mp4`
(the page loading, trimmed from the recording) and `assets/img/owlcoder-logo.png`.

---

## What Owl Coder is

The second step is walked by the arrows without leaving it (a step with
`data-subs="3"` is a slide with four beats). Four cards on the left, each
with a small 3D object — a book, a code cube, a podium, a heatmap — and a
stage on the right. The first arrow lands on Learn; each next arrow selects
the next card and plays its scene on the stage, coded and looping:

- **Learn** — a real module, *Time & Space Complexity*: the Article face
  explains it with a six-class growth chart, the Video face plays the
  module's own intro clip (`assets/video/module-time-complexity.mp4`,
  colour-graded into the palette from the supplied recording, duplicate
  frames dropped and motion-interpolated to 60 fps), the Notes face types
  the key points; the module's lessons tick off and a ring fills. The
  article's read-along highlight is an inline sentence background, so it
  follows the words wherever they wrap.
- **Practise** — an editor types a solution, tests go ✓ ✓ ✗, the AI mentor
  hints, the line is fixed, ✓ ✓ ✓, Accepted.
- **Compete** — a live contest: the clock ticks and the leaderboard reorders
  as "You" climbs to first; the trophy lands.
- **Track** — the isometric heatmap rises cell by cell, the streak counts,
  the improvement line draws, interview-readiness fills.

Clicking a card does the same as the arrows. `assets/js/moves.js`,
`assets/css/moves.css`.

---

## The desk (section 02)

The Dashboard is one step with six beats. A MacBook — aluminium lid, thin
bezel with a notch, hinge, a real keyboard and trackpad on a foreshortened
base, a shadow on the desk — settles at the centre and the real dashboard
recording plays on its screen with the Recordly camera leaning in as the
cursor hovers each component (`assets/video/desk-dashboard.mp4`, 60 fps;
cue track hand-authored in `desk-dashboard.cues.json`). The dashboard's
components, **rebuilt in code as curvy glass cards**, emerge from the screen
and take up a slow **orbit around the laptop** — a tilted ring, wide side to
side and shallow front to back, so a card passes in front of the keyboard at
the front, beside the laptop at the sides, and behind and above the lid at
the back. Laptop and ring share one 3D space, so the lid really occludes a
card passing behind it. Each card bobs on a travelling wave; one orbit takes
~36 s; hovering a card slows the orbit to a crawl; a pop pauses it. Rings
ripple out across the desk and the room drifts under the pointer.

Each arrow pops one card: it leaves the ring and flies to the front as a 3D
object (a FLIP from its live orbit position into a pop layer, with an arc
toward the viewer and a light sweep). Its thickness grows as it comes — six
rounded layers stepped behind the face, so the depth follows the corner
curve exactly rather than straight edge planes that would poke out when the
card tilts. It grows
up to 1.55×, the room blurs and dims behind it, its numbers fill in —
the ring draws, counts count, bars fill, the heatmap lights cell by cell in
random order with its cells standing up — and a description is typed
beside it. The next arrow sends it back to its place in the ring as the next
comes forward. Clicking the blurred room or pressing Esc closes the pop
without losing the place:
the next arrow continues from the following card, and after the fifth it
leaves the section. Clicking a floating slab opens it.

Order: Coding Overview, Linked Profiles (with the real LeetCode, CodeChef
and HackerRank marks from `assets/img/logos/`), All Courses, Heatmap,
Connect — GitHub and LinkedIn as coded 3D tiles, because those links are
real in the product's overview header.

Fast navigation is safe: every beat change first puts any card that is not
in its orbit slot straight back (`settleAll`), so a flight interrupted by
the next arrow, a wheel burst, a rail jump or a card click can never leave a
card stranded in the pop layer. A pop also starts from wherever the card is
at that instant, including mid-way home.

Under 1080 px the laptop sits on top with the slabs in a column beneath,
and the pop becomes a centred sheet. `assets/js/desk.js`,
`assets/css/desk.css`.

---

## The projector (section 03)

Courses is one step with six windows: the shelf, the roadmap, articles,
videos, notes, labs. The arrows walk them; the six tabs in the copy jump
straight to one.

A MacBook (the same build as the desk) sits on one side of the stage with
the copy on the other, over a radiance of drifting green discs and rings
pulsing out from behind the laptop. The real recording of that view plays
on its screen under the Recordly camera: each clip is cut to start about a
second and a half before the click that opens the view and plays that short
lead-in a little faster, so the projection starts two to three seconds
after the laptop lands. At that moment a lens lights at the centre of the screen, a beam
opens from it toward the centre of the stage, and the opened view **comes
out of the laptop as a projection**: a glass panel with stepped layers for
thickness flies out of the lens along the beam, grows to full size, lands
flat with a projector flicker, and its contents build in live. Two status
pills with real numbers attach to the laptop. Behind the panel the
recording keeps scrolling the opened view (a segment loop) under the beam's
light. The owl's eyes sit in the corner opposite the laptop, alternating
high and low, and glide across with each crossing.

The next arrow folds the projection back into the screen, scrolls the copy
away, and **the laptop crosses to the other side** on a shallow arc,
turning to face the other way, while the next copy rises from below; the
screen dips through its own background to the next recording. The laptop
alternates sides window by window, so each window has its own silhouette.
Backward is the exact reverse.

The six projections are proper web UI rebuilt in the palette, none a
screenshot, and every one rests flat and pixel-aligned so the type stays
sharp (the flight is 3D; the transform is cleared on landing):

- **The shelf** — My Courses as the product's grid: six course cards with
  the ring, the six counts and both buttons, rising in with a stagger,
  rings drawing and counts counting; a hover sweep then cycles the cards.
- **The roadmap** — the profile pod beside the modules placed along a
  winding road that paves itself; nodes pop, cards slide in from their
  side, bars fill, DONE and CONTINUE HERE stamp onto their cards, the
  current one glows, the road's dashes travel.
- **Articles** — the article as the product shows it: the list, the page
  with its title and complexity tags, a read-along sentence highlight, the
  code block typing itself, the contents rail following the reading.
- **Videos** — the player at full panel width playing the module's own
  Sliding Window intro (cropped from the recording above its control bar,
  graded into the palette, 60 fps), the scrubber following, the list
  beneath.
- **Notes** — the trainer's note as a ruled sheet with a folded corner
  whose title, bullets and code write themselves; a Trainer stamp lands.
  The recording never loaded a note (a storage error), so the sheet is
  built from the note's real title.
- **Labs** — the Coding Ground problem inside the course: statement, the
  editor typing the solution, Run Code, both test cases turning green.

Each clip is trimmed to the stretch it needs (laptop clips at 1600 wide,
native 30 fps, a keyframe every half second so loop seeks are instant;
`assets/video/courses-*.mp4`) with a hand-authored cue file
for the opening click and a mark, a loop point and an end in `courses.js`.
The player gained segment control for this: `to`, `loopFrom`, `freeze`,
`mark`, `onMark`, plus `from` and `rate` for the lead-in speed.

Fast navigation is safe the same way as the desk: every window change
first settles everything that is not the window being left or the one
arriving, and the crossing starts from the laptop's live position.
Geometry scales with the stage (laptop 640 px, panel 600 px at a 1560×780
reference, up to 1.4×); the panel overlaps the lid by a quarter of its
width and the copy takes the far side. Under 1080 px it becomes a column:
laptop, panel, copy; no crossing.
`assets/js/courses.js`, `assets/css/courses.css`.

A lesson this scene taught twice: every stylesheet loads globally, and
site.css carries short unscoped classes (`.live`, `.p1`, `.p2`, `.sub`,
`.tick`, `.play`). A new scene must prefix every class it uses, and reset
`<s>`/`<u>` if it uses them for markup.

---

## The deck (section 04)

Practise is one step with four cards: trainer problems, trainee problems,
the Coding Ground, company and LeetCode problems. The arrows walk them; the
four monitor dots in the copy jump straight to one.

It opens from the Courses laptop. Arriving by arrow from the labs window,
the same MacBook stands where Courses left it, already showing the practice
page; it glides to the right of the stage, turns to face the viewer, its
base folds up behind the lid, the hinge and the browser chrome go, and the
lid grows into **a plain monitor** — black bezel, aluminium rim, nothing
else. Three more monitors slide in behind it, fanned up and a little to
the right in real perspective, over a soft floor with a pool of shadow and
a faint reflection; a dot grid and two slow blooms sit behind. Entering any
other way, the deck simply rises into place.

Each monitor shows one practice page as proper web UI in the palette: the
app bar, the module tiles, the problem list, the description blocks, the
dark editor, Run and Submit, the compiler-response table. The page is built
from components, and the card plays its **beats**: one component at a time
**cuts out of the glass** — a copy rises straight toward the viewer on one
clean ease, a shadow that follows its own shape growing under it, the page
behind stepping back a little (dimmer, less saturated), a faded ghost of
the component left where it sat and a small tag naming it — and the action
of that beat plays inside it while the rest of the page stays on the
screen. The rise takes half a second and the return a third of one; while it
hovers only the shadow breathes, so the type never moves. When the beat ends
it settles back and the page keeps the end state. (A first version lifted the
pieces with a tremor and a gloss; it read as a glitch and was dropped.) Pages scroll inside the glass when a
later component is below the fold. Lifted pieces rest at an integer
position with an axis-aligned scale and no rotation, so type stays sharp.

Each card lifts only the components that carry its point; the rest of the
page stays on the glass, already in its finished state.

- **Trainer problems** — the module tabs count up; the trainer set lists
  and selects; the batch bar locks then unlocks the set.
- **Trainee problems** — the Maya set lists and Candy Jars is picked; the
  points and submissions count; the problem lifts, its jars fill and the
  winning pair lights.
- **Coding Ground** — the solution **types itself** into the code arena;
  Run compiles; the test cases return Pass; Submit stamps Accepted and
  lights today's cell on a mini heatmap.
- **Company & LeetCode** — the list opens on the module’s own set and
  switches to the Leet tab, the rows changing over to the LeetCode ones
  carrying the real LeetCode mark and their solved ticks; the Accepted card counts 855 / 855 and beats 100 % with the
  runtime bars, solved there and counted here; the company-tagged set with
  its tags.

The copy on the left carries a marker highlight on the headline, inline
highlights in the sentence, a beat tracker that lights and ticks in sync
with the lifted component, and the four dots. The owl's eyes take the
alternate corner on the copy side with every card.

The next arrow dims the top monitor's screen, tips it and drops it; the
deck tilts into 3D (its faces show their thickness), the remaining cards
advance a slot, the fallen card returns at the rear, and the deck swings
back flat as the new top card lands and its transform is cleared. Backward
is the mirror: the rear card lifts out and lands on top while the rest step
back.

---

## The one idea

Every step is a real Owl Coder screen rebuilt in HTML and CSS, never a
screenshot, sitting inside hardware with a reflection on the glass. Then
specific pieces **lift out of that screen** toward the reader in 3D.

The clearest example is the heatmap step: the grid peels off the dashboard and
stands up as an extruded isometric year above the monitor.

Hardware changes with the subject, and there are no phones, because Owl Coder
is a browser product that also runs on a tablet with a keyboard.

| Section | Frame |
|---|---|
| Opening | monitor, laptop and tablet together |
| Dashboard | all-in-one desktop |
| Courses | MacBook on alternating sides, the view projected out of it |
| Practise | a plain monitor, with a deck of them fanned behind it |
| AI Mentor, Contest | open laptop |
| Reports, Leaderboard | monitor on a stand |
| Admin Panel | one large console on a stand, five college screens on an arc behind it |
| Close | the five colleges in a row; then monitor, laptop and tablet together |

---

## The owl

It does not fly. It watches.

- **An owl's face** is held in the far background of every step at about five
  percent opacity and about thirty percent of the viewport wide — two ringed discs with big pupils, the brow ridge meeting
  in a V, a beak between — in one ink, no colour. It is repositioned per
  section, blinks on a long irregular cycle, and its pupils follow the
  pointer. You notice it once and then stop seeing it, which is the point.
- **Act breaks** carry a large outlined owl behind the act numeral.
- **One peek**, on the first beat of the admin panel, where it looks over the
  top edge of the console. It is drawn behind the machine, so only the head
  and the tufts clear the bezel. Once in the whole deck.
- **The last word**, standing beside the three machines on the closing slide.
  Having watched every step from the background, it is allowed to be looked
  at once.

The mascot itself is a cute vector owl built the way the real logo is: gold
body, oversized white face with no outline, very large dark eyes with sparkles,
purple-to-cyan wing, cyan tail. It is defined once in a `<template>` and cloned
into every slot that needs it.

---

## Colour and type

The product's own palette: the green family blended with white, plus the gold
from the owl.

| token | value |
|---|---|
| `--green` / `--green-d` / `--green-l` | `#15893F` / `#0B5D2C` / `#3CB371` |
| `--mint` | `#E9F6EC` |
| `--white` / `--paper` | `#FFFFFF` / `#F6FAF7` |
| `--ink` | `#121A15` |
| `--gold` | `#F7B500` |
| `--rail` | `#10231A`, the only dark surface |

Hanken Grotesk for display and interface, JetBrains Mono for numbers and code.

---

## Recordings

Module screen recordings play inside the deck with a Recordly-style camera:
a fixed 1.5× zoom that leads each click by a second, a spring that settles
without overshoot, motion blur on the move, a pan instead of a zoom-out when
clicks are close. Nothing is re-encoded.

- `tools/cues.js` turns an ordinary recording into a cue file by finding the
  cursor and the moments the screen changes.
- `assets/js/recordly.js` plays the recording and drives the camera from
  those cues. `assets/css/recordly.css` is the window it plays in.
- `recordly-test.html?clip=<path-without-extension>` previews a clip and
  its cues before it goes into the deck.
- `docs/RECORDLY-ANALYSIS.md` has the measured numbers and the recording
  guide.
- Segment control for scenes that play a stretch of a clip: `to` stops or
  loops back to `loopFrom` (or `freeze`s), and `mark`/`onMark` fires once
  when playback crosses a time — the Courses projector uses it as "the
  view has opened".

Clips go in `screen_recordings/`, named as in `docs/RUNNING-ORDER.md`.

---

## What is still a placeholder

Nothing. Every section is built from a recording of the real product or from
coded screens modelled on one. The last gap — section 08, which stood as a
reconstruction while the admin panel was unreachable — closed on 7 Nov 2026
with the five recordings supplied on 4 Nov.

---

## The wall of badges (section 09)

The deck ends on the institutions already running the product, staged from a
motion reference the client supplied: ID badges clipped to a wire, swinging when
you move past them and turning over when you point at one.

One wire sags across the room; from each anchor a cord, from each cord a clip,
and under each clip a college's badge at its own depth — six of them, all on
screen at once, because six is the whole set and showing them together is the
point. **The front is the college** (its own mark on a white plate, its name,
where it is) and **the back is our side of the same card** (the owl, and what
that college actually holds on the platform). The same mark on both sides would
say nothing twice.

Three layers per badge, because they each do one job: `.cg` is placed and faded
by the deck, `.bg-hang` swings on its clip, `.bg-flip` turns over. Putting two
of those on one element makes the swing fight the flip.

The swing is a spring: each badge is pulled toward a slow breath of air, damped,
and shoved by the cursor in proportion to how fast it goes past and how close it
comes. One rAF drives all six and writes one transform each. Tuned by
measurement, not by eye (`scratchpad/probe_swing.js` samples the peak angle
every frame rather than afterwards): it breathes at **1°**, a cursor sweep peaks
at **9.2°** without hitting the clamp, and it is back under 1.5° within two and
a half seconds.

Two things worth knowing:

- **A centred grid item's `max-height: 100%` is cyclic** — the row track is
  sized by the item — so it is dropped, and the two square college logos ran
  straight over the name underneath. The mark plate is a definite box with the
  logo laid absolutely inside it.
- **The world turns pointer events off**, as every scene's does. A badge is the
  one thing in this deck you are meant to be able to touch, so it turns them
  back on for itself.

### Who is on the wall

The six marks the client supplied. Four of them — SRKR, NCET, YCCE and Geetha —
are rows in the admin panel's own Organizations list, and their badges carry the
figures its Granted Content and contest tables record. The two Nagarjuna
colleges (Management Science and Studies, and Degree College) are **not** in
that list, so their badges carry no figures rather than a guess, and say so on
the back. Aditya University *is* in the panel, marked Inactive, and no mark was
supplied for it, so it is not on the wall.

---

## The admin house (section 08)

The institution's machinery drawn as one building: a white isometric cutaway on
graph paper, with five lit points standing beside the parts of it that matter —
the control desk, the company bank, the practice bank, the contest stage and the
content shelves. A route runs along the floor between them and fills as the
section is walked. Six beats: the house, then its five points.

Opening a point lights it, steps the house back and aside, and raises a panel
out of it carrying that part's recording with its description typing alongside.
The leader line stays drawn from the point to the panel, so what you are looking
at is never detached from where it lives in the building.

The model is **generated, not drawn**: every box is placed in world coordinates
and projected (x right-and-down, y left-and-down, z up), so the geometry is exact
at any size and the five points sit precisely beside their own machinery.

### The room behind it

At rest the house stands right of centre, so the opening words have the left of
the room to themselves rather than running under the roof. What fills the space
they leave is the deck's usual device — every room carries a watermark of the
thing it is about, a report sheet for Reports, a console for the old admin — and
for a building it can only be **its own floor plan**: flat and square against the
isometric view, carrying a draughtsman's title block, at a whisper. It is drawn
from the footprints the model collects as it builds itself, so it is the same
building and cannot drift from it.

Behind that, a drafting lattice at the model's own three angles, masked out of
the middle so it fills the room without ever being seen behind the house, and a
soft wash to give the empty corner some weight.

A plan and an isometric model are both faint green line work, so standing one
behind the other reads as a single confused drawing. When a point opens and the
house moves to the left, the plan crosses to the other side and turns off
square, and the lattice's clear window follows the house. Both are cheap only if
they are done the cheap way: the plan travels by **transform**, not by `left`
and `width`, and the lattice **switches** its mask rather than transitioning it
— animating a mask-image re-rasterises the whole room every frame and cost the
scene a quarter of its frame rate.

### The slide says its own name

Whoever is presenting should be able to read which room they are standing in
without looking anywhere else, so the slide's name is not in the small type
beside the picture — it is on a plate across the top of it, aligned to the
picture's own width, in the mono the rest of the deck labels things with, with
the point's number beside it (`03 / 05`). It fills itself in from the left as the
point opens, with one flick of the machine catching up with itself, the rule
running out beside it, and a slow sweep crossing it while the recording plays.

### Nothing in it stands still

While a point is open the slide used to have nothing moving in it but the
recording, so the house **floats** — about 13 px, for as long as the point is
open. Three things make that cheap, and each was measured:

- **The stage is promoted.** Without a layer of its own, moving the house
  re-rasterises every element in the model on every frame and the beat change
  falls to 40 fps.
- **It holds still while it travels.** A float running through the move costs
  the change a third of its frame rate, for motion nobody can see under a
  travelling house; it starts once everything has arrived.
- **The line to the panel is re-struck each frame** from the point's new
  height, so it stays glued to the pill at one end and the panel at the other —
  measured at within 0.12 px of the pill's centre through a 12.7 px bob.

The room moves too: rings go out from four places in it, the way one panel
reaches the colleges it serves, motes drift up through the drawing, and the walk
on the plan runs. All of it on transform and opacity alone, so it is handed to
the compositor, and it runs only while the section is on stage.

### The floor plan is the layout

Nothing in the building stands inside anything else, and every leg of the route
runs down an aisle. That is not tidiness for its own sake: the route is drawn in
a layer **above** the model so that it keeps its colour while the building dims,
which means a route crossing a rack reads as a line scribbled over the drawing.
So the racks leave aisles, and each point stands at the mouth of its bay rather
than on top of it — which also keeps the pills off the name lying on the roof.
Each point sits **part way along a leg**, never on a corner, so the walk passes
cleanly through it instead of turning on top of it.

The walked and unwalked halves of the route are two paths on the same geometry.
The lit one is drawn **wider** than its bed: at equal weight the bed's edge shows
along the fill and the route reads as two overlapping lines rather than one
filling one. One number drives the fill, the head that rides on its end and which
floor nodes have been reached, so those three can never disagree.

### Four things worth knowing

- **`vector-effect: non-scaling-stroke` and `getTotalLength()` disagree.** The
  first measures dashes in screen pixels, the second answers in user units, so a
  route "hidden" behind a full dash offset drew in pieces instead. The route
  carries no vector-effect; its widths are user units.
- **Type on an isometric plane is a matrix, and the matrix must not mirror.**
  The roof's name maps text-x to world −y and text-y to world +x, which gives a
  positive determinant; the obvious pairing gives a negative one and the word
  comes out backwards.
- **An svg with `preserveAspectRatio="meet"` letterboxes its own contents**, so a
  point's position is not its share of the element's width. The pills are placed
  through the real fit (scale, then the centring offset), which is what stands
  each one on its own stem.
- **A pill's box is computed, not measured.** Two reasons. gsap rewrites the
  transform on every scale change and **drops a `translate(-50%,-100%)`'s
  vertical half**, so the anchor is set as xPercent/yPercent instead; and at the
  moment the panel is placed the pill is still growing, so a measured right edge
  lands inside the name and the line to the panel strikes through it. The foot,
  the step-aside transform and the natural size are all known, so the box is
  worked out from those.

Everything the house does while a point is open answers one question: can the
name still be read? The pills ride inside the stage, so stepping the house back
would shrink them with it — each is scaled by the inverse about its own foot, and
the four that are not open fold back to their dot rather than shrink to a smudge.

**The panel is painted once while the house is idle**, the same lesson as the
contest sheets — and all five recordings with it, because each one's first frame
costs its own decode. Point changes are 14–90 ms worst frame; the house rests at
145 fps.

### Why a recording looks soft, and what actually fixes it

The admin recordings are 1918 px wide and the panel is 780 px. Showing one whole
is a 2.5× reduction, and small type does not survive that — the detail is gone
before anything in the pipeline touches it. That is worth stating because the
obvious suspects are all wrong, and each was measured rather than guessed
(`scratchpad/probe_sharp.js` parks the camera on a cue and scores the gradient
energy of the picture; `probe_sharp2.js` scores a bare `<video>` of the same
frame as a control):

- **It is not the transform.** A CSS `scale()` on a `<video>` was the first
  suspect — a raster made at window size and then blown up. Laying the picture out at
  the size it reaches when zoomed and scaling it *down* from there makes the
  zoomed state a 1:1 draw. Measured difference: **0.5%** — Chrome already draws
  video at composite scale — and the bigger layers cost the house a third of its
  frame rate with five recordings on the page. Reverted.
- **It is not the pipeline.** In the scene the picture scores 11.75; a bare
  `<video>` of the same frame at the same width scores 11.87. **Within 1% of the
  best any pipeline could do.**
- **It is the ratio, so the only lever is showing fewer source pixels.** The
  player now takes a `base` zoom — where the camera rests — plus a `gain` on
  what each cue asks for. The house rests at 1.08 anchored on the
  frame's top-left, where the admin's nav, breadcrumb and first columns live.
  The recording is never shown whole. Both default to 1, so every other scene
  is untouched.

The panel's picture is also **not the recording's shape**. Its width is pinned by
the house beside it, so the only way to give it more picture is to give it more
height: the pane is 1.55:1 and the player `fill`s it from the recording's
top-left rather than fitting the whole frame inside it. More rows, a third
taller, and the left-hand nav still in view.

---

## The sheet of glass (section 07)

The Coding Contest is the only dark room in the deck, and the only section whose
staging comes from a motion reference the client supplied rather than from the
product. One sheet of glass hangs in the middle of the room carrying a contest
screen, electricity running round its edge; smaller panes drift in the depth
behind it, and a lit pad throws a beam up into it. The arrow cracks the glass,
the pieces fly out past the viewer, and the next sheet is already coming forward
through the gap. Five beats: the contest list, the rules, the countdown, the
arena, the leader board.

The reference is blue and ours is green: the room, the electricity and the glass
are all built out of the product's own palette, with gold reserved for the
single warm edge along the floor.

Two of the five beats had no recording. The countdown page and the coding arena
are rebuilt in the deck from the product's own screenshots and played as though
they had been recorded: the clock counts down to zero and the Attempt button
appears, the code types itself into the editor line by line, Run Code fills the
compiler response and every hidden test case passes. The red guide labels
printed on those screenshots are not part of the product and are not there.

What makes the pane read as glass is thickness, not transparency: a visible
bevel with the light down its top and left, a frosted margin between that bevel
and the picture, a shadow cast inward onto the picture from the glass above it,
and one long specular streak across the whole face. Each sheet rests turned the
opposite way to the one before it, swings in from past that angle and settles
onto it with a knock.

The electricity is not an outline. A faint charge sits in the edge, and four
live arcs own a stretch of the perimeter each — crawling along it, throwing a
filament into the room, carrying a hot node where they touch the glass, and
dying to be replaced somewhere else.

The sheet does not break; it boils away. On the arrow it dims, lets go of
itself into about five hundred small balls, and they drop out of the room,
fading as they fall so that they are gone by the time they reach its floor — while the next sheet is already coming forward. On a
beat that is playing a recording the balls are coloured **from the picture
itself**: one frame is read into a small grid and each ball takes the colour of
its own patch, so the screen genuinely turns into them. The two built screens
have no frame to read, so they carry their own palette. It replaced a glass
break that read as a pattern laid over a video, and it costs a third as much:
the beat change went from a 222 ms worst frame to 77 ms.

Three things were softening the picture, and all three are gone: the player was
enlarging a 1900 px recording past the 1490 px it had to show it in, its motion
blur was sized for a full-screen player, and the glass's specular streak was a
blurred layer lying over the content.

Five things worth knowing about the build:

- **The electricity is a canvas, redrawn twelve times a second.** Real lightning
  flickers rather than slides. It is rendered at just over half size and
  stretched back up, and its glow is three strokes of decreasing width rather
  than a shadow — a shadowed stroke over an area that size is the most expensive
  thing a canvas can be asked to do. That one change took the scene from 9 fps
  to 77 while it rests.
- **A piece of broken glass is only as big as itself.** The first version gave
  every shard the full size of the sheet and clipped it to a polygon, which is
  two dozen slide-sized layers rasterised in full. Each is now sized to its own
  fragment.
- **The first paint of a sheet costs a third of a second** — a slide's worth of
  recording, gradients and type. Measured: every change of beat stalled the
  first time round and none of them stalled the second. So each sheet, and the
  break machinery itself, is painted once at a five-hundredth of an opacity
  while the scene is resting.
- **Every break starts from a known pose.** The same rule as the folder: the
  break is built from callbacks, an arrow mid-flight kills them, and the room is
  put back before the next one begins.

---

## The folder and the screen (section 06)

Reports is one step with four beats. A glass folder stands in the middle of the
room with its three report papers in the air around it — the staging comes from
the reference the client supplied, recoloured onto our palette. The section
title sits under the whole arrangement rather than behind it.

The word REPORTS is raised off the folder's own glass: one span per layer
stepped along z, the front one wearing a gradient clipped to the letters under a
hairline rim, built the way the act dividers build their titles. It is what
tells the first beat, without a word of copy being read, what the folder is full
of. It lives inside the folder's 3D space, so it is turned exactly as the folder
is turned and travels, scales and drifts with it for free; it sinks back into
the glass on the arrow and rises again when the folder comes home.

The arrow shrinks the folder into the bottom-left corner and draws a pull-down
presentation screen down in its place; a projector rises underneath and its lens
comes up. Only then does the report leave the folder: the page screws itself
into a ball, floats across the room in an arc into the lens, and the recording
opens out on the sheet. The words stand on the left quarter.

Walking between two reports leaves the screen and the projector exactly where
they are — one ball flies home to the folder and opens out flat again while the
next is already on its way to the lens. Only the return to the folder rolls the
screen back up.

Three things worth knowing about the build:

- **The sheet takes the recording's own shape** (`CLIP_AR`), so nothing is
  cropped off the projection, and the camera is held at `zoom: 1.16` instead of
  Recordly's usual 1.5×. A report is a page of tables; hunting the cursor would
  cut columns off it.
- **No `backdrop-filter` on the glass.** Over a near-white stage it only smears
  the panel behind into a halo and costs a composite layer for the privilege.
  The frosting is painted instead — a soft white mass inside the panel standing
  in for the papers — and the folder brings its own pool of colour with it,
  because glass is only visible against something.
- **Nothing is ever scaled between two sizes.** The folder travelling to the
  corner used to scale from 160px to 420px, which stretches every rim and
  shadow and then snaps back to the real geometry on landing. It tweens its
  box instead, so it is the right folder at every frame.
- **Every moving piece is two layers**: a wrapper carrying the entrance, the
  drift and the flight, and an inner element carrying the 3D pose. `clearProps`
  takes the whole transform rather than the one property it names, so sharing
  one element between a tween and a pose loses the pose.
- **The beats are built at their natural pace and played faster.** Every
  transition is assembled the way it reads best and then run at `SPEED`, so the
  shape of the choreography is kept and only the clock moves — the first arrow
  out of the folder took three and a half seconds, which read as waiting rather
  than watching, and now takes 2.2. One thing this forces: the crushed ball's
  flight is positioned on a timeline instead of delayed, because a delay does
  not answer to `timeScale` and the ball would arrive after the projection had
  already opened.
- **The lamp is part of the choreography.** A projector whose picture has gone
  is not still lit: the beam, the lens glass, the glow and the status light all
  go out as the report folds back into the lens, and come up again only when the
  next one reaches the glass — about a second of darkness in the middle of a
  1.7-second change. The lens and the LED are pseudo-elements, so they are
  switched with a class (`.rj-off`) and a CSS transition rather than a tween,
  and that class belongs to the pose like everything else `settleTo()` restores.
- **Every beat starts from a known pose.** The beats are built from callbacks —
  the paper is released, the clip is paused, the folder's props are cleared —
  and an arrow pressed mid-flight kills the timeline those callbacks live on.
  `settleTo()` puts the furniture back before any new beat begins.

The watcher is kept out of this section entirely.

---

## The three moments (section 05)

AI Mentor is one step with three moments: before you start, while you code,
after you submit. The arrows walk them; the three bars in the copy jump
straight to one.

Each moment is one slide holding three things side by side — the words on the
left, a live screen in the middle, and the person at their desk on the right.
The people are three supplied Lottie animations, recoloured onto our palette
(see **Preparing the animations** below). They are vector, so there is no
resolution to run out of, and they loop while their slide is on stage.

The screen is not a picture of the product; it is the product being used. It
replays what the recordings show, beat for beat: a dark head carrying the
mentor's mark, then the three moments — Before Start, After Start, Submitted —
as a large segmented control with a filled pill under the one this slide is
about. That control is the loudest thing on the panel on purpose; it is what
tells you which of the three you are watching.

Below it the five real questions for that moment. A pointer runs down them and
each one it passes lifts clear of the rest; it settles on one, clicks, and the
list gives way to <i>Thinking about your question…</i> centred in the panel.
The answer then fades in a block at a time — nothing is typed. It is left up
long enough to read, Back is pressed, the answer fades away upward, and the
list comes home for a second question and a second answer. Then it loops. One
cycle runs about twenty-six seconds, with the first answer up by twelve.

Behind all three slides the room itself says what the section is about. A
network of four layers is drawn across the back — every node, every link — with
signals travelling the links the whole time the section is on screen. Along the
bottom the promise of the section is laid on the floor of the room: a wordmark
tilted back on a perspective plane, its near edge at the bottom of the stage
and its far edge fading away, scrolling continuously. Letting it recede is what
allows it to be very large and still read as depth rather than as a banner.

Both are kept to a whisper. The network is masked out before it reaches the
words on the left so nothing has to be read through it, and the wordmark fades
at both ends. The watcher takes a different place on each of the three moments
rather than sitting in one spot throughout — all three in the upper band, since
the floor of this room already belongs to the wordmark.

The panel never resizes while this happens. Its body is pinned to the tallest
of its states, measured off-stage first, so it holds one position from start to
finish and the composition never shifts under the reader.

The arrow sends the whole slide into the depth of the room at once — words,
screen and person together, shrinking, blurring and fading — while the next
arrives from in front of the camera and settles back. The depth travel is slow
enough to read; the opacity is handed over in half that time so the two are
never both legible at once.

- **Before you start** — "Explain this problem in simple terms" returns a
  restatement, what to find, and the houses-with-lights analogy; then "Give me
  a hint to start coding?" names the variables and the next step. No code.
- **While you code** — "My code is too slow" names the n² restart as the cause
  and asks the question that leads to prefix counts; then "Hidden test cases
  are failing" names the three shapes worth checking. It never writes the fix.
- **After you submit** — "What is the time and space complexity" gives O(n) and
  O(n) with the reasoning, then points at the sliding window without writing
  it; then "How would I explain this in an interview?" gives the thirty-second
  framing.

Under each headline two ticks say what the mentor does and one cross says what
it will not do. That promise — it guides, it never hands you the answer — is
the section.

### Preparing the animations

The three animations arrived as `.lottie` bundles and live unpacked in
`source/lottie-src/`. `assets/lottie/{lta,ltb,ltc}.json` is what the page
loads, and it is built, not edited by hand:

```
node tools/recolour-raster.js    # only ltc — its artwork is 34 raster layers
node tools/prep-lottie.js        # all three — plates, assets, vector colour
```

Three things that cost real time and are worth knowing:

- **A `.lottie` bundle marks its images `e:1` (embedded) while `p` still names
  a file**, so the player looks for a file that is not there and the frame
  renders garbled. `prep-lottie.js` inlines each one as a `data:` URI.
- **Each animation ships its own opaque white background** — a solid layer in
  one, a canvas-sized flat PNG in another. On the page that reads as a pasted
  rectangle, so `stripPlates` drops any canvas-sized near-white solid or image
  layer and the artwork floats on our own background.
- **A flat hue rotation cannot do the recolour.** It takes the blues to green
  but drags skin to purple with them. `recolour-raster.js` moves only pixels
  whose hue sits in the blue/violet band, and folds anything dark in that band
  down to a near-black green instead of across — otherwise the hair comes back
  the same bright green as the shirt.

**The people are our own vector artwork**, posed from one parametrised figure:
tapered torso, limbs stroked as capsules with a darker pass underneath so the
edges read, a task chair, a desk crossing in front. They carry their own
palette variables. If a licensed character set is ever preferred, only the
three figure builders change.

---

## One rule about class names

Every stylesheet here is loaded globally, so a bare single-class rule in a later
file silently restyles any earlier scene that happens to use the same name. This
has bitten the deck twice. Prefix every class a scene owns, and scope anything
that has to stay short. `scratchpad/audit_css2.js` lists every bare single-class
rule whose name another stylesheet also styles; run it after adding a scene.

**The audit only sees across files, and a scene can collide with itself.** The
admin house names the tone of a rack's shelf `hs-plate`; a title plate added to
the same scene later took the same name, and every one of the model's hundred
shelf polygons quietly became a flex container. Nothing looked wrong — svg
shapes ignore most of it — and the audit said nothing, because both were in the
same stylesheet. It showed up as a measurement: the plate came back 49px wide
when it was plainly 750px on screen, because `querySelector` had found a
polygon. The same thing happened once before with `hs-stage`. **When a scene
uses one prefix for both its layout and its material tones, check a new name
against the file itself, not just against the others.**

---

## The rail, and scenes that have to follow it

Every scene lays itself out from its own `clientWidth` and re-lays-out on
`resize`. That is enough for a window being dragged, and not enough for this
deck: the rail collapses and expands, present mode hides it, fullscreen comes
and goes — and each of those changes the width of `.stage` while the window
stays exactly the same size. A scene therefore kept the geometry it was built
with and sat at the wrong width: recordings at the old size, a wall of badges
still spaced for the other rail.

Rather than teach ten scenes about the rail, **one `ResizeObserver` on `.stage`
in site.js turns any change of its box into the `resize` event they all already
understand**.

That immediately exposed a latent crash: the rail paints from `secOf(at)`, and
`at` is `-1` until the first step opens, so a resize fired before then asked for
the section of step −1 and threw. `secOf` now returns −1 for anything out of
range.

Two other things about the shell were wrong and are worth writing down.

**The toggle keeps one seat.** It used to sit at the top of the open rail and
at the foot of the collapsed one, so the button that opened the rail and the
button that closed it were at opposite ends of it. It is at the top in both,
hanging half over the rail's right edge.

**Present mode was painting the whole sidebar onto the slide.** It sets
`--rail-w` to `0` and then slid the rail off screen with
`transform: translateX(-100%)` — which, on a box of zero width, is nought
pixels. The background had no width to draw, but the icons, the wordmark and
the toggle are laid out beyond it and went on painting, with the slide showing
through behind them. Present mode hides the rail outright now; the `overflow`
matters on its own, because `.rail-tog` deliberately hangs over the rail's
right edge and would otherwise still show. `scratchpad/test_present.js` covers
both, and that leaving present mode restores the rail, its width and its open
section list.

### The toggle does not slide, and that is the point

The first version debounced the observer past the rail's .45s slide, so a scene
sat at the old width for the whole of it and then jumped. That reads as a stall.
The obvious answer — re-lay the scene out on every frame of the slide — is worse,
and the numbers say why. On the Intel UHD this deck is shown on:

| through the toggle | the .45s slide | snapped |
| --- | --- | --- |
| The Dashboard | 20fps, 7 long frames | 33fps, 2 |
| Courses | 12fps, 6 | 21fps, 3 |
| Practise | 15fps, 5 | 97fps, 1 |
| AI Mentor | 60fps, 0 | 128fps, 0 |
| Admin Panel | 41fps, 2 | 131fps, 1 |
| Get started | 81fps, 0 | 139fps, 0 |

`.stage` is `position: fixed` with `left: var(--rail-w)`, and **a width on a
transition is a layout on every frame** — of the whole scene, because the whole
scene is inside it. Muting every scene's resize listener and letting the stage
slide on its own still cost half the frame rate, so there was nothing to
optimise in the scenes: the slide itself was the bill.

So the rail does not slide open. Its width, the stage's `left` and every
scene's layout all change in **one frame**, which is also the only way they can
be in step with each other — which is what was wanted in the first place. The
rest of the collapsed rail already worked this way: `body.rail-min`
`display: none`s the labels, the numbers and the foot, so they have always
changed in a single frame. Only the box was pretending otherwise.

One re-seat still costs a long frame — 40 to 70ms of it is the scene rebuilding
itself, the rest is the browser re-laying the stage out — so the observer never
asks twice for the same width: every resize records the box the scenes were just
laid out for, and a stage change that matches it is dropped.

A scene is also not re-seated between `prep()` and `play()`. Those are half a
second apart, and a scene re-seated in the gap would settle into its end pose
and then play its entrance on top of it — a flash. A stage change arriving in
that window is held and delivered the moment `play()` has run.

### What the audit found

Two scenes were not following the stage at all.

**The Dashboard** had no resize handler whatsoever. The orbit reads the room on
every tick so the ring was fine, which is what hid it — but the laptop's size is
a custom property written once, and an opened card's pose (and the column of
type beside it, which is placed from the card's right edge) was worked out from
the room as it was when the card popped. Toggle the rail and the card sat on top
of its own description.

**Courses** re-ran `layout()` but never re-seated the hardware. The laptop is
placed by transform from numbers taken out of the room's width, so it kept the
`x` it was given and walked off the edge of the stage.

**Practise** dropped the component it had lifted out of the card. The lifted
piece is an overlay placed in pixels from the old room, so it cannot simply be
left where it is; it is now put back, the deck re-laid out, and the same beat
raised again from the new geometry.

`scratchpad/test_resize_all.js` walks all nine sections and several of their
beats, toggles the rail both ways on each, and asks three questions: did
anything follow, did it start following before the toggle had finished, and did
the geometry that moved come back exactly. Measuring boxes off the screen is
useless for that — half this deck is in continuous motion and nothing ever reads
the same twice — so the fingerprint is what a scene *derives*: the custom
properties it writes on its root and the inline `left/top/width/height` its
`layout()` writes on everything it places. Anything the scene changes on its own
while nobody touches it is sampled first and subtracted.

---

## The arrows

The arrows, Page keys, space, the wheel and a swipe all walk the deck, and
Home and End jump to the ends. The handler runs in the **capture phase** on
both `window` and `document`, so nothing downstream can swallow a press and a
host that delivers key events to only one of the two still reaches it. A
pointer press claims focus for the page, which an embedded preview panel
needs before it will forward keys at all, and clears focus from a clicked
deck button.

A step change holds a short lock so a burst of presses cannot tear a
transition. The lock's release is scheduled **before** any scene code runs,
so nothing that throws can strand it; a press made while it is held is
remembered and replayed when it lifts; and a lock older than 1.2 s is treated
as stale. `window.deckDiag()` in the console reports the current step, the
lock, the keys seen and any recorded page error.

---

## How a scene enters

Every scene module exposes three calls, and the deck drives them in order:

1. **`prep(step)`** — called by `go()` the instant the step is made visible,
   *before* its fade-in starts. It puts the scene in its start state (desk:
   laptop lowered and dark, cards folded inside the screen and invisible;
   opening: nodes scattered unlit; act wall: letters flat in the wall; moves:
   cards and stage hidden). Without this, the half second between the step
   appearing and `play()` firing shows the raw CSS layout — or whatever the
   scene looked like when it was last left.
2. **`play(step)`** — ~0.55 s later, runs the entrance from that state. It
   is skipped if the deck has already moved on.
3. **`stop(step)`** — on leaving; kills timelines, tickers and listeners.

A new scene should follow the same shape. `scratchpad/test_prep.js` enters
every scene the way a presenter would and samples the first 460 ms;
`scratchpad/test_courses_stress.js` hammers the projector with fast arrows,
wheel bursts, tab jumps and rail jumps mid-crossing.

---

## Editing

- **Copy and screens** live in `index.html`. One `<article class="step">` per
  step, with `data-sec` and `data-label` driving both rails.
- **Colour and type** are tokens at the top of `site.css`.
- **Anything that lifts out** is a `.pop` with a `data-z` depth in pixels.
- **The owl** is the `<template id="owlTpl">` near the top of the document.
- **Adding a step**: drop in an `<article class="step" data-sec="…"
  data-label="…">`. Both rails, the counter and the keyboard pick it up with no
  further wiring.

---

## Reference

- `docs/RUNNING-ORDER.md` — the agreed order and the recording brief.
- `docs/MYNA-REFERENCE-ANALYSIS.md` — teardown of the earlier Myna site.
- `owlcoder_data/` — screenshots, screen recordings and the brochure.
  Reference only; nothing from it ships.
- `.backup/` — the three earlier builds, kept for comparison.
