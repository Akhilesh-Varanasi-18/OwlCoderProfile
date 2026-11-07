/* courses.js — section 03, Courses: the projector (v2).

   One step, six windows: the shelf, the roadmap, articles, videos, notes,
   labs. A MacBook sits on one side of the stage playing the real recording
   of that view under the Recordly camera. At the click that opens the view
   (a mark on the clip) a beam opens from a lens at the screen's centre and
   the opened view comes out of the laptop as a projected panel — curvy
   glass with stepped thickness, its UI rebuilt in the palette as proper
   web UI and animated — sitting between the laptop and the copy. The next
   arrow folds the projection back into the lens, scrolls the copy away,
   and the laptop crosses to the other side for the next window while the
   owl's eyes move to the opposite corner; the recording stays continuous
   on the screen. The arrows walk the six windows (data-subs="5"); the tabs
   in the copy jump straight to one.

   Sharpness rules: every panel rests on integer pixels with no transform
   (flights are 3D, then `clearProps`); nothing carrying text is scaled or
   rotated at rest. Lifecycle, like every scene: prep(step) sets the start
   state the instant the step appears; play(step) runs the entrance;
   stop(step) kills it all. Every state change first settles everything that
   is not the window being left or the one arriving. */
(function (global) {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function even(v) { v = Math.round(v); return v % 2 ? v + 1 : v; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function pct(v) { return Math.round(v) + '%'; }

  /* ───────── icons (24-box line icons, drawn, never font glyphs) ───────── */
  var SVG = {
    shelf: 'M4 5h4v14H4zM10 5h4v14h-4zM16.3 5.6l3.6.9-2.9 12.9-3.6-.9z',
    roadmap: 'M5 19c7 0 2-8 7-8s2-7 7-7M5 19h.01M19 4h.01',
    articles: 'M6 3h9l4 4v14H6zM9 12h7M9 16h7M9 8h3',
    videos: 'M4 6h16v12H4zM10 9.5v5l4.5-2.5z',
    notes: 'M5 4h11l3 3v13H5zM8 10h8M8 14h5M16 4v3h3',
    lab: 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3',
    tick: 'M5 12l4 4L19 7', play: 'M8 6v12l10-6z', pause: 'M8 5v14M16 5v14', course: 'M4 5h16v12H4zM8 21h8', doc: 'M6 3h9l4 4v14H6z',
    star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z', flag: 'M5 21V4h11l-1.5 3.5L16 11H5',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0', code: 'M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14',
    list: 'M4 6h16M4 12h16M4 18h16', grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'
  };
  function ic(name, cls) { return '<svg class="crs-ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + SVG[name] + '"/></svg>'; }

  /* ───────── the six windows ───────── */
  var VIEWS = [
    { key: 'shelf', name: 'The shelf', short: 'Shelf', clip: 'courses-shelf', pwf: 1.08,
      h: 'Every course<br>assigned <em>to you.</em>',
      say: 'DSA, a language, SQL. Each course shows what is inside before you open it: articles, videos, trainer and trainee problems, labs and notes. Two ways in, Course View and Report View.',
      head: 'My Courses', headX: '<span class="pj-seg"><i>' + ic('list') + 'List</i><i class="on">' + ic('grid') + 'Grid</i></span>', chip: '9 courses',
      pills: ['9 courses assigned', 'DSA · 32% complete'], pillIc: ['course', 'star'] },
    { key: 'roadmap', name: 'The roadmap', short: 'Roadmap', clip: 'courses-roadmap', pwf: 1.08,
      h: 'The whole course,<br><em>as a road.</em>',
      say: 'Course View opens on the learning path. Fifteen modules in order, each marked done, in progress or not started. The one button that matters is always on the module you are on.',
      head: 'Learning Path · DSA', chip: '1 of 15 modules completed', pills: ['Module 01 · continue here', '43 / 135 items done'], pillIc: ['flag', 'tick'] },
    { key: 'articles', name: 'Articles', short: 'Articles', clip: 'courses-articles', pwf: 1.12,
      h: 'Read it first,<br><em>in the module.</em>',
      say: 'Open a module and the tabs are right there. Articles carry a contents rail, worked code and the complexity written next to every operation.',
      head: 'Articles · Hash Map and Hash Set', chip: 'Article 1 of 2', pills: ['Articles · 1 / 2 read', 'Contents · 7 sections'], pillIc: ['doc', 'articles'] },
    { key: 'videos', name: 'Videos', short: 'Videos', clip: 'courses-video', pwf: 1.04,
      h: 'Then watch it,<br><em>without leaving.</em>',
      say: 'Every module carries recorded video on the same topic, listed beside the player and ticked off as you finish.',
      head: 'Videos · Sliding Window', chip: '1 / 1 watched', chipCls: 'ok', pills: ['sliding_window_technique', 'Watched · 1 / 1'], pillIc: ['play', 'tick'] },
    { key: 'notes', name: 'Notes', short: 'Notes', clip: 'courses-notes', pwf: 1.0,
      h: 'Your trainer’s notes,<br><em>for your batch.</em>',
      say: 'A trainer can attach notes to any module. Written for this batch and kept with the lesson they explain, not lost in a chat somewhere.',
      head: 'Notes · Conditional Statements', chip: 'Trainer’s note', chipCls: 'gold', pills: ['Python Programming', 'Notes · 1 attached'], pillIc: ['course', 'notes'] },
    { key: 'lab', name: 'Labs', short: 'Labs', clip: 'courses-lab', pwf: 1.06,
      h: 'Your lab syllabus,<br><em>folded in.</em>',
      say: 'College lab programs become real problems inside the course: statement, test cases and the editor, right where the module is. Run it, pass it, move on.',
      head: 'Lab · Perfect Square Root or Not', chip: 'Points 40', chipCls: 'gold', pills: ['Coding Ground · inside the course', '254 submissions'], pillIc: ['code', 'user'] }
  ];
  // segment control for each clip (seconds into the trimmed clip): a run
  // starts at `from`, about a second and a half before the click that opens
  // the view, and plays a little faster until the `mark` — the moment the
  // view has opened and the projection starts; after `to` the opened view
  // loops from `loopFrom` (or freezes) behind the projection
  // the clips are cut to start at the lead-in, so `from` is 0; `rate` is the
  // lead-in speed (the product's own page loads are what make some longer)
  var CLIP = {
    shelf: { mark: 1.8, loopFrom: 2.6, to: 11.3, rate: 1.3 },
    roadmap: { mark: 2.9, loopFrom: 4.0, to: 23.3, rate: 1.6 },
    articles: { mark: 3.2, loopFrom: 3.9, to: 26.7, rate: 1.6 },
    videos: { mark: 2.0, loopFrom: 3.3, to: 24.8, rate: 1.3 },
    notes: { mark: 1.8, to: 2.0, freeze: true, rate: 1.3 },
    lab: { mark: 2.3, loopFrom: 2.6, to: 24.2, rate: 1.3 }
  };
  // where the owl's eyes sit for each window: the corner opposite the
  // laptop, alternating up and down (viewport %, like the .watch classes)
  var EYES = [{ l: 86, t: 17, r: 3 }, { l: 17, t: 83, r: -3 }, { l: 86, t: 83, r: 2 }, { l: 17, t: 17, r: -3 }, { l: 86, t: 17, r: 3 }, { l: 17, t: 83, r: -3 }];

  var MAC_HTML =
    '<div class="mac"><div class="mac-lid"><div class="mac-bezel"><i class="mac-notch"></i><div class="mac-scr">' +
    '<div class="mac-chrome"><i></i><i></i><i></i><span class="tab"><b></b>Owl Coder</span><span class="url">owlcoder.technicalhub.io/<em>courses</em></span></div>' +
    '<div class="mac-view"></div><span class="mac-glass"></span><span class="crs-tint"></span><span class="mac-off"></span>' +
    '</div></div></div><span class="mac-hinge"></span>' +
    '<span class="mac-base"><i class="mac-spk l"></i><i class="mac-spk r"></i><i class="mac-keys"></i><i class="mac-pad"></i></span><span class="mac-shadow"></span></div>';

  /* ───────── helpers for the scenes ───────── */
  function count(tl, node, to, dur, at, fmt) {
    var o = { v: 0 };
    tl.to(o, { v: to, duration: dur, ease: 'power2.out', onUpdate: function () { node.textContent = fmt ? fmt(o.v) : Math.round(o.v); } }, at);
  }
  // type tokens (coloured spans) into `node`, character by character, with a caret
  function typeLine(tl, node, tokens, at, cps) {
    var full = tokens.map(function (t) { return t.t; }).join(''), n = full.length, o = { c: 0 };
    function render(c, done) {
      var h = '', left = c;
      tokens.forEach(function (t) { if (left <= 0) return; var s = t.t.slice(0, left); left -= t.t.length; h += t.c ? '<span class="' + t.c + '">' + esc(s) + '</span>' : esc(s); });
      node.innerHTML = h + (done ? '' : '<i class="caret"></i>');
    }
    tl.call(function () { render(0); }, null, at);
    tl.to(o, { c: n, duration: n / (cps || 24), ease: 'none', onUpdate: function () { render(Math.round(o.c)); }, onComplete: function () { render(n, true); } }, at);
  }
  function ring(r) { var s = r * 2 + 8, c = r + 4; return '<svg viewBox="0 0 ' + s + ' ' + s + '"><circle class="t" cx="' + c + '" cy="' + c + '" r="' + r + '"/><circle class="a" cx="' + c + '" cy="' + c + '" r="' + r + '"/></svg>'; }
  function drawRing(tl, circle, r, p, dur, at) {
    var C = 2 * Math.PI * r, o = { e: 0 };
    circle.setAttribute('stroke-dasharray', '0 ' + C);
    tl.to(o, { e: 1, duration: dur, ease: 'power3.out', onUpdate: function () { circle.setAttribute('stroke-dasharray', (C * p * o.e) + ' ' + C); } }, at);
  }
  function tabs(list, on) {
    return '<div class="pj-tabs">' + list.map(function (t) {
      var p = t[2] ? Math.round(t[1] / t[2] * 100) : 0;
      return '<span class="' + (t[0] === on ? 'on' : '') + '"><b>' + t[0] + '</b><small>' + t[1] + ' / ' + t[2] + '</small><u style="--p:' + p + '%"></u></span>';
    }).join('') + '</div>';
  }
  function list(title, items, cls) {
    return '<div class="pj-card pj-list' + (cls ? ' ' + cls : '') + '"><em>' + title + '</em>' + items.map(function (i) {
      return '<a class="' + (i.on ? 'on' : '') + '">' + ic(i.ic || 'doc') + '<span>' + i.t + (i.sub ? '<small>' + i.sub + '</small>' : '') + '</span>' + (i.tick ? '<i class="pj-tick">✓</i>' : '') + '</a>';
    }).join('') + '</div>';
  }
  // entrance that lands flat: 3D on the way in, transform cleared on arrival
  function riseIn(tl, targets, at, opts) {
    opts = opts || {};
    tl.fromTo(targets, { opacity: 0, y: opts.y == null ? 24 : opts.y, x: opts.x || 0, rotationX: opts.rx == null ? -12 : opts.rx, transformPerspective: 900 },
      { opacity: 1, y: 0, x: 0, rotationX: 0, duration: opts.dur || .65, ease: 'power3.out', stagger: opts.stagger || 0, clearProps: 'transform' }, at);
  }

  /* ───────── the scenes: what each projection holds and how it fills in ───────── */
  // the real numbers from the recording of My Courses
  var CNT = [['Articles', '#2F6FD6'], ['Videos', '#7C5CFF'], ['Trainer', '#15893F'], ['Trainee', '#F7B500'], ['Labs', '#22A7C9'], ['Notes', '#9B59B6']];
  var COURSES = [
    { n: 'DSA', p: 32, it: '43 / 135 items', c: '#2F6FD6', cnt: [[6, 17], [1, 33], [11, 44], [25, 39], [0, 0], [0, 2]] },
    { n: 'Python Programming', p: 0, it: '0 / 521 items', c: '#7C5CFF', cnt: [[0, 43], [0, 42], [0, 51], [0, 370], [0, 9], [0, 6]] },
    { n: 'Data Structures', p: 1, it: '4 / 297 items', c: '#F08A24', cnt: [[3, 48], [1, 66], [0, 68], [0, 106], [0, 5], [0, 4]] },
    { n: 'Advanced Data Structures', p: 16, it: '45 / 281 items', c: '#15893F', cnt: [[39, 42], [3, 39], [3, 84], [0, 116], [0, 0], [0, 0]] },
    { n: 'SQL', p: 1, it: '5 / 413 items', c: '#D64541', cnt: [[5, 20], [0, 0], [0, 106], [0, 287], [0, 0], [0, 0]] },
    { n: 'Java Programming', p: 0, it: '0 / 355 items', c: '#E0457B', cnt: [[0, 75], [0, 0], [0, 21], [0, 236], [0, 15], [0, 8]] }
  ];
  var MODS = [
    { n: 1, nm: 'Complexity Analysis', p: 50, st: 'in progress', go: true, side: 'r', nx: 40, ny: 85 },
    { n: 2, nm: 'Vectors', p: 100, st: 'completed', done: true, side: 'l', nx: 60, ny: 62.5 },
    { n: 3, nm: 'Two Pointers', p: 43, st: 'in progress', side: 'r', nx: 40, ny: 40 },
    { n: 4, nm: 'Sliding Window', p: 50, st: 'in progress', side: 'l', nx: 60, ny: 17.5 }
  ];
  var ROAD_D = 'M160,400 C160,370 240,290 240,250 C240,210 160,200 160,160 C160,120 240,110 240,70 C240,30 160,20 160,-10';

  var SCENE = {
    /* 1 · the shelf: My Courses as the product's own grid — six course
       cards with ring, counts and both buttons; a hover sweep cycles */
    shelf: {
      html: function () {
        return '<div class="sh-grid">' + COURSES.map(function (c) {
          return '<div class="sh-card" style="--c:' + c.c + '"><div class="sh-top"><div class="sh-ring">' + ring(15) + '<b>' + c.p + '%</b></div><div class="sh-nm"><b>' + c.n + '</b><span>' + c.it + '</span></div></div>' +
            '<div class="sh-cnt">' + CNT.map(function (l, j) { return '<i style="--dc:' + l[1] + '"><u></u><span>' + l[0] + '</span><b><em data-n="' + c.cnt[j][0] + '">0</em><small>/' + c.cnt[j][1] + '</small></b></i>'; }).join('') + '</div>' +
            '<div class="sh-btns"><span class="pj-pill">Course View</span><span class="pj-pill ghost">Report View</span></div></div>';
        }).join('') + '</div>';
      },
      reset: function (b) {
        var cards = $$('.sh-card', b);
        gsap.set(cards, { opacity: 0 });
        cards.forEach(function (c) { c.classList.remove('hot'); });
        $$('.sh-ring .a', b).forEach(function (c) { c.setAttribute('stroke-dasharray', '0 200'); });
        $$('[data-n]', b).forEach(function (n) { n.textContent = '0'; });
      },
      enter: function (b) {
        var tl = gsap.timeline(), cards = $$('.sh-card', b);
        riseIn(tl, cards, 0, { stagger: .07 });
        cards.forEach(function (c, i) {
          drawRing(tl, $('.sh-ring .a', c), 15, COURSES[i].p / 100, 1.0, .25 + i * .07);
          $$('[data-n]', c).forEach(function (n, j) { count(tl, n, +n.dataset.n, .8, .3 + i * .07 + j * .04); });
        });
        var idle = gsap.timeline({ repeat: -1 }), order = [0, 3, 2, 1, 5, 4];
        order.forEach(function (ci, n) { idle.call(function () { cards.forEach(function (c, j) { c.classList.toggle('hot', j === ci); }); }, null, n * 2.4); });
        idle.to({}, { duration: 2.4 }, (order.length - 1) * 2.4);
        tl.add(idle, .9);
        return tl;
      }
    },

    /* 2 · the roadmap: the profile pod and the modules placed along a
       winding road that paves itself; the current one glows, Done lands */
    roadmap: {
      html: function () {
        return '<div class="rd"><div class="pj-card rd-pod"><div class="pj-eyebrow">DSA</div><div class="rd-av">KP</div><b class="rd-who">K. Prasanth</b><span class="rd-id">3838</span>' +
          '<div class="rd-ring">' + ring(40) + '<b><s>0%</s><small>complete</small></b></div><div class="rd-of"><strong>0</strong> / 135 items</div>' +
          '<div class="rd-chips"><i>Trainer <b>11 / 44</b></i><i>Trainee <b>25 / 39</b></i><i>Articles <b>6 / 17</b></i></div></div>' +
          '<div class="rd-path"><svg viewBox="0 0 400 400" preserveAspectRatio="none"><path class="rd-shadow" d="' + ROAD_D + '"/><path class="rd-edge" d="' + ROAD_D + '"/><path class="rd-road" d="' + ROAD_D + '"/><path class="rd-dash" d="' + ROAD_D + '"/></svg>' +
          '<span class="rd-more">↑ 11 more modules</span>' +
          MODS.map(function (m) {
            return '<span class="rd-n' + (m.done ? ' done' : m.go ? ' go' : '') + '" style="left:' + m.nx + '%;top:' + m.ny + '%">' + (m.done ? '✓' : m.n) + '</span>' +
              '<div class="pj-card rd-mod ' + m.side + '" style="top:calc(' + m.ny + '% - 2.75em)"><div class="rd-top"><span class="pj-eyebrow">Module 0' + m.n + ' · ' + m.st + '</span><b class="rd-pc">0%</b></div>' +
              '<div class="rd-nm">' + m.nm + '</div>' +
              '<div class="rd-row"><div class="pj-bar" style="--p:' + m.p + '%"><u></u></div><span class="pj-pill' + (m.done ? ' ghost' : '') + '">' + (m.done ? 'Review' : 'Resume →') + '</span></div>' +
              (m.done ? '<span class="rd-stamp">DONE</span>' : m.go ? '<span class="rd-stamp go">CONTINUE HERE</span>' : '') + '</div>';
          }).join('') + '</div></div>';
      },
      reset: function (b) {
        var paths = $$('.rd-path path', b);
        paths.forEach(function (p) { if (!p._len) p._len = p.getTotalLength(); if (!p.classList.contains('rd-dash')) { p.style.strokeDasharray = p._len + ' ' + p._len; p.style.strokeDashoffset = p._len; } });
        gsap.set($('.rd-dash', b), { opacity: 0 });
        gsap.set($$('.rd-mod', b), { opacity: 0 });
        gsap.set($$('.rd-n', b), { scale: 0 });
        gsap.set($$('.rd-mod .pj-bar u', b), { scaleX: 0 });
        $$('.rd-pc', b).forEach(function (p) { p.textContent = '0%'; });
        gsap.set($$('.rd-stamp', b), { opacity: 0, scale: 1.8, rotation: -8 });
        gsap.set($('.rd-more', b), { opacity: 0 });
        $('.rd-ring .a', b).setAttribute('stroke-dasharray', '0 400'); $('.rd-ring s', b).textContent = '0%'; $('.rd-of strong', b).textContent = '0';
        $$('.rd-mod', b).forEach(function (m) { m.classList.remove('lit'); });
      },
      enter: function (b) {
        var tl = gsap.timeline(), mods = $$('.rd-mod', b), nodes = $$('.rd-n', b);
        $$('.rd-path path', b).forEach(function (p) { if (!p.classList.contains('rd-dash')) tl.to(p, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, 0); });
        tl.to($('.rd-dash', b), { opacity: 1, duration: .6 }, .9);
        mods.forEach(function (m, i) {
          var at = .25 + i * .22;
          tl.to(nodes[i], { scale: 1, duration: .5, ease: 'back.out(2.2)', clearProps: 'transform' }, at);
          riseIn(tl, m, at + .08, { x: MODS[i].side === 'r' ? 22 : -22, y: 10, rx: -10 });
          tl.to($('.pj-bar u', m), { scaleX: 1, duration: .9, ease: 'power3.out' }, at + .4);
          count(tl, $('.rd-pc', m), MODS[i].p, .9, at + .4, pct);
        });
        drawRing(tl, $('.rd-ring .a', b), 40, .32, 1.3, .3);
        count(tl, $('.rd-ring s', b), 32, 1.3, .3, pct); count(tl, $('.rd-of strong', b), 43, 1.3, .3);
        tl.to($$('.rd-stamp', b), { opacity: 1, scale: 1, rotation: -8, duration: .45, ease: 'back.out(2.2)', stagger: .2 }, 1.1)
          .to($('.rd-more', b), { opacity: 1, duration: .5 }, 1.2)
          .call(function () { mods[0].classList.add('lit'); }, null, 1.1);
        return tl;
      }
    },

    /* 3 · articles: the article as the product shows it — list, page with
       the code typing itself and a read-along highlight, contents rail */
    articles: {
      html: function () {
        return tabs([['Articles', 1, 2], ['Trainer', 0, 2], ['Practice', 1, 2]], 'Articles') +
          '<div class="ar">' + list('Articles', [{ t: 'Set and Unordered Set', on: true }, { t: 'Map and Unordered Map', tick: true }]) +
          '<div class="ar-page"><div class="ar-ttl"><h4>Set and Unordered Set in C++</h4><span class="ar-tags"><i>O(log n)</i><i>O(1) avg</i></span></div><h5 class="ar-h">What Are They?</h5>' +
          '<p class="ar-p"><span class="sn">Both are containers from the Standard Template Library that store a collection of <b>unique elements</b>.</span> ' +
          '<span class="sn">No value is attached to an element; <b>duplicates are rejected</b> automatically.</span> ' +
          '<span class="sn">They are the natural choice for one question: is this element present?</span></p>' +
          '<div class="ar-code"><div class="ln"></div><div class="ln"></div><div class="ln"></div></div></div>' +
          '<div class="pj-card ar-toc"><em>Contents <i>▾</i></em>' +
          ['Set and Unordered Set in C++', 'What Are They?', 'Why Use Them?', 'How They Work Internally', 'Important Operations', 'Time Complexity', 'When to Choose Which', 'Coding Examples']
            .map(function (t, i) { return '<a class="' + (i > 0 ? 'ar-sub' : '') + '">' + t + '</a>'; }).join('') + '</div></div>';
      },
      reset: function (b) {
        gsap.set($$('.pj-tabs span', b), { opacity: 0 });
        gsap.set([$('.pj-list', b), $('.ar-ttl', b), $('.ar-h', b), $('.ar-p', b), $('.ar-code', b), $('.ar-toc', b)], { opacity: 0 });
        gsap.set($$('.ar-tags i', b), { opacity: 0 });
        $$('.ar-toc a', b).forEach(function (a) { a.classList.remove('on'); });
        $$('.sn', b).forEach(function (s) { s.classList.remove('lit'); });
        $$('.ar-code .ln', b).forEach(function (l) { l.innerHTML = ''; });
      },
      enter: function (b) {
        var tl = gsap.timeline(), toc = $$('.ar-toc a', b), sn = $$('.sn', b);
        riseIn(tl, $$('.pj-tabs span', b), 0, { y: -10, rx: 0, dur: .45, stagger: .06 });
        riseIn(tl, $('.pj-list', b), .1, { x: -14, y: 0, rx: 0 });
        riseIn(tl, $('.ar-ttl', b), .2, { y: 14, rx: 0 });
        riseIn(tl, $('.ar-h', b), .32, { y: 12, rx: 0 });
        riseIn(tl, $('.ar-p', b), .42, { y: 12, rx: 0 });
        riseIn(tl, $('.ar-code', b), .6, { y: 18, rx: -8, dur: .7 });
        riseIn(tl, $('.ar-toc', b), .3, { x: 14, y: 0, rx: 0 });
        tl.fromTo($$('.ar-tags i', b), { opacity: 0, x: 10 }, { opacity: 1, x: 0, duration: .4, ease: 'power3.out', stagger: .12, clearProps: 'transform' }, 1.9);
        var lines = $$('.ar-code .ln', b);
        typeLine(tl, lines[0], [{ t: 'set', c: 'ck' }, { t: '<int> s;              ' }, { t: '// sorted · O(log n)', c: 'cc' }], .9, 34);
        typeLine(tl, lines[1], [{ t: 'unordered_set', c: 'ck' }, { t: '<int> us;   ' }, { t: '// hashed · O(1) avg', c: 'cc' }], 2.0, 34);
        typeLine(tl, lines[2], [{ t: 's.insert(' }, { t: '5', c: 'cn' }, { t: '); us.insert(' }, { t: '5', c: 'cn' }, { t: ');' }], 3.15, 34);
        tl.call(function () { toc[1].classList.add('on'); }, null, .6);
        var idle = gsap.timeline({ repeat: -1 }), plan = [[0, 1], [1, 1], [2, 2]];
        plan.forEach(function (p, i) {
          idle.call(function () { sn.forEach(function (s, j) { s.classList.toggle('lit', j === p[0]); }); toc.forEach(function (a, j) { a.classList.toggle('on', j === p[1]); }); }, null, i * 1.7);
        });
        idle.call(function () { sn.forEach(function (s) { s.classList.remove('lit'); }); toc.forEach(function (a, j) { a.classList.toggle('on', j === 1); }); }, null, plan.length * 1.7);
        idle.to({}, { duration: 1.2 }, plan.length * 1.7);
        tl.add(idle, 1.2);
        return tl;
      }
    },

    /* 4 · videos: the player at full width playing the module's own clip,
       the controls following it, the list beneath */
    videos: {
      html: function () {
        return tabs([['Videos', 1, 1], ['Articles', 0, 1], ['Notes', 0, 1], ['Trainer', 1, 3], ['Practice', 2, 2]], 'Videos') +
          '<div class="vd"><div class="vd-player"><video src="assets/video/courses-sliding-window.mp4" poster="assets/img/courses-sliding-window-poster.jpg" muted loop playsinline preload="auto"></video><i class="glare"></i><span class="vd-badge"><i></i>NOW PLAYING</span></div>' +
          '<div class="vd-ctl"><i class="vd-play">' + ic('pause') + '</i><div class="vd-bar"><u></u><i style="left:22%"></i><i style="left:46%"></i><i style="left:71%"></i></div><span class="vd-time">0:00 / 0:20</span></div>' +
          list('Videos · Module 04 · Algorithms', [{ t: 'sliding_window_technique', sub: '0:20 · watched', on: true, tick: true, ic: 'videos' }], 'vd-list') + '</div>';
      },
      reset: function (b, w) {
        var v = $('video', b); if (v) { try { v.pause(); v.currentTime = 0; } catch (e) {} }
        if (w && w._tick) { gsap.ticker.remove(w._tick); w._tick = null; }
        gsap.set($$('.pj-tabs span', b), { opacity: 0 });
        gsap.set([$('.vd-player', b), $('.vd-ctl', b), $('.vd-list', b)], { opacity: 0 });
        $('.vd-bar u', b).style.width = '0%';
      },
      enter: function (b, w) {
        var tl = gsap.timeline(), v = $('video', b), bar = $('.vd-bar u', b), time = $('.vd-time', b);
        function fmt(t) { t = Math.max(0, t | 0); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); }
        riseIn(tl, $$('.pj-tabs span', b), 0, { y: -10, rx: 0, dur: .45, stagger: .06 });
        riseIn(tl, $('.vd-player', b), .12, { y: 26, rx: -10, dur: .8 });
        riseIn(tl, [$('.vd-ctl', b), $('.vd-list', b)], .45, { y: 12, rx: 0, stagger: .1 });
        tl.call(function () {
          if (!v) return;
          v.play().catch(function () {});
          w._tick = function () { var d = v.duration || 20.6; bar.style.width = ((v.currentTime / d) * 100).toFixed(2) + '%'; time.textContent = fmt(v.currentTime) + ' / ' + fmt(d); };
          gsap.ticker.add(w._tick);
        }, null, .5);
        return tl;
      }
    },

    /* 5 · notes: the trainer's note as a ruled sheet that writes itself */
    notes: {
      html: function () {
        return tabs([['Videos', 0, 2], ['Articles', 0, 2], ['Notes', 0, 1], ['Trainer', 0, 8], ['Practice', 0, 43], ['Lab', 0, 2]], 'Notes') +
          '<div class="nt">' + list('Notes', [{ t: 'if, if-else, if-elif-else statements', on: true, ic: 'notes' }]) +
          '<div class="nt-stage"><div class="nt-sheet"><div class="nt-t">if, if-else, if-elif-else statements</div>' +
          '<div class="nt-li"><b>if</b> runs a block only when its condition is true</div>' +
          '<div class="nt-li"><b>if-else</b> chooses between two paths; one of them always runs</div>' +
          '<div class="nt-li"><b>if-elif-else</b> checks conditions in order; the first true one wins</div>' +
          '<div class="nt-code"><div class="ln"></div><div class="ln"></div><div class="ln"></div></div><span class="nt-stamp">TRAINER</span></div></div></div>';
      },
      reset: function (b) {
        gsap.set($$('.pj-tabs span', b), { opacity: 0 });
        gsap.set([$('.pj-list', b), $('.nt-sheet', b)], { opacity: 0 });
        gsap.set($('.nt-t', b), { clipPath: 'inset(0 100% 0 0)' });
        gsap.set($$('.nt-li', b), { opacity: 0 });
        gsap.set($('.nt-code', b), { opacity: 0 });
        gsap.set($('.nt-stamp', b), { opacity: 0, scale: 1.7, rotation: -11 });
        $$('.nt-code .ln', b).forEach(function (l) { l.innerHTML = ''; });
      },
      enter: function (b) {
        var tl = gsap.timeline();
        riseIn(tl, $$('.pj-tabs span', b), 0, { y: -10, rx: 0, dur: .45, stagger: .06 });
        riseIn(tl, $('.pj-list', b), .1, { x: -14, y: 0, rx: 0 });
        riseIn(tl, $('.nt-sheet', b), .15, { y: 28, rx: -14, dur: .85 });
        tl.to($('.nt-t', b), { clipPath: 'inset(0 0% 0 0)', duration: .9, ease: 'power2.inOut' }, .55)
          .fromTo($$('.nt-li', b), { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: .55, ease: 'power3.out', stagger: .42, clearProps: 'transform' }, 1.2);
        riseIn(tl, $('.nt-code', b), 2.4, { y: 8, rx: 0, dur: .5 });
        var lines = $$('.nt-code .ln', b);
        typeLine(tl, lines[0], [{ t: 'if', c: 'ck' }, { t: ' marks >= ' }, { t: '90', c: 'cn' }, { t: ':   grade = ' }, { t: '"A"', c: 'cs' }], 2.6, 30);
        typeLine(tl, lines[1], [{ t: 'elif', c: 'ck' }, { t: ' marks >= ' }, { t: '75', c: 'cn' }, { t: ': grade = ' }, { t: '"B"', c: 'cs' }], 3.5, 30);
        typeLine(tl, lines[2], [{ t: 'else', c: 'ck' }, { t: ':             grade = ' }, { t: '"C"', c: 'cs' }], 4.4, 30);
        tl.to($('.nt-stamp', b), { opacity: 1, scale: 1, rotation: -11, duration: .45, ease: 'back.out(2.4)' }, 5.3);
        return tl;
      }
    },

    /* 6 · labs: the problem, the editor typing the solution, the test
       cases turning green on Run */
    lab: {
      html: function () {
        return tabs([['Videos', 0, 2], ['Articles', 0, 2], ['Notes', 0, 1], ['Trainer', 0, 8], ['Practice', 0, 43], ['Lab', 0, 2]], 'Lab') +
          '<div class="clb"><div class="pj-card clb-stmt"><div class="pj-eyebrow">Home / Coding Ground · Lab 01</div><h5>Perfect Square Root or Not</h5>' +
          '<p>Find out whether the given number has a perfect square root. Any number that is the product of two equal whole numbers is a <b>perfect square</b>: 64 = 8 × 8.</p>' +
          '<dl><dt>Input format</dt><dd>a single integer n</dd><dt>Output format</dt><dd>True or False</dd><dt>Constraints</dt><dd>0 ≤ n ≤ 100000</dd></dl></div>' +
          '<div class="clb-stage"><div class="clb-ed"><div class="clb-hd"><i></i><i></i><i></i>main.py<s>Python 3</s></div>' +
          '<div class="ln"><i>1</i><span></span></div><div class="ln"><i>2</i><span></span></div><div class="ln"><i>3</i><span></span></div>' +
          '<span class="clb-run">' + ic('play') + 'Run Code</span></div>' +
          '<div class="clb-cases"><div class="clb-case"><div class="pj-eyebrow">Test case 1 <s>·</s></div><div>Input <u>26</u></div><div>Output <u>False</u></div></div>' +
          '<div class="clb-case"><div class="pj-eyebrow">Test case 2 <s>·</s></div><div>Input <u>36</u></div><div>Output <u>True</u></div></div>' +
          '<div class="clb-sum"><i>✓</i>2 / 2 test cases passed · 40 points</div></div></div></div>';
      },
      reset: function (b) {
        gsap.set($$('.pj-tabs span', b), { opacity: 0 });
        gsap.set([$('.clb-stmt', b), $('.clb-ed', b)], { opacity: 0 });
        gsap.set($$('.clb-case', b), { opacity: 0 });
        gsap.set($('.clb-sum', b), { opacity: 0 });
        gsap.set($('.clb-run', b), { scale: 1 });
        $$('.clb-case', b).forEach(function (c) { c.classList.remove('ok'); $('.pj-eyebrow s', c).textContent = '·'; });
        $$('.clb-ed .ln span', b).forEach(function (l) { l.innerHTML = ''; });
      },
      enter: function (b) {
        var tl = gsap.timeline(), cases = $$('.clb-case', b);
        riseIn(tl, $$('.pj-tabs span', b), 0, { y: -10, rx: 0, dur: .45, stagger: .06 });
        riseIn(tl, $('.clb-stmt', b), .1, { x: -14, y: 0, rx: 0 });
        riseIn(tl, $('.clb-ed', b), .2, { y: 26, rx: -12, dur: .85 });
        riseIn(tl, cases, .5, { y: 12, rx: 0, stagger: .12 });
        var lines = $$('.clb-ed .ln span', b);
        typeLine(tl, lines[0], [{ t: 'n = ' }, { t: 'int', c: 'cf' }, { t: '(' }, { t: 'input', c: 'cf' }, { t: '())' }], .9, 22);
        typeLine(tl, lines[1], [{ t: 'r = ' }, { t: 'int', c: 'cf' }, { t: '(n ** ' }, { t: '0.5', c: 'cn' }, { t: ')' }], 1.8, 22);
        typeLine(tl, lines[2], [{ t: 'print', c: 'cf' }, { t: '(r * r == n)' }], 2.65, 22);
        tl.to($('.clb-run', b), { scale: .9, duration: .12, yoyo: true, repeat: 1, ease: 'power2.inOut', clearProps: 'transform' }, 3.45);
        cases.forEach(function (c, i) {
          tl.call(function () { c.classList.add('ok'); $('.pj-eyebrow s', c).textContent = 'Passed ✓'; }, null, 3.85 + i * .3);
        });
        riseIn(tl, $('.clb-sum', b), 4.5, { y: 6, rx: 0, dur: .45 });
        return tl;
      }
    }
  };

  /* ───────── build ───────── */
  function buildOnce(crs) {
    if (crs._built) return;
    crs._built = true;
    var layers = ''; for (var i = 6; i >= 1; i--) layers += '<i class="ly" style="--li:' + i + '"></i>';
    var h = '<div class="crs-bg" aria-hidden="true"><i class="crs-disc d1"></i><i class="crs-disc d2"></i><i class="crs-disc d3"></i><div class="crs-rings"><i></i><i></i><i></i><i></i></div></div>' +
      '<div class="crs-lap side-l" aria-hidden="true">' + MAC_HTML + '</div>' +
      '<div class="crs-pills side-l" aria-hidden="true"><span class="crs-pill crs-p1"><i></i><s></s></span><span class="crs-pill crs-p2"><i></i><s></s></span></div>' +
      '<svg class="crs-cone" aria-hidden="true"><defs>' +
      '<linearGradient id="crsBeamG" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#3CB371" stop-opacity=".55"/><stop offset=".45" stop-color="#BFE4CB" stop-opacity=".30"/><stop offset="1" stop-color="#E9F6EC" stop-opacity=".24"/></linearGradient>' +
      '<linearGradient id="crsCoreG" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".9"/><stop offset="1" stop-color="#FFFFFF" stop-opacity=".08"/></linearGradient>' +
      '<radialGradient id="crsLensG"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset=".35" stop-color="#7FD39B" stop-opacity=".6"/><stop offset="1" stop-color="#3CB371" stop-opacity="0"/></radialGradient></defs>' +
      '<polygon class="crs-beam" points="0,0 0,0 0,0 0,0" fill="url(#crsBeamG)" opacity="0"/><polygon class="crs-core" points="0,0 0,0 0,0 0,0" fill="url(#crsCoreG)" opacity="0"/>' +
      '<circle class="crs-lens-glow" r="34" fill="url(#crsLensG)" opacity="0"/><circle class="crs-lens" r="4.5" fill="#fff" opacity="0"/></svg>';
    VIEWS.forEach(function (v, i) {
      h += '<div class="crs-win ' + (i % 2 ? 'side-r' : 'side-l') + '" data-i="' + i + '">' +
        '<div class="crs-copy"><span class="crs-k"><i>' + ic(v.key) + '</i>03 · Courses <s>·</s> ' + v.name + '</span><h3 class="crs-h">' + v.h + '</h3><p class="crs-say">' + v.say + '</p>' +
        '<div class="crs-tabs">' + VIEWS.map(function (t, j) { return '<span class="crs-tab' + (j === i ? ' on' : '') + '" data-k="' + j + '" role="button"><i>' + ic(t.key) + '</i>' + t.short + '</span>'; }).join('') + '</div></div>' +
        '<div class="crs-proj ' + (i % 2 ? 'from-r' : 'from-l') + '" aria-hidden="true"><div class="pj">' + layers + '<div class="pj-face"><i class="pj-shine"></i>' +
        '<div class="pj-head"><i class="pj-ic">' + ic(v.key) + '</i><b>' + v.head + '</b>' + (v.headX || '') + '<span class="pj-chip' + (v.chipCls ? ' ' + v.chipCls : '') + '">' + v.chip + '</span></div>' +
        '<div class="pj-body">' + SCENE[v.key].html() + '</div></div><i class="pj-glow"></i></div></div></div>';
    });
    crs.innerHTML = h;
    var kb = $('.mac-keys', crs);
    var rows = [14, 14, 14, 13, 12].map(function (n) { return '<div class="kr">' + new Array(n + 1).join('<i></i>') + '</div>'; });
    rows.push('<div class="kr"><i></i><i></i><i></i><i class="w"></i><i class="sp"></i><i class="w"></i><i></i><i></i><i></i></div>');
    kb.innerHTML = rows.join('');

    crs._wins = $$('.crs-win', crs).map(function (w, i) {
      return { el: w, i: i, key: VIEWS[i].key, copy: $('.crs-copy', w), proj: $('.crs-proj', w), pj: $('.pj', w), face: $('.pj-face', w), body: $('.pj-body', w),
        shine: $('.pj-shine', w), glow: $('.pj-glow', w), rly: null, host: null, pw: 0, ph: 0, px: 0, py: 0 };
    });
    var view = $('.mac-view', crs);
    VIEWS.forEach(function (v, i) {
      var host = el('div', 'crs-rly'); view.appendChild(host);
      var w = crs._wins[i], cfg = CLIP[v.key]; w.host = host;
      if (!global.Recordly) return;
      global.Recordly.load(host, 'assets/video/' + v.clip + '.mp4', 'assets/video/' + v.clip + '.cues.json',
        { autoplay: false, pad: 0, bg: '#F6F8F7', loop: false, poster: 'assets/img/' + v.clip + '-poster.jpg',
          to: cfg.to, loopFrom: cfg.loopFrom || 0, freeze: !!cfg.freeze, mark: cfg.mark, from: cfg.from || 0, rate: cfg.rate || 1, onMark: function () { onMark(crs, i); } })
        .then(function (r) { w.rly = r; if (w._wantArm) { w._wantArm = false; armNow(crs, i); } });
    });
    var step = crs.closest('.step');
    $$('.crs-tab', crs).forEach(function (t) {
      t.addEventListener('click', function () { if (global.deckSetSub && step) global.deckSetSub(step, +t.dataset.k); });
    });
    if (step) step.addEventListener('substep', function (e) { show(step, e.detail.k, e.detail.d); });
    crs._coneObj = { t: 0 };
  }

  /* ───────── geometry ───────── */
  function layout(crs) {
    var W = crs.clientWidth || innerWidth, H = crs.clientHeight || innerHeight, narrow = W <= 1080;
    var k = narrow ? clamp(Math.min(W, 600) / 600, .6, 1) : clamp(Math.min(W / 1560, H / 780), .62, 1.4);
    var mw = even(640 * k), gut = Math.round(48 * k), gap = Math.round(30 * k), over = Math.round(mw * .26);
    crs.style.setProperty('--k', k.toFixed(3)); crs.style.setProperty('--mw', mw + 'px');
    crs.classList.toggle('narrow', narrow);
    var lapX = [gut + mw / 2, W - gut - mw / 2], lapY = Math.round(H * .49);
    var g = crs._geo = { W: W, H: H, k: k, mw: mw, gut: gut, gap: gap, over: over, narrow: narrow, lapX: lapX, lapY: lapY };
    crs._wins.forEach(function (w, i) {
      var side = i % 2, pw = even(600 * k * (VIEWS[i].pwf || 1));
      w.pw = pw; w.proj.style.width = pw + 'px';
      if (narrow) { w.copy.style.left = w.copy.style.top = w.copy.style.width = ''; w.proj.style.left = w.proj.style.top = ''; return; }
      // the panel: its near edge sits `over` inside the lid; every edge on a whole pixel
      var pjX = side ? lapX[1] - mw / 2 + over - pw / 2 : lapX[0] + mw / 2 - over + pw / 2;
      var ph = w.proj.offsetHeight || 420;
      w.ph = ph; w.px = Math.round(pjX - pw / 2); w.py = Math.round(H * .5 - ph / 2);
      w.proj.style.left = w.px + 'px'; w.proj.style.top = w.py + 'px';
      // the copy takes what is left on the far side
      var cl, cw;
      if (side === 0) { cl = w.px + pw + gap; cw = Math.max(220, W - gut - cl); } else { cl = gut; cw = Math.max(220, w.px - gap - gut); }
      w.copy.style.left = cl + 'px'; w.copy.style.width = cw + 'px';
      var ch = w.copy.offsetHeight || 300; w.copy.style.top = Math.round(H * .5 - ch / 2) + 'px';
    });
    return g;
  }
  function rel(crs, node) { var a = node.getBoundingClientRect(), c = crs.getBoundingClientRect(); return { left: a.left - c.left, top: a.top - c.top, right: a.right - c.left, bottom: a.bottom - c.top, width: a.width, height: a.height }; }
  // the lens: the centre of the screen, with a small aperture
  function lensAt(crs) { var r = rel(crs, $('.mac-scr', crs)); return { x: r.left + r.width * .5, y: r.top + r.height * .5, a: Math.max(8, r.height * .05) }; }
  function drawCone(crs, w) {
    var h = crs._h; if (!h) return;
    var t = crs._coneObj.t;
    if (t <= 0.001) { [h.beam, h.core, h.lens, h.lensG].forEach(function (n) { n.setAttribute('opacity', 0); }); return; }
    var side = w.i % 2, L = lensAt(crs), p = rel(crs, w.face);
    var tx = side ? p.right - 2 : p.left + 2, ty1 = p.top + 4, ty2 = p.bottom - 4;
    var px = L.x + (tx - L.x) * t, py1 = (L.y - L.a) + (ty1 - (L.y - L.a)) * t, py2 = (L.y + L.a) + (ty2 - (L.y + L.a)) * t;
    h.beam.setAttribute('points', L.x + ',' + (L.y - L.a) + ' ' + px + ',' + py1 + ' ' + px + ',' + py2 + ' ' + L.x + ',' + (L.y + L.a));
    var cy = (py1 + py2) / 2, ch = (py2 - py1) * .17;
    h.core.setAttribute('points', L.x + ',' + (L.y - L.a * .45) + ' ' + px + ',' + (cy - ch) + ' ' + px + ',' + (cy + ch) + ' ' + L.x + ',' + (L.y + L.a * .45));
    var op = Math.min(1, t * 1.3);
    h.beam.setAttribute('opacity', op); h.core.setAttribute('opacity', op * .75);
    [h.grad, h.gradC].forEach(function (gr) { gr.setAttribute('x1', L.x); gr.setAttribute('x2', px); gr.setAttribute('y1', L.y); gr.setAttribute('y2', L.y); });
    h.lens.setAttribute('cx', L.x); h.lens.setAttribute('cy', L.y); h.lens.setAttribute('opacity', op);
    h.lensG.setAttribute('cx', L.x); h.lensG.setAttribute('cy', L.y); h.lensG.setAttribute('opacity', op * .9);
  }
  function lensPulse(crs, on) {
    var h = crs._h; if (!h) return;
    gsap.killTweensOf(h.lensG);
    if (on) gsap.fromTo(h.lensG, { attr: { r: 34 } }, { attr: { r: 46 }, duration: 1.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    else gsap.set(h.lensG, { attr: { r: 34 } });
  }

  /* ───────── the owl's eyes: the corner opposite the laptop ───────── */
  function eyes(k) {
    var w = $('#watch'); if (!w) return;
    var e = EYES[k];
    w.style.transitionDuration = '1.1s';
    w.style.left = e.l + '%'; w.style.top = e.t + '%'; w.style.rotate = e.r + 'deg';
  }
  function eyesOff() {
    var w = $('#watch'); if (!w) return;
    w.style.left = ''; w.style.top = ''; w.style.rotate = ''; w.style.transitionDuration = '';
  }

  /* ───────── state ───────── */
  function paintTabs(crs, k) { $$('.crs-tab', crs).forEach(function (t) { t.classList.toggle('on', +t.dataset.k === k); }); }
  function killScene(w) {
    if (w._sc) { w._sc.kill(); w._sc = null; }
    if (w._tick) { gsap.ticker.remove(w._tick); w._tick = null; }
    $$('*', w.body).forEach(function (n) { gsap.killTweensOf(n); });
    SCENE[w.key].reset(w.body, w);
  }
  function resetProj(crs, w) {
    if (w._tl) { w._tl.kill(); w._tl = null; }
    gsap.killTweensOf([w.proj, w.pj, w.shine, w.glow]);
    killScene(w);
    gsap.set(w.proj, { opacity: 0, clearProps: 'transform' });
    gsap.set(w.pj, { '--dk': 0 });
    gsap.set(w.shine, { opacity: 0, xPercent: -55 });
    gsap.set(w.glow, { opacity: 0 });
  }
  function coneOff(crs) {
    var h = crs._h; if (!h) return;
    gsap.killTweensOf(crs._coneObj); crs._coneObj.t = 0;
    [h.beam, h.core, h.lens, h.lensG].forEach(function (n) { n.setAttribute('opacity', 0); });
    lensPulse(crs, false);
    gsap.killTweensOf(h.tint); gsap.set(h.tint, { opacity: 0 });
  }
  function pills(crs, k, on) {
    var ps = $$('.crs-pill', crs), v = VIEWS[k];
    gsap.killTweensOf(ps);
    if (on) ps.forEach(function (p, i) { $('s', p).textContent = v.pills[i]; $('i', p).innerHTML = ic(v.pillIc[i]); });
    gsap.to(ps, { opacity: on ? 1 : 0, scale: on ? 1 : .6, duration: on ? .5 : .22, ease: on ? 'back.out(1.8)' : 'power2.in', stagger: on ? .12 : 0, overwrite: true, clearProps: on ? 'transform' : '' });
  }
  // everything not in `keep` goes straight to its rest state
  function settleAll(crs, keep) {
    if (crs._tl) { crs._tl.kill(); crs._tl = null; }
    crs._busy = false;
    crs._wins.forEach(function (w, i) {
      if (keep.indexOf(i) >= 0) return;
      w.el.classList.remove('crs-live');
      gsap.killTweensOf(w.copy); gsap.set(w.copy, { opacity: 0, y: 0 });
      resetProj(crs, w);
    });
    if (crs._open != null && keep.indexOf(crs._open) < 0) { crs._open = null; coneOff(crs); pills(crs, 0, false); }
  }

  /* ───────── the projection: out of the lens, along the beam, lands flat ───────── */
  function project(crs, k) {
    var w = crs._wins[k], h = crs._h;
    if (!h || crs._open === k) return;
    var g = h.g, side = k % 2;
    crs._open = k;
    if (g.narrow) { gsap.set(w.proj, { opacity: 1, clearProps: 'transform' }); w._sc = SCENE[w.key].enter(w.body, w, crs); return; }
    var L = lensAt(crs), cx = w.px + w.pw / 2, cy = w.py + w.ph / 2;
    gsap.killTweensOf([crs._coneObj, w.proj, w.pj, w.shine, w.glow, h.tint]);
    var tl = w._tl = gsap.timeline();
    tl.to(crs._coneObj, { t: 1, duration: .55, ease: 'power2.out', onUpdate: function () { drawCone(crs, w); } }, 0)
      .to(h.tint, { opacity: 1, duration: .5 }, .05)
      .set(w.proj, { x: L.x - cx, y: L.y - cy, scale: .08, rotationY: side ? 55 : -55, transformPerspective: 1100, transformOrigin: '50% 50%', opacity: 0 }, 0)
      .to(w.proj, { opacity: 1, duration: .22, ease: 'power1.out' }, .08)
      .to(w.proj, { x: 0, y: 0, scale: 1, rotationY: 0, duration: .95, ease: 'power3.out', clearProps: 'transform', onUpdate: function () { drawCone(crs, w); } }, .08)
      .to(w.pj, { '--dk': 1, duration: .6, ease: 'power2.out' }, .3)
      .to(w.glow, { opacity: 1, duration: .5 }, .5)
      .fromTo(w.shine, { xPercent: -55, opacity: 0 }, { xPercent: 55, opacity: .85, duration: .7, ease: 'power2.inOut' }, .55)
      .to(w.shine, { opacity: 0, duration: .2 }, 1.2)
      // the beam's final shape against the landed panel, then a projector flicker
      .call(function () { drawCone(crs, w); }, null, 1.04)
      .to(w.proj, { opacity: .78, duration: .05 }, 1.04).to(w.proj, { opacity: 1, duration: .07 }, 1.09).to(w.proj, { opacity: .9, duration: .05 }, 1.18).to(w.proj, { opacity: 1, duration: .1 }, 1.23)
      .call(function () { if (crs._open !== k) return; w._sc = SCENE[w.key].enter(w.body, w, crs); }, null, .6)
      .call(function () { if (crs._open === k) pills(crs, k, true); }, null, .75)
      .call(function () { if (crs._open === k) lensPulse(crs, true); }, null, 1.04);
  }
  function unproject(crs, k) {
    var w = crs._wins[k], h = crs._h, side = k % 2;
    if (!h) return;
    if (w._tl) { w._tl.kill(); w._tl = null; }
    if (w._sc) { w._sc.kill(); w._sc = null; }
    if (w._tick) { gsap.ticker.remove(w._tick); w._tick = null; }
    crs._open = null;
    pills(crs, k, false);
    lensPulse(crs, false);
    if (h.g.narrow) { resetProj(crs, w); coneOff(crs); return; }
    var L = lensAt(crs), cx = w.px + w.pw / 2, cy = w.py + w.ph / 2;
    gsap.killTweensOf([crs._coneObj, w.proj, w.pj, w.shine, w.glow, h.tint]);
    var tl = gsap.timeline();
    tl.to(crs._coneObj, { t: 0, duration: .36, ease: 'power2.in', onUpdate: function () { drawCone(crs, w); } }, .02)
      .to(h.tint, { opacity: 0, duration: .3 }, 0)
      .to(w.glow, { opacity: 0, duration: .15 }, 0)
      .to(w.proj, { x: L.x - cx, y: L.y - cy, scale: .1, opacity: 0, rotationY: side ? 45 : -45, transformPerspective: 1100, transformOrigin: '50% 50%', duration: .4, ease: 'power2.in', onUpdate: function () { drawCone(crs, w); } }, 0)
      .to(w.pj, { '--dk': 0, duration: .3 }, 0)
      .call(function () { resetProj(crs, w); }, null, .42);
    w._tl = tl;
  }

  /* ───────── the recording on the screen ───────── */
  function arm(crs, k) {
    if (crs._k !== k) return;
    var w = crs._wins[k];
    crs._armed = k;
    if (!w.rly) { w._wantArm = true; return; }
    armNow(crs, k);
  }
  function armNow(crs, k) {
    var w = crs._wins[k];
    if (crs._armed !== k || !w.rly) return;
    crs._wins.forEach(function (o, i) { if (i !== k && o.rly) o.rly.pause(); });
    switchHost(crs, k, .3);
    w.rly.restart();
  }
  // the screen dips through its own background to the next recording
  function switchHost(crs, k, dur, dip) {
    crs._wins.forEach(function (o, i) {
      gsap.killTweensOf(o.host);
      if (i === k) {
        if (o.rly && crs._armed !== k) { try { o.rly.rewind(); } catch (e) {} }
        gsap.to(o.host, { opacity: 1, duration: dur, ease: 'power1.inOut', delay: dip ? dur * .55 : 0 });
      } else gsap.to(o.host, { opacity: 0, duration: dip ? dur * .55 : dur, ease: 'power1.in' });
    });
  }
  function onMark(crs, k) {
    if (crs._k !== k || crs._armed !== k || crs._busy || !crs._h) return;
    project(crs, k);
  }

  /* ───────── copy in and out ───────── */
  function enterCopy(crs, w, d) {
    w.el.classList.add('crs-live');
    gsap.killTweensOf(w.copy); gsap.set(w.copy, { opacity: 1, y: 0 });
    gsap.fromTo($$(':scope > *', w.copy), { opacity: 0, y: 26 * d }, { opacity: 1, y: 0, duration: .7, ease: 'power3.out', stagger: .07, overwrite: true, clearProps: 'transform' });
  }

  /* ───────── walking the windows ───────── */
  function show(step, k, d) {
    var crs = $('.crs', step), h = crs && crs._h; if (!h) return;
    var from = crs._k; if (from === k) return;
    var g = h.g, wf = crs._wins[from], wt = crs._wins[k], sf = from % 2, st = k % 2, cross = sf !== st && !g.narrow;
    // a tab or arrow within the first second: the entrance is still flying — land the hardware first,
    // otherwise killing it leaves the laptop faint, the lid half open and the screen dark
    var entering = !!(crs._enter && crs._enter.isActive());
    settleAll(crs, [from, k]);
    crs._enter = null;
    if (entering) {
      gsap.killTweensOf([h.lap, h.lid, h.off]);
      gsap.set(h.lap, { y: g.lapY, opacity: 1 }); gsap.set(h.lid, { rotationX: -8 }); gsap.set(h.off, { opacity: 0 });
      gsap.set($$('.crs-disc', crs), { opacity: 1 });
    }
    crs._k = k; crs._armed = null; crs._busy = true;
    paintTabs(crs, k);
    if (crs._open === from) unproject(crs, from); else { pills(crs, from, false); coneOff(crs); }
    gsap.set(wt.copy, { opacity: 0 });
    var tl = crs._tl = gsap.timeline({ onComplete: function () { crs._busy = false; } });
    tl.to(wf.copy, { opacity: 0, y: -70 * d, duration: .42, ease: 'power2.in' }, 0)
      .call(function () { wf.el.classList.remove('crs-live'); gsap.set(wf.copy, { y: 0 }); }, null, .44);
    if (cross) {
      tl.to(h.lap, { x: g.lapX[st], duration: 1.05, ease: 'power2.inOut' }, .08)
        .to(h.lap, { y: g.lapY + 36, duration: .5, ease: 'sine.in' }, .08)
        .to(h.lap, { y: g.lapY, duration: .55, ease: 'sine.out' }, .58)
        .to(h.mac, { rotationY: st ? -11 : 11, duration: 1.05, ease: 'power2.inOut' }, .08)
        .to(h.rings, { x: g.lapX[st], duration: 1.05, ease: 'power2.inOut' }, .08)
        .to(h.pills, { x: g.lapX[st], duration: 1.05, ease: 'power2.inOut' }, .08)
        .call(function () { eyes(k); }, null, .08)
        .call(function () { [h.lap, h.pills].forEach(function (n) { n.classList.toggle('side-r', st === 1); n.classList.toggle('side-l', st === 0); }); }, null, .6);
    } else if (!g.narrow) {
      tl.to(h.lap, { y: g.lapY - 24, duration: .36, ease: 'sine.out' }, .1).to(h.lap, { y: g.lapY, duration: .42, ease: 'sine.in' }, .46)
        .call(function () { eyes(k); }, null, .1);
    }
    tl.call(function () { switchHost(crs, k, .5, true); }, null, cross ? .42 : .25)
      .call(function () { enterCopy(crs, wt, d); }, null, cross ? .55 : .42)
      .call(function () { arm(crs, k); }, null, cross ? 1.12 : .78);
  }

  /* The laptop is placed by transform, from numbers taken out of the room's
     width. The room changes width without the window changing size every
     time the rail slides, present mode arrives or fullscreen comes and goes —
     so unless the scene is re-seated the laptop keeps the x it was given and
     walks off the edge of the stage. The panel and the copy are placed in
     layout(), which already runs; what is left is the hardware. */
  function seat(crs) {
    var h = crs._h; if (!h) return;
    var g = h.g = layout(crs), k = crs._k, side = k % 2, w = crs._wins[k];
    // a beat caught mid-flight is dropped and the scene re-seated, so the
    // pose and the geometry always agree
    if (crs._tl) { crs._tl.kill(); crs._tl = null; }
    crs._enter = null; crs._busy = false;
    gsap.killTweensOf([h.lap, h.mac, h.lid, h.off, h.rings, h.pills]);
    gsap.set([h.lap, h.rings, h.pills], { x: g.lapX[side], y: g.lapY });
    gsap.set(h.lap, { opacity: 1 });
    gsap.set(h.mac, { xPercent: -50, yPercent: -50, rotationY: side ? -11 : 11 });
    gsap.set(h.lid, { rotationX: -8 });
    gsap.set(h.off, { opacity: 0 });
    [h.lap, h.pills].forEach(function (n) { n.classList.toggle('side-r', side === 1); n.classList.toggle('side-l', side === 0); });
    gsap.set($$('.crs-disc', crs), { opacity: 1 });
    crs._wins.forEach(function (o, i) {
      o.el.classList.toggle('crs-live', i === k);
      gsap.set(o.copy, { opacity: i === k ? 1 : 0, y: 0 });
      gsap.set(o.host, { opacity: i === k ? 1 : 0 });
    });
    // the projected panel lands on its own left/top, which layout() just
    // rewrote; the beam has to be struck again between the new two points
    if (crs._open === k) drawCone(crs, w);
  }

  /* ───────── ambient: the radiance ───────── */
  function startAmbient(crs) {
    stopAmbient(crs);
    var a = crs._amb = [];
    $$('.crs-disc', crs).forEach(function (d, i) {
      a.push(gsap.to(d, { x: (i % 2 ? -1 : 1) * 60, y: (i === 1 ? -1 : 1) * 44, duration: 16 + i * 5, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
      a.push(gsap.to(d, { scale: 1.08, duration: 11 + i * 3, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    });
    $$('.crs-rings i', crs).forEach(function (r, i) {
      a.push(gsap.fromTo(r, { scale: .5, opacity: .6 }, { scale: 1.45, opacity: 0, duration: 6, ease: 'power1.out', repeat: -1, delay: i * 1.5 }));
    });
  }
  function stopAmbient(crs) { (crs._amb || []).forEach(function (t) { t.kill(); }); crs._amb = null; }

  /* ───────── lifecycle ───────── */
  function prep(step) {
    var crs = $('.crs', step); if (!crs || !global.gsap) return null;
    stop(step);
    buildOnce(crs);
    var g = layout(crs);
    var k = step._subAt | 0, side = k % 2;
    crs._k = k; crs._open = null; crs._armed = null; crs._busy = false;
    var lap = $('.crs-lap', crs), mac = $('.mac', crs), lid = $('.mac-lid', crs), off = $('.mac-off', crs), rings = $('.crs-rings', crs), tint = $('.crs-tint', crs), pl = $('.crs-pills', crs);
    var beam = $('.crs-beam', crs), core = $('.crs-core', crs), lens = $('.crs-lens', crs), lensG = $('.crs-lens-glow', crs), grad = $('#crsBeamG', crs), gradC = $('#crsCoreG', crs);
    [lap, pl].forEach(function (n) { n.classList.toggle('side-r', side === 1); n.classList.toggle('side-l', side === 0); });
    gsap.set(lap, { x: g.lapX[side], y: g.lapY + 70, opacity: 0 });
    gsap.set(pl, { x: g.lapX[side], y: g.lapY });
    gsap.set(mac, { xPercent: -50, yPercent: -50, rotationY: side ? -11 : 11 });
    gsap.set(lid, { rotationX: -30 }); gsap.set(off, { opacity: 1 }); gsap.set(tint, { opacity: 0 });
    gsap.set(rings, { x: g.lapX[side], y: g.lapY }); gsap.set($$('.crs-rings i', crs), { opacity: 0, scale: .5 });
    gsap.set($$('.crs-disc', crs), { opacity: 0, x: 0, y: 0, scale: 1 });
    gsap.set($$('.crs-pill', crs), { opacity: 0, scale: .6 });
    [beam, core, lens, lensG].forEach(function (n) { n.setAttribute('opacity', 0); }); crs._coneObj.t = 0;
    crs._h = { lap: lap, mac: mac, lid: lid, off: off, rings: rings, tint: tint, pills: pl, beam: beam, cone: beam, core: core, lens: lens, lensG: lensG, grad: grad, gradC: gradC, g: g };
    crs._wins.forEach(function (w, i) {
      w.el.classList.toggle('crs-live', i === k);
      gsap.killTweensOf(w.copy); gsap.set(w.copy, { opacity: 0, y: 0 });
      gsap.set(w.host, { opacity: i === k ? 1 : 0 });
      if (w.rly) { try { w.rly.rewind(); } catch (e) {} }
      resetProj(crs, w);
    });
    paintTabs(crs, k);
    eyes(k);
    if (!crs._onResize) { crs._onResize = function () { seat(crs); }; addEventListener('resize', crs._onResize); }
    return crs._h;
  }

  function play(step) {
    var crs = $('.crs', step); if (!crs) return;
    var h = crs._h || prep(step); if (!h) return;
    var k = crs._k, w = crs._wins[k], g = h.g;
    startAmbient(crs);
    var tl = crs._tl = crs._enter = gsap.timeline({ onComplete: function () { crs._busy = false; crs._enter = null; } });
    crs._busy = true;
    tl.to($$('.crs-disc', crs), { opacity: 1, duration: 1.3, ease: 'power2.out', stagger: .12 }, 0)
      .to(h.lap, { y: g.lapY, opacity: 1, duration: .95, ease: 'power3.out' }, .05)
      .to(h.lid, { rotationX: -8, duration: 1.15, ease: 'power3.out' }, .12)
      .to(h.off, { opacity: 0, duration: .5 }, .5)
      .call(function () { enterCopy(crs, w, 1); }, null, .45)
      .call(function () { arm(crs, k); }, null, 1.0);
  }

  function stop(step) {
    var crs = $('.crs', step); if (!crs || !crs._built) return;
    settleAll(crs, []);
    stopAmbient(crs);
    if (crs._h) coneOff(crs);
    crs._wins.forEach(function (w) { if (w.rly) { try { w.rly.pause(); } catch (e) {} } w._wantArm = false; });
    gsap.killTweensOf($$('.crs-pill', crs));
    eyesOff();
    crs._h = null; crs._open = null; crs._armed = null; crs._busy = false; crs._enter = null;
  }

  global.Courses = { prep: prep, play: play, stop: stop, show: show, VIEWS: VIEWS };
})(window);
