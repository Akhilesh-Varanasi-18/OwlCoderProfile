#!/usr/bin/env node
/* cues.js — derive a zoom cue track from an ordinary screen recording.

   Usage:  node tools/cues.js <recording.mp4> [out.cues.json]

   No click log is needed. The recording is read at 10 fps, half resolution,
   greyscale, and two things are measured per frame:

     1. The cursor. Between quiet frames the only pixels that change are the
        cursor's old spot and its new spot, so the cursor is found by
        continuity across those small clusters — no template, no DPI guess.
     2. UI change. A burst of changed pixels after a quiet stretch is a
        click landing (dropdown, modal, button state) or a navigation.

   A small burst becomes a FOCUS cue at the cursor (or at the centre of
   the change when the cursor is unknown). A burst covering most of the
   frame becomes a NAV cue, which the player answers by zooming out so the
   new page is seen whole — the same thing Recordly does when a modal opens.

   The player (assets/js/recordly.js) adds the 1 s lead-in, the spring and
   the motion blur; the cue file only says *when* and *where*. */
'use strict';
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');

const src = process.argv[2];
if (!src) { console.error('usage: node tools/cues.js <video> [out.json]'); process.exit(1); }
const out = process.argv[3] || src.replace(/\.[^.\\/]+$/, '') + '.cues.json';

const probe = JSON.parse(execFileSync('ffprobe', [
  '-v', 'error', '-select_streams', 'v:0',
  '-show_entries', 'stream=width,height', '-show_entries', 'format=duration',
  '-of', 'json', src
]).toString());
const W = probe.streams[0].width, H = probe.streams[0].height, DUR = +probe.format.duration;

const FPS  = 10;
const W2   = Math.floor(W / 4) * 2, H2 = Math.floor(H / 4) * 2;   // half res, even
const N    = W2 * H2;
const THR  = 28;                 // luma delta that counts as "changed"
const QUIET= 4000;               // below this many changed px the frame is cursor-only
const EVT  = 1500;               // at/above this many changed px a UI change is happening
const NAV  = 0.45;               // change bbox covering this much of the frame = navigation
const CUR  = { wMin: 3, wMax: 36, hMin: 4, hMax: 46, nMin: 6, nMax: 1000 };

console.log(`${src}  ${W}x${H}  ${DUR.toFixed(1)}s  -> analysing at ${W2}x${H2} @ ${FPS}fps`);

const ff = spawn('ffmpeg', [
  '-v', 'error', '-i', src,
  '-vf', `fps=${FPS},scale=${W2}:${H2}`,
  '-f', 'rawvideo', '-pix_fmt', 'gray', '-'
]);

// ---------- connected components on a binary mask ----------
const stack = new Int32Array(N);
function clusters(mask) {
  const outC = [];
  for (let i = 0; i < N; i++) {
    if (!mask[i]) continue;
    let sp = 0; stack[sp++] = i; mask[i] = 0;
    let x0 = W2, y0 = H2, x1 = -1, y1 = -1, n = 0;
    while (sp) {
      const p = stack[--sp]; n++;
      const x = p % W2, y = (p / W2) | 0;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      if (x > 0      && mask[p - 1])  { mask[p - 1] = 0;  stack[sp++] = p - 1; }
      if (x < W2 - 1 && mask[p + 1])  { mask[p + 1] = 0;  stack[sp++] = p + 1; }
      if (y > 0      && mask[p - W2]) { mask[p - W2] = 0; stack[sp++] = p - W2; }
      if (y < H2 - 1 && mask[p + W2]) { mask[p + W2] = 0; stack[sp++] = p + W2; }
    }
    outC.push({ x0, y0, x1, y1, n, w: x1 - x0 + 1, h: y1 - y0 + 1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 });
  }
  return outC;
}
const cursorLike = c => c.w >= CUR.wMin && c.w <= CUR.wMax && c.h >= CUR.hMin && c.h <= CUR.hMax && c.n >= CUR.nMin && c.n <= CUR.nMax;
const dist = (a, b) => Math.hypot(a.cx - b.cx, a.cy - b.cy);

// ---------- per-frame state ----------
let prev = null, prevC = null, idx = 0;
let L = null;               // last known cursor position {cx, cy, t}
let quiet = 0, burst = null;
const events = [], track = [];
const mask = new Uint8Array(N);

function onFrame(f) {
  const t = idx / FPS; idx++;
  if (!prev) { prev = f; return; }

  let count = 0, bx0 = W2, by0 = H2, bx1 = -1, by1 = -1;
  for (let i = 0; i < N; i++) {
    const d = f[i] - prev[i];
    if (d > THR || d < -THR) {
      mask[i] = 1; count++;
      const x = i % W2, y = (i / W2) | 0;
      if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; if (y < by0) by0 = y; if (y > by1) by1 = y;
    } else mask[i] = 0;
  }
  prev = f;

  // ---- cursor by continuity (quiet frames only) ----
  if (count > 0 && count < QUIET) {
    const C = clusters(mask).filter(cursorLike);     // clusters() consumes the mask
    if (L) {
      const rest = C.filter(c => dist(c, L) > 10);   // drop the spot it just left
      if (rest.length) {
        rest.sort((a, b) => dist(a, L) - dist(b, L));
        L = { cx: rest[0].cx, cy: rest[0].cy, t };
      }
    } else if (prevC) {
      // bootstrap: the cluster present in two consecutive diffs is where it WAS
      let was = null;
      for (const a of prevC) for (const b of C) if (dist(a, b) <= 6) was = b;
      if (was) {
        const now = C.filter(c => dist(c, was) > 10).sort((a, b) => dist(a, was) - dist(b, was))[0];
        L = now ? { cx: now.cx, cy: now.cy, t } : { cx: was.cx, cy: was.cy, t };
      }
    }
    prevC = C;
  } else {
    prevC = null;
  }
  if (L) track.push([+t.toFixed(1), +(L.cx / W2).toFixed(4), +(L.cy / H2).toFixed(4)]);

  // ---- UI change bursts ----
  if (count >= EVT) {
    if (!burst) burst = { t0: t, x0: bx0, y0: by0, x1: bx1, y1: by1, peak: count, frames: 1,
                          cursor: L && t - L.t < 3 ? { x: L.cx, y: L.cy } : null };
    else {
      burst.x0 = Math.min(burst.x0, bx0); burst.y0 = Math.min(burst.y0, by0);
      burst.x1 = Math.max(burst.x1, bx1); burst.y1 = Math.max(burst.y1, by1);
      burst.peak = Math.max(burst.peak, count); burst.frames++;
    }
    quiet = 0;
  } else {
    quiet++;
    if (burst && quiet >= 2) { finish(burst); burst = null; }
  }
}

function finish(b) {
  const area = ((b.x1 - b.x0 + 1) * (b.y1 - b.y0 + 1)) / N;
  const kind = area >= NAV ? 'nav' : 'focus';
  let x = (b.x0 + b.x1) / 2, y = (b.y0 + b.y1) / 2, from = 'change';
  if (kind === 'focus' && b.cursor) {
    const pad = 80;
    if (b.cursor.x >= b.x0 - pad && b.cursor.x <= b.x1 + pad && b.cursor.y >= b.y0 - pad && b.cursor.y <= b.y1 + pad) {
      x = b.cursor.x; y = b.cursor.y; from = 'cursor';
    }
  }
  events.push({ t: +b.t0.toFixed(2), kind, x: +(x / W2).toFixed(4), y: +(y / H2).toFixed(4),
                area: +area.toFixed(3), peak: b.peak, frames: b.frames, from });
}

// ---------- stream ----------
let buf = Buffer.alloc(0);
ff.stdout.on('data', chunk => {
  buf = buf.length ? Buffer.concat([buf, chunk]) : chunk;
  while (buf.length >= N) { onFrame(Buffer.from(buf.subarray(0, N))); buf = buf.subarray(N); }
});
ff.stderr.on('data', d => process.stderr.write(d));
ff.on('close', () => {
  if (burst) finish(burst);

  // ---- events -> cues ----
  const cues = [];
  let lastNav = -9;
  for (const e of events) {
    if (e.kind === 'nav') {
      // merge a run of navs (page paints in pieces) into one
      if (cues.length && cues[cues.length - 1].z === 1 && e.t - cues[cues.length - 1].t < 1.5) continue;
      cues.push({ t: e.t, z: 1, kind: 'nav' });
      lastNav = e.t;
      continue;
    }
    if (e.t - lastNav < 1.5) continue;                  // page still settling after a nav
    const p = cues[cues.length - 1];
    if (p && p.z > 1 && e.t - p.t < 0.8) { p.x = e.x; p.y = e.y; p.from = e.from; continue; }
    cues.push({ t: e.t, x: e.x, y: e.y, z: 1.5, kind: 'focus', from: e.from });
  }

  const result = { src: src.replace(/\\/g, '/'), w: W, h: H, duration: +DUR.toFixed(2),
                   analysed: { fps: FPS, w: W2, h: H2 }, cues, track };
  fs.writeFileSync(out, JSON.stringify(result, null, 1).replace(/\[\n\s+([\d.,\s-]+?)\n\s+\]/g, (m, g) => '[' + g.replace(/\s+/g, '') + ']'));

  console.log(`\n${events.length} change events -> ${cues.length} cues; cursor seen on ${track.length} of ${idx} frames`);
  for (const c of cues) console.log(`  ${String(c.t).padStart(6)}s  ${c.kind.padEnd(5)}` + (c.z > 1 ? `  at (${c.x}, ${c.y})  via ${c.from}` : ''));
  console.log(`\nwrote ${out}`);
});
