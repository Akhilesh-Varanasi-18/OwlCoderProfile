/* moves.js — "What Owl Coder is".

   Four cards on the left, a stage on the right. The deck's arrows walk the
   cards (sub-steps of one slide): the first arrow lands on Learn, the next
   three select Practise, Compete and Track. Each card plays its own looping
   scene on the stage, built from the product's own surfaces. The AI mentor
   appears inside Practise, which is where it lives in the product.

   Driven by the deck: Moves.play(step) on arrival, Moves.stop(step) on
   leaving, and a 'substep' event on the step when an arrow moves inside. */
(function (global) {
  'use strict';
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rnd = function (a, b) { return a + Math.random() * (b - a); };

  var SAY = [null,
    'Courses are built from modules, and every module carries an article, a video and your own notes — read, watch, write, in order.',
    'Trainer and trainee problems for every module, solved in the browser in four languages, with a mentor that hints and never solves.',
    'Live coding contests with a ticking clock and a leaderboard that reorders as you climb.',
    'Every problem you solve — here, on LeetCode or CodeChef — lands on your heatmap, your reports and your improvement tracker.'
  ];

  // heatmap colours by level, as the deck's iso cells expect them
  var LV = [
    ['#E9F6EC', '#CFE3D6', '#DCEBE1'], ['#BFE8CC', '#8FC6A2', '#A8D7B7'], ['#7FD39B', '#4FA76C', '#66BD82'],
    ['#3CB371', '#237F4C', '#2F9A5F'], ['#15893F', '#0B5D2C', '#11733A']
  ];
  function paintCell(el, lv) { el.style.setProperty('--c', LV[lv][0]); el.style.setProperty('--cd', LV[lv][1]); el.style.setProperty('--cm', LV[lv][2]); }

  function blink(eyes) {
    if (!eyes.length || reduced) return null;
    var tl = gsap.timeline({ repeat: -1, repeatDelay: 2.5 + Math.random() * 3 });
    tl.to(eyes, { scaleY: .08, duration: .22, ease: 'power2.in', transformOrigin: 'center' })
      .to(eyes, { scaleY: 1, duration: .36, ease: 'back.out(2.2)' }, '+=.1');
    return tl;
  }
  function bob(owl, tl) {
    if (!owl) return;
    tl.add(gsap.to($('.o-bird', owl), { y: -5, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 96%' }), 0);
    var b = blink($$('.o-eye', owl)); if (b) tl.add(b, 0);
  }
  function burst(confs, tl, at, ox, oy) {
    confs.forEach(function (c, i) {
      tl.fromTo(c, { opacity: 1, x: ox, y: oy, rotation: 0, scale: 1 },
        { x: ox + rnd(-110, 110), y: oy + rnd(-120, 30), rotation: rnd(-180, 180), opacity: 0, scale: .6, duration: .95, ease: 'power2.out', immediateRender: false }, at + i * .02);
    });
  }

  /* ───────── the scenes; each returns a master timeline ───────── */
  var SCENE = {};

  // 1 · Learn — article, video, notes; the module's lessons tick off
  SCENE[1] = function (sc) {
    var faces = $$('.ln-face', sc), sents = $$('.sn', sc), bars = $$('.gc i', sc), vid = $('.ln-vid', sc), vbar = $('.player .bar i', sc);
    var notes = $$('.note-lines span', sc), items = $$('.ln-list li', sc), ring = $('.ring .p', sc), pct = $('.ring b', sc), owl = $('.mv-owl', sc);
    var FLIP_A = 3.8, FLIP_B = 8.2, END = 11.8;
    gsap.set(faces, { opacity: 0, rotationY: 90 }); gsap.set(faces[0], { opacity: 1, rotationY: 0 });
    gsap.set(bars, { scaleY: 0, transformOrigin: 'bottom' });
    gsap.set(vbar, { width: '0%' }); gsap.set(notes, { clipPath: 'inset(0 100% 0 0)' }); gsap.set(ring, { strokeDashoffset: 170 });
    function stopVid() { if (vid) { vid.pause(); try { vid.currentTime = 0; } catch (e) {} } }
    function clearSents() { sents.forEach(function (s) { s.classList.remove('on'); }); }
    var p = { v: 0 };
    var tl = gsap.timeline({ repeat: -1, repeatDelay: .6, onRepeat: function () { items.forEach(function (li) { li.classList.remove('done'); }); clearSents(); stopVid(); } });
    // read along, one sentence at a time
    sents.forEach(function (s, i) { tl.call(function () { clearSents(); s.classList.add('on'); }, null, .4 + i * .5); });
    tl.call(clearSents, null, .4 + sents.length * .5)
      .to(bars, { scaleY: 1, duration: .6, ease: 'back.out(1.4)', stagger: .14 }, 1.4)
      .to(faces[0], { rotationY: -90, opacity: 0, duration: .4, ease: 'power2.in' }, FLIP_A)
      .to(faces[1], { rotationY: 0, opacity: 1, duration: .5, ease: 'power2.out' }, FLIP_A + .4)
      // the video starts only once the face has stopped turning, so its frames are never re-rasterised mid-flip
      .call(function () { if (vid) { try { vid.currentTime = 0; } catch (e) {} vid.play().catch(function () {}); } }, null, FLIP_A + .95)
      .to(vbar, { width: '100%', duration: FLIP_B - FLIP_A - 1.1, ease: 'none' }, FLIP_A + 1.0)
      .to(faces[1], { rotationY: -90, opacity: 0, duration: .4, ease: 'power2.in' }, FLIP_B)
      .call(stopVid, null, FLIP_B + .4)
      .to(faces[2], { rotationY: 0, opacity: 1, duration: .5, ease: 'power2.out' }, FLIP_B + .4)
      .to(notes, { clipPath: 'inset(0 0% 0 0)', duration: .55, stagger: .5, ease: 'none' }, FLIP_B + .9)
      .to(ring, { strokeDashoffset: 0, duration: END - 1.2, ease: 'none' }, .6)
      .to(p, { v: 100, duration: END - 1.2, ease: 'none', onUpdate: function () { pct.textContent = Math.round(p.v) + '%'; } }, .6)
      .to({}, { duration: .1 }, END);
    items.forEach(function (li, i) { tl.call(function () { li.classList.add('done'); }, null, 1.0 + i * ((END - 2.2) / items.length)); });
    bob(owl, tl);
    tl._vid = vid;
    return tl;
  };

  // 2 · Practise — type, run, fail one, the mentor hints, fix, accepted
  SCENE[2] = function (sc) {
    var lines = $$('.ed-code > span', sc), tests = $$('.pr-tests li', sc), mentor = $('.pr-mentor', sc), ok = $('.pr-ok', sc);
    var run = $('.ed-top .run', sc), fix = lines[lines.length - 1], confs = $$('.conf', sc), owl = $('.mv-owl', sc);
    var FIX_FROM = fix.innerHTML;
    gsap.set(lines, { clipPath: 'inset(0 100% 0 0)' }); gsap.set(mentor, { opacity: 0, y: 12 }); gsap.set(ok, { opacity: 0, scale: .7 });
    gsap.set(confs, { opacity: 0 });
    function reset() { tests.forEach(function (t) { t.classList.remove('ok', 'bad'); }); fix.classList.remove('hl'); fix.innerHTML = FIX_FROM; }
    var tl = gsap.timeline({ repeat: -1, repeatDelay: 1.6, onRepeat: reset });
    lines.forEach(function (l, i) { tl.to(l, { clipPath: 'inset(0 0% 0 0)', duration: .42, ease: 'none' }, .2 + i * .5); });
    var T = .2 + lines.length * .5 + .2;
    tl.to(run, { scale: .9, duration: .1, yoyo: true, repeat: 1 }, T)
      .call(function () { tests[0].classList.add('ok'); }, null, T + .4)
      .call(function () { tests[1].classList.add('ok'); }, null, T + .8)
      .call(function () { tests[2].classList.add('bad'); }, null, T + 1.2)
      .to(mentor, { opacity: 1, y: 0, duration: .5, ease: 'back.out(1.6)' }, T + 1.6)
      .call(function () { fix.classList.add('hl'); fix.innerHTML = '<span class="kw">return</span> n ? sum : 0;'; }, null, T + 2.9)
      .to(run, { scale: .9, duration: .1, yoyo: true, repeat: 1 }, T + 3.7)
      .call(function () { tests[2].classList.remove('bad'); tests[2].classList.add('ok'); }, null, T + 4.1)
      .to(mentor, { opacity: 0, y: 8, duration: .3 }, T + 4.1)
      .to(ok, { opacity: 1, scale: 1, duration: .5, ease: 'back.out(2)' }, T + 4.4);
    burst(confs, tl, T + 4.45, 40, -10);
    tl.to({}, { duration: .6 }, T + 5.4);
    var b = blink($$('.o-eye', owl)); if (b) tl.add(b, 0);
    return tl;
  };

  // 3 · Compete — a live board: submissions land, rows reorder, You climbs
  SCENE[3] = function (sc) {
    var rows = $$('.lb-row', sc), timer = $('.ct-timer', sc), trophy = $('.ct-trophy', sc), confs = $$('.conf', sc);
    var ROW = 56, MAXS = 700;
    var BASE = [
      { solved: 4, t: 2250, s: 420 }, { solved: 4, t: 2410, s: 380 }, { solved: 3, t: 1980, s: 350 },
      { solved: 3, t: 2105, s: 310 }, { solved: 3, t: 2660, s: 290 }
    ];
    var yi = rows.findIndex(function (r) { return r.classList.contains('you'); });
    var st, order;
    var pts = rows.map(function (r) { return $('.lb-sc b', r); }), bars = rows.map(function (r) { return $('.lb-bar u', r); });
    var rks = rows.map(function (r) { return $('.lb-rk', r); }), pips = rows.map(function (r) { return $$('.lb-pips i', r); });
    var times = rows.map(function (r) { return $('.lb-time', r); }), deltas = rows.map(function (r) { return $('.lb-delta', r); });
    function mmss(s) { return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
    function paint(i) {
      pips[i].forEach(function (p, k) { p.classList.toggle('f', k < st[i].solved); });
      times[i].textContent = mmss(st[i].t);
    }
    function rank() { return rows.map(function (_, i) { return i; }).sort(function (a, b) { return st[b].s - st[a].s || st[a].t - st[b].t; }); }
    function layout(instant) {
      var prev = order || rank();
      order = rank();
      order.forEach(function (ri, rk) {
        rks[ri].className = 'lb-rk' + (rk === 0 ? ' g' : rk === 1 ? ' s' : rk === 2 ? ' b' : '');
        $('b', rks[ri]).textContent = rk + 1;
        var moved = prev.indexOf(ri) - rk;      // + = climbed
        if (instant) { gsap.set(rows[ri], { y: rk * ROW }); }
        else {
          gsap.to(rows[ri], { y: rk * ROW, duration: .7, ease: 'power3.inOut' });
          if (moved) {
            deltas[ri].textContent = (moved > 0 ? '▲' : '▼') + Math.abs(moved);
            deltas[ri].className = 'lb-delta ' + (moved > 0 ? 'up' : 'down');
            gsap.fromTo(deltas[ri], { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .3, onComplete: function () { gsap.to(deltas[ri], { opacity: 0, duration: .4, delay: 1.1 }); } });
            gsap.fromTo(rows[ri], { backgroundColor: moved > 0 ? '#EDF9F1' : '#FDF1F0' }, { backgroundColor: ri === yi ? '#FFFBEB' : '#FFFFFF', duration: 1.2, ease: 'power1.out' });
          }
        }
        rows[ri].classList.toggle('lead', ri === yi && rk === 0);
      });
      return order[0] === yi;
    }
    function submit(i, solved, gain, dt) {
      st[i].solved = Math.min(6, st[i].solved + (solved ? 1 : 0)); st[i].t += dt;
      var o = { v: st[i].s }; st[i].s += gain;
      gsap.to(o, { v: st[i].s, duration: .6, ease: 'power2.out', onUpdate: function () { pts[i].textContent = Math.round(o.v); } });
      gsap.to(bars[i], { width: (st[i].s / MAXS * 100) + '%', duration: .7, ease: 'power3.out' });
      paint(i);
      return layout(false);
    }
    function reset() {
      st = BASE.map(function (b) { return { solved: b.solved, t: b.t, s: b.s }; });
      rows.forEach(function (_, i) { pts[i].textContent = st[i].s; gsap.set(bars[i], { width: (st[i].s / MAXS * 100) + '%' }); paint(i); gsap.set(deltas[i], { opacity: 0 }); });
      order = null; layout(true);
      gsap.set(trophy, { opacity: 0, scale: .5 }); gsap.set(confs, { opacity: 0 });
    }
    reset();
    var t = { v: 7198 };
    var tl = gsap.timeline({ repeat: -1, repeatDelay: 1.6, onRepeat: reset });
    tl.call(function () { submit(yi, true, 95, 140); }, null, 1.2)
      .call(function () { submit(4, true, 70, 160); }, null, 2.7)
      .call(function () { submit(yi, true, 115, 150); }, null, 4.2)
      .call(function () { submit(0, false, 30, 90); }, null, 5.5)
      .call(function () { if (submit(yi, true, 130, 170)) gsap.to(trophy, { opacity: 1, scale: 1, duration: .6, ease: 'back.out(2)' }); }, null, 7.0);
    burst(confs, tl, 7.3, 0, 0);
    tl.to(t, { v: 7198 - 11, duration: 11, ease: 'none', onUpdate: function () {
      var s = Math.round(t.v), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
      timer.textContent = [h, m, x].map(function (n) { return String(n).padStart(2, '0'); }).join(':');
    } }, 0);
    var owl = $('.mv-owl', sc); var b = blink($$('.o-eye', owl)); if (b) tl.add(b, 0);
    tl._rows = rows.concat(bars, deltas, [trophy]);
    return tl;
  };

  // 4 · Track — the heatmap rises, the streak counts, the line draws
  SCENE[4] = function (sc) {
    var cells = $$('.tk-grid i', sc), streak = $('.tk-stat b', sc), line = $('.tk-chart .ln', sc), dot = $('.tk-chart .dot', sc);
    var ring = $('.tk-ready .ring .p', sc), pct = $('.tk-ready .ring b', sc);
    var L = line.getTotalLength();
    gsap.set(line, { strokeDasharray: L, strokeDashoffset: L }); gsap.set(ring, { strokeDashoffset: 170 });
    cells.forEach(function (c) { c.style.setProperty('--z', 0); });
    var s = { v: 0 }, pr = { v: 0 }, rp = { v: 0 };
    var tl = gsap.timeline({ repeat: -1, repeatDelay: 1.4 });
    cells.forEach(function (c, i) { var z = +c.dataset.z; if (z) tl.to(c, { '--z': z, duration: .5, ease: 'back.out(1.5)' }, .1 + i * .028); });
    tl.to(s, { v: 12, duration: 2.4, ease: 'power1.inOut', onUpdate: function () { streak.textContent = Math.round(s.v); } }, .3)
      .to(pr, { v: 1, duration: 2.2, ease: 'power1.inOut', onUpdate: function () {
        var p = line.getPointAtLength(pr.v * L); gsap.set(line, { strokeDashoffset: L * (1 - pr.v) }); gsap.set(dot, { attr: { cx: p.x, cy: p.y } });
      } }, 1.0)
      .to(ring, { strokeDashoffset: 170 * (1 - .72), duration: 2.4, ease: 'power1.inOut' }, 1.4)
      .to(rp, { v: 72, duration: 2.4, ease: 'power1.inOut', onUpdate: function () { pct.textContent = Math.round(rp.v) + '%'; } }, 1.4)
      .to({}, { duration: .8 }, 4.0);
    return tl;
  };

  /* ───────── wiring ───────── */
  function buildOnce(root) {
    if (root._built) return;
    root._built = true;
    // the Track heatmap: 12 weeks × 7 days, weighted toward recent weeks
    var grid = $('.tk-grid', root);
    for (var w = 0; w < 12; w++) for (var d = 0; d < 7; d++) {
      var cell = document.createElement('i');
      var r = Math.random() * (0.35 + w / 12);
      var lv = r < .35 ? 0 : r < .6 ? 1 : r < .8 ? 2 : r < .93 ? 3 : 4;
      paintCell(cell, lv); cell.dataset.z = lv * 7; cell.style.setProperty('--z', 0);
      grid.appendChild(cell);
    }
    // the little heatmap on the Track card
    $$('.ht.iso i', root).forEach(function (c) { var lv = Math.floor(rnd(0, 5)); paintCell(c, lv); c.dataset.z = lv * 4; c.style.setProperty('--z', lv); });
    // confetti bits for Practise and Compete
    [$('.pr-side', root), $('.lb-burst', root)].forEach(function (host) {
      if (!host) return;
      for (var i = 0; i < 14; i++) { var k = document.createElement('i'); k.className = 'conf'; host.appendChild(k); }
    });
  }

  function killScene(root) {
    var tl = root._sceneTl;
    if (!tl) return;
    if (tl._rows) gsap.killTweensOf(tl._rows);
    if (tl._vid) { tl._vid.pause(); }
    tl.kill(); root._sceneTl = null;
  }
  function stop(step) {
    var root = step && $('.moves', step);
    if (!root) return;
    if (root._tl) { root._tl.kill(); root._tl = null; }
    killScene(root);
    if (root._onSub) { step.removeEventListener('substep', root._onSub); root._onSub = null; }
  }

  // k is the card, 1–4
  function show(step, k, d) {
    var root = $('.moves', step);
    var cards = $$('.mv-card', root), scs = $$('.sc', root), dots = $$('.mv-dots i', root), say = $('.mv-say', root);
    var prev = root._k == null ? -1 : root._k;
    root._k = k;

    cards.forEach(function (c, i) {
      var on = i + 1 === k;
      c.classList.toggle('on', on);
      var cells = $$('.iso i', c);
      if (cells.length) gsap.to(cells, { '--z': function (idx, el) { return on ? +el.dataset.z : Math.max(1, +el.dataset.z / 4); }, duration: .6, ease: 'back.out(1.4)', stagger: .04 });
    });
    dots.forEach(function (o, i) { o.classList.toggle('on', i + 1 === k); });

    if (say.textContent !== SAY[k]) {
      gsap.to(say, { opacity: 0, y: -4, duration: .18, onComplete: function () { say.textContent = SAY[k]; gsap.fromTo(say, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: .32 }); } });
    }

    killScene(root);
    var nxt = scs[k - 1], old = prev >= 1 ? scs[prev - 1] : null;
    if (old && old !== nxt) {
      gsap.to(old, { opacity: 0, x: -36 * d, rotationY: -7 * d, duration: .3, ease: 'power2.in',
        onComplete: function () { old.classList.remove('on'); gsap.set(old, { clearProps: 'all' }); } });
    }
    nxt.classList.add('on');
    gsap.fromTo(nxt, { opacity: 0, x: 36 * d, rotationY: 7 * d }, { opacity: 1, x: 0, rotationY: 0, duration: .5, ease: 'power3.out', delay: old && old !== nxt ? .22 : 0 });
    root._sceneTl = SCENE[k](nxt);
    if (reduced && root._sceneTl) root._sceneTl.progress(.99).pause();
  }

  // The start state, set the instant the step becomes visible — before the
  // deck's fade-in. Whatever scene was lit when this step was last left is
  // still lit, and the cards still sit at their final positions.
  function prep(step) {
    var root = $('.moves', step);
    if (!root || !global.gsap) return;
    stop(step);
    buildOnce(root);
    root._k = null;
    $$('.sc', root).forEach(function (s) { s.classList.remove('on'); gsap.set(s, { clearProps: 'all' }); });
    if (!reduced) {
      // the cards carry a CSS transition for their hover lift; suspend it so
      // this reset is instant rather than a visible fade-out
      var cards = $$('.mv-card', root);
      cards.forEach(function (c) { c.style.transition = 'none'; });
      gsap.set($$('.mv-head > *', root), { opacity: 0, y: 14 });
      gsap.set(cards, { opacity: 0, y: 26, rotationX: -8 });
      gsap.set($('.mv-stage', root), { opacity: 0, x: 40, rotationY: 8 });
      void root.offsetWidth;
      cards.forEach(function (c) { c.style.transition = ''; });
    }
  }

  function play(step) {
    var root = $('.moves', step);
    if (!root || !global.gsap) return;
    prep(step);

    var cards = $$('.mv-card', root), stage = $('.mv-stage', root), head = $$('.mv-head > *', root);
    if (!reduced) {
      root._tl = gsap.timeline()
        .fromTo(head, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .5, ease: 'power3.out', stagger: .06 }, 0)
        .fromTo(cards, { opacity: 0, y: 26, rotationX: -8 }, { opacity: 1, y: 0, rotationX: 0, duration: .6, ease: 'power3.out', stagger: .08, clearProps: 'transform,opacity' }, .05)
        .fromTo(stage, { opacity: 0, x: 40, rotationY: 8 }, { opacity: 1, x: 0, rotationY: 0, duration: .7, ease: 'power3.out' }, .15);
    }
    show(step, (step._subAt | 0) + 1, 1);

    root._onSub = function (e) { show(step, e.detail.k + 1, e.detail.d); };
    step.addEventListener('substep', root._onSub);

    // clicking a card selects it, through the deck so the arrows stay in sync
    cards.forEach(function (c, i) {
      if (c._wired) return; c._wired = true;
      c.addEventListener('click', function () { if (global.deckSetSub) global.deckSetSub(step, i); });
    });
  }

  global.Moves = { prep: prep, play: play, stop: stop, show: show };
})(window);
