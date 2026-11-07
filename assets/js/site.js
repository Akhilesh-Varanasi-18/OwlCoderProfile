/* ══════════════════════════════════════════════════════════════════
   OWL CODER — the walkthrough
   A deck. Arrows walk the steps, the counter moves between sections,
   and the rail opens to show where inside a section you are.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ═══════ 1 · THE OWL ═══════ */
  var tpl = $('#owlTpl');
  var SRC = tpl && tpl.content && tpl.content.querySelector('.o-bird');
  if (SRC) $$('.owl').forEach(function (s) { s.appendChild(SRC.cloneNode(true)); });

  function blinkEyes(eyes, min, max) {
    if (!eyes.length || reduced) return;
    (function loop() {
      gsap.timeline({ onComplete: function () { gsap.delayedCall(min + Math.random() * (max - min), loop); } })
        .to(eyes, { scaleY: 0.08, duration: 0.24, ease: 'power2.in' })
        .to(eyes, { scaleY: 1, duration: 0.4, ease: 'back.out(2.2)' }, '+=0.12');
    })();
  }
  function owlLife(svg, delay) {
    if (!svg || reduced) return;
    var bird = $('.o-bird', svg);
    if (bird) gsap.to(bird, { y: -6, rotation: 1.4, duration: 3.4, ease: 'sine.inOut',
      yoyo: true, repeat: -1, transformOrigin: '50% 96%' });
    gsap.delayedCall(delay || 1.2, function () { blinkEyes($$('.o-eye', svg), 2.4, 6); });
  }

  /* The watcher. It never moves on its own; it is placed by the step,
     and it blinks on a long, irregular cycle so you notice it once. */
  var watch = $('#watch');
  blinkEyes($$('.w-eye', watch), 5, 13);

  // The pupils follow the pointer, so the owl looks at whoever is looking.
  // Left alone for a few seconds, they settle back to centre.
  var looks = $$('.w-look', watch);
  if (looks.length && !reduced) {
    var lookTimer;
    addEventListener('mousemove', function (e) {
      looks.forEach(function (lk) {
        var r = lk.parentNode.querySelector('.w-disc').getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        var d = Math.hypot(dx, dy) || 1, m = Math.min(1, d / 600) * 30;
        gsap.to(lk, { x: dx / d * m, y: dy / d * m, duration: .5, ease: 'power2.out', overwrite: 'auto' });
      });
      clearTimeout(lookTimer);
      lookTimer = setTimeout(function () { gsap.to(looks, { x: 0, y: 0, duration: 1.2, ease: 'power2.inOut' }); }, 3500);
    }, { passive: true });
  }
  var WATCH_POS = {
    'Opening':         'p-bl',
    'The Dashboard':   'p-left',
    'Courses':         'p-right',
    'Practise':        'p-low',
    'AI Mentor':       'p-left',
    'Reports':         'p-right',
    'Coding Contest':  'p-top',
    'Admin Panel':     'p-left',
    'Close':           'p-right'
  };

  /* ═══════ 2 · BUILD THE DECK ═══════ */
  var steps = $$('.step');
  var stage = $('#stage');
  var railNav = $('#railNav');
  var dkNow = $('#dkNow'), dkAll = $('#dkAll'), dkBar = $('#dkBar');
  var goLbl = $('#dkPresent') && $('#dkPresent').querySelector('span');

  // one line icon per section, 24-unit grid, drawn with the current colour
  var ICON = {
    'Opening':        'M5 21V4m0 0h11l-2 4 2 4H5',
    'The Dashboard':  'M4 4h7v7H4zM13 4h7v4h-7zM13 11h7v9h-7zM4 14h7v6H4z',
    'Courses':        'M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 0-2 2zM5 4v18M9 8h6',
    'Practise':       'M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16',
    'AI Mentor':      'M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2zM19 3v3M20.5 4.5h-3',
    'Reports':        'M4 20h16M7 16v-5M12 16V7M17 16v-9',
    'Coding Contest': 'M7 4h10v4a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 3M17 6h3a3 3 0 0 1-3 3M12 13v4M8 21h8M10 17h4',
    'Admin Panel':    'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8',
    // the way in, not an arrow: a door with the step through it
    'Get started':    'M14 3h5a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-5M3 12h11M10.5 8l4 4-4 4'
  };
  var FALLBACK_ICON = 'M12 3l9 9-9 9-9-9z';

  // group the steps into sections; act dividers belong to no section
  var secs = [], bySec = {};
  steps.forEach(function (el, i) {
    if (el.dataset.act) return;
    var n = el.dataset.sec;
    if (!bySec[n]) { bySec[n] = { name: n, steps: [] }; secs.push(bySec[n]); }
    bySec[n].steps.push(i);
  });
  if (dkAll) dkAll.textContent = String(secs.length).padStart(2, '0');

  // render the rail
  secs.forEach(function (sec, si) {
    var row = document.createElement('div');
    row.className = 'rn-sec';
    row.dataset.sec = si;
    row.dataset.name = sec.name;
    row.innerHTML = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="' + (ICON[sec.name] || FALLBACK_ICON) + '"/></svg>' +
      '<span class="lb">' + sec.name + '</span>' +
      '<span class="nm">' + String(si + 1).padStart(2, '0') + '</span>';
    row.addEventListener('click', function () { go(sec.steps[0]); });
    railNav.appendChild(row);

    var wrap = document.createElement('div');
    wrap.className = 'rn-steps';
    wrap.dataset.sec = si;
    sec.steps.forEach(function (idx) {
      var s = document.createElement('div');
      s.className = 'rn-step';
      s.dataset.idx = idx;
      s.innerHTML = '<i></i><span>' + steps[idx].dataset.label + '</span>';
      s.addEventListener('click', function () { go(idx); });
      wrap.appendChild(s);
    });
    railNav.appendChild(wrap);
  });
  var railSecs = $$('.rn-sec', railNav), railWraps = $$('.rn-steps', railNav), railSteps = $$('.rn-step', railNav);

  /* A rail along the bottom of each slide, naming every step in its
     section. You can see how far through a section you are without
     having to look left. */
  secs.forEach(function (sec) {
    if (sec.steps.length < 2) return;
    sec.steps.forEach(function (idx, pos) {
      var bar = document.createElement('div');
      bar.className = 'steprail';
      var inner = document.createElement('div');
      inner.className = 'sr-in';
      sec.steps.forEach(function (o, k) {
        var it = document.createElement('div');
        it.className = 'sr-i' + (k === pos ? ' on' : '');
        it.innerHTML = '<i></i><span>' + steps[o].dataset.label + '</span>';
        it.addEventListener('click', function () { go(o); });
        inner.appendChild(it);
      });
      bar.appendChild(inner);
      steps[idx].appendChild(bar);
    });
  });

  /* ═══════ 3 · NAVIGATION ═══════ */
  var at = -1, busy = false, busySince = 0, pending = 0;
  /* A step change sets the scene's start pose now and runs its entrance half
     a second later. A scene re-seated inside that gap would jump straight to
     its settled pose and then play the entrance on top of it — a flash. So a
     stage change arriving in that window is held, and delivered once play()
     has run. */
  var changing = false, missedSize = false, sentW = 0, sentH = 0;
  function stageBox() { var s = $('.stage'); return s ? s.getBoundingClientRect() : null; }
  /* Re-seating a scene costs it a whole repaint — 40 to 70ms in the heavier
     rooms — so it is worth never asking twice for the same width. Every
     resize, this one or the window's own, records the box the scenes have
     just been laid out for; a stage change that matches it is dropped. */
  function markSized() { var r = stageBox(); if (r) { sentW = r.width; sentH = r.height; } }
  addEventListener('resize', markSized);
  function fireStageSize(force) {
    if (changing) { missedSize = true; return; }
    if (!force) {
      var r = stageBox();
      if (r && Math.abs(r.width - sentW) < 1 && Math.abs(r.height - sentH) < 1) return;
    }
    missedSize = false;
    dispatchEvent(new Event('resize'));
  }
  // the lock is held for half a second per step change; a press made while it is held is
  // remembered and runs when it lifts, and a lock older than two seconds is treated as stale
  function locked() { if (busy && performance.now() - busySince > 1200) busy = false; return busy; }
  function release() { busy = false; if (pending) { var d = pending; pending = 0; if (d > 0) next(); else prev(); } }

  function secOf(i) {
    // `at` is -1 until the first step opens, and the stage can be measured
    // before that — a resize then asked for the section of step -1 and threw
    if (i < 0 || i >= steps.length || !steps[i]) return -1;
    var n = steps[i].dataset.sec;
    for (var k = 0; k < secs.length; k++) if (secs[k].name === n) return k;
    return -1;
  }

  function paintRail(i) {
    var si = secOf(i);
    railSecs.forEach(function (r, k) { r.classList.toggle('on', k === si); });
    railWraps.forEach(function (w, k) {
      var open = k === si;
      w.style.height = open ? (w.scrollHeight + 'px') : '0px';
    });
    railSteps.forEach(function (s) { s.classList.toggle('on', +s.dataset.idx === i); });
  }

  function go(i, dir) {
    i = clamp(i, 0, steps.length - 1);
    if (i === at || locked()) return;
    var prev = at;
    at = i;
    changing = true;
    busy = true; busySince = performance.now(); pending = 0;

    var cur = steps[i], old = prev >= 0 ? steps[prev] : null;
    var d = dir || (prev < 0 ? 1 : (i > prev ? 1 : -1));
    // the lock lifts on a timer taken out NOW, before any scene code runs: whatever happens
    // below, the arrows are live again half a second later
    setTimeout(release, old ? 500 : 200);

    if (old) {
      try {
        if (window.Assembly) Assembly.stop(old);
        if (window.Moves) Moves.stop(old);
        if (window.Wall) Wall.stop(old);
        if (window.Desk) Desk.stop(old);
        if (window.Courses) Courses.stop(old);
        if (window.Practise) Practise.stop(old);
        if (window.Mentor) Mentor.stop(old);
        if (window.Reports) Reports.stop(old);
        if (window.Arena) Arena.stop(old);
        if (window.House) House.stop(old);
        if (window.Admin) Admin.stop(old);
        if (window.Close) Close.stop(old);
      } catch (err) { console.error('[deck] a scene failed to stop', err); }
      gsap.killTweensOf(old);
      gsap.to(old, { opacity: 0, duration: .3, ease: 'power2.in',
        onComplete: function () { if (old !== steps[at]) { old.classList.remove('on'); gsap.set(old, { clearProps: 'opacity' }); } } });
    }
    gsap.killTweensOf(cur);
    cur.classList.add('on');
    // only an explicit step back (the arrow) lands on the last beat; the
    // rail and any other jump open a step at its first
    cur._subAt = dir === -1 ? subsOf(cur) : 0;
    cur.dataset.sub = cur._subAt;
    // Scenes set their start state NOW, before the fade-in begins. play()
    // only runs half a second later; without this, that half second shows
    // the raw layout (or a stale end state) of whatever the step holds.
    try {
      if ($('.asm', cur) && window.Assembly && Assembly.prep) Assembly.prep(cur);
      if ($('.moves', cur) && window.Moves && Moves.prep) Moves.prep(cur);
      if ($('.wall', cur) && window.Wall && Wall.prep) Wall.prep(cur);
      if ($('.desk', cur) && window.Desk && Desk.prep) Desk.prep(cur);
      if ($('.crs', cur) && window.Courses && Courses.prep) Courses.prep(cur);
      if ($('.prac', cur) && window.Practise && Practise.prep) Practise.prep(cur, old);
      if ($('.mentor', cur) && window.Mentor && Mentor.prep) Mentor.prep(cur);
      if ($('.reports', cur) && window.Reports && Reports.prep) Reports.prep(cur);
      if ($('.arena', cur) && window.Arena && Arena.prep) Arena.prep(cur);
      if ($('.house', cur) && window.House && House.prep) House.prep(cur);
      if ($('.admin', cur) && window.Admin && Admin.prep) Admin.prep(cur);
      if ($('.close', cur) && window.Close && Close.prep) Close.prep(cur);
    } catch (err) { console.error('[deck] a scene failed to prepare', err); }
    if (reduced) { gsap.set(cur, { opacity: 1 }); }
    else {
      gsap.fromTo(cur, { opacity: 0 }, { opacity: 1, duration: .45, ease: 'power2.out', delay: old ? .18 : 0 });
      gsap.fromTo($$('.st-copy > *, .sh > *, .act-in > *', cur),
        { opacity: 0, y: 18 * d },
        { opacity: 1, y: 0, duration: .6, ease: 'power3.out', stagger: .055, delay: old ? .2 : .1 });
      gsap.fromTo($$('.rig', cur).filter(function (r) { return !r.closest('.asm'); }), { opacity: 0, y: 30, rotationX: 8 },
        { opacity: 1, y: 0, rotationX: 0, duration: .85, ease: 'power3.out', delay: old ? .24 : .14 });
    }

    // the watcher takes its position from the section
    var pos = steps[i].dataset.act ? 'p-act' : (steps[i].dataset.watch || WATCH_POS[steps[i].dataset.sec] || 'p-right');
    watch.className = 'watch ' + pos;

    if (!steps[i].dataset.act) {
      var si = secOf(i);
      if (dkNow) dkNow.textContent = String(si + 1).padStart(2, '0');
      paintRail(i);
    }
    if (dkBar) dkBar.style.width = ((i / (steps.length - 1)) * 100).toFixed(2) + '%';

    gsap.delayedCall(old ? .55 : .3, function () {
      changing = false;
      play(cur);
      if (missedSize) fireStageSize(true);
    });
  }

  /* Sub-steps: a step with data-subs="N" is walked N times by the arrows
     before the deck moves on. The step hears a 'substep' event each time. */
  function subsOf(s) { return +s.dataset.subs || 0; }
  function setSub(step, k, d) {
    step._subAt = k;
    step.dataset.sub = k;
    step.dispatchEvent(new CustomEvent('substep', { detail: { k: k, d: d } }));
  }
  function next() {
    var cur = steps[at];
    if (locked()) { pending = 1; return; }
    if (cur && (cur._subAt | 0) < subsOf(cur)) { setSub(cur, (cur._subAt | 0) + 1, 1); return; }
    go(at + 1, 1);
  }
  function prev() {
    var cur = steps[at];
    if (locked()) { pending = -1; return; }
    if (cur && (cur._subAt | 0) > 0) { setSub(cur, (cur._subAt | 0) - 1, -1); return; }
    go(at - 1, -1);
  }
  window.deckSetSub = function (step, k) {
    if (steps[at] !== step || locked()) return;
    k = clamp(k, 0, subsOf(step));
    if (k !== (step._subAt | 0)) setSub(step, k, k > (step._subAt | 0) ? 1 : -1);
  };

  $('#dkNext').addEventListener('click', next);
  $('#dkPrev').addEventListener('click', prev);
  $('.rail-brand').addEventListener('click', function (e) { e.preventDefault(); go(0); });

  addEventListener('error', function (e) {
    try { var log = JSON.parse(sessionStorage.getItem('owl-errors') || '[]'); log.push(new Date().toISOString() + ' ' + (e.message || e.type) + ' @ ' + (e.filename || '').split('/').pop() + ':' + (e.lineno || '')); sessionStorage.setItem('owl-errors', JSON.stringify(log.slice(-20))); } catch (x) {}
  });
  // The deck is driven from the keyboard, so the handler runs in the CAPTURE phase and is
  // bound to both window and document: nothing downstream can swallow a press, and a host
  // that delivers key events to only one of the two still reaches us. The guard flag stops
  // the pair from acting twice on the same press.
  function onKey(e) {
    if (e.defaultPrevented || e._deck) return;
    var t = e.target;
    if (t && t.closest && t.closest('input, textarea, [contenteditable]')) return;
    var k = e.key;
    if (!k) return;
    var hit = true;
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === ' ' || k === 'Spacebar') next();
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp') prev();
    else if (k === 'Home') go(0);
    else if (k === 'End') go(steps.length - 1);
    else if (k.toLowerCase() === 'f') toggleFS();
    else hit = false;
    if (hit) { e._deck = true; keyLog.push(k); if (keyLog.length > 12) keyLog.shift(); e.preventDefault(); }
  }
  var keyLog = [];
  addEventListener('keydown', onKey, true);
  document.addEventListener('keydown', onKey, true);

  // An embedded preview panel only forwards key events once the page itself holds focus,
  // and a clicked deck button keeps focus so Space would re-fire it. One press fixes both.
  addEventListener('pointerdown', function () {
    try { if (!document.hasFocus()) window.focus(); } catch (e) {}
  }, true);
  addEventListener('pointerup', function (e) {
    var a = document.activeElement;
    if (a && a !== document.body && a.blur && a.closest && a.closest('.deck, .rail')) a.blur();
  }, true);

  // one line to paste back if the arrows ever look dead
  window.deckDiag = function () {
    return { at: at, sub: steps[at] ? (steps[at]._subAt | 0) : null, busy: busy, pending: pending,
      sinceLock: Math.round(performance.now() - busySince), hasFocus: document.hasFocus(),
      focus: document.activeElement ? document.activeElement.tagName : null, keysSeen: keyLog.slice(),
      errors: (function () { try { return JSON.parse(sessionStorage.getItem('owl-errors') || '[]'); } catch (e) { return 'n/a'; } })() };
  };

  // wheel and swipe both step, never scroll
  var wheelLock = 0;
  addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaY) < 8) return;
    var now = performance.now();
    if (now < wheelLock) return;
    wheelLock = now + 620;
    if (e.deltaY > 0) next(); else prev();
  }, { passive: true });

  var touchY = null;
  addEventListener('touchstart', function (e) { touchY = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchend', function (e) {
    if (touchY === null) return;
    var dy = touchY - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 50) { if (dy > 0) next(); else prev(); }
    touchY = null;
  }, { passive: true });

  /* ═══════ 4 · SHELL ═══════ */
  // The rail starts collapsed on a desktop; on a narrow screen it is an
  // overlay instead, so the collapsed styling must not apply there.
  if (innerWidth <= 1080) document.body.classList.remove('rail-min');
  $('#railTog').addEventListener('click', function () {
    if (innerWidth <= 1080) document.body.classList.toggle('rail-open');
    else {
      document.body.classList.toggle('rail-min');
      setTimeout(function () { paintRail(at); }, 460);
    }
  });
  function toggleFS() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(function () {});
  }
  $('#dkFull').addEventListener('click', toggleFS);
  $('#dkPresent').addEventListener('click', function () {
    var on = document.body.classList.toggle('present');
    if (goLbl) goLbl.textContent = on ? 'Exit' : 'Present';
    if (on) { document.documentElement.requestFullscreen().catch(function () {}); go(0); }
    else if (document.fullscreenElement) document.exitFullscreen();
  });
  document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement && document.body.classList.contains('present')) {
      document.body.classList.remove('present');
      if (goLbl) goLbl.textContent = 'Present';
    }
  });

  /* ═══════ 5 · WHAT EACH STEP DOES ON ARRIVAL ═══════
     The one idea the deck is built on: pieces of the screen lift out of
     the glass toward the reader. Everything else is per-step.          */
  function liftPops(root) {
    var pops = $$('.pop', root);
    if (!pops.length) return;
    gsap.killTweensOf(pops);
    if (reduced) { pops.forEach(function (p) { gsap.set(p, { z: +p.dataset.z || 0, opacity: 1, scale: 1, y: 0 }); }); return; }
    gsap.set(pops, { z: 0, opacity: 0, scale: .88, y: 14 });
    var tl = gsap.timeline();
    tl.to(pops, { z: function (i, t) { return +t.dataset.z || 70; },
      opacity: 1, scale: 1, y: 0, duration: .85, ease: 'back.out(1.5)', stagger: .1 });
    pops.forEach(function (p, i) {
      tl.to(p, { y: '+=6', duration: 2.6 + i * .3, ease: 'sine.inOut', yoyo: true, repeat: -1 }, '>-0.25');
    });
  }

  var LV = [
    { c: '#EDF5EF', d: '#DCE8E0', m: '#E5EFE8', z: 0 },
    { c: '#BFE3CB', d: '#95C0A4', m: '#A9D2B7', z: 7 },
    { c: '#6CC78E', d: '#4C9F6C', m: '#5BB37D', z: 16 },
    { c: '#15893F', d: '#0D6A2E', m: '#117A36', z: 27 },
    { c: '#0B5D2C', d: '#064320', m: '#085026', z: 38 }
  ];
  function level(i, n) {
    var r = Math.random(), hot = (i > n * .64 && i < n * .8) || (i > n * .36 && i < n * .43);
    if (hot) return r > .7 ? 4 : r > .46 ? 3 : r > .2 ? 2 : 1;
    return r > .94 ? 2 : r > .85 ? 1 : 0;
  }
  var flatHeat = null, isoCells = null;
  (function buildHeat() {
    var el = $('#hmFlat');
    if (el) {
      var h = '';
      flatHeat = [];
      for (var i = 0; i < 364; i++) { var L = level(i, 364); flatHeat.push(L); h += '<i class="' + (L ? 'l' + L : '') + '"></i>'; }
      el.innerHTML = h;
    }
    var iso = $('#iso');
    if (iso) {
      var g = '';
      isoCells = [];
      for (var k = 0; k < 322; k++) {
        var L2 = level(k, 322); isoCells.push(L2);
        var v = LV[L2];
        g += '<i style="--c:' + v.c + ';--cd:' + v.d + ';--cm:' + v.m + ';--z:0"></i>';
      }
      iso.innerHTML = g;
    }
  })();

  function extrude(iso) {
    var nodes = $$('i', iso);
    nodes.forEach(function (n, k) {
      var z = LV[isoCells[k]].z;
      if (!z) return;
      if (reduced) { n.style.setProperty('--z', z); return; }
      var o = { v: 0 };
      gsap.to(o, { v: z, duration: .6, ease: 'back.out(2)', delay: Math.floor(k / 7) * 0.011,
        onUpdate: function () { n.style.setProperty('--z', o.v.toFixed(1)); } });
    });
  }

  /* the editor types its own solution */
  var CODE = [
    [['ck', '#include'], ['', ' '], ['cs', '<bits/stdc++.h>']],
    [['ck', 'using namespace'], ['', ' std;']],
    [],
    [['ck', 'int'], ['', ' '], ['cf', 'main'], ['', '() {']],
    [['', '  '], ['ck', 'int'], ['', ' n, m; cin >> n >> m;']],
    [['', '  vector<vector<'], ['ck', 'int'], ['', '>> a(n, vector<'], ['ck', 'int'], ['', '>(m));']],
    [['', '  '], ['ck', 'for'], ['', ' (auto &r : a) '], ['ck', 'for'], ['', ' (auto &v : r) cin >> v;']],
    [],
    [['', '  '], ['ck', 'int'], ['', ' sum = '], ['cn', '0'], ['', ';']],
    [['', '  '], ['ck', 'for'], ['', ' ('], ['ck', 'int'], ['', ' i = '], ['cn', '0'], ['', '; i < n; i++)']],
    [['', '    '], ['ck', 'for'], ['', ' ('], ['ck', 'int'], ['', ' j = '], ['cn', '0'], ['', '; j < m; j++)']],
    [['', '      '], ['ck', 'if'], ['', ' (i == '], ['cn', '0'], ['', ' || i == n-'], ['cn', '1'], ['', ' || j == '], ['cn', '0'], ['', ' || j == m-'], ['cn', '1'], ['', ')']],
    [['', '        sum += a[i][j];']],
    [],
    [['', '  cout << sum;']],
    [['', '}']]
  ];
  var CH = [];
  CODE.forEach(function (ln, i) {
    ln.forEach(function (t) { for (var k = 0; k < t[1].length; k++) CH.push([t[0], t[1][k]]); });
    if (i < CODE.length - 1) CH.push(['', '\n']);
  });
  function paintCode(n) {
    var out = '', cls = null, buf = '';
    function flush() {
      if (!buf) return;
      var s = buf.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      out += cls ? '<span class="' + cls + '">' + s + '</span>' : s;
      buf = '';
    }
    for (var i = 0; i < n && i < CH.length; i++) {
      if (CH[i][0] !== cls) { flush(); cls = CH[i][0]; }
      buf += CH[i][1];
    }
    flush();
    return out;
  }
  var typeTimer = null;
  function typeCode(code, sub, after) {
    clearInterval(typeTimer);
    if (reduced) { code.innerHTML = paintCode(CH.length); code.classList.add('done'); if (sub) sub.classList.add('hot'); if (after) after(); return; }
    code.classList.remove('done');
    code.innerHTML = '';
    if (sub) sub.classList.remove('hot');
    var n = 0;
    typeTimer = setInterval(function () {
      n += 4 + Math.floor(Math.random() * 5);
      code.innerHTML = paintCode(n);
      if (n < CH.length) return;
      clearInterval(typeTimer);
      code.classList.add('done');
      setTimeout(function () { if (sub) sub.classList.add('hot'); }, 300);
      if (after) setTimeout(after, 420);
    }, 24);
  }

  var cdTimer = null;
  function runCountdown(root) {
    clearInterval(cdTimer);
    var h = $('#cdH', root), m = $('#cdM', root), s = $('#cdS', root);
    if (!h || reduced) return;
    var left = 18 * 3600 + 42 * 60 + 3;
    cdTimer = setInterval(function () {
      if (--left < 0) left = 18 * 3600 + 42 * 60 + 3;
      h.textContent = String(Math.floor(left / 3600)).padStart(2, '0');
      m.textContent = String(Math.floor(left / 60) % 60).padStart(2, '0');
      s.textContent = String(left % 60).padStart(2, '0');
    }, 1000);
  }

  function play(step) {
    // the deck may already have moved on in the half second before this fires
    if (step !== steps[at]) return;
    clearInterval(cdTimer);
    clearInterval(typeTimer);

    try {
      if ($('.asm', step) && window.Assembly) Assembly.play(step);
      if ($('.moves', step) && window.Moves) Moves.play(step);
      if ($('.wall', step) && window.Wall) Wall.play(step);
      if ($('.desk', step) && window.Desk) Desk.play(step);
      if ($('.crs', step) && window.Courses) Courses.play(step);
      if ($('.prac', step) && window.Practise) Practise.play(step);
      if ($('.mentor', step) && window.Mentor) Mentor.play(step);
      if ($('.reports', step) && window.Reports) Reports.play(step);
      if ($('.arena', step) && window.Arena) Arena.play(step);
      if ($('.house', step) && window.House) House.play(step);
      if ($('.admin', step) && window.Admin) Admin.play(step);
      if ($('.close', step) && window.Close) Close.play(step);
    } catch (err) { console.error('[deck] a scene failed to play', err); }

    var code = $('#code', step);
    if (code) {
      typeCode(code, $('#subBtn', step), function () { liftPops(step); });
    } else {
      liftPops(step);
    }

    var iso = $('#iso', step);
    if (iso) gsap.delayedCall(.5, function () { extrude(iso); });

    var pod = $('.podium', step);
    if (pod && !reduced) {
      var pds = $$('.pd', pod);
      gsap.set(pds, { scaleY: 0, transformOrigin: 'bottom' });
      gsap.to(pds, { scaleY: 1, duration: .7, ease: 'back.out(1.6)', stagger: .11, delay: 1 });
    }

    if ($('.cd', step)) runCountdown(step);

    var peek = $('.peeker', step);
    if (peek && !reduced) {
      gsap.fromTo(peek, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: .9, ease: 'back.out(1.5)', delay: .7 });
      blinkEyes($$('.o-eye', peek), 2, 5);
    }
  }

  /* ═══════ 6 · BOOT ═══════ */
  (function boot() {
    var bootEl = $('#boot'), fill = $('#bootFill'), pct = { v: 0 };
    document.body.classList.add('lock');

    function open() {
      document.body.classList.remove('lock');
      bootEl.classList.add('gone');
      go(0);
      owlLife($('.rail-owl'), 2.4);
      owlLife($('#ctaOwl'), 1.6);
    }
    if (reduced) { open(); return; }

    owlLife($('.boot-owl'), .5);
    gsap.from('.boot-owl', { opacity: 0, scale: .72, y: 18, duration: .85, ease: 'back.out(1.7)' });
    gsap.to(pct, { v: 100, duration: 1.7, ease: 'power1.inOut',
      onUpdate: function () { if (fill) fill.style.width = pct.v + '%'; } });

    var done = false;
    function run() { if (done) return; done = true; open(); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(run, 1500); });
    setTimeout(run, 2600);
  })();

  var winW = innerWidth, winH = innerHeight;
  addEventListener('resize', function () {
    if (innerWidth <= 1080) document.body.classList.remove('rail-min');
    // the stage fires this event too, every frame the rail slides; the rail's
    // own paint reads scrollHeight on every section and is not worth a frame
    if (innerWidth === winW && innerHeight === winH) return;
    winW = innerWidth; winH = innerHeight;
    paintRail(at);
  });

  /* The rail collapses and expands, present mode hides it, and fullscreen
     comes and goes — every one of those changes the width of the stage while
     the window stays exactly the same size. A scene that only listens for
     'resize' therefore keeps the geometry it was laid out with and sits at the
     wrong width until something else nudges it: recordings at the old size,
     a wall of badges still spaced for the other rail.

     Rather than teach ten scenes about the rail, one observer on the stage
     turns any change of its box into the event they all already understand.

     It fires on every frame of the slide, not at the end of it. A scene that
     only hears about its new width once the rail has stopped moving sits at
     the old size for the whole .45s and then jumps — which reads as a stall,
     not as a resize. The observer is already throttled to one call per frame
     by the browser, and dispatching from inside it means the scene re-lays-out
     in the same frame the stage moved, so the two travel together. A trailing
     call catches the last sub-pixel after the transition settles.

     This is safe from a loop: .stage is "position: fixed; inset: 0" with only
     its 'left' driven by the rail, so nothing a scene writes to its own
     children can change the box we are observing. */
  (function watchStage() {
    var st = $('.stage');
    if (!st || !window.ResizeObserver) return;
    var w = 0, h = 0, t = 0;
    new ResizeObserver(function (en) {
      var r = en[0].contentRect;
      if (Math.abs(r.width - w) < 1 && Math.abs(r.height - h) < 1) return;
      w = r.width; h = r.height;
      fireStageSize();
      clearTimeout(t);
      t = setTimeout(fireStageSize, 90);
    }).observe(st);
  })();
})();
