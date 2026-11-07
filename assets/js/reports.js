/* ══════════════════════════════════════════════════════════════════
   06 · REPORTS — "the folder and the screen"

   Beat 0 · a glass folder stands in the middle of the room, its report
            papers floating around it.
   Beat 1-3 · the folder shrinks into the bottom-left corner. One of its
            papers flies out, becomes the roller of a pull-down screen and
            the sheet is drawn down from it. A projector rises below, its
            lens lights, the beam lands on the sheet, and the recording of
            that report plays inside it. The words stand on the left.
            Leaving a beat runs all of that backwards.

   Lifecycle: prep (state before the fade-in) → play → stop.
   ══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function even(v) { v = Math.round(v); return v % 2 ? v + 1 : v; }
  var reduced = global.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ic(d) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>';
  }
  var TICK = 'M5 12.5l4.5 4.5L19 7';
  var CLIP_AR = 1900 / 890;        // every report recording is this shape

  /* How fast a beat changes. Every transition is built at its natural pace and
     then played at this rate, so the shape of the choreography is kept and only
     the clock moves — the first arrow out of the folder used to run three and a
     half seconds, which read as waiting rather than watching. */
  var SPEED = 1.5;

  /* the section's name, standing out of the back wall */
  var WORD = 'REPORTS', WORD_N = 26, WORD_STEP = 1.5;

  /* ───────── the three reports ───────── */
  var VIEWS = [
    { key: 'overview', clip: 'reports-overview', tab: 'Course Overview',
      h: 'Module by module,', h2: 'graded.',
      say: 'Report View opens on the whole course. Articles finished, trainer and trainee problems by difficulty, the average time each one took, solve rate, first-attempt rate and a rating for every module.',
      pts: ['Four headline numbers across the top', 'Time thresholds — easy 10m, medium 25m, hard 35m', 'A rating per module, not just a percentage'],
      paper: { t: 'Course Report', s: 'DSA · NAGPUR_FDP_2026' },
      cfg: { to: 19.4, mark: 1.2, rate: 1.18 } },
    { key: 'module', clip: 'reports-module', tab: 'Module View',
      h: 'Inside one module,', h2: 'what is left.',
      say: 'Pick a module from the strip and everything follows it: trainer and trainee progress rings, then every problem with its difficulty, status, time taken, threshold and attempts.',
      pts: ['Every module of the course, one click away', 'Trainer and trainee counted separately', 'Pass or fail against the time threshold'],
      paper: { t: 'Module Report', s: 'Binary Tree · 5/5' },
      cfg: { to: 21.5, mark: 1.2, rate: 1.18 } },
    { key: 'tracker', clip: 'reports-tracker', tab: 'Improvement Tracker',
      h: 'How fast you are getting,', h2: 'week on week.',
      say: 'It watches how long you sit with each problem and turns that into a readiness line. Nine weeks of solve counts, first-attempt rates and average times, against the target an interview sets.',
      pts: ['Weekly progress, rated week by week', 'Journey to Interview Readiness per difficulty', 'Measured against the target, not against yesterday'],
      paper: { t: 'Improvement', s: 'Week 1 — Week 9' },
      cfg: { to: 16.4, mark: 1.2, rate: 1.1 } }
  ];

  /* the papers in the air: where each sits while the folder is centre stage,
     as a fraction of the folder's own box, plus its tilt and its drift */
  /* Where each paper sits while the folder is centre stage, as a fraction of
     the folder's own box. They are fanned up and well out to the sides: on the
     first pass they lay across the folder's face and the glass — the thing the
     beat is actually about — could not be seen at all. */
  var AIR = [
    { x: -.86, y: -.9,  w: .44, rx: 10, ry: -22, rz: -12, z: 150, d: 0 },
    { x:  .88, y: -1.0, w: .46, rx:  8, ry:  18, rz:  10, z: 190, d: .5 },
    { x:  .0,  y: -1.3, w: .42, rx:  6, ry:  -5, rz:  -4, z: 110, d: 1 }
  ];
  // in the corner they tuck in beside the folder instead of drifting up
  // through the words
  var AIR_SMALL = [
    { x: -.04, y: -.68, w: .6, rx: 8, ry: -16, rz: -9, z: 70, d: 0 },
    { x:  .9,  y: -.5, w: .64, rx: 6, ry: 14, rz: 8, z: 90, d: .5 },
    { x:  .78, y: -.1, w: .56, rx: 5, ry: -8, rz: -5, z: 50, d: 1 }
  ];
  var CUBES = [
    { x: -.72, y: -.26, s: .1, rz: 18, d: .2 },
    { x:  .74, y: -.52, s: .13, rz: -14, d: .9 },
    { x:  .58, y:  .12, s: .08, rz: 26, d: 1.5 },
    { x: -.48, y:  .3, s: .07, rz: -22, d: 1.1 }
  ];

  /* A sheet of paper screwed into a ball: an irregular outline with a few hard
     creases across it. This is what travels from the folder to the projector —
     the flat page sliding across the room never looked like anything. */
  function wadHtml() {
    return '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<path class="rw-o" d="M50 6 L78 16 L94 42 L88 72 L64 94 L33 92 L9 70 L6 38 L24 14 Z"/>' +
      '<path class="rw-c" d="M50 6 L41 40 L6 38M41 40 L64 94M41 40 L88 72M41 40 L78 16"/>' +
      '<path class="rw-h" d="M24 14 L41 40 L9 70"/>' +
      '</svg>';
  }

  /* ───────── build ───────── */
  function paperHtml(v) {
    return '<div class="rp-ph"><b>' + v.t + '</b><s>' + v.s + '</s></div>' +
      '<div class="rp-pb"><i class="rp-pic"></i><div class="rp-lines"><i></i><i></i><i></i></div></div>' +
      '<div class="rp-rows"><i></i><i></i><i></i><i></i></div><i class="rp-curl"></i>';
  }
  /* The room's watermark. Drawn thin and wavy it read as a pencil sketch, and a
     report sheet behind a centred folder is simply hidden by it — every part
     worth seeing lands under the folder. So it is a skyline instead: bars wider
     than the folder is, with a trend line across their tops, so what shows is
     the part either side of it. */
  function markHtml() {
    var W = 1200, H = 600, base = 548, rx = 26;
    var bars = [[40, 196], [240, 330], [440, 252], [640, 436], [840, 352], [1040, 486]];
    var b = '', pts = [];
    bars.forEach(function (q) {
      b += '<rect x="' + q[0] + '" y="' + (base - q[1]) + '" width="150" height="' + q[1] + '" rx="' + rx + '"/>';
      pts.push((q[0] + 75) + ' ' + (base - q[1] - 34));
    });
    return '<svg class="rp-mark" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMax meet">' +
      '<g class="rp-mark-in">' +
      '<g class="rp-mark-b">' + b + '</g>' +
      '<path class="rp-mark-t" d="M' + pts.join(' L') + '"/>' +
      '<path class="rp-mark-x" d="M8 ' + base + ' H' + (W - 8) + '"/>' +
      '</g></svg>';
  }

  function buildOnce(rp) {
    if (rp._built) return;
    rp._built = true;

    var h = '<div class="rp-bg" aria-hidden="true"><i class="rp-sky"></i><i class="rp-floor"></i>' +
      markHtml() + '</div>' +
      '<div class="rp-world" aria-hidden="true">';

    // the folder
    h += '<div class="rp-mv rf-air"><div class="rf"><div class="rf-in">' +
      '<i class="rf-halo"></i><i class="rf-cast"></i><i class="rf-tab"></i><i class="rf-back"></i>' +
      '<div class="rf-stack"><i class="rf-sheet"></i><i class="rf-sheet"></i><i class="rf-sheet"></i></div>' +
      '<i class="rf-front"><i class="rf-fog"></i></i><i class="rf-lip"></i><i class="rf-spec"></i><i class="rf-edge"></i>' +
      '<div class="rpw"><div class="rpw-pl"></div></div>' +
      '</div></div></div>';

    // one paper per report, plus the drifting cubes
    VIEWS.forEach(function (v, i) {
      h += '<div class="rp-mv rp-air" data-i="' + i + '"><div class="rp-paper">' + paperHtml(v.paper) + '</div></div>';
    });
    CUBES.forEach(function () { h += '<i class="rp-mv rp-cube-air"><i class="rp-cube"></i></i>'; });
    VIEWS.forEach(function (v, i) { h += '<div class="rp-wad" data-i="' + i + '">' + wadHtml() + '</div>'; });

    // the screen: roller, sheet, weighted bar and pull ring
    h += '<div class="rps">' +
      '<div class="rs-sheet"><div class="rs-canvas"></div><i class="rs-lit"></i><i class="rs-sheen"></i></div>' +
      '<div class="rs-barw"><i class="rs-bar"></i><i class="rs-cap l"></i><i class="rs-cap r"></i>' +
      '<span class="rs-ring"><i></i><u></u></span></div>' +
      '<div class="rs-rollw"><i class="rs-roll"></i><i class="rs-cap l"></i><i class="rs-cap r"></i></div>' +
      '</div>';

    // the projector and its beam
    h += '<i class="rj-cone"></i>' +
      '<div class="rj"><i class="rj-body"></i><i class="rj-top"></i><i class="rj-vent"></i><i class="rj-led"></i>' +
      '<i class="rj-foot l"></i><i class="rj-foot r"></i><i class="rj-lens"></i><i class="rj-glow"></i></div>';

    h += '</div>';

    // the opening title and the three descriptions
    h += '<div class="rp-hero"><div class="rp-kick"><b>06 · Reports</b></div>' +
      '<h3>Every number the course <em>kept on you.</em></h3>' +
      '<p>Three reports sit in the folder: the course as a whole, one module at a time, and how much faster you are getting. Each one opens on its own screen.</p></div>';
    VIEWS.forEach(function (v, i) {
      h += '<div class="rp-copy" data-i="' + i + '">' +
        '<div class="rp-kick"><b>06 · Reports</b><s></s>' + v.tab + '</div>' +
        '<h2 class="rp-h">' + v.h + '<em>' + v.h2 + '</em></h2>' +
        '<p class="rp-say">' + v.say + '</p>' +
        '<div class="rp-list">' + v.pts.map(function (p) {
          return '<span><i>' + ic(TICK) + '</i>' + p + '</span>';
        }).join('') + '</div>' +
        '<div class="rp-dots">' + [0, 1, 2, 3].map(function (j) {
          return '<span class="rp-dot" data-k="' + j + '"></span>';
        }).join('') + '<em>' + (i + 2) + ' / 4</em></div></div>';
    });

    rp.innerHTML = h;
    // Two layers everywhere that moves: the wrapper carries entrance, drift and
    // flight, the inner element carries the 3D pose. They never touch the same
    // transform, so a tween can never take the pose away with it.
    rp._fAir = $('.rf-air', rp);
    rp._folder = $('.rf', rp);
    rp._airs = $$('.rp-air', rp);
    rp._papers = $$('.rp-paper', rp);
    rp._cAirs = $$('.rp-cube-air', rp);
    rp._cubes = $$('.rp-cube', rp);
    rp._wads = $$('.rp-wad', rp);
    rp._screen = $('.rps', rp);
    rp._sheet = $('.rs-sheet', rp);
    rp._canvas = $('.rs-canvas', rp);
    rp._roll = $('.rs-rollw', rp);
    rp._barw = $('.rs-barw', rp);
    rp._pj = $('.rj', rp);
    rp._cone = $('.rj-cone', rp);
    rp._glow = $('.rj-glow', rp);
    rp._lit = $('.rs-lit', rp);
    rp._hero = $('.rp-hero', rp);
    rp._copies = $$('.rp-copy', rp);
    rp._rly = [];
    buildWord(rp);

    // one Recordly host per report, parked inside the sheet
    VIEWS.forEach(function (v, i) {
      var host = document.createElement('div');
      host.className = 'rp-rly';
      host.style.opacity = '0';
      rp._canvas.appendChild(host);
      if (!global.Recordly) return;
      global.Recordly.load(host, 'assets/video/' + v.clip + '.mp4', 'assets/video/' + v.clip + '.cues.json',
        { autoplay: false, pad: 0, bg: '#F6F8F7', loop: true, zoom: 1.16,
          to: v.cfg.to, mark: v.cfg.mark, rate: v.cfg.rate })
        .then(function (r) { rp._rly[i] = r; });
    });

    var step = rp.closest('.step');
    $$('.rp-dot', rp).forEach(function (d) {
      d.addEventListener('click', function () { if (global.deckSetSub && step) global.deckSetSub(step, +d.dataset.k); });
    });
    if (step) step.addEventListener('substep', function (e) { show(step, e.detail.k, e.detail.d); });
  }

  /* ───────── geometry ─────────
     Two layouts live here: the folder centre stage (beat 0) and the folder in
     the corner with a screen beside it (beats 1-3). Both are computed up front
     so a beat only ever moves between two known poses. */
  /* ══════ the word on the folder ══════
     One span per layer, stepped along z, the front one wearing a glass face and
     a light that runs across it once it is out — the same extrusion the act
     dividers use for their titles. It is raised off the folder's own glass,
     inside the folder's 3D space, so it is turned exactly as the folder is
     turned and travels, scales and drifts with it without a line of code.
     Nothing else on the first beat says in words what the folder is full of. */
  function buildWord(rp) {
    var pl = $('.rpw-pl', rp), lay = [];
    function span(cls) {
      var e = document.createElement('span');
      e.className = cls; e.textContent = WORD; pl.appendChild(e); return e;
    }
    var shade = span('rpw-ly rpw-shade');
    for (var i = 0; i < WORD_N; i++) {
      var face = i === WORD_N - 1;
      var ly = span('rpw-ly' + (i === 0 ? ' rpw-base' : '') + (face ? ' rpw-face' : ''));
      // the body of the letter is one tone laid down many times; thin at the
      // back and denser towards the face, so the thickness reads as glass with
      // a depth to it rather than as a slab of flat colour
      if (!face) ly.style.color = 'rgba(21,137,63,' + (.028 + (i / WORD_N) * .085).toFixed(3) + ')';
      ly._z = i * WORD_STEP; lay.push(ly);
    }
    var sheen = span('rpw-ly rpw-sheen');
    sheen._z = (WORD_N - 1) * WORD_STEP + .6;
    rp._word = $('.rpw', rp); rp._wpl = pl; rp._wly = lay;
    rp._wshade = shade; rp._wsheen = sheen;
  }
  function wordParts(rp) { return rp._wly.concat([rp._wpl, rp._wshade, rp._wsheen]); }

  /* How deep the letters stand off the glass, as a share of their own height.
     The folder's size is the stage's, not a constant, so the step is measured
     from the type every time the room is laid out. */
  function wordDepth(rp) {
    var fs = parseFloat(getComputedStyle(rp._wly[0]).fontSize) || 56;
    var step = fs * .0075;
    rp._wly.forEach(function (ly, i) { ly._z = i * step; });
    rp._wsheen._z = (WORD_N - 1) * step + step;
  }

  /* the two rest poses: flat in the wall and invisible, or standing out of it */
  function wordRest(rp, out) {
    if (!rp._word) return;
    gsap.killTweensOf(wordParts(rp));
    rp._wly.forEach(function (ly) { gsap.set(ly, { z: out ? ly._z : 0, opacity: out ? 1 : 0 }); });
    gsap.set(rp._wshade, { opacity: out ? 1 : 0 });
    gsap.set(rp._wsheen, { z: rp._wsheen._z, opacity: 0, backgroundPosition: '150% 0' });
  }
  /* it pushes out of the wall, back layers first, and the light sweeps it */
  function wordOut(rp, at, tl) {
    if (!rp._word) return;
    var n = rp._wly.length;
    rp._wly.forEach(function (ly, i) {
      tl.fromTo(ly, { z: 0, opacity: 0 }, { z: ly._z, opacity: 1, duration: .9, ease: 'power3.out' }, at + (i / n) * .34);
    });
    tl.fromTo(rp._wshade, { opacity: 0 }, { opacity: 1, duration: .9, ease: 'power2.out' }, at + .14)
      .set(rp._wsheen, { opacity: 1, backgroundPosition: '150% 0' }, at + .6)
      .to(rp._wsheen, { backgroundPosition: '-150% 0', duration: 1.05, ease: 'power2.inOut' }, at + .6)
      .set(rp._wsheen, { opacity: 0 }, at + 1.66);
  }
  /* and sinks back into it, front layers first */
  function wordIn(rp, at, tl) {
    if (!rp._word) return;
    var n = rp._wly.length;
    rp._wly.forEach(function (ly, i) {
      tl.to(ly, { z: 0, opacity: 0, duration: .44, ease: 'power2.in' }, at + ((n - i) / n) * .14);
    });
    tl.to(rp._wshade, { opacity: 0, duration: .34, ease: 'power2.in' }, at);
  }

  function layout(rp) {
    var W = rp.clientWidth || innerWidth, H = rp.clientHeight || innerHeight, narrow = W <= 1080;
    rp.classList.toggle('narrow', narrow);
    var k = narrow ? clamp(W / 820, .6, 1) : clamp(Math.min(W / 1600, H / 880), .72, 1.24);
    rp.style.setProperty('--k', k.toFixed(3));

    // beat 0 — the folder in the middle of the room
    var bigW = even(clamp(Math.min(W * .28, H * .42), 260, 420)), bigH = Math.round(bigW * .8);
    var big = { w: bigW, h: bigH, x: Math.round(W / 2 - bigW / 2), y: Math.round(H * .5 - bigH / 2) };

    // beats 1-3 — the folder in the bottom-left corner, under the words
    var smW = even(clamp(bigW * .3, 96, 160)), smH = Math.round(smW * .8);
    var gut = Math.round(44 * k);
    var small = { w: smW, h: smH, x: gut + Math.round(14 * k), y: Math.round(H - smH - Math.round(40 * k)) };

    // the words: the left quarter
    var cw = even(clamp(360 * k, 250, 410));
    rp.style.setProperty('--cw', cw + 'px');

    // the screen: everything right of the words
    var left = gut + cw + Math.round(46 * k);
    var shW = even(clamp(W - left - gut, 440, 1180));
    var shH = Math.round(shW / CLIP_AR);          // the clip's own shape — no crop
    var shY = Math.round(clamp(H * .36 - shH / 2, Math.round(52 * k), H * .22));
    var roll = Math.max(11, Math.round(shH * .058));
    var bar = Math.max(10, Math.round(shH * .052));

    // the projector sits below the sheet, a little to its left, aimed up at it
    var pjW = even(clamp(shW * .2, 118, 224)), pjH = Math.round(pjW * .38);
    var ringBottom = shY + roll + shH + bar + Math.round(46 * k);   // the pull ring hangs this far
    var pjX = Math.round(left + shW * .09);
    var pjY = Math.round(Math.max(ringBottom + Math.round(22 * k), H - pjH - Math.round(46 * k)));
    if (pjY + pjH > H - 26) pjY = H - pjH - 26;

    // the beam, from the lens to the middle of the sheet
    var lensX = pjX + pjW * .22, lensY = pjY + pjH * .5;
    var aimX = left + shW * .52, aimY = shY + roll + shH * .5;
    var dx = aimX - lensX, dy = aimY - lensY;
    var cone = { x: Math.round(lensX), y: Math.round(lensY), len: Math.round(Math.sqrt(dx * dx + dy * dy)),
      ang: Math.atan2(dy, dx) * 180 / Math.PI, h: Math.round(shH * 1.15) };

    var g = rp._geo = { W: W, H: H, k: k, narrow: narrow, big: big, small: small,
      cw: cw, cx: gut, sh: { x: left, y: shY, w: shW, h: shH, roll: roll, bar: bar }, pj: { x: pjX, y: pjY, w: pjW, h: pjH }, cone: cone };

    // the parts that never move once placed
    var sc = rp._screen;
    sc.style.left = g.sh.x + 'px'; sc.style.top = g.sh.y + 'px';
    sc.style.width = g.sh.w + 'px'; sc.style.height = (g.sh.h + roll) + 'px';
    rp._roll.style.cssText = 'position:absolute;left:0;right:0;top:0;height:' + roll + 'px';
    rp._barw.style.cssText = 'position:absolute;left:2.6%;right:2.6%;top:' + roll + 'px;height:' + bar + 'px';
    rp._sheet.style.top = roll + 'px';
    rp._sheet.style.fontSize = Math.round(13 * k) + 'px';
    rp._sheet.style.setProperty('--sheetH', shH + 'px');
    var pj = rp._pj;
    pj.style.left = g.pj.x + 'px'; pj.style.top = g.pj.y + 'px';
    pj.style.width = g.pj.w + 'px'; pj.style.height = g.pj.h + 'px';
    pj.style.fontSize = Math.round(13 * k) + 'px';
    rp._cone.style.cssText = 'position:absolute;left:' + cone.x + 'px;top:' + (cone.y - cone.h / 2) + 'px;' +
      'width:' + cone.len + 'px;height:' + cone.h + 'px;transform-origin:0% 50%;transform:rotate(' + cone.ang.toFixed(2) + 'deg)';

    // the words and the opening title
    rp._copies.forEach(function (c) {
      c.style.left = g.cx + 'px';
      var ch = c.offsetHeight || 420;
      c.style.top = Math.round(clamp(H * .5 - ch / 2, 20, H - ch - 20)) + 'px';
    });
    // the title stands under the whole arrangement — the papers own the top of
    // the room and nothing has to be read through them
    var hh = rp._hero.offsetHeight || 260;
    rp._hero.style.top = Math.round(clamp(big.y + big.h + Math.round(40 * k), 20, H - hh - 16)) + 'px';

    placeFolder(rp, rp._k === 0 ? big : small, rp._k === 0 ? 1 : 0);
    wordDepth(rp);              // the label's relief follows the folder's size
    return g;
  }

  /* put the folder, its papers and its cubes at one of the two poses */
  function placeFolder(rp, box, open) {
    var fa = rp._fAir;
    fa.style.left = box.x + 'px'; fa.style.top = box.y + 'px';
    fa.style.width = box.w + 'px'; fa.style.height = box.h + 'px';
    fa.style.fontSize = Math.round(box.w * .034) + 'px';
    // turned, not face-on: a flat rectangle of glass reads as an outline, and a
    // folder you can see the side and the depth of reads as an object
    gsap.set(rp._folder, { rotationX: open ? 13 : 9, rotationY: open ? -21 : -15, transformPerspective: 1500 });
    var air = open ? AIR : AIR_SMALL;
    rp._airs.forEach(function (w, i) {
      if (i === rp._flying) return;            // this one is becoming the screen
      var a = air[i], pw = Math.round(box.w * a.w);
      w.style.width = pw + 'px'; w.style.height = Math.round(pw * 1.3) + 'px';
      w.style.fontSize = Math.round(pw * .1) + 'px';
      w.style.left = Math.round(box.x + box.w * .5 + box.w * a.x - pw / 2) + 'px';
      w.style.top = Math.round(box.y + box.h * .5 + box.h * a.y) + 'px';
      gsap.set(rp._papers[i], { rotationX: a.rx, rotationY: a.ry, rotation: a.rz, z: a.z, transformPerspective: 1100 });
    });
    rp._cAirs.forEach(function (w, i) {
      var cu = CUBES[i], sz = Math.round(box.w * cu.s);
      w.style.width = sz + 'px'; w.style.height = sz + 'px';
      w.style.left = Math.round(box.x + box.w * .5 + box.w * cu.x) + 'px';
      w.style.top = Math.round(box.y + box.h * .5 + box.h * cu.y) + 'px';
      gsap.set(rp._cubes[i], { rotation: cu.rz });
    });
  }

  /* ───────── the folder's own life ───────── */
  function startFloat(rp) {
    stopFloat(rp);
    if (reduced) return;
    var a = rp._float = [];
    // every drift is a fromTo about the rest pose — a relative tween would leave
    // the folder a few pixels lower every time a beat restarted it
    var big = rp._k === 0, air = big ? AIR : AIR_SMALL, amp = big ? 1 : .5;
    // long and shallow. The first pass bobbed hard enough to read as a bounce,
    // which is the wrong note for a folder of records sitting still in a room.
    // Carried on the wrappers, and started from wherever the entrance left them
    // rather than from a fixed zero. A fromTo writes its start values the moment
    // it is created — even a delayed one — which is what used to yank each paper
    // back the instant the drift began.
    function drift(el, dy, dx, dr, dur, delay) {
      var y0 = gsap.getProperty(el, 'y') || 0, x0 = gsap.getProperty(el, 'x') || 0;
      var r0 = gsap.getProperty(el, 'rotation') || 0;
      // ease on from wherever the entrance left it, then ride the swell
      a.push(gsap.to(el, { y: y0 + dy, x: x0 + dx, rotation: r0 + dr, duration: dur * .5,
        ease: 'sine.inOut', delay: delay, onComplete: function () {
          a.push(gsap.to(el, { y: y0, x: x0, rotation: r0, duration: dur, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
        } }));
      // the sideways sway runs on its own period, which is what turns a bob
      // into a float — the two never line up, so it never looks mechanical
      a.push(gsap.to(el, { x: x0 - dx * .7, duration: dur * 1.37, ease: 'sine.inOut',
        yoyo: true, repeat: -1, delay: delay + dur * .5 }));
    }
    drift(rp._fAir, -15 * amp, 5 * amp, 1.1, 4.4, 0);
    rp._airs.forEach(function (w, i) {
      if (i === rp._flying) return;
      drift(w, -(19 + i * 6) * amp, (i % 2 ? 7 : -7) * amp, (i % 2 ? 2.4 : -2.4), 3.5 + i * .55, air[i].d * .7);
    });
    rp._cAirs.forEach(function (w, i) {
      drift(w, -(22 + i * 5) * amp, (i % 2 ? -9 : 9) * amp, (i % 2 ? 22 : -22), 3.8 + i * .5, CUBES[i].d * .7);
    });
    var mk = $('.rp-mark-in', rp);
    if (mk) a.push(gsap.fromTo(mk, { yPercent: -.8, rotate: -.6 }, { yPercent: .8, rotate: .6,
      duration: 22, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 50%' }));
  }
  function stopFloat(rp) { (rp._float || []).forEach(function (t) { t.kill(); }); rp._float = null; }

  function playClip(rp, i, on) {
    var r = rp._rly && rp._rly[i]; if (!r) return;
    try {
      // play() hands back a promise, and pausing before it resolves rejects it.
      // Walking the beats quickly does exactly that, so the rejection is
      // swallowed here rather than left to surface as a console error.
      var pr = on ? (r.restart ? r.restart() : r.play()) : (r.pause ? r.pause() : r.stop && r.stop());
      if (pr && pr.catch) pr.catch(function () {});
    } catch (e) {}
  }
  function clipHost(rp, i) { return $$('.rp-rly', rp._canvas)[i]; }

  /* where the beam leaves the lens */
  function lensAt(g) { return { x: g.pj.x + g.pj.w * .18, y: g.pj.y + g.pj.h * .5 }; }

  /* park a crushed sheet over a wrapper's centre, at the size it flies at */
  function wadTo(rp, i, box) {
    var w = rp._wads[i], sz = Math.round(box.w * .34);
    w.style.width = sz + 'px'; w.style.height = sz + 'px';
    w.style.left = Math.round(box.x + box.w / 2 - sz / 2) + 'px';
    w.style.top = Math.round(box.y + box.h / 2 - sz / 2) + 'px';
    gsap.set(w, { x: 0, y: 0 });
    return { el: w, cx: box.x + box.w / 2, cy: box.y + box.h / 2, sz: sz };
  }

  /* ───────── the three pieces of a beat ─────────
     rig    · the screen comes down and the projector lights (or shuts down)
     send   · a report leaves the folder as a crushed ball, flies into the lens,
              and opens out on the sheet
     recall · the reverse: the projection folds back into the lens and the ball
              flies home to the folder, opening out flat again
     Walking between two reports runs only recall + send: the screen and the
     projector stay exactly where they are, which is what was asked for and also
     what stops the recording being squashed into a rolling sheet. */
  function rig(rp, at, tl, up) {
    var sh = rp._geo.sh, ring = $('.rs-ring', rp);
    if (up) {
      tl.fromTo(rp._roll, { opacity: 0, scaleX: .72 }, { opacity: 1, scaleX: 1, duration: .34, ease: 'power3.out' }, at)
        .fromTo(rp._sheet, { height: 0 }, { height: sh.h, duration: .95, ease: 'power2.inOut' }, at + .26)
        .fromTo(rp._barw, { opacity: 0, y: 0 }, { opacity: 1, y: sh.h, duration: .95, ease: 'power2.inOut' }, at + .26)
        .fromTo(ring, { scaleY: .4, opacity: 0 }, { scaleY: 1, opacity: 1, duration: .4, ease: 'power3.out' }, at + .92)
        .fromTo(rp._pj, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .55, ease: 'power3.out' }, at + .78)
        .call(function () { rp._pj.classList.remove('rj-off'); }, null, at + 1.1)
        .fromTo(rp._glow, { opacity: 0, scale: .4 }, { opacity: 1, scale: 1, duration: .5, ease: 'power2.out' }, at + 1.16)
        .fromTo(rp._cone, { opacity: 0, scaleY: .25 }, { opacity: .8, scaleY: 1, duration: .6, ease: 'power2.out' }, at + 1.2);
    } else {
      tl.to([rp._cone, rp._glow], { opacity: 0, duration: .34, ease: 'power2.in' }, at)
        .call(function () { rp._pj.classList.add('rj-off'); }, null, at)
        .to(rp._pj, { opacity: 0, y: 26, duration: .38, ease: 'power2.in' }, at + .1)
        .to(ring, { opacity: 0, duration: .22 }, at + .18)
        .to(rp._sheet, { height: 0, duration: .6, ease: 'power2.inOut' }, at + .3)
        .to(rp._barw, { y: 0, opacity: 0, duration: .6, ease: 'power2.inOut' }, at + .3)
        .to(rp._roll, { opacity: 0, scaleX: .7, duration: .3, ease: 'power2.in' }, at + .8);
    }
  }

  /* the wrapper's box as it stands right now, drift included */
  function airBox(air) {
    return { x: parseFloat(air.style.left) + (gsap.getProperty(air, 'x') || 0),
             y: parseFloat(air.style.top) + (gsap.getProperty(air, 'y') || 0),
             w: parseFloat(air.style.width), h: parseFloat(air.style.height) };
  }

  function send(rp, i, at, tl) {
    var g = rp._geo, air = rp._airs[i], host = clipHost(rp, i), lens = lensAt(g);
    rp._flying = i;
    gsap.killTweensOf([air, rp._wads[i]]);
    tl.call(function () {
      // the page screws itself into a ball where it floats
      var box = airBox(air), W = wadTo(rp, i, box);
      gsap.set(W.el, { opacity: 0, scale: 2.2, rotation: -18 });
      // and floats across the room into the lens, in an arc. Every piece of the
      // flight is positioned on one timeline rather than delayed, so the whole
      // of it answers to the same speed lever the beat does — a delay would not.
      var dx = lens.x - W.cx, dy = lens.y - W.cy;
      rp._wadTl = gsap.timeline()
        .to(W.el, { opacity: 1, scale: 1, rotation: 0, duration: .36, ease: 'power2.inOut' }, 0)
        .to(air, { opacity: 0, scale: .34, rotation: 26, duration: .34, ease: 'power2.in' }, 0)
        .to(W.el, { x: dx * .52, y: dy * .52 - Math.abs(dx) * .17, duration: .46, ease: 'sine.out' }, .3)
        .to(W.el, { x: dx, y: dy, duration: .44, ease: 'sine.in' }, .76)
        .to(W.el, { scale: .12, duration: .9, ease: 'power2.in' }, .3)
        .to(W.el, { rotation: 300, duration: .9, ease: 'none' }, .3)
        .to(W.el, { opacity: 0, duration: .18 }, 1.04);
      rp._wadTl.timeScale(SPEED);
    }, null, at);
    // the lens takes it: the lamp comes back up as the ball reaches the glass,
    // and the report opens out on the sheet
    tl.call(function () { rp._pj.classList.remove('rj-off'); }, null, at + 1.04)
      .to(rp._glow, { opacity: 1, scale: 1.5, duration: .2, ease: 'power2.out' }, at + 1.08)
      .to(rp._glow, { scale: 1, duration: .5, ease: 'power2.inOut' }, at + 1.34)
      .to(rp._cone, { opacity: 1, duration: .22 }, at + 1.16)
      .fromTo(rp._lit, { opacity: 0 }, { opacity: 1, duration: .5 }, at + 1.2)
      .call(function () { playClip(rp, i, true); }, null, at + 1.2)
      .fromTo(host, { opacity: 0, scaleX: .24, scaleY: .1, transformOrigin: '14% 88%' },
        { opacity: 1, scaleX: 1, scaleY: 1, duration: .62, ease: 'power3.out' }, at + 1.2)
      .call(function () { rp._flying = -1; }, null, at + 1.6);
  }

  function recall(rp, i, at, tl) {
    var g = rp._geo, air = rp._airs[i], host = clipHost(rp, i), lens = lensAt(g);
    tl.to(host, { opacity: 0, scaleX: .24, scaleY: .1, duration: .42, ease: 'power3.in',
      transformOrigin: '14% 88%' }, at)
      .to(rp._lit, { opacity: 0, duration: .34 }, at)
      .call(function () { playClip(rp, i, false); }, null, at + .42)
      // the picture goes and the lamp goes out behind it. It stays out until the
      // next report reaches the lens, which is what a projector actually does.
      .to([rp._cone, rp._glow], { opacity: 0, duration: .34, ease: 'power2.in' }, at + .08)
      .call(function () { rp._pj.classList.add('rj-off'); }, null, at + .14);
    tl.call(function () {
      var box = airBox(air), W = wadTo(rp, i, box);
      var dx = lens.x - W.cx, dy = lens.y - W.cy;
      gsap.set(W.el, { x: dx, y: dy, scale: .12, rotation: 300, opacity: 0 });
      rp._wadTl = gsap.timeline()
        .to(W.el, { opacity: 1, duration: .2 })
        .to(W.el, { x: dx * .5, y: dy * .5 - Math.abs(dx) * .15, duration: .44, ease: 'sine.out' }, 0)
        .to(W.el, { x: 0, y: 0, duration: .44, ease: 'sine.in' }, .44)
        .to(W.el, { scale: 1, duration: .88, ease: 'power2.out' }, 0)
        .to(W.el, { rotation: 0, duration: .88, ease: 'none' }, 0)
        // and opens out flat again as it lands
        .to(W.el, { opacity: 0, scale: 2.1, duration: .32, ease: 'power2.out' }, .88)
        .fromTo(air, { opacity: 0, scale: .34, rotation: 26 },
          { opacity: 1, scale: 1, rotation: 0, duration: .4, ease: 'power2.out' }, .9);
      rp._wadTl.timeScale(SPEED);
    }, null, at + .34);
  }

  /* The folder travels between centre stage and the corner.
     It is resized, not scaled. Scaling a 160px folder up to 420px stretches
     every edge, rim and shadow with it and then snaps back to the real
     geometry at the end — which is the shape change and the catch. Tweening
     the box itself means it is the right folder at every frame. */
  function moveFolder(rp, toBig, at, tl) {
    var g = rp._geo, from = toBig ? g.small : g.big, to = toBig ? g.big : g.small;
    var fa = rp._fAir, air = toBig ? AIR : AIR_SMALL, D = .92;
    tl.call(function () { stopFloat(rp); }, null, at);
    tl.set(fa, { x: 0, y: 0, scale: 1, rotation: 0 }, at);
    tl.to(fa, { left: to.x, top: to.y, width: to.w, height: to.h,
      fontSize: Math.round(to.w * .034), duration: D, ease: 'power3.inOut' }, at)
      .to(rp._folder, { rotationX: toBig ? 13 : 9, rotationY: toBig ? -21 : -15,
        duration: D, ease: 'power3.inOut' }, at);

    rp._airs.forEach(function (w, i) {
      if (i === rp._flying) return;
      var a = air[i], pw = Math.round(to.w * a.w);
      tl.set(w, { x: 0, y: 0, scale: 1, rotation: 0 }, at);
      tl.to(w, { left: Math.round(to.x + to.w * .5 + to.w * a.x - pw / 2),
        top: Math.round(to.y + to.h * .5 + to.h * a.y),
        width: pw, height: Math.round(pw * 1.3), fontSize: Math.round(pw * .1),
        duration: D, ease: 'power3.inOut' }, at + i * .02)
        .to(rp._papers[i], { rotationX: a.rx, rotationY: a.ry, rotation: a.rz, z: a.z,
          duration: D, ease: 'power3.inOut' }, at + i * .02);
    });
    rp._cAirs.forEach(function (w, i) {
      var cu = CUBES[i], sz = Math.round(to.w * cu.s);
      tl.set(w, { x: 0, y: 0, scale: 1, rotation: 0 }, at);
      tl.to(w, { left: Math.round(to.x + to.w * .5 + to.w * cu.x),
        top: Math.round(to.y + to.h * .5 + to.h * cu.y),
        width: sz, height: sz, duration: D, ease: 'power3.inOut' }, at + i * .02);
    });
    tl.call(function () { startFloat(rp); }, null, at + D + .02);
  }

  /* snap the whole scene to one beat's rest pose.
     Every beat is built from callbacks — the paper is released, the clip is
     paused, the folder's props are cleared — and an arrow pressed mid-flight
     kills the timeline those callbacks live on. So before any new beat begins,
     the furniture is put back where that beat left it, from scratch. */
  function settleTo(rp, j) {
    var g = rp._geo, home = j === 0, box = home ? g.big : g.small;
    stopFloat(rp);
    rp._flying = -1;
    if (rp._wadTl) { rp._wadTl.kill(); rp._wadTl = null; }
    gsap.killTweensOf(rp._wads);
    rp._wads.forEach(function (w) { gsap.set(w, { opacity: 0, x: 0, y: 0, scale: 1, rotation: 0 }); });
    var movers = [rp._fAir].concat(rp._airs, rp._cAirs);
    gsap.killTweensOf(movers.concat(rp._papers, [rp._folder], rp._cubes, rp._copies, [rp._hero]));
    movers.forEach(function (n) { gsap.set(n, { x: 0, y: 0, scale: 1, rotation: 0 }); });
    placeFolder(rp, box, home ? 1 : 0);
    rp._airs.forEach(function (w, i) { gsap.set(w, { opacity: (!home && i === j - 1) ? 0 : 1 }); });
    rp._cAirs.forEach(function (w) { gsap.set(w, { opacity: 1 }); });
    gsap.set(rp._hero, { opacity: home ? 1 : 0, y: 0 });
    rp._copies.forEach(function (c, i) { gsap.set(c, { opacity: (!home && i === j - 1) ? 1 : 0, x: 0 }); });
    wordRest(rp, home);
    var ring = $('.rs-ring', rp);
    if (home) {
      gsap.set(rp._sheet, { height: 0 });
      gsap.set(rp._barw, { y: 0, opacity: 0 });
      gsap.set(rp._roll, { opacity: 0, scaleX: .7 });
      gsap.set(ring, { opacity: 0, scaleY: .4 });
      gsap.set(rp._pj, { opacity: 0, y: 34 });
      gsap.set([rp._cone, rp._glow, rp._lit], { opacity: 0 });
      rp._pj.classList.add('rj-off');
    } else {
      gsap.set(rp._sheet, { height: g.sh.h });
      gsap.set(rp._barw, { y: g.sh.h, opacity: 1 });
      gsap.set(rp._roll, { opacity: 1, scaleX: 1 });
      gsap.set(ring, { opacity: 1, scaleY: 1 });
      gsap.set(rp._pj, { opacity: 1, y: 0, rotationX: 0 });
      gsap.set([rp._cone, rp._glow, rp._lit], { opacity: 1, scaleY: 1 });
      rp._pj.classList.remove('rj-off');
    }
    $$('.rp-rly', rp._canvas).forEach(function (h, i) {
      var on = !home && i === j - 1;
      gsap.set(h, { opacity: on ? 1 : 0, scaleX: 1, scaleY: 1 });
      playClip(rp, i, on);
    });
    startFloat(rp);
  }

  /* ───────── walking the four ───────── */
  function show(step, k, d) {
    var rp = $('.reports', step); if (!rp || !rp._h) return;
    var from = rp._k; if (from === k) return;
    killRun(rp);
    settleTo(rp, from);                  // start every beat from a known pose
    rp._k = k;
    paintDots(rp, k);
    var tl = rp._tl = gsap.timeline({ onComplete: function () { rp._tl = null; } });

    if (from === 0) {
      // the folder retreats, the screen comes down, then the report is sent
      tl.to(rp._hero, { opacity: 0, y: -18, duration: .4, ease: 'power2.in' }, 0);
      wordIn(rp, 0, tl);
      moveFolder(rp, false, .14, tl);
      rig(rp, .22, tl, true);
      tl.fromTo(rp._copies[k - 1], { opacity: 0, x: -22 },
        { opacity: 1, x: 0, duration: .6, ease: 'power3.out', clearProps: 'x' }, 1.14);
      send(rp, k - 1, 1.48, tl);
    } else if (k === 0) {
      // the report comes home, the machine shuts down, the folder returns
      recall(rp, from - 1, 0, tl);
      tl.to(rp._copies[from - 1], { opacity: 0, x: -16, duration: .36, ease: 'power2.in' }, .1);
      rig(rp, 1.04, tl, false);
      moveFolder(rp, true, 1.66, tl);
      wordOut(rp, 1.95, tl);
      tl.fromTo(rp._hero, { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: .55, ease: 'power3.out', clearProps: 'transform' }, 2.36);
    } else {
      // between two reports the screen never moves: one ball goes home while
      // the next is already on its way to the lens
      recall(rp, from - 1, 0, tl);
      tl.to(rp._copies[from - 1], { opacity: 0, x: -16, duration: .36, ease: 'power2.in' }, 0);
      send(rp, k - 1, .7, tl);
      tl.fromTo(rp._copies[k - 1], { opacity: 0, x: -22 },
        { opacity: 1, x: 0, duration: .6, ease: 'power3.out', clearProps: 'x' }, .98);
    }
    tl.timeScale(SPEED);
  }
  function paintDots(rp, k) {
    rp._copies.forEach(function (c) { $$('.rp-dot', c).forEach(function (d) { d.classList.toggle('on', +d.dataset.k === k); }); });
  }
  function killRun(rp) {
    if (rp._tl) { rp._tl.kill(); rp._tl = null; }
    if (rp._wly) gsap.killTweensOf(wordParts(rp));
    if (rp._wadTl) { rp._wadTl.kill(); rp._wadTl = null; }
    gsap.killTweensOf(rp._wads);
    gsap.killTweensOf([rp._sheet, rp._barw, rp._roll, rp._pj, rp._cone, rp._glow, rp._lit, rp._hero,
      rp._folder, rp._fAir].concat(rp._airs, rp._papers, rp._cAirs, rp._cubes, rp._copies,
      $$('.rp-rly', rp._canvas), [$('.rs-ring', rp)]));
  }

  /* ───────── lifecycle ───────── */
  function rest(rp) {
    // everything that belongs to a report beat, parked
    gsap.set(rp._sheet, { height: 0 });
    gsap.set(rp._barw, { y: 0, opacity: 0 });
    gsap.set(rp._roll, { opacity: 0, scaleX: .7 });
    gsap.set($('.rs-ring', rp), { opacity: 0, scaleY: .4 });
    gsap.set(rp._pj, { opacity: 0, y: 34 });
    rp._pj.classList.add('rj-off');
    gsap.set([rp._cone, rp._glow, rp._lit], { opacity: 0 });
    $$('.rp-rly', rp._canvas).forEach(function (hst, i) { gsap.set(hst, { opacity: 0, scaleX: 1, scaleY: 1 }); playClip(rp, i, false); });
    rp._wads.forEach(function (w) { gsap.set(w, { opacity: 0, x: 0, y: 0, scale: 1, rotation: 0 }); });
    rp._copies.forEach(function (c) { gsap.set(c, { opacity: 0 }); });
    rp._airs.forEach(function (w) { gsap.set(w, { opacity: 1 }); });
    wordRest(rp, false);
  }

  function prep(step) {
    var rp = $('.reports', step); if (!rp || !global.gsap) return null;
    stop(step);
    buildOnce(rp);
    rp._k = step._subAt | 0;
    rp._flying = -1;
    layout(rp);
    rest(rp);
    var k = rp._k;
    gsap.set(rp._hero, { opacity: 0, y: k === 0 ? 18 : 0 });
    gsap.set([rp._fAir].concat(rp._airs, rp._cAirs), { opacity: 0 });
    gsap.set($('.rp-bg', rp), { opacity: 0 });
    paintDots(rp, k);
    rp._h = true;
    if (!rp._onResize) {
      // The stage moves under this scene for a whole .45s while the rail
      // slides, and the event arrives on every frame of it. Re-seating costs
      // a layout and a handful of gsap.sets, so it is done on the frame it is
      // asked for: the scene travels with the stage instead of jumping once
      // the stage has stopped.
      rp._onResize = function () {
        if (!rp._built || !rp._h) return;
        // a resize is already a disruption; a beat caught mid-flight is
        // dropped and the scene re-seated, so pose and geometry always agree
        killRun(rp);
        layout(rp);
        settleTo(rp, rp._k);
      };
      addEventListener('resize', rp._onResize);
    }
    return rp._h;
  }

  function play(step) {
    var rp = $('.reports', step); if (!rp) return;
    if (!rp._h && !prep(step)) return;
    var k = rp._k, tl = rp._tl = gsap.timeline({ onComplete: function () { rp._tl = null; } });
    tl.to($('.rp-bg', rp), { opacity: 1, duration: .6, ease: 'power2.out' }, 0)
      .fromTo(rp._fAir, { opacity: 0, y: 30, scale: .94 },
        { opacity: 1, y: 0, scale: 1, duration: .7, ease: 'power3.out' }, .08);
    var last = .78;
    rp._airs.forEach(function (w, i) {
      if (k > 0 && i === k - 1) return;                   // this one is already the screen
      var at = .2 + i * .09;
      tl.fromTo(w, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: .55, ease: 'power3.out' }, at);
      last = Math.max(last, at + .55);
    });
    tl.fromTo(rp._cAirs, { opacity: 0, scale: .6 }, { opacity: 1, scale: 1, duration: .6, stagger: .08, ease: 'power3.out' }, .3);
    // the drift only begins once every entrance has landed, so it takes over
    // from a settled pose rather than interrupting one
    tl.call(function () { startFloat(rp); }, null, last + .05);

    if (k === 0) {
      tl.fromTo(rp._hero, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .6, ease: 'power3.out', clearProps: 'transform' }, .42);
      wordOut(rp, .3, tl);
    } else {
      // the folder and its papers arrive at their own pace; everything the beat
      // machinery builds runs on its own timeline at the beat speed, so the ball
      // and the projection stay in step with each other
      gsap.set(rp._airs[k - 1], { opacity: 0 });
      var sub = gsap.timeline();
      rig(rp, 0, sub, true);
      sub.fromTo(rp._copies[k - 1], { opacity: 0, x: -22 },
        { opacity: 1, x: 0, duration: .6, ease: 'power3.out', clearProps: 'x' }, .95);
      send(rp, k - 1, 1.3, sub);
      sub.timeScale(SPEED);
      tl.add(sub, .35);
    }
  }

  function stop(step) {
    var rp = $('.reports', step); if (!rp || !rp._built) return;
    killRun(rp);
    stopFloat(rp);
    $$('.rp-rly', rp._canvas).forEach(function (h, i) { playClip(rp, i, false); });
    rp._h = null;
  }

  global.Reports = { prep: prep, play: play, stop: stop, show: show, VIEWS: VIEWS };
})(window);
