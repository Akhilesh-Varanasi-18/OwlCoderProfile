# Owl Coder — final running order

Settled 16 Oct 2026 from the product walkthrough. Nine sections, thirty-three
steps. Arrows walk the steps; at the last step of a section the next arrow
moves to the next section. The counter shows the section, the rail shows the
step.

---

## Corrections from the walkthrough

- **Assessments are not separate.** What the brochure calls assessments is the
  **Coding Contest**, and it lives inside Owl Coder. One section, not two.
- **Trainers do not have a separate login.** Same application; what you see
  depends on who you are. Every module carries **trainer problems** (what the
  trainer teaches from) and **trainee problems** (what the student practises
  on). That is a detail inside Practise, not a section of its own.
- **Company preparation is not a section.** Company problems are content the
  admin panel loads in, and they surface inside the practice sets. It becomes a
  step in Practise and a step in Admin.
- **There is no price story.** Dropped.
- **The heatmap is the streak surface.** It reflects everything solved, inside
  a course and on LeetCode, CodeChef and the rest. That makes it the strongest
  single image in the whole deck, so it closes the Dashboard section.

---

## The order

| # | Section | Steps |
|---|---|---|
| 01 | **Opening** | 2 — the title · what Owl Coder is |
| 02 | **The Dashboard** | 4 — your coding overview · linked coding profiles · all courses combined · the heatmap |
| 03 | **Courses** | 1 step, six windows — the shelf · the roadmap · articles · videos · notes · labs (the projector) |
| 04 | **Practise** | 1 step, four cards — trainer problems · trainee problems · Coding Ground · company and LeetCode problems (the deck) |
| 05 | **AI Mentor** | 1 step, three moments — before you start · while you code · after you submit |
| 06 | **Reports** | 1 step, four beats — the folder · course overview · module view · improvement tracker (the projector) |
| 07 | **Coding Contest** | 5 — current and past · the instructions · the countdown · the arena · the leaderboard |
| 08 | **Admin Panel** | 1 step, six beats — the control room · one panel, every organisation · company problems · DSA problems · articles and videos · contests, and what it feeds |
| 09 | **Close** | 2 — trusted by · any device, get started |

Three act dividers sit between them, each a single held beat with a large
outlined owl behind an act numeral:

- **I · The Student** before 02
- **II · The Arena** before 07
- **III · The Institution** before 08

---

## What to record, section by section

Short clips, no narration needed. Name them by section and step so they drop
straight in. Everything is reference; every screen gets rebuilt in code.

### 02 · The Dashboard — `02-dashboard-*`
1. `01-overview` — the coding overview at the top: total solved, the easy /
   medium / hard split.
2. `02-profiles` — the LeetCode, CodeChef, HackerRank and GitHub cards, with
   real streaks, rating, badges and contest counts showing.
3. `03-courses-combined` — the all-courses-combined panel: articles present
   versus finished, videos present versus watched, problems by difficulty.
4. `04-heatmap` — the heatmap, ideally with a hover showing a day's count.

### 03 · Courses — `03-courses-*`
1. `01-shelf` — My Courses, scrolled slowly, showing several courses with
   their article / video / trainer / trainee / lab / note counts and both
   buttons.
2. `02-roadmap` — Course View: the module roadmap, with a completed module, an
   in-progress one and a locked one visible, and the Resume button.
3. `03-articles` — inside a module, the Articles tab with an article open.
4. `04-videos` — the Videos tab with a video in the player.
5. `05-notes-labs` — the Notes tab and the lab-syllabus integration.

*Received 23 Oct 2026 as `courses_theshelf / theroadmap / thearticles /
thevideo / notes&lab.mp4` and built as the projector. The Notes tab in that
recording shows a storage error instead of the note; re-record it once the
bucket permission is fixed and the on-screen segment can be swapped.*

### 04 · Practise — `04-practise-*`
*Supplied 24 Oct 2026 as `thepractise_trainerproblems.mp4`,
`thepractise_traineeproblems.mp4` and
`thepractice_leetcodeandcompanyproblems.mp4`, with
`practisemodulerefferencevideo.mp4` as the reference. This section is built
as coded UI from what the recordings show (the deck); no clip plays in it.*
1. `01-trainer` — a module's Trainer problems list, the batch lock, the
   worked solution and the compiler response.
2. `02-trainee` — the same module's practice set (the Maya tab), a problem,
   Run, and the first submission.
3. `03-codingground` — opening a problem: description on the left, editor on
   the right, Run, Submit, and the test-case results coming back.
4. `04-company-leetcode` — the Leet tab's problems with their solved marks,
   the accepted submission, and anything company-tagged.

### 05 · AI Mentor — `05-mentor-*`
*Supplied 25 Oct 2026 as `AImentor_beforestart.mp4`, `AImentor_whilecoding.mp4`
and `aimentor_aftersubmitting.mp4`, with `AImnetorreferrence video.mp4` for the
depth move. No clip plays in this section: the panel is coded UI and the three
people are the supplied Lottie animations, recoloured onto our palette and
built into `assets/lottie/` by `tools/prep-lottie.js`. The fifteen questions
and the answer style are taken from the recordings. Each moment is one slide —
words, live screen and person — and the arrow flies the whole slide into the
depth of the room while the next comes in from in front of the camera. The
panel replays the recorded flow: tab, question list, a hover that lifts one, a
click, "Thinking about your question…", the answer fading in, Back, then a
second question and answer — two pairs per moment, about 26 s a cycle.*
1. `01-before` — the mentor opened before writing anything, showing the prompt
   set and one answer.
2. `02-during` — the mentor opened mid-problem with failing cases, showing it
   give a hint rather than a solution.
3. `03-after` — the mentor opened after submitting, showing the review prompts.

### 06 · Reports — `06-reports-*`
*Supplied 25 Oct 2026 as `reports-courseoverview.mp4`, `reports-moduleoverview.mp4`
and `reports-improvementracker.mp4`, with `reportsrefference1.png` (a glass
folder with its papers in the air) and `reportsrefference2.png` (a pull-down
presentation screen) for the staging. All three play, each on its own sheet,
at `zoom: 1.16` rather than Recordly's usual 1.5× — a report is a page of
tables and the usual hunt for the cursor would crop columns off the
projection. Built into `assets/video/reports-{overview,module,tracker}.mp4`
with cue tracks from `tools/cues.js`.*

The step runs four beats:

0. **The folder** — a glass folder stands in the middle of the room with its
   three report papers floating around it, over a wash of slow waves. The
   section title sits under the whole arrangement.
1. `01-course-overview` — the folder shrinks into the bottom-left corner while
   one paper flies out, becomes the roller of a pull-down screen, and the sheet
   is drawn down from it. A projector rises below, its lens lights, the beam
   lands, and the course report plays on the sheet. The words stand on the left.
2. `02-module-view` — the sheet rolls up, that paper returns to the folder, and
   the next one comes out the same way with the module report.
3. `03-improvement-tracker` — the same again, with the weekly progress and the
   Journey to Interview Readiness.

The watcher is kept out of this section entirely (`data-watch="p-none"`).

### 07 · Coding Contest — `07-contest-*`
1. `01-list` — the contest page with Current and Past tabs, and the past list.
2. `02-details` — View Details on a contest: instructions, rules, examples.
3. `03-countdown` — a current contest with the timer running before the start.
4. `04-arena` — the contest environment: the questions, solving one, submitting.
5. `05-leaderboard` — the leaderboard: how many appeared, the top three, and
   where you stand.

### 08 · Admin Panel — `08-admin-*`
*Supplied 4 Nov 2026 as `theinstitutions-OnepannelEveryorg.mp4`,
`theinsitutions-companyproblems.mp4`, `theinstituiton_dsaproblems.mp4`,
`theinstitution_videos&articles.mp4` and
`theinstitution_contestmanagement.mp4`, and built into
`assets/video/admin-{orgs,company,dsa,content,contests}.mp4` with cue tracks
from `tools/cues.js`. All five play, each on the console, at `zoom: 1.18`
rather than the usual 1.5x — the panel is a wide table of records and the
usual hunt for the cursor crops columns clean off the screen. The same lesson
Reports learned.*

Built 7 Nov 2026 as the control room (`assets/js/admin.js`). A large console
on a stand holds the recording; five college screens stand on an arc behind
it, deeper into the room. What the admin loads leaves the console as a packet,
runs out along the feed lines, and lands in every college at once — the row it
belongs to fills and its count ticks up. That is the whole claim of the
section, made as a picture rather than as a sentence.

A recording of `05-feeds` was never needed in the end: the arc is the feed.

The step runs six beats:

0. **The control room** — the console asleep with the section's name raised
   off its own glass, the arc dim behind it. The owl takes its one peek over
   the top edge here, and nowhere else in the deck.
1. `01-organisations` — the organisation list, Content Access and Granted
   Content. The five colleges light and take their names.
2. `02-company-problems` — 2,781 problems across 52 companies.
3. `03-dsa-problems` — 3,389 problems, plus 980 LeetCode and 205 AI Lab,
   with a solution slot per language and a review status.
4. `04-content` — 840 articles and 541 videos, per module and topic.
5. `05-contests` — 33 contests, 5 open, across 3 organisations; and the
   whole arc carrying everything at once.

Every figure in the copy is read off the recordings themselves.

### 09 · Close — `09-close-*`
Built 7 Nov 2026 as coded screens (`assets/js/close.js`); no clip plays in it.
Two steps, one scene file, because they are one thought.

1. `01-colleges` — the five client colleges from the panel's own
   Organizations list, standing in a row at the front of the room: the arc
   from section 08 seen from the other side. Their figures come from Granted
   Content, and the two with no granted row carry a plain tag rather than an
   invented number. One band of platform totals runs under the row.
2. `02-devices` — a monitor, a laptop and a tablet with a keyboard standing
   together, each carrying the same coded face reflowed to its own width,
   which is the claim the step makes. The owl stands beside them, and the
   deck ends on the invitation.

*Correction logged 7 Nov 2026: the earlier placeholder listed NCMS, GU and NDC
as colleges running Owl Coder. The panel's Organizations table names Aditya
University, Geetha University, NCET, SRKR and YCCE, and those are the five
now shown.*

---

## How the owl is used

No flying bird. The owl watches instead.

- **Act dividers** — a large outlined owl behind the act numeral, three times
  in the whole deck.
- **Watching eyes** — a pair of eyes held in the far background of every step,
  at very low contrast, blinking on a slow irregular cycle. Position shifts by
  section so it never reads as a static graphic.
- **One peek** — on the first beat of the admin panel, the owl looks over the
  top edge of the console. Once, and never again.
- **The last word** — it stands beside the three machines on the closing
  slide, the only time in the deck it is the thing being looked at.

## Hardware

Owl Coder is a browser product that also runs on a tablet with a keyboard, so
no phones anywhere.

| Section | Frame |
|---|---|
| Opening, Dashboard | all-in-one desktop, screen filling the slide |
| Courses | open laptop, three-quarter view |
| Practise, AI Mentor | laptop straight on, screen large and close |
| Reports | monitor on a stand |
| Coding Contest | laptop for the arena, monitor for the leaderboard |
| Admin Panel | large console on a stand, five college screens on an arc behind |
| Close | the five colleges in a row; then monitor, laptop and tablet together |
