/* desk.js — section 02, The Dashboard.

   A MacBook settles at the centre and the recording plays on its screen
   with the Recordly camera. The dashboard's components — rebuilt in code
   as glass cards — emerge from the screen and take up a slow orbit around
   the laptop: a tilted ring, wide side to side and shallow front to back,
   so a card passes in front of the keyboard at the front, beside the
   laptop at the sides, and behind and above the lid at the back. They
   share one 3D space with the laptop, so the lid really occludes them.
   Each bobs on a travelling wave. Hovering slows the orbit; a pop pauses it.

   Beat 0 is the desk. Beats 1–5 take one card each: it leaves the ring,
   flies to the front as a 3D object, the room blurs behind it, its numbers
   fill in, and a description is typed beside it. The next beat sends it
   back to its place in the ring while the next one comes forward.
   Clicking the blurred room (or Escape) closes the pop without losing the
   place: the next arrow continues from the following card.

   Driven by the deck: Desk.play(step) on arrival, Desk.stop(step) on
   leaving, and a 'substep' event on the step when an arrow moves inside. */
(function (global) {
  'use strict';
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var narrow = function () { return innerWidth <= 1080; };
  var TAU = Math.PI * 2;

  var TEXT = {
    overview: { k: '01 · The ring', h: 'Your Coding Overview',
      say: 'Everything you have solved, learned and are working toward — one ring, one number, all time.',
      li: ['69 solved all-time · 0 this week', 'Easy 37 · Medium 31 · Hard 0 · Labs 0', 'Updates the moment a submission is accepted'] },
    profiles: { k: '02 · Linked profiles', h: 'Your coding profiles, in one place',
      say: 'Link LeetCode, CodeChef and HackerRank once. What you solve there counts here.',
      li: ['LeetCode · 25 solved · 13 easy · 12 medium', 'CodeChef · rating stars and contests', 'HackerRank · skill badges in C, C++, Python, Java, SQL'] },
    courses: { k: '03 · All courses', h: 'All Courses Combined',
      say: 'Every course you are enrolled in, added up — how much you have read, watched and solved.',
      li: ['Articles 65 / 381 · Videos 5 / 239 · Labs 0 / 29', 'Easy 24 · Medium 19 · Hard 0 from the course sets', 'One bar per kind, so the gaps are obvious'] },
    heat: { k: '04 · The heatmap', h: 'A year of solving, one square a day',
      say: 'Every accepted problem lands here — from Owl Coder, LeetCode or CodeChef — and the streak builds.',
      li: ['Last month 6 · last week 0', 'Five shades, from none to many', 'Scrolls back a full year'] },
    links: { k: '05 · Connect', h: 'GitHub and LinkedIn, linked',
      say: 'Two marks sit beside your overview. Add your GitHub and LinkedIn once; edit them from the pencil whenever they change.',
      li: ['GitHub · your repositories beside your solves', 'LinkedIn · the profile trainers and companies see', 'One click to open, one pencil to update'] }
  };
  var ORDER = ['overview', 'profiles', 'courses', 'heat', 'links'];
  var LV = [['#E9F6EC','#CFE3D6','#DCEBE1'], ['#BFE8CC','#8FC6A2','#A8D7B7'], ['#7FD39B','#4FA76C','#66BD82'], ['#3CB371','#237F4C','#2F9A5F'], ['#15893F','#0B5D2C','#11733A']];
  var C = 2 * Math.PI * 48;   // the overview ring

  // the orbit: an ellipse around the laptop, seen from a little above
  var ORB = { rx: .36, ry: .27, rz: 380, period: 36, lean: 20, cx: .5, cy: .45 };

  function layout(desk) {
    var W = desk.clientWidth || innerWidth, H = desk.clientHeight || innerHeight;
    var mw = Math.min(900, W * 0.46, (H - 150) / 0.76);
    mw = Math.max(400, Math.round(mw));
    desk.style.setProperty('--mw', mw + 'px');
    desk.style.setProperty('--k', (mw / 800).toFixed(3));
    return mw;
  }

  function buildOnce(desk) {
    if (desk._built) return;
    desk._built = true;
    var host = $('.mac-view', desk);
    if (global.Recordly && host) {
      global.Recordly.load(host, 'assets/video/desk-dashboard.mp4', 'assets/video/desk-dashboard.cues.json',
        { autoplay: false, pad: 0, bg: '#F6F8F7', loop: true, poster: 'assets/img/desk-dashboard-poster.jpg' })
        .then(function (r) { desk._rly = r; if (desk._wantPlay) r.play(); });
    }
    var kb = $('.mac-keys', desk);
    if (kb) {
      var rows = [14, 14, 14, 13, 12].map(function (n) { return '<div class="kr">' + new Array(n + 1).join('<i></i>') + '</div>'; });
      rows.push('<div class="kr"><i></i><i></i><i></i><i class="w"></i><i class="sp"></i><i class="w"></i><i></i><i></i><i></i></div>');
      kb.innerHTML = rows.join('');
    }
    $$('.tile3d', desk).forEach(function (t) {
      for (var i = 0; i < 10; i++) { var ly = document.createElement('i'); ly.className = 'ly'; ly.style.setProperty('--i', i); t.insertBefore(ly, t.firstChild); }
    });
    // each card's thickness: six rounded layers behind the face
    $$('.fc', desk).forEach(function (fc) {
      var face = $('.face', fc);
      for (var i = 6; i >= 1; i--) { var ly = document.createElement('i'); ly.className = 'ly'; ly.style.setProperty('--li', i); fc.insertBefore(ly, face); }
    });
    var grid = $('.hm3', desk);
    if (grid) for (var w = 0; w < 16; w++) for (var d = 0; d < 7; d++) {
      var c = document.createElement('i');
      var r = Math.random() * (0.25 + w / 16);
      var lv = r < .42 ? 0 : r < .66 ? 1 : r < .84 ? 2 : r < .95 ? 3 : 4;
      c.style.setProperty('--c', LV[lv][0]); c.style.setProperty('--cd', LV[lv][1]); c.style.setProperty('--cm', LV[lv][2]);
      c.dataset.lv = lv; c.dataset.z = lv ? 4 + lv * 4 : 0; c.style.setProperty('--z', 0);
      grid.appendChild(c);
    }
  }

  /* ───────── each component's fill-in, run when it pops ───────── */
  function count(tl, el, to, dur, at) {
    var o = { v: 0 };
    tl.to(o, { v: to, duration: dur, ease: 'power2.out', onUpdate: function () { el.textContent = Math.round(o.v); } }, at);
  }
  var ANIM = {
    overview: function (card) {
      var easy = $('.a.easy', card), med = $('.a.med', card), tl = gsap.timeline(), o = { e: 0 };
      tl.to(o, { e: 1, duration: 1.5, ease: 'power3.out', onUpdate: function () {
        easy.setAttribute('stroke-dasharray', (C * .536 * o.e) + ' ' + C);
        med.setAttribute('stroke-dasharray', (C * .449 * o.e) + ' ' + C); med.setAttribute('stroke-dashoffset', -C * .536 * o.e);
      } }, 0);
      $$('[data-n]', card).forEach(function (n, i) { count(tl, n, +n.dataset.n, 1.2, .1 + i * .08); });
      return tl;
    },
    profiles: function (card) {
      var tl = gsap.timeline();
      tl.fromTo($$('.pf li', card), { x: -18, opacity: 0 }, { x: 0, opacity: 1, duration: .55, ease: 'power3.out', stagger: .14 }, 0)
        .fromTo($$('.pf-c s', card), { scale: .5, opacity: 0 }, { scale: 1, opacity: 1, duration: .4, ease: 'back.out(2)', stagger: .06 }, .5);
      $$('[data-n]', card).forEach(function (n, i) { count(tl, n, +n.dataset.n, 1.0, .25 + i * .14); });
      return tl;
    },
    courses: function (card) {
      var tl = gsap.timeline();
      tl.fromTo($$('.cs-l u', card), { scaleX: 0 }, { scaleX: 1, duration: .9, ease: 'power3.out', stagger: .1 }, .05);
      $$('[data-n]', card).forEach(function (n, i) { count(tl, n, +n.dataset.n, .9, .05 + i * .1); });
      return tl;
    },
    heat: function (card) {
      var cells = $$('.hm3 i', card), lit = cells.filter(function (c) { return +c.dataset.lv > 0; }), tl = gsap.timeline();
      cells.forEach(function (c) { c.classList.add('off'); c.style.setProperty('--z', 0); });
      for (var i = lit.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = lit[i]; lit[i] = lit[j]; lit[j] = t; }
      lit.forEach(function (c, i) {
        var at = .1 + i * .035;
        tl.call(function () { c.classList.remove('off'); }, null, at);
        tl.to(c, { '--z': +c.dataset.z, duration: .5, ease: 'back.out(1.8)' }, at);
      });
      $$('[data-n]', card).forEach(function (n) { count(tl, n, +n.dataset.n, 2.0, .2); });
      return tl;
    },
    links: function (card) {
      var tiles = $$('.tile3d', card), tl = gsap.timeline();
      tl.fromTo(tiles, { rotationY: -90, opacity: 0 }, { rotationY: -24, opacity: 1, duration: .8, ease: 'back.out(1.4)', stagger: .15 }, 0)
        .fromTo($$('.ln-l li', card), { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: 'power3.out', stagger: .12 }, .5)
        .to(tiles, { rotationY: 24, rotationX: -8, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: .2 }, 1.2);
      return tl;
    }
  };
  function restCard(card, key) {
    if (key === 'overview') {
      var easy = $('.a.easy', card), med = $('.a.med', card);
      easy.setAttribute('stroke-dasharray', (C * .536) + ' ' + C); med.setAttribute('stroke-dasharray', (C * .449) + ' ' + C); med.setAttribute('stroke-dashoffset', -C * .536);
    }
    if (key === 'heat') $$('.hm3 i', card).forEach(function (c) { c.classList.remove('off'); c.style.setProperty('--z', 0); });
    gsap.set($$('.pf li, .pf-c s, .cs-l u, .ln-l li, .tile3d', card), { clearProps: 'all' });
    $$('[data-n]', card).forEach(function (n) { n.textContent = n.dataset.n; });
  }

  /* ───────── typing ───────── */
  function typeInto(el, text, speed, tl, at) {
    el.textContent = '';
    var caret = document.createElement('i'); caret.className = 'caret';
    var n = text.length, o = { i: 0 };
    tl.add(function () { el.textContent = ''; el.appendChild(caret); }, at);
    tl.to(o, { i: n, duration: n / speed, ease: 'none', onUpdate: function () { el.textContent = text.slice(0, Math.round(o.i)); el.appendChild(caret); } }, at);
    tl.add(function () { if (caret.parentNode) caret.parentNode.removeChild(caret); }, at + n / speed + .05);
    return at + n / speed + .15;
  }

  /* ───────── the orbit ───────── */
  // where a card sits for an angle; 0 is the front (low, near), π the back (high, far)
  function orbitAt(desk, th) {
    var W = desk.clientWidth, H = desk.clientHeight, s = Math.sin(th), c = Math.cos(th);
    return { x: W * ORB.rx * s, y: H * ORB.ry * c, z: ORB.rz * c, ry: -s * ORB.lean, dim: (1 - c) / 2 };
  }
  function baseScale(desk) { return .64 * (+getComputedStyle(desk).getPropertyValue('--k') || 1); }

  function startOrbit(desk, slots) {
    var o = desk._orb = { t: 0, w: 0, speed: 1, target: 1 };
    var W = desk.clientWidth, H = desk.clientHeight, s0 = baseScale(desk);
    var ex = 0, ey = -H * .07, ez = -220;   // where the screen is, relative to the ring's centre
    slots.forEach(function (s, i) { s._e = s._e == null ? 0 : s._e; s._i = i; });
    desk._tick = function () {
      var dt = gsap.ticker.deltaRatio(60) / 60;
      o.speed += (o.target - o.speed) * Math.min(1, dt * 3);
      o.t += dt * o.speed; o.w += dt;
      slots.forEach(function (s) {
        if (s._out) return;
        var th = (o.t / ORB.period) * TAU + s._i * (TAU / slots.length) + Math.PI * .5;
        var p = orbitAt(desk, th), e = s._e, ie = 1 - e;
        var wave = Math.sin(o.w * 1.3 + s._i * 1.25) * 11 * e;
        gsap.set(s, { x: p.x * e + ex * ie, y: p.y * e + ey * ie + wave, z: p.z * e + ez * ie, rotationY: p.ry * e,
          scale: s0 * (.22 + .78 * e), opacity: e * (1 - p.dim * .42), xPercent: -50, yPercent: -50 });
      });
    };
    gsap.ticker.add(desk._tick);
  }
  function stopOrbit(desk) {
    if (desk._tick) { gsap.ticker.remove(desk._tick); desk._tick = null; }
  }
  function orbitSpeed(desk, v) { if (desk._orb) desk._orb.target = v; }

  // big, like an object picked up, tilted toward the reader
  var TILT = { overview: [-9, 5], profiles: [-8, 4], courses: [-9, 5], heat: [-14, 18], links: [-8, 6] };
  function popPose(desk, card, key) {
    var W = desk.clientWidth, H = desk.clientHeight, W0 = card.offsetWidth, H0 = card.offsetHeight;
    var s = Math.min(1.55, (W * .5) / W0, (H * .74) / H0), t = TILT[key] || [-9, 5];
    // x, y relative to the ring's centre, which is where the pop layer's cards are anchored
    return { x: W * .06 + W0 * s / 2 - W * ORB.cx, y: H * .47 - H * ORB.cy, s: s, ry: t[0], rx: t[1], tx: W * .06 + W0 * s + 40 };
  }

  /* The stage can change width without the window ever changing size: the
     rail collapses, present mode arrives, fullscreen comes and goes. Two
     things in this scene do not follow by themselves. The orbit reads the
     room on every tick, so the ring is fine — but the laptop's size is a CSS
     variable written once, and an opened card's pose (and the column of type
     beside it, which is placed from the card's right edge) was computed from
     the room as it was when the card popped. Left alone, the card sits over
     its own description. */
  function seat(desk) {
    if (!desk._built || !desk._cards) return;
    layout(desk);
    var key = desk._open;
    if (!key) return;
    var card = desk._cards[key], pl = $('.desk-pop', desk);
    if (!card || card.parentNode !== pl) return;
    if (desk._popTl) { desk._popTl.kill(); desk._popTl = null; }
    gsap.killTweensOf(card);
    var p = desk._popBase = popPose(desk, card, key);
    gsap.set(card, { xPercent: -50, yPercent: -50, x: p.x, y: p.y, z: 0, scale: p.s,
      rotationY: p.ry, rotationX: p.rx, opacity: 1, '--dk': 1 });
    gsap.set($('.shine', card), { opacity: 0 });
    gsap.set($('.desk-veil', desk), { opacity: 1, visibility: 'visible' });
    $('.desk-text', desk).style.setProperty('--tx', p.tx + 'px');
    // the fill-in is started from inside the pop timeline we just killed
    if (desk._animKey !== key) {
      if (desk._anim) desk._anim.kill();
      desk._anim = ANIM[key](card); desk._animKey = key;
      if (reduced) desk._anim.progress(1);
    }
  }

  /* ───────── the pop ───────── */
  // Put every card that is not in its slot straight back, except the ones
  // named. A killed flight leaves a card stranded in the pop layer with its
  // slot marked as taken; this is what makes fast arrows safe.
  function settleAll(desk, keep) {
    keep = keep || [];
    ORDER.forEach(function (key) {
      var slot = $('.s-' + key, desk), card = desk._cards && desk._cards[key];
      if (!slot || !card) return;
      if (keep.indexOf(key) >= 0) return;
      gsap.killTweensOf(card);
      if (card.parentNode !== slot) { slot.appendChild(card); gsap.set(card, { clearProps: 'all' }); restCard(card, key); }
      slot._out = false;
    });
  }
  function pop(desk, key) {
    var slot = $('.s-' + key, desk), card = desk._cards[key], pl = $('.desk-pop', desk);
    if (narrow()) {
      pl.appendChild(card);
      return gsap.fromTo(card, { opacity: 0, scale: .9 }, { opacity: 1, scale: 1, duration: .5, ease: 'back.out(1.3)' });
    }
    orbitSpeed(desk, 0);
    slot._out = true;
    // start from wherever the card is right now — in its slot, or mid-flight home
    var src = card.parentNode === pl ? card : slot;
    gsap.killTweensOf(card);
    var cur = { x: gsap.getProperty(src, 'x'), y: gsap.getProperty(src, 'y'), z: gsap.getProperty(src, 'z'),
      ry: gsap.getProperty(src, 'rotationY'), s: gsap.getProperty(src, 'scale'), o: gsap.getProperty(src, 'opacity') };
    pl.appendChild(card);
    gsap.set(card, { xPercent: -50, yPercent: -50, x: cur.x, y: cur.y, z: cur.z, rotationY: cur.ry, rotationX: 0, scale: cur.s, opacity: cur.o, transformOrigin: '50% 50%', '--dk': 0 });
    var p = popPose(desk, card, key);
    desk._popBase = p;
    var tl = gsap.timeline();
    tl.to(card, { x: p.x, y: p.y, duration: .85, ease: 'power3.inOut' }, 0)
      .to(card, { scale: p.s, opacity: 1, duration: .85, ease: 'back.out(1.15)' }, 0)
      .to(card, { rotationY: p.ry, rotationX: p.rx, duration: .85, ease: 'power2.out' }, 0)
      .to(card, { z: 160, duration: .45, ease: 'sine.out' }, 0)
      .to(card, { z: 0, duration: .45, ease: 'sine.in' }, .45)
      .to(card, { '--dk': 1, duration: .6, ease: 'power2.out' }, .2)
      .fromTo($('.shine', card), { opacity: 1, x: '-55%' }, { x: '55%', duration: 1.1, ease: 'power2.inOut' }, .35)
      .to($('.shine', card), { opacity: 0, duration: .2 }, 1.4);
    $('.desk-text', desk).style.setProperty('--tx', p.tx + 'px');
    return tl;
  }
  function unpop(desk, key, instant) {
    var slot = $('.s-' + key, desk), card = desk._cards[key];
    if (!card || card.parentNode === slot) return gsap.timeline();
    if (desk._anim) { desk._anim.kill(); desk._anim = null; }
    var home = function () {
      slot.appendChild(card); gsap.set(card, { clearProps: 'all' }); restCard(card, key); slot._out = false;
      if (!desk._open) orbitSpeed(desk, 1);
    };
    if (instant || narrow()) {
      if (instant) { home(); return gsap.timeline(); }
      return gsap.to(card, { opacity: 0, scale: .92, duration: .3, onComplete: home });
    }
    // the slot kept its place in the (paused) ring; fly back to it
    var to = { x: gsap.getProperty(slot, 'x'), y: gsap.getProperty(slot, 'y'), z: gsap.getProperty(slot, 'z'),
      ry: gsap.getProperty(slot, 'rotationY'), s: gsap.getProperty(slot, 'scale'), o: gsap.getProperty(slot, 'opacity') };
    var tl = gsap.timeline({ onComplete: home });
    tl.to(card, { x: to.x, y: to.y, scale: to.s, opacity: to.o, rotationY: to.ry, rotationX: 0, duration: .75, ease: 'power3.inOut' }, 0)
      .to(card, { '--dk': 0, duration: .4, ease: 'power2.in' }, 0)
      .to(card, { z: Math.max(to.z, 0) + 120, duration: .38, ease: 'sine.out' }, 0)
      .to(card, { z: to.z, duration: .37, ease: 'sine.in' }, .38);
    return tl;
  }

  function paintDots(desk, pos, open) {
    $$('.desk-count i', desk).forEach(function (o, i) {
      o.classList.toggle('on', open ? i === pos : i === 0 && pos === 0);
      o.classList.toggle('at', !open && pos > 0 && i === pos);
    });
  }

  function show(step, k, d) {
    var desk = $('.desk', step);
    var veil = $('.desk-veil', desk), text = $('.desk-text', desk), hint = $('.desk-hint', desk);
    var was = desk._open;
    if (desk._popTl) { desk._popTl.kill(); desk._popTl = null; }
    if (desk._typeTl) { desk._typeTl.kill(); desk._typeTl = null; }
    // anything else still in flight goes home at once; only the card leaving
    // and the card arriving are allowed to be out of the ring
    settleAll(desk, [was, k > 0 ? ORDER[k - 1] : null]);
    var tl = gsap.timeline();
    desk._popTl = tl;

    if (k === 0) {
      desk._open = null;
      if (was) tl.add(unpop(desk, was), 0); else orbitSpeed(desk, 1);
      tl.to(veil, { opacity: 0, duration: .5, onComplete: function () { veil.style.visibility = 'hidden'; } }, 0)
        .to(text, { opacity: 0, duration: .3, onComplete: function () { text.style.visibility = 'hidden'; } }, 0);
      hint.innerHTML = (step._subAt | 0) > 0 ? 'Press <kbd>→</kbd> to continue · click a card to open it' : 'Press <kbd>→</kbd> to open each component · hover to slow the orbit';
      tl.to(hint, { opacity: 1, duration: .4 }, .3);
      paintDots(desk, step._subAt | 0, false);
      return;
    }

    var key = ORDER[k - 1], T = TEXT[key];
    if (was === key) return;
    desk._open = key;
    paintDots(desk, k, true);
    veil.style.visibility = 'visible';
    tl.to(veil, { opacity: 1, duration: .5 }, 0).to(hint, { opacity: 0, duration: .2 }, 0);
    if (was) tl.add(unpop(desk, was), 0);
    tl.add(pop(desk, key), was ? .08 : 0);
    tl.add(function () { if (desk._anim) desk._anim.kill(); desk._anim = ANIM[key](desk._cards[key]); desk._animKey = key; if (reduced) desk._anim.progress(1); }, .4);

    var kick = $('.kick', text), h = $('h3', text), say = $('.say', text), lis = $$('li', text);
    text.style.visibility = 'visible';
    kick.textContent = T.k; h.textContent = ''; say.textContent = ''; lis.forEach(function (li) { li.textContent = ''; });
    gsap.set(text, { opacity: 0, y: 10, yPercent: -50 });
    var ty = gsap.timeline();
    desk._typeTl = ty;
    ty.to(text, { opacity: 1, y: 0, duration: .4, ease: 'power2.out' }, .5);
    var at = typeInto(h, T.h, 34, ty, .6);
    at = typeInto(say, T.say, 46, ty, at);
    T.li.forEach(function (s, i) { at = typeInto(lis[i], s, 60, ty, at + .05); });
    if (reduced) ty.progress(1);
  }

  function closePop(step) { var desk = $('.desk', step); if (desk._open) show(step, 0, -1); }
  function openCard(step, k) { step._subAt = k; step.dataset.sub = k; show(step, k, 1); }

  /* ───────── entrance / exit ───────── */
  function stop(step) {
    var desk = step && $('.desk', step);
    if (!desk) return;
    desk._wantPlay = false;
    if (desk._rly) desk._rly.pause();
    stopOrbit(desk);
    ['_tl', '_popTl', '_typeTl', '_anim', '_sway', '_waves'].forEach(function (n) { if (desk[n]) { desk[n].kill(); desk[n] = null; } });
    if (desk._onSub) { step.removeEventListener('substep', desk._onSub); desk._onSub = null; }
    if (desk._onMove) { removeEventListener('mousemove', desk._onMove); desk._onMove = null; }
    if (desk._onKey) { removeEventListener('keydown', desk._onKey); desk._onKey = null; }
    desk._open = null; desk._animKey = null;
    settleAll(desk);
    gsap.set($('.desk-veil', desk), { opacity: 0, visibility: 'hidden' });
    gsap.set($('.desk-text', desk), { opacity: 0, visibility: 'hidden' });
  }

  // The start state, set the instant the step becomes visible — before the
  // deck's fade-in — so no frame ever shows the raw layout or a stale orbit.
  function prep(step) {
    var desk = $('.desk', step);
    if (!desk || !global.gsap) return null;
    stop(step);
    buildOnce(desk);
    desk._cards = {};
    var slots = ORDER.map(function (k) { var s = $('.s-' + k, desk); s.dataset.key = k; desk._cards[k] = $('.fc', s); restCard(desk._cards[k], k); s._out = false; s._e = 0; return s; });
    desk._open = null;
    layout(desk);
    var h = { slots: slots, stage: $('.desk-stage', desk), mac: $('.mac', desk), lid: $('.mac-lid', desk), off: $('.mac-off', desk),
      waves: $$('.desk-waves i', desk), veil: $('.desk-veil', desk), text: $('.desk-text', desk), hint: $('.desk-hint', desk) };
    gsap.set(h.veil, { opacity: 0, visibility: 'hidden' }); gsap.set(h.text, { opacity: 0, visibility: 'hidden', yPercent: -50 }); gsap.set(h.hint, { opacity: 0 });
    gsap.set(h.stage, { rotationX: 4, rotationY: 0 });
    gsap.set(h.mac, { xPercent: -50, yPercent: -50 });
    if (reduced || narrow()) {
      gsap.set(h.lid, { rotationX: -8 }); gsap.set(h.mac, { y: 0, opacity: 1 }); gsap.set(h.off, { opacity: 0 });
    } else {
      // laptop lowered and dark; cards folded inside the screen, invisible
      gsap.set(h.mac, { y: 70, opacity: 0 }); gsap.set(h.lid, { rotationX: -34 }); gsap.set(h.off, { opacity: 1 });
      gsap.set(slots, { xPercent: -50, yPercent: -50, x: 0, y: -desk.clientHeight * .07, z: -220, scale: baseScale(desk) * .22, rotationY: 0, rotation: 0, opacity: 0 });
    }
    if (!desk._onResize) {
      desk._onResize = function () { seat(desk); };
      addEventListener('resize', desk._onResize);
    }
    desk._h = h;
    return h;
  }

  function play(step) {
    var desk = $('.desk', step);
    if (!desk || !global.gsap) return;
    var h = desk._h || prep(step);
    desk._h = null;
    var slots = h.slots, stage = h.stage, mac = h.mac, lid = h.lid, off = h.off, waves = h.waves, veil = h.veil, text = h.text, hint = h.hint;
    var k = step._subAt | 0;
    desk._wantPlay = true;
    if (desk._rly) desk._rly.play();

    if (reduced || narrow()) {
      if (!narrow()) { slots.forEach(function (s) { s._e = 1; }); startOrbit(desk, slots); if (reduced) desk._orb.target = 0; desk._tick(); }
      show(step, k, 1);
    } else {
      startOrbit(desk, slots);
      var tl = gsap.timeline();
      desk._tl = tl;
      tl.fromTo(mac, { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: .9, ease: 'power3.out' }, 0)
        .fromTo(lid, { rotationX: -34 }, { rotationX: -8, duration: 1.2, ease: 'power3.out' }, .1)
        .to(off, { opacity: 0, duration: .6, ease: 'power2.out' }, .55);
      // the cards come out of the screen and take their places in the ring
      slots.forEach(function (s, i) { tl.to(s, { _e: 1, duration: 1.3, ease: 'power3.out' }, 1.0 + i * .12); });
      // open whatever the position is by now — the reader may have pressed → during the entrance
      tl.add(function () {
        var cur = step._subAt | 0, want = cur ? ORDER[cur - 1] : null;
        if (desk._open !== want) show(step, cur, 1);
      }, k > 0 ? 2.1 : 2.0);
      var wv = gsap.timeline({ repeat: -1 });
      waves.forEach(function (w, i) { wv.fromTo(w, { scale: .3, opacity: .55 }, { scale: 1.55, opacity: 0, duration: 5.5, ease: 'sine.out' }, i * 1.8); });
      wv.to({}, { duration: 5.4 }, 0);
      desk._waves = wv;
      desk._sway = gsap.to(stage, { rotationY: 2, duration: 8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    }

    if (!reduced && !narrow()) {
      var qx = gsap.quickTo(stage, 'rotationY', { duration: 1.1, ease: 'power2.out' }), qy = gsap.quickTo(stage, 'rotationX', { duration: 1.1, ease: 'power2.out' });
      desk._onMove = function (e) {
        var nx = (e.clientX / innerWidth - .5) * 2, ny = (e.clientY / innerHeight - .5) * 2;
        if (!desk._open) { qx(nx * 3); qy(4 - ny * 2); return; }
        var card = desk._cards[desk._open];
        if (!card || !desk._popBase) return;
        gsap.to(card, { rotationY: desk._popBase.ry + nx * 8, rotationX: desk._popBase.rx - ny * 6, duration: .7, ease: 'power2.out', overwrite: 'auto' });
      };
      addEventListener('mousemove', desk._onMove, { passive: true });
    }
    desk._onKey = function (e) { if (e.key === 'Escape') closePop(step); };
    addEventListener('keydown', desk._onKey);
    desk._onSub = function (e) { show(step, e.detail.k, e.detail.d); };
    step.addEventListener('substep', desk._onSub);

    if (!veil._wired) { veil._wired = true; veil.addEventListener('click', function () { closePop(step); }); }
    slots.forEach(function (s, i) {
      if (s._wired) return; s._wired = true;
      s.addEventListener('click', function () { openCard(step, i + 1); });
      s.addEventListener('mouseenter', function () { if (!desk._open) orbitSpeed(desk, .12); });
      s.addEventListener('mouseleave', function () { if (!desk._open) orbitSpeed(desk, 1); });
    });
  }

  global.Desk = { prep: prep, play: play, stop: stop, show: show, close: closePop };
})(window);
