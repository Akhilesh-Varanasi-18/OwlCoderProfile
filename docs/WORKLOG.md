# Owl Coder presentation — work log

One section per working day, closed when the local server is stopped for the
day. Written so a manager can read it; technical detail lives in `README.md`
and the other docs. The project went into Git on 7 Nov 2026, late in Day 8 —
before that this file was the only record, and it stays the plain-language one.

---

## Day 1 — 15–16 Oct 2026 (summary)

- Studied the earlier Myna marketing site as the structural reference.
- Three full design directions built and rejected before the current one.
- Settled the deck architecture: one screen at a time, arrows walk steps,
  the counter moves between sections; 9 sections, 33 steps, 3 act breaks.
- Agreed the running order and wrote the per-section recording brief
  (`docs/RUNNING-ORDER.md`).
- Settled the brand treatment: the owl watches (background eyes) rather
  than flies.

---

## Day 2 — 22 Oct 2026 (from the creation of `screen_recordings/`)

- Studied the Recordly screen-recording tool and measured exactly how its
  auto-zoom behaves, so the effect can be reproduced in our own code.
- Built that effect in-house: any ordinary screen recording now plays
  inside the presentation with smooth cursor-following zoom — no video
  editing, no re-exporting. Includes a preview page for checking clips.
- Rebuilt the opening screen: glowing pieces assemble into a 3D desktop
  layer by layer, the screen scans, the desktop rotates, the live landing
  page loads inside it and the Owl Coder logo rises into place. Refined
  four times on feedback (desktop style, pace, layout).
- Redesigned the owl-eyes brand element as a subtle one-ink watermark whose
  pupils follow the cursor; positioned per section.
- Reworked the side navigation: collapsed by default, clean icon tiles with
  hover labels, correctly centred active state.
- Built the "What is Owl Coder" module: four cards — Learn, Practise,
  Compete, Track — each opening an animated demo of that part of the
  product, walked with the arrow keys (a new sub-step mechanism in the
  deck). Learn uses the real module video we recorded, re-coloured to the
  palette and smoothed to 60 fps; the leaderboard was rebuilt as a live
  contest table.
- Replaced the chapter dividers with 3D extruded titles pushing out of a
  wall; no owl on these slides.
- Built the Dashboard module: a MacBook playing the real dashboard
  recording with the zoom camera, and the dashboard's own components
  rebuilt in code as glass cards that orbit the laptop. Each opens as a 3D
  pop-up with numbers, bars and the heatmap filling in live and a typed
  description beside it; click outside or Esc closes without losing the
  place. Includes LeetCode / CodeChef / HackerRank and GitHub / LinkedIn
  cards with the real logos. Three design iterations on feedback.
- Fixed every glitch found in review: cards left stuck by fast navigation,
  scenes overlapping after sidebar navigation, corner artefacts on the
  pop-up, cards drifting off-screen, and the brief flash when entering a
  module.
- Added automated browser checks: a walk of every scene, a rapid-navigation
  stress test, and a first-half-second entry test for every module. All
  passing, no console errors, verified at three screen sizes.
- Kept documentation current: `README.md`, `docs/RECORDLY-ANALYSIS.md`,
  `docs/RUNNING-ORDER.md`.

**Next:** Courses module (section 03) from the next screen recording, then
the remaining sections in order; the admin panel once its recordings exist.

---
## Day 3 — 23 Oct 2026

- Received the five Courses screen recordings (the shelf, the roadmap,
  articles, videos, notes and labs) and the 3D-projection reference clip.
- Studied the reference clip frame by frame and wrote down its mechanic:
  device fixed on one side, a light cone from its screen, a glass panel
  sliding out that builds its content live, small status pills on the device.
- Analysed every Courses recording: where each click lands, the exact
  moment each view opens, and that each clip begins where the previous one
  ends, so the laptop screen can run continuously across the module.
- Found a product defect in the recording: the Notes tab never loads (a
  storage permission error); only the note's title is real. Flagged it,
  built the note from its title, and offered to swap the clip when
  re-recorded.
- Proposed the "projector" pattern for the whole module and agreed it:
  a laptop that alternates sides window by window, the recording playing
  inside it up to the opening click, then the opened view coming out of
  the laptop as a coded 3D projection beside it, six windows in all.
- Prepared the recordings: trimmed each to the stretch it needs, authored
  the click cues by hand, and produced the module's own Sliding Window
  intro clip re-coloured into the palette and smoothed to 60 fps.
- Extended the in-house recording player with segment control: stop,
  loop and freeze points, plus a "click mark" the deck reacts to.
- Built the Courses module, first version: six windows walked by the
  arrows, the laptop crossing with a continuous screen, the light cone,
  and six coded projections — course slabs on a shelf, the learning path
  as a road, the article with typing code and a read-along highlight, the
  video player playing the real intro clip, the trainer's note writing
  itself, the lab with editor and test cases turning green. Status pills,
  module tabs in the copy, a radiant background, and a column layout for
  narrow screens.
- Fixed styling collisions found in review, where short global class
  names from the deck's base stylesheet restyled the new scene.
- Added a rapid-navigation stress test for the module (ten scenarios) and
  extended the entry-flash test to it; all passing at three screen sizes
  with no console errors.
- Kept documentation current: `README.md` (The projector),
  `docs/RUNNING-ORDER.md`, `docs/RECORDLY-ANALYSIS.md`.
- Handed over for review.

**Next (Day 4, 24 Oct):** the quality pass from the review — larger, sharper
projections rebuilt as proper web UI, the lens-and-beam projection feel, the
eyes moved to alternate corners and reduced everywhere.


---

## Day 4 — 24 Oct 2026

**Courses (section 03), second version after review.**

- Rebuilt all six projections larger and sharper after the first version came
  back blurry and small. Everything now rests pixel-aligned and flat, with the
  3-D movement only during the flight, so the type stays crisp.
- Rebuilt the projection moment so it reads as a real projector: a lens lights
  on the screen, a beam opens, the view flies out along it and lands with a
  flicker.
- Rebuilt the learning path as a winding road that paves itself, after the
  first version was not liked.
- Produced a clean, smooth version of the module's own intro video, which was
  recorded at roughly a third of normal smoothness. Done with a two-pass method
  so the gentle parts are smoothed and the fast slide changes are left alone,
  which is what stops the smearing.
- Shortened the wait before each projection. Each recording now starts about a
  second and a half before the click that opens the view and plays that short
  run-up slightly faster, so the projection arrives two to three seconds after
  the arrow instead of four to eight.
- Moved the owl's eyes to the corner opposite the laptop, travelling with it,
  and reduced their size across the whole deck.

**Practise (section 04), built today: "the deck".**

- Analysed the reference video and the three new screen recordings.
- The laptop from the Courses section now glides across, folds its base away
  and becomes a plain monitor, with three more monitors sliding in behind it as
  a three-dimensional deck.
- Four cards, walked by the arrows: trainer problems, trainee problems, the
  Coding Ground, and company and LeetCode problems. Each is the real product
  page rebuilt in our colours.
- On each card the components that carry the story lift off the glass one at a
  time, with the action playing inside them while the rest of the page stays
  put. The first version shook as it lifted; on review that was dropped for a
  clean rise with a shadow that follows the shape of the piece.
- Narrowed the highlights to the ones chosen in review, three or four per card
  rather than every component, which also shortened each card.
- The arrow drops the top monitor, tilts the deck, shuffles it and lands the
  next card. Backwards is the mirror image.
- Renamed "Owl Ground" to "Coding Ground" everywhere, as asked.
- Used the real LeetCode mark so viewers recognise the platform.

**Opening (section 01).**

- Reworked the desktop so it reads as a real display rather than an
  illustration: a proper bezel, corners that match it, no square edges showing
  behind the case, and a flatter resting angle that keeps the corners clean.
- Moved the desktop clear of the product mark in the corner and repositioned
  and resized the owl's eyes.

**Defects found and fixed.**

- The arrow keys could stop working altogether. A lock that guards each slide
  change could be left on permanently if anything went wrong during the change.
  It now lifts on a timer taken out beforehand, remembers a key pressed while
  it is held, and expires by itself. Proven with 320 real key presses across
  four fresh loads with none lost.
- The laptop could be left half-faded if a view was switched within a second of
  arriving. The entrance now completes before the switch takes over.
- The contest leaderboard on the second slide had its rows beside their column
  headers instead of under them, with half of them outside the panel. Two
  different parts of the deck had given the same name to different things, and
  the later one was overriding the other. Found two more of the same kind by
  writing a check for it, and fixed all three. The check is kept for future
  sections.
- Smaller fixes from review: problem titles no longer cut off, a tab that
  appeared not to switch, and the monitor corners.

**Testing.** Automated checks for the new section (twelve rapid-use
scenarios), the existing checks extended to cover it, a random-use soak, a
real-keyboard walk of the whole deck, and the new styling check. All passing,
no errors, at four screen sizes.

**Documentation.** Kept current, including a new note on the naming rule that
caused the leaderboard defect.

**Next (Day 5):** the remaining sections as recordings arrive — AI Mentor,
Reports, Coding Contest, Admin Panel and the close.

---

## Day 5 — 25 Oct 2026

**AI Mentor (section 05), built today: "the three moments".**

- Watched the reference video and the mentor recordings and took the content
  from the product itself: one problem, fifteen real questions across three
  moments — before you start, while you code, after you submit — with the
  answers the mentor actually gives. Every one of them stops short of the
  solution, which is the promise the section is there to make.
- The three people are the animations supplied for the job, prepared and
  recoloured onto our green. Three things had to be solved to use them: each
  one shipped its own opaque white background, which was the grey box seen in
  review; the artwork was referenced by filenames that were not in the bundle,
  which is why the first frames came out garbled; and a straight colour shift
  turned skin purple, so only the blue range is moved and anything dark inside
  it is folded to near-black green, or the hair came out the same bright green
  as the shirt. Two earlier versions were dropped on review — hand-drawn people
  ("they look like kid animations") and a thought cloud.
- The whole slide now travels as one: words, person and screen fly into the
  depth of the room and the next arrives from outside it, as in the reference.
- The screen panel replays the recorded product flow on a loop of about
  twenty-six seconds: the tabs as a large highlighted control, the question
  list, a question lifting under the pointer, a click, "thinking about your
  question", the answer fading in block by block — never typed, as asked —
  held long enough to read, then Back, the answer fading away and a second
  question taking its place.
- The header was called out twice in review as too small and too plain. It is
  now a filled segmented control, large, with the live moment carried in it.
- Background, after the brief for "something AI-ish that highlights the
  background without dominating the foreground": a neural graph drawn across
  the room with signals running along it, and the promise "AI mentor · guides,
  never solves" laid on the floor of the room in perspective, scrolling. The
  owl's eyes alternate corners between the three moments.

**Reports (section 06), built today: "the folder and the screen".**

- Built from the two references supplied and the three report recordings. One
  slide, four beats.
- A glass folder stands in the middle of the room with its three report papers
  floating around it, the papers fanned well clear of its face so the glass is
  the thing you look at. The folder brings its own pool of colour with it,
  because glass is invisible against a white wall.
- The arrow shrinks the folder into the corner and draws a pull-down
  presentation screen down in its place; a projector rises under it and its
  lamp comes up. Only then does the report leave the folder: the page screws
  itself into a ball, floats across the room into the lens, and the recording
  opens out on the sheet. The words stand in the left quarter.
- Between two reports the screen and the projector stay exactly where they are:
  one ball flies home to the folder and opens out flat again while the next is
  already on its way. This replaced an earlier version in which the flat page
  slid across the room, which review called ugly.
- The section's name is raised off the folder's own glass in glass — the same
  treatment the chapter titles use — so the first beat says what it is about
  without a line of copy being read. It was first built across the back wall
  and moved onto the folder on review.
- The background watermark was rebuilt twice: the first version read as a
  pencil sketch, the second as a report skyline behind the folder.
- Three rounds of review on the motion, all addressed: the drift is a slow
  swell now rather than a bob, with the sideways sway on its own period so it
  never looks mechanical; the folder is resized rather than scaled as it
  travels, so it is the same folder at every frame instead of changing shape
  and catching on the way back; and the projector was rebuilt from scratch as a
  real machine after the first one was called kiddish.
- Beat changes were shortened by about a third on review — folder to first
  report 3.4 seconds down to 2.2, report to report 2.6 down to 1.7 — by playing
  the same choreography on a faster clock rather than cutting anything out of
  it.
- The projector's lamp now goes out between two reports and comes back only as
  the next report reaches the lens, instead of burning throughout.
- This section carries no owl, as asked.

**Defects found and fixed.**

- Two cases of two parts of the deck giving the same name to different things,
  which silently restyled earlier sections — the same class of fault as the
  leaderboard defect on Day 4. The check written for it had missed both,
  because it was reading a hard-coded list of stylesheets that had not been
  updated. It now reads the real list out of the page.
- A jump of 40–80 pixels as each paper settled into its float. Found by
  sampling every moving piece 25 times a second and printing the frame-to-frame
  movement; it does not show up by eye. Two separate causes, both fixed, and
  every moving piece now carries its motion and its three-dimensional pose on
  separate layers so one can never take the other with it.
- The recording was being squashed into the screen as the sheet rolled.
- An arrow pressed mid-flight could leave a stale description on screen, a
  recording playing out of sight or a paper hidden. Every beat now puts the
  furniture back before it begins.
- A browser error when a recording was stopped within a moment of starting,
  surfaced by the random-use soak.

**Testing.** Automated checks for both new sections (twelve rapid-use scenarios
each), the entrance check extended to all twenty routes into the deck, a
random-use soak, 240 real key presses with none lost, and the styling check.
All passing, no errors, at several screen sizes.

**Documentation.** Kept current, including notes on preparing supplied
animations and on the motion faults above.

**Next (Day 6):** the remaining sections as recordings arrive — Coding
Contest, Admin Panel and the close.

---

## Day 6 — 26 Oct 2026

A short day: no new build work. The deck was brought up and left where Day 5
closed it — twenty-two slides, sections 01 to 06 complete and signed off, with
the last two changes to Reports (the section name raised off the folder's glass
and the projector's lamp switching between reports) already logged under Day 5,
as they were made in the same sitting past midnight.

The three sections still to build — Coding Contest, Admin Panel and the close —
are all waiting on their screen recordings; nothing new has arrived in
`screen_recordings/` since yesterday's reports clips.

Stopped at the client's request to pick up tomorrow.

**Next (Day 7):** Coding Contest, Admin Panel and the close, as the recordings
arrive.

---

## Day 7 — 4 Nov 2026

The institution recordings arrived. All five were ingested into
`assets/video/` as `admin-orgs`, `admin-company`, `admin-dsa`,
`admin-content` and `admin-contests`, and a cue track was derived for each
with `tools/cues.js` — between twelve and fourteen cues per clip over
twenty-eight to thirty-two seconds. No build work on the deck itself; the
section they belong to was still the old reconstruction at the end of the day.

**Next (Day 8):** the Admin Panel rebuilt from those recordings, and the close.

---

## Day 8 — 7 Nov 2026

The last two sections, and with them the deck.

**08 · Admin Panel — the control room.** The five steps that had been standing
as a reconstruction since the panel was unreachable were thrown away and the
section rebuilt from the recordings as one step of six beats.

- A large console stands on a stand in the middle of the room and carries the
  recording. Five college screens stand on an arc behind it, deeper in, turned
  towards the middle: the centre of the arc is the furthest point of the room,
  so that screen is the highest and the smallest and the outer ones come
  forward.
- What the admin loads does not stay on the console. It leaves the screen as a
  packet, runs out along a feed line to each college, and lands — the college
  lights, the row that beat owns fills, and its count ticks up to the real
  figure. By the last beat every college on the arc is carrying everything.
  One panel, every organisation, said as a picture instead of as a sentence.
- The recordings play at 1.18x rather than the usual 1.5x. The admin panel is
  a wide table of records and the usual hunt for the cursor crops columns
  clean off the screen — the same lesson Reports learned, learned again.
- Every figure in the copy is read off the recordings: 2,781 company problems
  across 52 companies, 3,389 problems plus 980 LeetCode and 205 AI Lab, 840
  articles and 541 videos, 33 contests across 3 organisations. The old
  placeholder copy had invented "1,500+ problems, 100+ tags"; that is gone.
- The owl takes its one peek here, over the top edge of the console. It is
  drawn *behind* the machine so only the head and the tufts clear the bezel —
  on the first pass it was written after the console in the markup and floated
  in front of the screen like a sticker.
- A recording of `05-feeds` was asked for in the running order and never
  needed: the arc is the feed.

**09 · Close — who runs it, and on what.** Two steps, one scene file.

- The colleges come forward out of the arc and stand in a row at the front of
  the room, lit and large enough to read, with a band of platform figures
  under them.
- Then the three machines Owl Coder runs on — a monitor, a laptop and a tablet
  with a keyboard, no phone anywhere — stand together, each carrying the same
  coded face reflowed to its own width, which is the whole claim of the step.
  The owl stands beside them: having watched every step from the background,
  it is allowed to be looked at once.

**A correction to the colleges.** The placeholder close listed NCMS, GU and
NDC. The panel's own Organizations table names six: Technical Hub as the
platform, then Aditya University, Geetha University, NCET, SRKR and YCCE. The
five client colleges are what the deck shows now, and the per-college figures
come from Granted Content. Two of the five have no granted row, so they carry
a plain tag rather than a number invented to fill the gap.

**Defects found and fixed.**

- The word on the back wall ran straight through the arc of colleges, which is
  the thing the section is about. It is raised off the console's own glass
  instead — which is also the only thing a sleeping machine could plausibly be
  showing.
- The arc was sized as a share of the viewport. That put one college through
  the headline and another clean off the right-hand edge. It is measured now:
  half an outer screen has to fit between the end of the arc and the edge of
  the room, and on the left between the end of the arc and the words.
- The college screens were clipped — four counted rows and a header do not fit
  in a 4:3 box at that size — and their rows were labelled with single letters
  where C stood for Company, Content and Contests at once. Taller faces, a
  header, and no letters.
- Every device on the closing slide rendered as a bare pane of glass with no
  frame: the body carried the padding, but the screen is its sibling and not
  its child, so it covered the body completely.
- The invitation ran under the deck's own bar at the foot of the frame, so the
  url and the byline were never seen.
- The college cards had a hole in the middle. A heatmap was tried in it and
  pushed the names and figures off the bottom; the face is sized to what it
  actually holds instead.
- The room's watermark crossed the whole stage and read as debris laid over
  the copy. It is a whisper behind the console now.

**Testing.** The whole deck walked forward through all forty-four presses to
the last step and all the way back to the first; thirty rapid presses at
120 ms through the admin beats, in bursts that change direction mid-flight;
checks that no recording is left playing on a step that is off screen and that
nothing on either new section overflows the frame. All clean, no page errors,
at 1680x945 and 1280x720. The styling check reports no new shared or colliding
class names from either new stylesheet.

**Documentation.** README, running order and this log all brought current. The
README no longer has a "what is still a placeholder" list, because there is
nothing left in it.

---

## Day 8, later — 7 Nov 2026

The same day, after the control room was signed off: section 08 rebuilt a
second time, section 09 rebuilt, the shell made to behave, and the site made
fit to put on the internet.

**08 · Admin Panel — rebuilt again, as a house.** The client's reference was a
white isometric warehouse cutaway on graph paper with labels floating over it.
The console room was replaced by a generated isometric cutaway of the
institution's own machinery — racks, a control desk, a contest dais, a van —
with the five recordings standing on it as five lit points. An arrow walks the
route along the floor from one point to the next, the point lights, and its
recording rises out of the building beside a typed description. Four rounds of
review on it:

- The model steps back and the picture grows when a point opens. The names on
  the points stayed readable, which took computing the label's box rather than
  measuring one that was still growing.
- The route "was not getting filled correctly, and the drawn line and the
  filling line overlapped". It is one line now: the lit part is drawn wider
  than its bed, and one number drives the fill, the head riding on its end and
  which floor nodes are lit, so they cannot disagree.
- "The video is very blurry after it settles." Two plausible causes were
  measured and both were innocent — the transform cost half a percent, the
  player's own pipeline was within one percent of a bare video element. The
  real answer is arithmetic: a 1918-pixel recording in a 780-pixel pane is a
  two-and-a-half-times reduction and no filter recovers it. The camera now
  rests zoomed in, so fewer source pixels are asked to cover the pane.
- "There aren't any animations in this module." The house floats while a point
  is open, and the room carries expanding rings, drifting motes and a running
  dash on the floor plan. All of it is transform and opacity only, and it
  stops when the section leaves the stage.
- The slide's name moved off the small type and onto a plate across the top of
  its own picture, filling left to right in the deck's monospace with a slow
  sweep while the recording plays — so anyone presenting can see which slide
  they are on.

**09 · Close — a wall of badges.** From the client's reference recording: six
college badges hanging on a wire, swinging when the cursor passes and turning
over when it stops on one. Front is the college; back is what Owl Coder runs
for them. The swing is a small physics loop — a spring, damping, and an
impulse from the pointer's own speed — and the section was renamed **Get
started** in the rail with a door-and-step icon instead of the old arrow.
The second step, "Any device, get started", is commented out at the client's
request; the scene file still builds it, so one uncommented line brings it
back.

**The sidebar, and everything that has to follow it.** Collapsing the rail
changes the width of the stage without the window changing size at all, and
every scene sizes itself from the window. So scenes kept the geometry they
were built with: recordings at the old size, a laptop walking off the edge,
an open card sitting on top of its own description.

- One watcher on the stage now turns any change of its box — the rail, present
  mode, fullscreen — into the event every scene already understands.
- All nine sections were audited both ways across the toggle. Three were
  wrong: the Dashboard had no handler at all, Courses never re-seated its
  laptop, and Practise dropped the component it had lifted out of the card.
- The toggle itself no longer slides. Animating the width of the stage is a
  full re-layout of the scene on every frame of the animation, and it cost two
  thirds of the frame rate — Practise ran at 15 frames a second through it.
  The rail, the stage and the scene all change in a single frame now, which is
  both the smooth answer and the only genuinely simultaneous one: Practise
  through the same toggle, 97. The rest of the collapsed rail already worked
  that way; only the box was pretending otherwise.
- The expand button sat at the foot of the collapsed rail while the collapse
  button sat at its head. Both are at the head now.
- Present mode left the whole sidebar painting across the slide. It set the
  rail's width to zero and then slid it "off screen" by -100% of itself, which
  on a box of zero width is nought pixels: the background disappeared and the
  icons, the wordmark and the toggle were left on the stage with nothing
  behind them. Hiding it properly was tried first and was the wrong answer —
  presenting is exactly when you want to jump to a section. Present mode now
  changes two things and no more: the screen it fills and the button that gets
  you out. The sidebar is whole inside it and still expands and collapses.

**The recordings, for the live site.** Every clip came off the screen recorder
at about 6.9 Mbps — a bitrate for camera footage, not for a screen, where most
of the frame does not change between frames. They also carried an audio track
nothing plays, and their index sat at the end of the file, so a browser had to
finish the whole download before it could show one frame.

Re-encoded with none of that: **251 MB down to 50 MB, eighty per cent
smaller**, with the frame size, the frame count and every cue time untouched.
Measured against the originals the difference is 0.9993 structural similarity
and 55 dB — not a visible change. The frame size was deliberately left alone:
the camera zooms into these, and sharpness there is a ratio of source pixels
to pane pixels, so shrinking them is exactly the thing that would make them
look cheap. The index moved to the front of each file, so playback can start
while the rest is still arriving.

**Into Git.** First commit pushed to
`github.com/Akhilesh-Varanasi-18/OwlCoderProfile`. The raw material — the
client's screenshot and brochure pack and the original screen captures, over a
gigabyte between them — is deliberately not in it: nothing the site serves
reads them, and they belong in a backup or in Git LFS, not in the tree. The
dead weight inside `assets/` went too: five crops from the first, scrapped
version of the Dashboard and one logo for a site the deck never names.

**Testing.** Every scene's stress test; the rail audit across all nine sections
and eight beats, both ways; the entry-flash check on all twenty-five routes
into a section; 240 real key presses with none lost and no errors; the styling
check unchanged. All clean against the re-encoded recordings as well as before
them.

---
