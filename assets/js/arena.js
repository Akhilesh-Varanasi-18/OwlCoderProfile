/* ══════════════════════════════════════════════════════════════════
   07 · CODING CONTEST — "the arena"

   One step, five beats, one dark room. A sheet of glass hangs in the
   middle of it carrying the product; electricity runs round its edge;
   smaller panes drift in the depth behind. The arrow cracks the glass,
   the pieces fly past the viewer, and the next sheet is already coming
   forward through the gap.

   Three beats play a recording. Two had none — the countdown page and
   the coding arena — so they are rebuilt here from the product's own
   screenshots and played like a recording: the clock ticks, the code
   types itself, the tests run.

   Lifecycle: prep (state before the fade-in) → play → stop.
   ══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function even(v) { v = Math.round(v); return v % 2 ? v + 1 : v; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  var reduced = global.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var AR = 1900 / 890;          // every contest screen is this shape

  /* Each sheet rests turned the opposite way to the one before it, so the room
     reads as a room: the viewer travels past one pane and meets the next from
     the other side. The arrival swings in from beyond that angle and settles
     back onto it. */
  function tilt(i) { return (i % 2 ? 10.5 : -10.5); }
  var BREAK = 2.15;             // how long one sheet takes to replace another

  /* ───────── the five beats ───────── */
  var BEATS = [
    { key: 'list', kind: 'clip', clip: 'contest-list', tab: 'Contest list',
      h: 'Every contest,', h2: 'current and past.',
      say: 'The Coding Contest page lists what is running in your organisation now and every contest that has closed — with the date, the window, whether it is major or minor, and whether you are registered.',
      cfg: { to: 15.4, mark: 1.1, rate: 1.14, zoom: 1.2 } },
    { key: 'rules', kind: 'clip', clip: 'contest-rules', tab: 'The rules',
      h: 'The rules,', h2: 'before the clock.',
      say: 'View Details opens the instructions and the judging system: twenty points for an easy question, forty for a medium, sixty for a hard, one off for every failed run, and the minute you submit added as penalty.',
      cfg: { to: 31.4, mark: 1.1, rate: 1.16, zoom: 1.2 } },
    { key: 'wait', kind: 'ui', ui: 'wait', tab: 'The countdown',
      h: 'Registered.', h2: 'Now the wait.',
      say: 'The same page carries the clock. It counts down to the start in front of the whole batch, and the moment it reaches zero the Attempt button appears and the contest is open.' },
    { key: 'arena', kind: 'ui', ui: 'arena', tab: 'The arena',
      h: 'Four questions,', h2: 'one clock.',
      say: 'Inside: the question list, the statement with its formats and constraints, the editor with your language, and the compiler response under it — every hidden test case, with memory and CPU time.' },
    { key: 'board', kind: 'clip', clip: 'contest-board', tab: 'The leader board',
      h: 'Where you', h2: 'finished.',
      say: 'When the clock stops the board is final: the podium, then every competitor by rank with their score, their penalty time and the minute they solved each question.',
      cfg: { to: 19.4, mark: 1.1, rate: 1.12, zoom: 1.12 } }
  ];

  /* the panes drifting in the depth, as a fraction of the stage */
  var CHIPS = [
    { x: -.47, y: .04, w: .13, z: -700, ry: 28, d: 0 },
    { x: .49, y: .0, w: .14, z: -820, ry: -26, d: .7 },
    { x: -.44, y: .33, w: .11, z: -520, ry: 24, d: 1.4 },
    { x: .46, y: .31, w: .12, z: -560, ry: -22, d: .4 },
    { x: -.39, y: -.27, w: .09, z: -1020, ry: 18, d: 2.1 },
    { x: .41, y: -.25, w: .1, z: -1060, ry: -16, d: 1.1 },
    { x: .0, y: .45, w: .1, z: -900, ry: 6, d: 1.8 }
  ];

  /* ═════════ the two screens that had no recording ═════════
     Both are rebuilt from the product's own screenshots. The guide
     labels printed on those screenshots in red are not part of the
     product and are not here. */

  function waitHtml() {
    return '<div class="ca-pg"><div class="ca-scroll">' +
      '<div class="ca-nav"><span class="ca-logo"><i>TH</i>TECHNICAL HUB</span>' +
      '<a>Owl Dashboard</a><a>Coding Contest</a><span class="ca-me">K. Prasanth</span></div>' +
      '<div class="ca-hero"><i class="ca-dotfield"></i><i class="ca-wave"></i>' +
      '<h1>SkillUpCoder-Round-2-Offline-InCampus-Batch-4</h1>' +
      '<div class="ca-when"><span>17/09/2026</span><span>15:40</span></div></div>' +
      '<div class="ca-body"><div class="ca-main">' +
      '<h2 class="ca-h2">General Instructions</h2>' +
      '<ul class="ca-ul"><li>1. You can switch between the questions.</li>' +
      '<li>2. You must <b>submit</b> each question when you pass all the test cases.</li>' +
      '<li>3. You must click on <b>Final Submit</b> to make the final submission.</li></ul>' +
      '<h2 class="ca-h2">Judging System</h2><p class="ca-sub">Points Table</p>' +
      '<table class="ca-table"><tr><th>Question</th><th>Max Score</th></tr>' +
      '<tr><td>Easy</td><td>20 Pts.</td></tr><tr><td>Medium</td><td>40 Pts.</td></tr>' +
      '<tr><td>Hard</td><td>60 Pts.</td></tr></table>' +
      '<ul class="ca-ul"><li>1 point from the Max Score will be deducted upon each unsuccessful run.</li>' +
      '<li>The minute at which you submit a question will be added to your penalty.</li></ul>' +
      '</div><div class="ca-side"><div class="ca-card">' +
      '<div class="ca-badge"><b>Skill<s>Up</s> CODER</b></div>' +
      '<h3>Contest Info</h3><span class="ca-lb">Leader Board</span>' +
      '<div class="ca-row"><i></i><em>Registered:</em><b>259</b></div>' +
      '<div class="ca-row"><i></i><em>Duration:</em><b>0d 1h 30m</b></div>' +
      '<p class="ca-note ca-state">Registered for Closed contest</p>' +
      '<p class="ca-note ca-warn ca-lead">Contest Starts in</p>' +
      '<div class="ca-clock">' +
      '<span><i data-u="d">0d</i><u>Days</u></span><span><i data-u="h">18h</i><u>Hrs</u></span>' +
      '<span><i data-u="m">42m</i><u>Mins</u></span><span><i data-u="s">03s</i><u>Secs</u></span></div>' +
      '<span class="ca-attempt" style="opacity:0">Attempt</span>' +
      '</div></div></div>' +
      '</div>' + clockHtml() + '<i class="ca-cur"></i></div>';
  }

  /* The clock the whole beat is about. It lives over the page and takes it
     when the moment comes: four dials, a ring that empties as the seconds go,
     and the word the contest is waiting on. */
  function clockHtml() {
    var dial = function (u, lab) {
      return '<span class="ca-d" data-u="' + u + '">' +
        '<svg viewBox="0 0 100 100" aria-hidden="true">' +
        '<circle class="ca-d-bg" cx="50" cy="50" r="43"/>' +
        '<circle class="ca-d-fg" cx="50" cy="50" r="43"/></svg>' +
        '<b>00</b><u>' + lab + '</u></span>';
    };
    return '<div class="ca-hc">' +
      '<i class="ca-hc-veil"></i>' +
      '<div class="ca-hc-in">' +
      '<div class="ca-hc-kick">SkillUpCoder · Round 2 · Batch 4</div>' +
      '<div class="ca-hc-stack">' +
      '<div class="ca-hc-col"><div class="ca-hc-lab">Contest starts in</div>' +
      '<div class="ca-hc-dials">' + dial('d', 'Days') + dial('h', 'Hours') +
      dial('m', 'Minutes') + dial('s', 'Seconds') + '</div></div>' +
      '<div class="ca-hc-go"><b>The contest is open</b>' +
      '<span class="ca-hc-btn">Attempt</span></div></div>' +
      '</div></div>';
  }

  var CODE = [
    '<span class="ck-cm">#include &lt;bits/stdc++.h&gt;</span>',
    '<span class="ck-kw">using namespace</span> std;',
    '',
    '<span class="ck-ty">int</span> main() {',
    '    <span class="ck-ty">int</span> n, x;',
    '    cin &gt;&gt; n &gt;&gt; x;',
    '    vector&lt;<span class="ck-ty">int</span>&gt; data(n, <span class="ck-nu">0</span>);',
    '    <span class="ck-kw">for</span> (<span class="ck-ty">int</span> i = <span class="ck-nu">0</span>; i &lt; n; i++) cin &gt;&gt; data[i];',
    '    <span class="ck-ty">int</span> ans = -<span class="ck-nu">1</span>;',
    '    <span class="ck-kw">for</span> (<span class="ck-ty">int</span> i = <span class="ck-nu">0</span>; i &lt; n; i++) {',
    '        <span class="ck-kw">if</span> (data[i] == x) {',
    '            ans = i;',
    '            <span class="ck-kw">break</span>;',
    '        }',
    '    }',
    '    cout &lt;&lt; ans;',
    '}'
  ];
  var TESTS = [
    ['1', '7 5 1 2 2 5 5 6', '3', '3', '1408 KB', '3.512 ms'],
    ['2', '5 9 1 9 9 4 7', '1', '1', '1396 KB', '2.904 ms'],
    ['3', '6 2 2 2 3 4 5 6', '0', '0', '1412 KB', '3.118 ms']
  ];

  function arenaHtml() {
    var qs = ['Question 1', 'Question 2', 'Question 3', 'Question 4'].map(function (q, i) {
      return '<a class="' + (i === 0 ? 'on' : '') + '">' + q + '</a>';
    }).join('');
    var lines = CODE.map(function (l) {
      return '<span class="ca-l"><span class="ca-i">' + (l || ' ') + '</span></span>';
    }).join('');
    var nums = CODE.map(function (_, i) { return (i + 1); }).join('<br>');
    var rows = TESTS.map(function (t) {
      return '<tr><td>' + t[0] + '</td><td>' + t[1] + '</td><td>' + t[2] + '</td><td>' + t[3] +
        '</td><td>' + t[4] + '</td><td>' + t[5] + '</td><td class="pass">pass</td></tr>';
    }).join('');
    return '<div class="ca-pg"><div class="ca-ar">' +
      '<div class="ca-qs"><h4>Questions List</h4>' + qs + '</div>' +
      '<div class="ca-arm">' +
      '<div class="ca-bar"><span class="ca-lb2">Leader Board</span>' +
      '<span class="ca-crumb"><b>Home</b> / <b>Owl ground</b> / <s>First Occurrence in a Sorted Array</s></span>' +
      '<span class="ca-pts">Points: 20</span>' +
      '<span class="ca-timer">1:10:57</span><span class="ca-lang">C++ · GCC 11.1.0</span></div>' +
      '<div class="ca-split">' +
      '<div class="ca-prob">' +
      '<div class="ca-blk"><p>It is guaranteed that <b>X appears at least once</b> in the array. Find and print the <b>index of the first occurrence</b> of X. Your solution should run efficiently using <b>Binary Search</b>.</p></div>' +
      '<div class="ca-blk"><h5>Input Format</h5><p>The first line contains two integers N and X, where N is the number of elements in the array and X is the element to search for.</p><p>The second line contains N space-separated integers representing the sorted array.</p></div>' +
      '<div class="ca-blk"><h5>Output Format</h5><p>Print the index of the first occurrence of X.</p></div>' +
      '<div class="ca-blk"><h5>Constraints</h5><p>1 &lt;= N &lt;= 100000<br>1 &lt;= X &lt;= 1000000<br>1 &lt;= A[i] &lt;= 1000000</p></div>' +
      '<div class="ca-blk"><h5>Example</h5><p><b>Input</b><br>7 5<br>1 2 2 5 5 5 6</p><p><b>Output</b><br>3</p></div>' +
      '<div class="ca-blk"><h5>Explanation</h5><p>5 first appears at index 3, so 3 is printed. Binary search finds the left-most match without walking the array.</p></div>' +
      '</div>' +
      '<div class="ca-right">' +
      '<div class="ca-ed"><div class="ca-ln">' + nums + '</div><pre>' + lines + '</pre><i class="ca-caret"></i></div>' +
      '<div class="ca-run"><span class="r">Run Code</span><span class="s">Submit</span></div>' +
      '<div class="ca-out"><h5>Compiler Response</h5>' +
      '<table><tr><th>#</th><th>Input</th><th>Expected</th><th>Your Output</th><th>Memory</th><th>CPU Time</th><th>Result</th></tr>' +
      rows + '</table><p class="ca-ok">All hidden testcases passed</p></div>' +
      '</div></div></div></div><i class="ca-cur"></i></div>';
  }

  /* ───────── build ───────── */
  function buildOnce(ar) {
    if (ar._built) return;
    ar._built = true;

    var h = '<div class="cx-room" aria-hidden="true"><i class="cx-sky"></i><i class="cx-floor"></i>' +
      '<i class="cx-edge"></i><canvas class="cx-stars"></canvas></div>' +
      '<div class="cx-world" aria-hidden="true">';

    CHIPS.forEach(function () { h += '<div class="cx-mv cx-chipW"><div class="cx-chip"><b></b><i></i><i></i><u></u></div></div>'; });
    h += '<i class="cx-aura"></i><div class="cx-pad"><i class="cx-beam"></i><i class="cx-ring1"></i><i class="cx-ring2"></i><i class="cx-core"></i></div>';

    BEATS.forEach(function (b, i) {
      h += '<div class="cx-mv cx-paneW" data-i="' + i + '"><div class="cx-pane">' +
        '<div class="cx-plate"><div class="cx-screen">' +
        (b.kind === 'clip' ? '<div class="cx-rly"></div>' : b.ui === 'wait' ? waitHtml() : arenaHtml()) +
        '</div><i class="cx-sheen"></i><i class="cx-spec"></i><i class="cx-dead"></i><i class="cx-rim"></i></div>' +
        '</div></div>';
    });
    h += '<canvas class="cx-bolt"></canvas></div><canvas class="cx-boil"></canvas>';

    BEATS.forEach(function (b, i) {
      h += '<div class="cx-copy" data-i="' + i + '">' +
        '<div class="cx-ttl"><div class="cx-kick"><b>07 · Coding Contest</b><s></s>' + b.tab + '</div>' +
        '<h2 class="cx-h">' + b.h + ' <em>' + b.h2 + '</em></h2></div>' +
        '<p class="cx-say">' + b.say + '</p></div>';
    });

    h += '<div class="cx-nav">' + BEATS.map(function (_, j) {
      return '<span class="cx-dot" data-k="' + j + '"></span>';
    }).join('') + '<em></em></div>';

    ar.innerHTML = h;
    ar._stars = $('.cx-stars', ar);
    ar._world = $('.cx-world', ar);
    ar._chipWs = $$('.cx-chipW', ar);
    ar._pad = $('.cx-pad', ar);
    ar._aura = $('.cx-aura', ar);
    ar._paneWs = $$('.cx-paneW', ar);
    ar._panes = $$('.cx-pane', ar);
    ar._plates = $$('.cx-plate', ar);
    ar._screens = $$('.cx-screen', ar);
    ar._deads = $$('.cx-dead', ar);
    ar._bolt = $('.cx-bolt', ar);
    ar._boil = $('.cx-boil', ar);
    ar._copies = $$('.cx-copy', ar);
    ar._nav = $('.cx-nav', ar);
    ar._rly = [];
    ar._bl = { v: 1 };              // how bright the electricity is, 0-1.6

    // one player per recording, parked inside its own sheet of glass
    BEATS.forEach(function (b, i) {
      if (b.kind !== 'clip' || !global.Recordly) return;
      var host = $('.cx-rly', ar._screens[i]);
      global.Recordly.load(host, 'assets/video/' + b.clip + '.mp4', 'assets/video/' + b.clip + '.cues.json',
        // The sheet is about 1490px of a 1900px recording, so anything past
        // about 1.27x is the player enlarging the picture beyond the pixels it
        // has — which is what was making the text look soft. And the motion
        // blur that suits a full-screen player is a smear at this size.
        { autoplay: false, pad: 0, bg: '#F4F8F6', loop: true, zoom: b.cfg.zoom,
          blur: 1 / 1100, maxBlur: 1.6,
          to: b.cfg.to, mark: b.cfg.mark, rate: b.cfg.rate })
        .then(function (r) {
          ar._rly[i] = r;
          if (ar._h && ar._k === i) playClip(ar, i, true);
        });
    });

    var step = ar.closest('.step');
    $$('.cx-dot', ar).forEach(function (d) {
      d.addEventListener('click', function () { if (global.deckSetSub && step) global.deckSetSub(step, +d.dataset.k); });
    });
    if (step) step.addEventListener('substep', function (e) { show(step, e.detail.k, e.detail.d); });
  }

  /* ───────── geometry ─────────
     The glass takes as much of the room as it can have: the words sit above
     it, the pad under it, and what is left is the sheet. */
  function layout(ar) {
    var W = ar.clientWidth || innerWidth, H = ar.clientHeight || innerHeight, narrow = W <= 1080;
    ar.classList.toggle('narrow', narrow);
    var k = narrow ? clamp(W / 860, .62, 1) : clamp(Math.min(W / 1600, H / 880), .74, 1.22);
    ar.style.setProperty('--k', k.toFixed(3));
    ar.style.setProperty('--cw', even(clamp(430 * k, 300, 520)) + 'px');

    var gut = Math.round(58 * k);
    // the words are a band across the top; the sheet takes everything under it
    var top = Math.round(gut * .62);
    ar._copies.forEach(function (c) { c.style.left = gut + 'px'; c.style.right = gut + 'px'; c.style.top = top + 'px'; });
    var ch = ar._copies[0].offsetHeight || Math.round(120 * k);
    var after = top + ch + Math.round(22 * k);

    var navH = Math.round(40 * k);
    var maxH = H - after - navH - Math.round(16 * k);
    var pw = even(clamp(Math.min(W - gut * 2, maxH * AR), 420, 1860));
    var ph = Math.round(pw / AR);
    var px = Math.round((W - pw) / 2), py = Math.round(after + (maxH - ph) / 2);

    var g = ar._geo = { W: W, H: H, k: k, narrow: narrow, pane: { x: px, y: py, w: pw, h: ph }, top: top };

    ar._paneWs.forEach(function (p) {
      p.style.left = px + 'px'; p.style.top = py + 'px';
      p.style.width = pw + 'px'; p.style.height = ph + 'px';
      p.style.fontSize = Math.round(pw * .016) + 'px';
    });
    // the coded screens are sized so they read at this distance, not so they
    // match the recordings pixel for pixel
    ar._screens.forEach(function (s) { s.style.setProperty('--ca', (pw / 1900 * 19.4).toFixed(2) + 'px'); });

    ar._nav.style.cssText = 'position:absolute;left:' + gut + 'px;top:' +
      Math.round(py + ph + Math.round(14 * k)) + 'px;font-size:' + (16 * k).toFixed(1) + 'px';

    // the glow the glass sits in, painted once for all five sheets
    var am = Math.round(pw * .06);
    ar._aura.style.cssText = 'position:absolute;left:' + (px - am) + 'px;top:' + (py - am) + 'px;width:' +
      (pw + am * 2) + 'px;height:' + (ph + am * 2) + 'px';

    // the pad under the glass
    var padw = Math.round(pw * .62), padh = Math.round(padw * .17);
    ar._pad.style.cssText = 'position:absolute;left:' + Math.round(px + pw / 2 - padw / 2) + 'px;top:' +
      Math.round(py + ph - padh * .22) + 'px;width:' + padw + 'px;height:' + padh + 'px;' +
      'transform:rotateX(74deg);transform-style:preserve-3d';

    // the panes in the depth
    ar._chipWs.forEach(function (c, i) {
      var q = CHIPS[i], cw = Math.round(W * q.w), chh = Math.round(cw / 1.5);
      c.style.left = Math.round(W / 2 + W * q.x - cw / 2) + 'px';
      c.style.top = Math.round(H / 2 + H * q.y - chh / 2) + 'px';
      c.style.width = cw + 'px'; c.style.height = chh + 'px';
      gsap.set($('.cx-chip', c), { rotationY: q.ry, rotationX: -4, z: q.z, transformPerspective: 1400 });
    });

    sizeBolt(ar);
    sizeStars(ar);
    ar._boil.width = W; ar._boil.height = H;
    return g;
  }

  /* ═════════ the room's dust and streaks ═════════ */
  function sizeStars(ar) {
    var c = ar._stars, W = ar.clientWidth, H = ar.clientHeight;
    c.width = Math.max(2, Math.round(W / 2)); c.height = Math.max(2, Math.round(H / 2));
    var n = Math.round(clamp(W * H / 26000, 40, 120));
    ar._dust = [];
    for (var i = 0; i < n; i++) {
      ar._dust.push({ x: Math.random(), y: Math.random(), z: rnd(.25, 1), r: rnd(.5, 1.7),
        s: rnd(.00006, .00042), g: Math.random() < .14 });
    }
  }
  function drawStars(ar) {
    var c = ar._stars, x = c.getContext('2d'), W = c.width, H = c.height;
    x.clearRect(0, 0, W, H);
    ar._dust.forEach(function (p) {
      p.y -= p.s * (1 + p.z); if (p.y < -.02) { p.y = 1.02; p.x = Math.random(); }
      var a = .12 + p.z * .5;
      x.beginPath();
      x.arc(p.x * W, p.y * H, p.r * p.z * 1.6, 0, 6.2832);
      x.fillStyle = p.g ? 'rgba(247,181,0,' + (a * .8).toFixed(3) + ')' : 'rgba(150,240,195,' + a.toFixed(3) + ')';
      x.fill();
      if (p.z > .8) {                    // the nearest few leave a streak
        x.strokeStyle = 'rgba(150,240,195,' + (a * .22).toFixed(3) + ')';
        x.lineWidth = p.r * .7;
        x.beginPath(); x.moveTo(p.x * W, p.y * H); x.lineTo(p.x * W, p.y * H + 26 * p.z); x.stroke();
      }
    });
  }

  /* ═════════ the electricity ═════════
     A jagged line that follows the sheet's edge, redrawn a dozen times a
     second — real lightning flickers, it does not slide. Two passes: a wide
     soft glow and a hot core. Every so often a bolt crosses the glass. */
  /* The canvas is rendered at a fraction of its size on screen and stretched
     back up. It is a glow — nobody can see the pixels — and the fill area is
     what costs, so this is most of the scene's frame budget. */
  var BSC = .55;
  function sizeBolt(ar) {
    var g = ar._geo; if (!g) return;
    var m = Math.round(44 * g.k), c = ar._bolt, w = g.pane.w + m * 2, h = g.pane.h + m * 2;
    c.width = Math.round(w * BSC); c.height = Math.round(h * BSC);
    c.style.cssText = 'position:absolute;left:' + (-m) + 'px;top:' + (-m) + 'px;width:' +
      w + 'px;height:' + h + 'px';
    ar._boltM = m; ar._boltAt = 0;
  }
  /* The perimeter, as a dense ribbon of points with their distance along it,
     so any stretch of the edge can be asked for by fraction. */
  function perim(w, h, m, r) {
    var pts = [], step = 7;
    function side(x0, y0, x1, y1) {
      var dx = x1 - x0, dy = y1 - y0, len = Math.sqrt(dx * dx + dy * dy), n = Math.max(2, Math.round(len / step));
      for (var i = 0; i <= n; i++) pts.push([x0 + dx * (i / n), y0 + dy * (i / n)]);
    }
    side(m + r, m, m + w - r, m);
    side(m + w, m + r, m + w, m + h - r);
    side(m + w - r, m + h, m + r, m + h);
    side(m, m + h - r, m, m + r);
    pts.push(pts[0].slice());
    var cum = [0], total = 0;
    for (var i = 1; i < pts.length; i++) {
      var ddx = pts[i][0] - pts[i - 1][0], ddy = pts[i][1] - pts[i - 1][1];
      total += Math.sqrt(ddx * ddx + ddy * ddy); cum.push(total);
    }
    return { pts: pts, cum: cum, total: total };
  }
  /* a stretch of the edge, jittered off the line — one live arc */
  function arcPts(P, t0, t1, amp) {
    var out = [], d0 = t0 * P.total, d1 = t1 * P.total, n = Math.max(6, Math.round((d1 - d0) / 11));
    for (var i = 0; i <= n; i++) {
      var d = d0 + (d1 - d0) * (i / n); while (d > P.total) d -= P.total; while (d < 0) d += P.total;
      // find the point at that distance
      var lo = 0, hi = P.cum.length - 1;
      while (lo < hi - 1) { var mid = (lo + hi) >> 1; if (P.cum[mid] < d) lo = mid; else hi = mid; }
      var p = P.pts[lo], q = P.pts[Math.min(lo + 1, P.pts.length - 1)];
      var seg = Math.max(.001, P.cum[hi] - P.cum[lo]), u = (d - P.cum[lo]) / seg;
      var x = p[0] + (q[0] - p[0]) * u, y = p[1] + (q[1] - p[1]) * u;
      var nx = -(q[1] - p[1]), ny = q[0] - p[0], nl = Math.sqrt(nx * nx + ny * ny) || 1;
      var j = (i === 0 || i === n) ? 0 : (Math.random() - .5) * amp;
      out.push([x + nx / nl * j, y + ny / nl * j]);
    }
    return out;
  }
  function strokePts(x, pts, close) {
    if (!pts.length) return;
    x.beginPath(); x.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]);
    if (close) x.closePath();
    x.stroke();
  }

  /* Live arcs: each one owns a stretch of the edge, crawls along it, throws the
     odd filament into the room and dies. Electricity that never changes shape
     reads as a neon outline, which is what it looked like. */
  function newArc(ar) {
    return { t: Math.random(), len: rnd(.04, .16), dir: Math.random() < .5 ? -1 : 1,
      sp: rnd(.05, .22), age: 0, life: rnd(.26, .72), amp: rnd(5, 13),
      br: Math.random() < .45 ? rnd(.2, .8) : -1 };
  }
  function drawBolt(ar, t) {
    var c = ar._bolt, g = ar._geo; if (!c || !g) return;
    var lvl = ar._bl ? ar._bl.v : 1;
    var dt = ar._boltAt ? Math.min(.2, (t - ar._boltAt) / 1000) : .06;
    if (t - ar._boltAt < 58 && ar._sweep === ar._sweepWas && Math.abs(lvl - ar._blWas) < .04) return;
    ar._sweepWas = ar._sweep; ar._blWas = lvl; ar._boltAt = t;

    var x = c.getContext('2d'), m = ar._boltM, w = g.pane.w, h = g.pane.h, K = g.k;
    x.setTransform(BSC, 0, 0, BSC, 0, 0);
    x.clearRect(0, 0, c.width / BSC, c.height / BSC);
    if (lvl <= .02) { ar._arcs = null; return; }

    if (!ar._perim || ar._perimW !== w) { ar._perim = perim(w, h, m, Math.round(12 * K)); ar._perimW = w; }
    var P = ar._perim;
    if (!ar._arcs) { ar._arcs = []; for (var i = 0; i < 4; i++) ar._arcs.push(newArc(ar)); }

    x.lineJoin = 'round'; x.lineCap = 'round';
    // the charge sitting in the edge itself
    x.strokeStyle = 'rgba(111,227,155,' + (.22 * lvl).toFixed(3) + ')';
    x.lineWidth = 2.2 * K; strokePts(x, P.pts, true);
    x.strokeStyle = 'rgba(214,255,232,' + (.3 * lvl).toFixed(3) + ')';
    x.lineWidth = .9 * K; strokePts(x, P.pts, true);

    ar._arcs.forEach(function (A, i) {
      A.age += dt; A.t += A.dir * A.sp * dt;
      if (A.age > A.life) { ar._arcs[i] = newArc(ar); return; }
      var u = A.age / A.life;                       // fades in and out over its life
      var a = lvl * Math.sin(Math.PI * Math.min(1, u)) * (.7 + Math.random() * .3);
      var pts = arcPts(P, A.t, A.t + A.len, A.amp * K);
      [[12, .09], [6, .2], [2.6, .5]].forEach(function (q) {
        x.strokeStyle = 'rgba(111,227,155,' + (q[1] * a).toFixed(3) + ')';
        x.lineWidth = q[0] * K; strokePts(x, pts);
      });
      x.shadowColor = 'rgba(120,235,170,' + (.9 * a).toFixed(3) + ')';
      x.shadowBlur = 8 * K * BSC;
      x.strokeStyle = 'rgba(236,255,245,' + (.98 * a).toFixed(3) + ')';
      x.lineWidth = 1.5 * K; strokePts(x, pts);
      x.shadowBlur = 0;
      // a filament thrown off into the room
      if (A.br >= 0 && pts.length > 3) {
        var j = Math.max(1, Math.round(pts.length * A.br)), p0 = pts[j], p1 = pts[j - 1];
        var nx = -(p0[1] - p1[1]), ny = p0[0] - p1[0], nl = Math.sqrt(nx * nx + ny * ny) || 1;
        var out = [p0], L = rnd(10, 30) * K, side = Math.random() < .5 ? 1 : -1;
        for (var b2 = 1; b2 <= 3; b2++) {
          out.push([p0[0] + nx / nl * side * L * (b2 / 3) + rnd(-7, 7) * K,
                    p0[1] + ny / nl * side * L * (b2 / 3) + rnd(-7, 7) * K]);
        }
        x.strokeStyle = 'rgba(190,250,215,' + (.5 * a).toFixed(3) + ')';
        x.lineWidth = 1.1 * K; strokePts(x, out);
      }
      // the hot node where it sits on the glass
      var hp = pts[Math.round(pts.length / 2)];
      if (hp) {
        var rad = 9 * K * a;
        var gr = x.createRadialGradient(hp[0], hp[1], 0, hp[0], hp[1], rad);
        gr.addColorStop(0, 'rgba(240,255,247,' + (.8 * a).toFixed(3) + ')');
        gr.addColorStop(1, 'rgba(111,227,155,0)');
        x.fillStyle = gr; x.beginPath(); x.arc(hp[0], hp[1], rad, 0, 6.2832); x.fill();
      }
    });

    // the bolt that crosses the glass
    if (ar._sweep) {
      var sw = ar._sweep, sp = [], n2 = 22;
      for (var i2 = 0; i2 <= n2; i2++) {
        var uu = i2 / n2;
        sp.push([m + uu * w, m + sw.y * h + (i2 === 0 || i2 === n2 ? 0 : (Math.random() - .5) * 26 * K)]);
      }
      [[10, .1], [4.4, .3]].forEach(function (q) {
        x.strokeStyle = 'rgba(111,227,155,' + (q[1] * sw.a).toFixed(3) + ')';
        x.lineWidth = q[0] * K; strokePts(x, sp);
      });
      x.strokeStyle = 'rgba(240,255,246,' + sw.a.toFixed(3) + ')';
      x.lineWidth = 1.5 * K; strokePts(x, sp);
    }
  }

  function sweep(ar) {
    if (reduced) return;
    ar._sweep = { y: rnd(.12, .88), a: 1 };
    gsap.to(ar._sweep, { a: 0, duration: .5, ease: 'power2.in',
      onUpdate: function () { ar._boltAt = 0; },
      onComplete: function () { ar._sweep = null; ar._boltAt = 0; } });
  }

  /* one loop drives the dust and the electricity */
  function startLoop(ar) {
    stopLoop(ar);
    if (reduced) { drawStars(ar); drawBolt(ar, 0); return; }
    var n = 0, last = 0;
    var tick = function (t) {
      ar._raf = requestAnimationFrame(tick);
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if ((n++ & 1) === 0) drawStars(ar);
      drawBolt(ar, t);
      drawBoil(ar, dt);
    };
    ar._raf = requestAnimationFrame(tick);
    ar._sweepT = setInterval(function () { if (Math.random() < .55) sweep(ar); }, 3800);
  }
  function stopLoop(ar) {
    stopBoil(ar);
    if (ar._raf) { cancelAnimationFrame(ar._raf); ar._raf = null; }
    if (ar._sweepT) { clearInterval(ar._sweepT); ar._sweepT = null; }
    ar._sweep = null;
  }

  /* ═════════ the screen boiling away ═════════
     The sheet does not break any more: it comes apart into small balls that
     drop out of it, bounce off the floor of the room and go out, while the
     next sheet is already coming forward. For a beat that is playing a
     recording the balls are coloured from the picture itself — one frame is
     read into a small grid and each ball takes the colour of its own patch —
     so the screen genuinely turns into them. The two built screens have no
     frame to read, so they carry their own palette. */
  var GX = 34, GY = 16;
  var PALS = {
    wait: function (u, v) {
      var r = Math.random();
      if (r < .72) return [246, 250, 247];
      if (r < .86) return [223, 240, 230];
      if (r < .96) return [21, 137, 63];
      return [247, 181, 0];
    },
    arena: function (u, v) {
      var r = Math.random();
      if (u > .53) {                       // the editor half is dark
        if (r < .74) return [17, 24, 28];
        if (r < .86) return [99, 210, 155];
        if (r < .95) return [127, 183, 255];
        return [247, 181, 0];
      }
      if (r < .6) return [247, 250, 248];
      if (r < .84) return [233, 246, 236];
      if (r < .95) return [21, 137, 63];
      return [90, 104, 96];
    }
  };

  function sampleScreen(ar, i) {
    var b = BEATS[i];
    if (b.kind !== 'clip') return null;
    var v = $('video', ar._screens[i]);
    if (!v || !v.videoWidth) return null;
    try {
      var c = ar._samp || (ar._samp = document.createElement('canvas'));
      c.width = GX; c.height = GY;
      var x = c.getContext('2d', { willReadFrequently: true });
      x.drawImage(v, 0, 0, GX, GY);
      return x.getImageData(0, 0, GX, GY).data;
    } catch (e) { return null; }
  }

  function boilFrom(ar, i) {
    var g = ar._geo, W = ar._paneWs[i];
    var r = W.getBoundingClientRect(), host = ar.getBoundingClientRect();
    var box = { x: r.left - host.left, y: r.top - host.top, w: r.width, h: r.height };
    var px = sampleScreen(ar, i), pal = PALS[BEATS[i].ui] || PALS.wait;
    var cw = box.w / GX, ch = box.h / GY, out = [];
    var floor = g.H * .9, cx = box.x + box.w / 2;
    for (var gy = 0; gy < GY; gy++) {
      for (var gx = 0; gx < GX; gx++) {
        var u = (gx + .5) / GX, v = (gy + .5) / GY;
        var col;
        if (px) {
          var o = (gy * GX + gx) * 4;
          col = [px[o], px[o + 1], px[o + 2]];
        } else col = pal(u, v);
        // off the grid: a regular lattice of balls reads as a halftone, not as
        // a screen coming apart
        var x0 = box.x + u * box.w + rnd(-.42, .42) * cw;
        var y0 = box.y + v * box.h + rnd(-.42, .42) * ch;
        out.push({
          // small, and sized in their own right rather than off the grid —
          // a ball the size of its cell is a decoration, not a dissolve
          x: x0, y: y0, r: rnd(1.8, 4.6) * g.k,
          vx: (x0 - cx) / box.w * rnd(40, 140) + rnd(-26, 26),
          vy: rnd(-120, -20) - (1 - v) * 40,
          c: col, a: 0,
          // they do not all let go at once: the sheet gives way across itself
          wait: (u * .55 + v * .45) * .26 + rnd(0, .05),
          // and they are mostly gone by the time they are down
          life: rnd(.7, 1.15), hit: 0, floor: floor - rnd(0, g.H * .04)
        });
      }
    }
    ar._balls = out;
    ar._boilOn = true;
  }

  function drawBoil(ar, dt) {
    var c = ar._boil; if (!c) return;
    var x = c.getContext('2d');
    if (!ar._boilOn) { if (ar._boilDirty) { x.clearRect(0, 0, c.width, c.height); ar._boilDirty = false; } return; }
    x.clearRect(0, 0, c.width, c.height);
    ar._boilDirty = true;
    // a lever for looking at it: a capture of this scene takes seconds, so the
    // fall has to be slowed right down before it can be photographed
    if (ar._boilSlow) dt /= ar._boilSlow;
    var live = 0, G = 900;
    ar._balls.forEach(function (p) {
      if (p.wait > 0) { p.wait -= dt; live++; return; }
      if (p.life <= 0) return;
      live++;
      p.a = Math.min(1, p.a + dt * 11);
      p.life -= dt;
      p.vy += G * dt;
      p.vx *= (1 - 1.1 * dt);              // air, so nothing shoots off sideways
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.y > p.floor) {                 // one small bounce, then away
        p.y = p.floor; p.vy = -p.vy * .28;
        p.vx *= .6; p.hit++;
        p.life = Math.min(p.life, p.hit > 1 ? .14 : .3);
      }
      // the fade covers most of the fall, so they are gone by the floor
      var a = p.a * Math.min(1, p.life / .6);
      if (a <= .01) return;
      var rr = p.r * (.72 + .28 * Math.min(1, p.life / .5));   // they shrink away too
      x.globalAlpha = a;
      x.fillStyle = 'rgb(' + p.c[0] + ',' + p.c[1] + ',' + p.c[2] + ')';
      x.beginPath(); x.arc(p.x, p.y, rr, 0, 6.2832); x.fill();
      if (rr > 3) {                        // only the nearer ones catch a light
        x.globalAlpha = a * .32;
        x.fillStyle = 'rgba(255,255,255,.9)';
        x.beginPath(); x.arc(p.x - rr * .3, p.y - rr * .33, rr * .3, 0, 6.2832); x.fill();
      }
    });
    x.globalAlpha = 1;
    if (!live) { ar._boilOn = false; ar._balls = null; }
  }
  function stopBoil(ar) {
    ar._boilOn = false; ar._balls = null;
    if (ar._boil) {
      ar._boil.getContext('2d').clearRect(0, 0, ar._boil.width, ar._boil.height);
      ar._boilDirty = false;
    }
  }


  /* the sheet gives way.
     It dims, lets go of itself into the balls, and is gone; the next one is
     already on its way forward while they are still falling. */
  function evaporate(ar, i, at, tl) {
    var plate = ar._plates[i], dead = ar._deads[i], W = ar._paneWs[i];
    tl.call(function () {
      boilFrom(ar, i);
      ar._bl.v = 1.45;                       // the charge goes out with it
      gsap.to(ar._bl, { v: 0, duration: .4, ease: 'power2.in' });
    }, null, at);
    tl.to(dead, { opacity: 1, duration: .32, ease: 'power2.in' }, at + .04)
      .to(plate, { autoAlpha: 0, duration: .4, ease: 'power2.in' }, at + .12)
      .to(W, { scale: .97, duration: .52, ease: 'power2.in' }, at)
      .call(function () { playBeat(ar, i, false); }, null, at + .26);
    tl.call(function () {
      gsap.set(W, { autoAlpha: 0, z: -1300, scale: .82 });
      gsap.set(plate, { autoAlpha: 1 });
      gsap.set(dead, { opacity: 0 });
    }, null, at + .86);
  }

  /* the next sheet comes forward out of the depth, through the gap */
  function formPane(ar, i, at, tl) {
    var W = ar._paneWs[i], pane = ar._panes[i];
    tl.call(function () {
      moveBolt(ar, i);
      ar._bl.v = 0;
    }, null, at);
    tl.fromTo(W, { autoAlpha: 0, z: -1250, scale: .82 },
      { autoAlpha: 1, z: 0, scale: 1, duration: .9, ease: 'power3.out' }, at)
      // it swings in from well past its resting angle and settles onto it
      .fromTo(pane, { rotationY: -tilt(i) * 2.6, rotationX: -8 },
        { rotationY: tilt(i), rotationX: 3, duration: 1.15, ease: 'back.out(1.25)' }, at)
      .fromTo(ar._pad, { opacity: .2 }, { opacity: 1, duration: .7, ease: 'power2.out' }, at + .1);
    // it lands with a knock, and the electricity finds the new edge
    tl.fromTo(W, { y: -26 }, { y: 0, duration: .5, ease: 'back.out(2.2)' }, at + .72)
      .call(function () { gsap.to(ar._bl, { v: 1, duration: .5, ease: 'power2.out' }); sweep(ar); }, null, at + .5);
  }

  function warm(ar, k) {
    ar._paneWs.forEach(function (W, i) {
      if (i !== k) gsap.set(W, { autoAlpha: 0, x: 0, y: 0, z: -1300, scale: .82 });
    });
  }

  /* ───────── painted once, quietly ─────────
     The first time a sheet is shown the browser has to paint the whole of it —
     a slide's worth of recording, gradients and type — and that is a third of
     a second of main thread. Measured: every change of beat stalls the first
     time round and none of them stall the second. So each sheet is shown for
     two frames at a five-hundredth of an opacity while nothing is happening,
     which buys the paint then instead of in the middle of the glass breaking. */
  function warmPaint(ar, i) {
    var W = ar._paneWs[i];
    if (!W || W._painted || ar._k === i) return;
    W._painted = true;
    // painted at the pose it will be seen in, not tucked away small: a raster
    // taken at one scale is of no use at another
    gsap.set(W, { autoAlpha: .002, z: 0, scale: 1 });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (ar._k !== i) gsap.set(W, { autoAlpha: 0, z: -1300, scale: .82 });
      });
    });
  }
  function warmSoon(ar, k) {
    stopWarm(ar);
    if (reduced) return;
    ar._paneWs[k]._painted = true;
    ar._warm = [];
    [k + 1, k - 1, k + 2, k - 2, k + 3, k - 3, k + 4, k - 4].forEach(function (i, n) {
      if (i < 0 || i >= BEATS.length || ar._paneWs[i]._painted) return;
      ar._warm.push(setTimeout(function () { if (ar._h) warmPaint(ar, i); }, 900 + n * 460));
    });
  }
  function stopWarm(ar) { (ar._warm || []).forEach(clearTimeout); ar._warm = null; }

  function moveBolt(ar, i) {
    if (ar._bolt.parentNode !== ar._panes[i]) ar._panes[i].appendChild(ar._bolt);
    sizeBolt(ar);
  }

  /* ───────── the sheet's own life ───────── */
  function startDrift(ar) {
    stopDrift(ar);
    if (reduced) return;
    var a = ar._drift = [];
    var k = ar._k, pane = ar._panes[k], W = ar._paneWs[k], t = tilt(k);
    // it keeps breathing on its axis once it has landed
    a.push(gsap.to(pane, { rotationY: t * .62, rotationX: 1.4, duration: 8.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    a.push(gsap.fromTo(W, { y: 0 }, { y: -11 * ar._geo.k, duration: 6.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    a.push(gsap.fromTo(W, { x: 0 }, { x: 7 * ar._geo.k, duration: 9.1, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    ar._chipWs.forEach(function (c, i) {
      var q = CHIPS[i];
      a.push(gsap.fromTo(c, { y: 0 }, { y: -(16 + i * 4) * ar._geo.k, duration: 5.2 + i * .6,
        ease: 'sine.inOut', yoyo: true, repeat: -1, delay: q.d * .5 }));
      a.push(gsap.to($('.cx-chip', c), { rotationY: q.ry * .72, duration: 8 + i * .9,
        ease: 'sine.inOut', yoyo: true, repeat: -1, delay: q.d * .4 }));
    });
    a.push(gsap.to($('.cx-ring1', ar._pad), { rotate: 360, duration: 44, ease: 'none', repeat: -1 }));
  }
  function stopDrift(ar) { (ar._drift || []).forEach(function (t) { t.kill(); }); ar._drift = null; }

  /* ───────── the screens play ───────── */
  function playClip(ar, i, on) {
    var r = ar._rly && ar._rly[i]; if (!r) return;
    try {
      var pr = on ? (r.restart ? r.restart() : r.play()) : (r.pause ? r.pause() : r.stop && r.stop());
      if (pr && pr.catch) pr.catch(function () {});
    } catch (e) {}
  }

  /* the countdown beat.
     The page is only the setting: the contest card lifts out of it, the clock
     takes the screen, the seconds run down on four dials and the contest
     opens. Then it puts the page back and does it again. */
  function runWait(ar, i) {
    var sc = ar._screens[i], tl = gsap.timeline({ repeat: -1, repeatDelay: .5 });
    var page = $('.ca-scroll', sc), card = $('.ca-card', sc), cur = $('.ca-cur', sc);
    var hc = $('.ca-hc', sc), veil = $('.ca-hc-veil', sc), inr = $('.ca-hc-in', sc);
    var lab = $('.ca-hc-lab', sc), go = $('.ca-hc-go', sc), btn = $('.ca-hc-btn', sc);
    var dials = $$('.ca-d', sc), rings = $$('.ca-d-fg', sc);
    var num = dials.map(function (d) { return $('b', d); });
    var state = $('.ca-state', sc), lead = $('.ca-lead', sc), att = $('.ca-attempt', sc);
    var small = $$('.ca-clock i', sc);
    var SEC = 8;                                  // seconds the clock runs on screen
    var t = { v: SEC };
    var LEN = 2 * Math.PI * 43;

    function paint() {
      var v = Math.max(0, t.v);
      num[0].textContent = '00'; num[1].textContent = '00';
      num[2].textContent = '00';
      num[3].textContent = (v < 10 ? '0' : '') + Math.ceil(v);
      // only the dial that is actually running is drawn
      gsap.set([rings[0], rings[1], rings[2]], { strokeDasharray: LEN, strokeDashoffset: LEN });
      gsap.set(rings[3], { strokeDasharray: LEN, strokeDashoffset: LEN * (1 - v / SEC) });
    }

    tl.call(function () {
      t.v = SEC; paint();
      state.textContent = 'Registered for Closed contest';
      lead.textContent = 'Contest Starts in';
      small[0].textContent = '0d'; small[1].textContent = '00h';
      small[2].textContent = '00m'; small[3].textContent = '08s';
      lab.textContent = 'Contest starts in';
    }, null, 0)
      .set(page, { y: 0 }, 0)
      .set([att, cur], { opacity: 0 }, 0)
      .set(hc, { opacity: 0 }, 0)
      .set(veil, { opacity: 0 }, 0)
      .set(go, { opacity: 0, y: 24 }, 0)
      .set(card, { z: 0, scale: 1 }, 0)
      .set(dials, { opacity: 0, scale: .5, y: 40 }, 0)
      .set([lab, $('.ca-hc-kick', sc)], { opacity: 0, y: 14 }, 0);

    // 1 · the page, and the card lifting out of it
    tl.to(page, { y: function () { return -Math.max(0, $('.ca-body', sc).offsetTop * .5); },
      duration: 1.4, ease: 'power2.inOut' }, .3)
      .to(card, { z: 54, scale: 1.045, duration: .7, ease: 'power3.out' }, 1.5)
      .to(card, { boxShadow: '0 0 0 1px rgba(21,137,63,.3), 0 2.6em 3.4em -1.4em rgba(13,46,27,.55)',
        duration: .7 }, 1.5);

    // 2 · the clock takes the screen
    tl.set(hc, { opacity: 1 }, 2.25)
      .to(veil, { opacity: 1, duration: .55, ease: 'power2.out' }, 2.25)
      .to(card, { z: 0, scale: .96, opacity: .25, duration: .6, ease: 'power2.in' }, 2.3)
      .to($('.ca-hc-kick', sc), { opacity: 1, y: 0, duration: .5, ease: 'power3.out' }, 2.5)
      .to(lab, { opacity: 1, y: 0, duration: .5, ease: 'power3.out' }, 2.62)
      .to(dials, { opacity: 1, scale: 1, y: 0, duration: .66, stagger: .07, ease: 'back.out(1.7)' }, 2.6);

    // 3 · the seconds run down
    tl.to(t, { v: 0, duration: SEC * .62, ease: 'none', onUpdate: paint }, 3.3);
    for (var q = 1; q <= SEC; q++) {
      tl.to(dials[3], { scale: 1.1, duration: .12, yoyo: true, repeat: 1, ease: 'power2.out' },
        3.3 + (SEC - q) * SEC * .62 / SEC);
    }

    // 4 · zero, and the contest opens
    tl.call(function () {
      t.v = 0; paint();
      lab.textContent = 'The wait is over';
      state.textContent = 'Contest is open';
      lead.textContent = 'Contest Ends in';
      small[1].textContent = '01h'; small[2].textContent = '15m'; small[3].textContent = '00s';
    }, null, 3.3 + SEC * .62)
      .fromTo(inr, { scale: 1 }, { scale: 1.04, duration: .18, yoyo: true, repeat: 1, ease: 'power2.out' },
        3.3 + SEC * .62)
      .to(dials, { opacity: 0, scale: .8, y: -22, duration: .4, stagger: .04, ease: 'power2.in' },
        3.5 + SEC * .62)
      .to(lab, { opacity: 0, y: -14, duration: .3 }, 3.5 + SEC * .62)
      .to(go, { opacity: 1, y: 0, duration: .6, ease: 'back.out(1.5)' }, 3.8 + SEC * .62);

    // 5 · and somebody takes it
    var T = 4.3 + SEC * .62;
    tl.set(cur, { opacity: 1,
      x: function () { return btn.getBoundingClientRect().left - sc.getBoundingClientRect().left - 70; },
      y: function () { return btn.getBoundingClientRect().top - sc.getBoundingClientRect().top + 64; } }, T)
      .to(cur, {
        x: function () { return btn.getBoundingClientRect().left - sc.getBoundingClientRect().left + btn.offsetWidth * .5; },
        y: function () { return btn.getBoundingClientRect().top - sc.getBoundingClientRect().top + btn.offsetHeight * .5; },
        duration: .8, ease: 'power2.inOut' }, T)
      .to(btn, { scale: .94, duration: .12, yoyo: true, repeat: 1 }, T + .85)
      .to(cur, { opacity: 0, duration: .3 }, T + 1.1)
      // 6 · back to the page, and round again
      .to([veil, inr], { opacity: 0, duration: .5, ease: 'power2.in' }, T + 1.5)
      .to(card, { opacity: 1, duration: .5 }, T + 1.5)
      .to(att, { opacity: 1, duration: .4 }, T + 1.6)
      .to(page, { y: 0, duration: 1, ease: 'power2.inOut' }, T + 2);
    return tl;
  }

  /* the arena, played like a recording: the code types, the tests run */
  function runArena(ar, i) {
    var sc = ar._screens[i], tl = gsap.timeline({ repeat: -1, repeatDelay: .8 });
    var lines = $$('.ca-l', sc), caret = $('.ca-caret', sc), cur = $('.ca-cur', sc);
    var rows = $$('.ca-out tr', sc).filter(function (r) { return !$('th', r); });
    var ok = $('.ca-ok', sc), run = $('.ca-run .r', sc), sub = $('.ca-run .s', sc), timer = $('.ca-timer', sc);
    var t0 = 70 * 60 + 57, clock = { v: t0 };

    tl.set(lines, { clipPath: 'inset(0% 100% 0% 0%)' }, 0)
      .set(rows, { opacity: 0 }, 0)
      .set([ok, cur], { opacity: 0 }, 0)
      .set(caret, { opacity: 0 }, 0)
      .call(function () { clock.v = t0; }, null, 0);

    // the contest clock, running the whole time
    tl.to(clock, { v: t0 - 92, duration: 16, ease: 'none', onUpdate: function () {
      var s = Math.max(0, Math.round(clock.v)), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60);
      timer.textContent = h + ':' + (m < 10 ? '0' : '') + m + ':' + ((s % 60) < 10 ? '0' : '') + (s % 60);
    } }, 0);

    // the statement comes forward first, while it is the thing being read
    var prob = $('.ca-prob', sc), right = $('.ca-right', sc);
    tl.set([prob, right], { z: 0 }, 0)
      .to(prob, { z: 46, duration: .7, ease: 'power3.out' }, .1)
      .to(prob, { z: 0, duration: .7, ease: 'power2.inOut' }, 2.6)
      // then the editor takes its turn, and the code is typed into it
      .to(right, { z: 54, duration: .7, ease: 'power3.out' }, 2.9);

    var at = 3.4;
    lines.forEach(function (l, j) {
      var inner = $('.ca-i', l), txt = inner.textContent.trim();
      var dur = clamp(txt.length * .022, .08, .62);
      tl.set(caret, { opacity: 1, top: function () { return l.offsetTop + 'px'; } }, at)
        .fromTo(caret, { left: function () { return (inner.offsetLeft) + 'px'; } },
          { left: function () { return (inner.offsetLeft + inner.offsetWidth) + 'px'; }, duration: dur, ease: 'none' }, at)
        .to(l, { clipPath: 'inset(0% 0% 0% 0%)', duration: dur, ease: 'none' }, at);
      at += dur + (txt ? .07 : .02);
    });
    tl.to(caret, { opacity: 0, duration: .2 }, at + .2);

    // run it
    tl.set(cur, { opacity: 1, x: function () { return run.offsetLeft - 60; }, y: function () { return run.offsetTop + 70; } }, at + .3)
      .to(cur, { x: function () { return run.offsetLeft + run.offsetWidth * .5; },
        y: function () { return run.offsetTop + run.offsetHeight * .5; }, duration: .8, ease: 'power2.inOut' }, at + .4)
      .to(run, { scale: .94, duration: .12, yoyo: true, repeat: 1 }, at + 1.2)
      .to(cur, { opacity: 0, duration: .25 }, at + 1.5);
    rows.forEach(function (r, j) {
      tl.fromTo(r, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: .3, ease: 'power2.out' }, at + 1.5 + j * .36);
    });
    tl.to(ok, { opacity: 1, duration: .4, ease: 'power2.out' }, at + 1.5 + rows.length * .36 + .2)
      .fromTo(sub, { boxShadow: '0 0 0 0 rgba(37,99,201,.6)' },
        { boxShadow: '0 0 0 .6em rgba(37,99,201,0)', duration: .9, repeat: 2 }, at + 2.6 + rows.length * .36)
      .to(right, { z: 0, duration: .8, ease: 'power2.inOut' }, at + 3.4 + rows.length * .36);
    return tl;
  }

  function playBeat(ar, i, on) {
    var b = BEATS[i];
    if (b.kind === 'clip') { playClip(ar, i, on); return; }
    if (ar._uiTl && ar._uiTl[i]) { ar._uiTl[i].kill(); ar._uiTl[i] = null; }
    if (!on || reduced) return;
    ar._uiTl = ar._uiTl || [];
    ar._uiTl[i] = b.ui === 'wait' ? runWait(ar, i) : runArena(ar, i);
  }
  function stopAllUi(ar) {
    (ar._uiTl || []).forEach(function (t) { if (t) t.kill(); });
    ar._uiTl = [];
  }

  /* ───────── poses ───────── */
  function settleTo(ar, k) {
    var g = ar._geo;
    stopBoil(ar);
    stopDrift(ar);
    killRun(ar);
    ar._k = k;
    ar._paneWs.forEach(function (W, i) {
      gsap.killTweensOf([W, ar._panes[i], ar._plates[i]]);
      gsap.set(ar._deads[i], { opacity: 0 });
      gsap.set(ar._plates[i], { autoAlpha: 1 });
      if (i === k) gsap.set(W, { autoAlpha: 1, x: 0, y: 0, z: 0, scale: 1 });
      gsap.set(ar._panes[i], { rotationY: tilt(i), rotationX: 3, transformPerspective: 1500 });
      if (i !== k) playBeat(ar, i, false);
    });
    warm(ar, k);
    ar._copies.forEach(function (c, i) { gsap.set(c, { autoAlpha: i === k ? 1 : 0, y: 0 }); });
    paintDots(ar, k);
    gsap.set(ar._pad, { opacity: 1 });
    moveBolt(ar, k);
    gsap.killTweensOf(ar._bl); ar._bl.v = 1;
    playBeat(ar, k, true);
    startDrift(ar);
    warmSoon(ar, k);
  }

  function paintDots(ar, k) {
    $$('.cx-dot', ar._nav).forEach(function (d) { d.classList.toggle('on', +d.dataset.k === k); });
    $('em', ar._nav).textContent = (k + 1) + ' / ' + BEATS.length;
  }
  function killRun(ar) {
    if (ar._tl) { ar._tl.kill(); ar._tl = null; }
    gsap.killTweensOf(ar._bl);
    gsap.killTweensOf(ar._paneWs.concat(ar._panes, ar._plates, ar._copies, [ar._pad]));
  }

  /* ───────── walking the five ───────── */
  function show(step, k, d) {
    var ar = $('.arena', step); if (!ar || !ar._h) return;
    var from = ar._k; if (from === k) return;
    killRun(ar);
    // Every break is built out of callbacks — the pieces are cleared, the crack
    // is hidden, the screen is stopped — and an arrow pressed mid-flight kills
    // the timeline they live on. So the room is put back to the pose it is
    // leaving before the next break begins, from scratch.
    settleTo(ar, from);
    stopDrift(ar);
    var tl = ar._tl = gsap.timeline({ onComplete: function () { ar._tl = null; } });

    tl.to(ar._copies[from], { autoAlpha: 0, y: -12, duration: .26, ease: 'power2.in' }, 0);
    // The incoming screen is started before the glass is touched. A paused
    // recording has to decode a frame when it is woken, and that is a third of
    // a second of main thread — spent here, against a still picture, instead of
    // in the middle of the pieces flying past.
    playBeat(ar, k, true);
    evaporate(ar, from, .1, tl);
    // the next sheet starts forward as the last of them are falling, not while
    // the screen is still coming apart
    formPane(ar, k, .9, tl);
    tl.fromTo(ar._copies[k], { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: .5, ease: 'power3.out' }, 1.18);
    tl.call(function () {
      ar._k = k;
      paintDots(ar, k);
      warm(ar, k);
      startDrift(ar);
      warmSoon(ar, k);
    }, null, BREAK);
    ar._k = k;              // the dots and any new arrow answer to the target at once
    paintDots(ar, k);
  }

  /* ───────── lifecycle ───────── */
  function prep(step) {
    var ar = $('.arena', step); if (!ar || !global.gsap) return null;
    stop(step);
    buildOnce(ar);
    ar._k = step._subAt | 0;
    layout(ar);
    settleTo(ar, ar._k);
    // the room arrives first, the glass second
    gsap.set($('.cx-room', ar), { opacity: 0 });
    gsap.set(ar._paneWs[ar._k], { autoAlpha: 0 });
    gsap.set(ar._copies[ar._k], { autoAlpha: 0 });
    gsap.set(ar._chipWs, { autoAlpha: 0 });
    gsap.set(ar._pad, { opacity: 0 });
    ar._bl.v = 0;
    ar._h = true;
    if (!ar._onResize) {
      // The stage moves under this scene for a whole .45s while the rail
      // slides, and the event arrives on every frame of it. Re-seating costs
      // a layout and a handful of gsap.sets, so it is done on the frame it is
      // asked for: the scene travels with the stage instead of jumping once
      // the stage has stopped.
      ar._onResize = function () {
        if (!ar._built || !ar._h) return;
        killRun(ar);
        layout(ar);
        settleTo(ar, ar._k);
      };
      addEventListener('resize', ar._onResize);
    }
    return ar._h;
  }

  function play(step) {
    var ar = $('.arena', step); if (!ar) return;
    if (!ar._h && !prep(step)) return;
    var k = ar._k, tl = ar._tl = gsap.timeline({ onComplete: function () { ar._tl = null; } });
    startLoop(ar);
    playBeat(ar, k, true);
    tl.to($('.cx-room', ar), { opacity: 1, duration: .7, ease: 'power2.out' }, 0)
      .to(ar._pad, { opacity: 1, duration: .7, ease: 'power2.out' }, .2)
      .fromTo(ar._chipWs, { autoAlpha: 0, z: -1600 }, { autoAlpha: 1, z: 0, duration: 1.1,
        stagger: .07, ease: 'power3.out' }, .15);
    formPane(ar, k, .35, tl);
    tl.fromTo(ar._copies[k], { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: .6, ease: 'power3.out' }, .55);
    tl.call(function () { startDrift(ar); warmSoon(ar, k); }, null, 1.5);
  }

  function stop(step) {
    var ar = $('.arena', step); if (!ar || !ar._built) return;
    killRun(ar);
    stopDrift(ar);
    stopLoop(ar);
    stopWarm(ar);
    stopAllUi(ar);
    BEATS.forEach(function (b, i) { if (b.kind === 'clip') playClip(ar, i, false); });
    ar._h = null;
  }

  global.Arena = { prep: prep, play: play, stop: stop, show: show, BEATS: BEATS };
})(window);
