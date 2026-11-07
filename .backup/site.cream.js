/* ══════════════════════════════════════════════════════════════════
   OWL CODER — presentation choreography
   Eleven slides, eleven different mechanics. Nothing is shared
   between sections except the shell: sidebar, deck controls, owl.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  gsap.registerPlugin(ScrollTrigger);

  /* ════════════════ 1 · SMOOTH SCROLL ════════════════ */
  var lenis = null;
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, touchMultiplier: 1.6, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function goTo(el) {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.2 });
    else el.scrollIntoView({ behavior: 'smooth' });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var el = document.getElementById(a.getAttribute('href').slice(1));
    if (!el) return;
    e.preventDefault();
    goTo(el);
    document.body.classList.remove('side-open');
  });

  /* ════════════════ 2 · SHELL: sidebar + deck ════════════════ */
  var slides = $$('.slide');
  var navLinks = $$('.side-nav a');
  var now = $('#dk-now'), all = $('#dk-all'), bar = $('#dk-bar i'), nameTag = $('#dk-name');
  var presentLbl = $('#dk-present') && $('#dk-present').querySelector('span');
  var at = -1;

  if (all) all.textContent = String(slides.length).padStart(2, '0');

  $('#side-toggle').addEventListener('click', function () {
    if (innerWidth <= 1080) document.body.classList.toggle('side-open');
    else document.body.classList.toggle('side-min');
    setTimeout(function () { ScrollTrigger.refresh(); }, 520);
  });

  function setSlide(i) {
    i = clamp(i, 0, slides.length - 1);
    if (i === at) return;
    at = i;
    if (now) now.textContent = String(i + 1).padStart(2, '0');
    navLinks.forEach(function (a, k) { a.classList.toggle('on', k === i); });
    if (nameTag) {
      nameTag.textContent = slides[i].dataset.name || '';
      nameTag.classList.add('show');
      clearTimeout(nameTag._t);
      nameTag._t = setTimeout(function () { nameTag.classList.remove('show'); }, 1700);
    }
  }

  $('#dk-prev').addEventListener('click', function () { goTo(slides[clamp(at - 1, 0, slides.length - 1)]); });
  $('#dk-next').addEventListener('click', function () { goTo(slides[clamp(at + 1, 0, slides.length - 1)]); });

  function toggleFS() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(function () {});
  }
  $('#dk-full').addEventListener('click', toggleFS);

  $('#dk-present').addEventListener('click', function () {
    var on = document.body.classList.toggle('present');
    if (presentLbl) presentLbl.textContent = on ? 'Exit' : 'Present';
    if (on) {
      document.documentElement.requestFullscreen().catch(function () {});
      goTo(slides[0]);
    } else if (document.fullscreenElement) document.exitFullscreen();
    setTimeout(function () { ScrollTrigger.refresh(); }, 580);
  });
  document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement && document.body.classList.contains('present')) {
      document.body.classList.remove('present');
      if (presentLbl) presentLbl.textContent = 'Present';
      setTimeout(function () { ScrollTrigger.refresh(); }, 580);
    }
  });

  addEventListener('keydown', function (e) {
    // the event can target the document or the window, which have no closest()
    var t = e.target;
    if (t && t.closest && t.closest('input, textarea, [contenteditable]')) return;
    var k = e.key;
    if (k === 'ArrowDown' || k === 'ArrowRight' || k === 'PageDown' || k === ' ') {
      e.preventDefault(); goTo(slides[clamp(at + 1, 0, slides.length - 1)]);
    } else if (k === 'ArrowUp' || k === 'ArrowLeft' || k === 'PageUp') {
      e.preventDefault(); goTo(slides[clamp(at - 1, 0, slides.length - 1)]);
    } else if (k === 'Home') { e.preventDefault(); goTo(slides[0]); }
    else if (k === 'End') { e.preventDefault(); goTo(slides[slides.length - 1]); }
    else if (k.toLowerCase && k.toLowerCase() === 'f') toggleFS();
  });

  slides.forEach(function (s, i) {
    ScrollTrigger.create({
      trigger: s, start: 'top 55%', end: 'bottom 45%',
      onEnter: function () { setSlide(i); },
      onEnterBack: function () { setSlide(i); }
    });
  });
  setSlide(0);

  (function progress() {
    function paint() {
      var doc = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.width = (doc > 0 ? clamp(scrollY / doc, 0, 1) * 100 : 0).toFixed(2) + '%';
      requestAnimationFrame(paint);
    }
    requestAnimationFrame(paint);
  })();

  /* ════════════════ 3 · THE OWL ════════════════
     Drawn on, then it lives: a slow weight shift and a slow gold
     blink. The blink is the whole personality, so it is deliberate —
     a long close, a beat, a long open — never a twitch.             */
  function drawOwl(svg, dur) {
    var tl = gsap.timeline();
    if (!svg) return tl;
    var lines = $$('.ln', svg);
    lines.forEach(function (p) {
      var L = 0;
      try { L = p.getTotalLength(); } catch (e) {}
      if (!L) return;
      p.style.strokeDasharray = L;
      p.style.strokeDashoffset = L;
    });
    var fills = $$('.wing, .iris, .pupil, .spark, .beak', svg);
    gsap.set(fills, { opacity: 0 });
    tl.to(lines, { strokeDashoffset: 0, duration: dur || 1.4, ease: 'power2.inOut', stagger: 0.03 }, 0)
      .to(fills, { opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.02 }, (dur || 1.4) * 0.45);
    return tl;
  }

  function owlLife(svg) {
    if (!svg || reduced) return;
    var eyes = $$('.eye', svg), glows = $$('.glow', svg), bird = $('.o-bird', svg);

    if (bird) {
      gsap.to(bird, { rotation: 1.5, y: -5, duration: 4.4, ease: 'sine.inOut',
        yoyo: true, repeat: -1, transformOrigin: '50% 94%' });
    }
    if (!eyes.length) return;

    function blink() {
      gsap.timeline({ onComplete: function () { gsap.delayedCall(2.6 + Math.random() * 4, blink); } })
        .to(eyes,  { scaleY: 0.06, duration: 0.34, ease: 'power2.in',  stagger: 0.04 })
        .to(eyes,  { scaleY: 1,    duration: 0.48, ease: 'power2.out', stagger: 0.04 }, '+=0.1')
        .fromTo(glows, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.48')
        .to(glows, { opacity: 0, duration: 1.2, ease: 'power2.in' });
    }
    gsap.delayedCall(1.5, blink);
  }

  /* The closing slide shows the same bird. Cloning the node (rather
     than <use>-ing it) keeps it inside the normal cascade, so it picks
     up the stroke, the gradients and the blink like the original. */
  (function mirrorOwl() {
    var src = $('#owl-src'), two = $('#owl2');
    if (!src || !two) return;
    var copy = src.cloneNode(true);
    copy.removeAttribute('id');
    $$('[id]', copy).forEach(function (n) { n.removeAttribute('id'); });
    two.appendChild(copy);
  })();

  /* ════════════════ 4 · SLIDE 01 · hero heatmap ════════════════ */
  (function heroHeat() {
    var el = $('#hm-hero');
    if (!el) return;
    var h = '';
    for (var i = 0; i < 364; i++) {
      var r = Math.random();
      var hot = (i > 250 && i < 302) || (i > 150 && i < 174);
      var c = '';
      if (hot) c = r > .72 ? 'l4' : r > .48 ? 'l3' : r > .22 ? 'l2' : 'l1';
      else if (r > .955) c = 'l2'; else if (r > .9) c = 'l1';
      h += '<i class="' + c + '"></i>';
    }
    el.innerHTML = h;
  })();

  /* ════════════════ 5 · SLIDE 02 · the tangle ════════════════
     Wires run from each chip to the middle with a lazy sag, so the
     mess reads as cabling rather than a neat star. Scrolling pulls
     the chips in and the single mark resolves.                     */
  (function tangle() {
    var box = $('#tangle'), svg = $('#tgWires');
    if (!box || !svg) return;
    var chips = $$('.tg-chip', box), core = $('.tg-core', box);

    function build() {
      var W = 1000, H = 440, d = '';
      chips.forEach(function (c, i) {
        var x = parseFloat(c.style.getPropertyValue('--x')) / 100 * W;
        var y = parseFloat(c.style.getPropertyValue('--y')) / 100 * H;
        var sag = 58 + (i % 3) * 36;
        var mx = (x + W / 2) / 2 + (i % 2 ? 44 : -44);
        var my = (y + H / 2) / 2 + sag;
        d += 'M' + x.toFixed(0) + ' ' + y.toFixed(0) +
             'Q' + mx.toFixed(0) + ' ' + my.toFixed(0) + ' ' + (W / 2) + ' ' + (H / 2) + ' ';
      });
      svg.innerHTML = '<path d="' + d + '"/>';
    }
    build();
    addEventListener('resize', build);

    if (reduced) { gsap.set(core, { opacity: 1, scale: 1 }); return; }

    // layout-relative, so it does not depend on where the page is scrolled
    function dx(t) { return box.offsetWidth / 2 - t.offsetLeft - t.offsetWidth / 2; }
    function dy(t) { return box.offsetHeight / 2 - t.offsetTop - t.offsetHeight / 2; }

    var tl = gsap.timeline({ paused: true });
    tl.set(chips, { x: 0, y: 0, scale: 1, opacity: 1 })
      .set(svg, { opacity: 1 })
      .set(core, { opacity: 0, scale: .82 })
      .from(chips, { opacity: 0, scale: .6, duration: .5, ease: 'back.out(1.6)',
                     stagger: { each: .05, from: 'random' } })
      .to({}, { duration: 1.15 })                       // hold: let the mess read
      .to(chips, { x: dx, y: dy, scale: .45, opacity: 0, duration: .95, ease: 'power2.in',
                   stagger: { each: .04, from: 'random' } })
      .to(svg, { opacity: 0, duration: .55, ease: 'power2.in' }, '<')
      .to(core, { opacity: 1, scale: 1, duration: .6, ease: 'back.out(1.7)' }, '-=.28');

    ScrollTrigger.create({ trigger: box, start: 'top 70%',
      onEnter: function () { tl.restart(); }, onEnterBack: function () { tl.restart(); } });
  })();

  /* ════════════════ 6 · SLIDE 03 · the roadmap ════════════════
     The road inks itself as you scroll, and each stop lands only once
     the ink has reached it.                                          */
  (function roadmap() {
    var road = $('#road'), ink = $('#road-ink');
    if (!road || !ink) return;
    var stops = $$('.stop', road), L = 0;
    try { L = ink.getTotalLength(); } catch (e) {}
    gsap.set(ink, { strokeDasharray: L, strokeDashoffset: reduced ? 0 : L });
    if (reduced) { gsap.set(stops, { opacity: 1, y: 0, scale: 1 }); return; }

    var tl = gsap.timeline({ paused: true });
    tl.set(ink, { strokeDashoffset: L })
      .set(stops, { opacity: 0, y: 16, scale: .9 })
      .to(ink, { strokeDashoffset: 0, duration: 2.4, ease: 'power1.inOut' }, 0);
    stops.forEach(function (s, i) {
      tl.to(s, { opacity: 1, y: 0, scale: 1, duration: .45, ease: 'back.out(2)' }, 0.34 + i * 0.4);
    });

    ScrollTrigger.create({ trigger: road, start: 'top 68%',
      onEnter: function () { tl.restart(); }, onEnterBack: function () { tl.restart(); } });
  })();

  /* ════════════════ 7 · SLIDE 04 · the 3D deck + ladder ════════════════
     Four course cards sit in a fanned pile and deal apart in Z as the
     slide arrives. Hovering a card brings it forward out of the pile. */
  (function deck3d() {
    var box = $('#deck3d');
    if (!box) return;
    var cards = $$('.dk3', box), N = cards.length;

    function pose(i, s) {
      var t = i - (N - 1) / 2;
      return { x: t * 26 * s, y: t * -16 * s, z: -i * 60 * s,
               rotationY: t * -9 * s, rotationZ: t * 2.6 * s };
    }
    cards.forEach(function (c, i) {
      var p = pose(i, .25);
      gsap.set(c, { xPercent: -50, yPercent: -50, opacity: 0, zIndex: N - i,
                    x: p.x, y: p.y, z: p.z, rotationY: p.rotationY, rotationZ: p.rotationZ });
    });

    gsap.timeline({ scrollTrigger: { trigger: box, start: 'top 76%', once: true } })
      .to(cards, { opacity: 1, duration: .4, stagger: .07 }, 0)
      .to(cards, {
        x: function (i) { return pose(i, 1).x; },
        y: function (i) { return pose(i, 1).y; },
        z: function (i) { return pose(i, 1).z; },
        rotationY: function (i) { return pose(i, 1).rotationY; },
        rotationZ: function (i) { return pose(i, 1).rotationZ; },
        duration: 1, ease: 'power3.out', stagger: .07
      }, .05);

    cards.forEach(function (c, i) {
      c.addEventListener('mouseenter', function () {
        gsap.to(c, { z: 100, rotationY: 0, rotationZ: 0, duration: .5, ease: 'power3.out', zIndex: 99 });
      });
      c.addEventListener('mouseleave', function () {
        var p = pose(i, 1);
        gsap.to(c, { z: p.z, rotationY: p.rotationY, rotationZ: p.rotationZ,
                     duration: .6, ease: 'power3.out', zIndex: N - i });
      });
    });

    gsap.to($$('#ladder .rung'), { opacity: 1, y: 0, duration: .7, ease: 'power3.out', stagger: .08,
      scrollTrigger: { trigger: '#ladder', start: 'top 88%', once: true } });
  })();

  /* ════════════════ 8 · SLIDE 05 · the hologram ════════════════ */
  var CODE = [
    [['c-k', '#include'], ['', ' '], ['c-s', '<bits/stdc++.h>']],
    [['c-k', 'using namespace'], ['', ' std;']],
    [],
    [['c-k', 'int'], ['', ' '], ['c-f', 'main'], ['', '() {']],
    [['', '  '], ['c-k', 'int'], ['', ' n, m; cin >> n >> m;']],
    [['', '  vector<vector<'], ['c-k', 'int'], ['', '>> a(n, vector<'], ['c-k', 'int'], ['', '>(m));']],
    [['', '  '], ['c-k', 'for'], ['', ' (auto &r : a) '], ['c-k', 'for'], ['', ' (auto &v : r) cin >> v;']],
    [],
    [['', '  '], ['c-k', 'int'], ['', ' sum = '], ['c-n', '0'], ['', ';']],
    [['', '  '], ['c-k', 'for'], ['', ' ('], ['c-k', 'int'], ['', ' i = '], ['c-n', '0'], ['', '; i < n; i++)']],
    [['', '    '], ['c-k', 'for'], ['', ' ('], ['c-k', 'int'], ['', ' j = '], ['c-n', '0'], ['', '; j < m; j++)']],
    [['', '      '], ['c-k', 'if'], ['', ' (i == '], ['c-n', '0'], ['', ' || i == n-'], ['c-n', '1'], ['', ' || j == '], ['c-n', '0'], ['', ' || j == m-'], ['c-n', '1'], ['', ')']],
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

  (function hologram() {
    var wrap = $('#holoWrap'), code = $('#holoCode');
    if (!wrap || !code) return;
    var sub = $('#hrSub'), pass = $('#holoPass'), rows = $$('.holo-cases tr[data-case]');
    var orbit = $('#orbit'), running = false, timer = null;

    function markPass(r) { r.classList.add('pass'); r.querySelector('.rs').textContent = 'pass'; }

    if (reduced) {
      code.innerHTML = paintCode(CH.length);
      code.classList.add('done');
      rows.forEach(markPass);
      if (sub) sub.classList.add('hot');
      if (pass) pass.classList.add('on');
      return;
    }

    function run() {
      if (running) return;
      running = true;
      code.classList.remove('done');
      code.innerHTML = '';
      rows.forEach(function (r) { r.classList.remove('pass'); r.querySelector('.rs').textContent = '·'; });
      if (sub) sub.classList.remove('hot');
      if (pass) pass.classList.remove('on');

      var n = 0;
      clearInterval(timer);
      timer = setInterval(function () {
        n += 4 + Math.floor(Math.random() * 5);
        code.innerHTML = paintCode(n);
        if (n < CH.length) return;
        clearInterval(timer);
        code.classList.add('done');
        if (sub) setTimeout(function () { sub.classList.add('hot'); }, 380);
        rows.forEach(function (r, i) { setTimeout(function () { markPass(r); }, 820 + i * 330); });
        setTimeout(function () {
          if (pass) pass.classList.add('on');
          setTimeout(function () { running = false; }, 2800);
        }, 820 + rows.length * 330);
      }, 26);
    }

    ScrollTrigger.create({ trigger: wrap, start: 'top 74%', onEnter: run, onEnterBack: run });

    gsap.from($('#holo'), { y: 48, opacity: 0, rotationX: 22, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: wrap, start: 'top 78%', once: true } });
    if (orbit) {
      gsap.fromTo(orbit, { '--spin': '0deg' }, { '--spin': '360deg', duration: 58, ease: 'none', repeat: -1 });
    }
  })();

  /* ════════════════ 9 · SLIDE 06 · the race + podium ════════════════ */
  (function compete() {
    var race = $('#race'), pod = $('#pod3d');
    if (!race) return;
    var rows = $$('li', race), bars = $$('.bar', race), steps = $$('.pd', pod);

    gsap.set(rows, { opacity: 0, x: -24 });
    gsap.set(bars, { width: 0 });
    gsap.set(steps, { scaleY: 0, transformOrigin: 'bottom' });

    gsap.timeline({ scrollTrigger: { trigger: race, start: 'top 80%', once: true } })
      .to(rows, { opacity: 1, x: 0, duration: .55, ease: 'power3.out', stagger: .08 }, 0)
      .to(bars, { width: function (i, t) { return t.parentNode.style.getPropertyValue('--w'); },
                  duration: 1.15, ease: 'power3.out', stagger: .08 }, .15)
      .to(steps, { scaleY: 1, duration: .85, ease: 'back.out(1.5)', stagger: .12 }, .5);

    if (reduced) return;
    var h = $('#cd-h'), m = $('#cd-m'), s = $('#cd-s');
    var left = 18 * 3600 + 42 * 60 + 3, iv = null;
    ScrollTrigger.create({ trigger: race, start: 'top 95%', end: 'bottom 5%',
      onToggle: function (self) {
        clearInterval(iv);
        if (!self.isActive) return;
        iv = setInterval(function () {
          if (--left < 0) left = 18 * 3600 + 42 * 60 + 3;
          h.textContent = String(Math.floor(left / 3600)).padStart(2, '0');
          m.textContent = String(Math.floor(left / 60) % 60).padStart(2, '0');
          s.textContent = String(left % 60).padStart(2, '0');
        }, 1000);
      } });
  })();

  /* ════════════════ 10 · SLIDE 07 · the isometric year ════════════════
     Real extrusion: each cell is a top face with two walls hinged down
     to the base plane, so the grid has genuine height.               */
  (function isoYear() {
    var el = $('#iso');
    if (!el) return;
    var LV = [
      { c: '#F2EADC', d: '#E2D7C2', m: '#EAE0CE', z: 0 },
      { c: '#F8DFA8', d: '#D8BA7C', m: '#E8CE92', z: 7 },
      { c: '#F0A51E', d: '#BE8113', m: '#D79318', z: 16 },
      { c: '#C9820A', d: '#9B6407', m: '#B27308', z: 27 },
      { c: '#8C5A05', d: '#684203', m: '#7A4E04', z: 38 }
    ];
    var cells = [], html = '';
    for (var i = 0; i < 301; i++) {
      var r = Math.random();
      var hot = (i > 192 && i < 244) || (i > 103 && i < 129);
      var L = 0;
      if (hot) L = r > .7 ? 4 : r > .46 ? 3 : r > .2 ? 2 : 1;
      else if (r > .94) L = 2; else if (r > .85) L = 1;
      cells.push(L);
      var v = LV[L];
      html += '<i style="--c:' + v.c + ';--cd:' + v.d + ';--cm:' + v.m + ';--z:0"></i>';
    }
    el.innerHTML = html;
    var nodes = $$('i', el);

    if (reduced) {
      nodes.forEach(function (n, k) { n.style.setProperty('--z', LV[cells[k]].z); });
      return;
    }
    ScrollTrigger.create({ trigger: el, start: 'top 82%', once: true, onEnter: function () {
      nodes.forEach(function (n, k) {
        var z = LV[cells[k]].z;
        if (!z) return;
        var o = { v: 0 };
        gsap.to(o, { v: z, duration: .7, ease: 'back.out(2)',
          delay: Math.floor(k / 7) * 0.013,
          onUpdate: function () { n.style.setProperty('--z', o.v.toFixed(1)); } });
      });
    } });
  })();

  /* ════════════════ 11 · SLIDE 08 · the mentor ════════════════ */
  (function mentor() {
    var box = $('#mentor');
    if (!box) return;
    var tabs = $$('.mt-tab', box), sets = $$('.mt-set', box), txt = $('#mtTxt');
    var SAY = [
      'Start by restating the problem. You only need the edge cells, so test <code>i == 0 || i == n-1 || j == 0 || j == m-1</code> rather than walking the whole matrix.',
      'Your loop checks the wrong boundary. Compare against <code>n-1</code> and <code>m-1</code> — the last valid index is one less than the size.',
      'This is O(n·m) time and O(1) extra space, which is optimal since every cell must be read once. Say that first in an interview, then walk the boundary condition.'
    ];
    var cur = 0, auto = null;

    function show(i) {
      cur = i;
      tabs.forEach(function (t, k) { t.classList.toggle('on', k === i); });
      sets.forEach(function (s, k) { s.classList.toggle('on', k === i); });
      if (!txt) return;
      gsap.to(txt, { opacity: 0, y: -6, duration: .2, onComplete: function () {
        txt.innerHTML = SAY[i];
        gsap.to(txt, { opacity: 1, y: 0, duration: .34, ease: 'power2.out' });
      } });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { clearInterval(auto); show(i); });
    });

    if (reduced) return;
    ScrollTrigger.create({ trigger: box, start: 'top 74%', end: 'bottom 26%',
      onToggle: function (self) {
        clearInterval(auto);
        if (!self.isActive) return;
        auto = setInterval(function () { show((cur + 1) % 3); }, 3800);
      } });
  })();

  /* ════════════════ 12 · reveals and counters ════════════════ */
  $$('.sh, .ec, .mini, .facts, .flowline, .note-c, .bignum, .cta-row, .cta-url, .cta-by, .cta-h').forEach(function (el) {
    gsap.from(el, { opacity: 0, y: 24, duration: .9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });

  $$('.count').forEach(function (el) {
    var to = parseFloat(el.dataset.to) || 0, sfx = el.dataset.sfx || '', o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () {
      gsap.to(o, { v: to, duration: 1.9, ease: 'power3.out',
        onUpdate: function () { el.textContent = Math.round(o.v).toLocaleString('en-IN') + sfx; } });
    } });
  });

  /* ════════════════ 13 · BOOT ════════════════ */
  (function boot() {
    var bootEl = $('#boot'), lid = $('#be-lid');
    document.body.classList.add('lock');

    function open() {
      document.body.classList.remove('lock');
      bootEl.classList.add('gone');

      var tl = gsap.timeline({ delay: .08 });
      tl.add(drawOwl($('#owl'), 1.5), 0);
      tl.to('.rise', { opacity: 1, y: 0, duration: .95, ease: 'power3.out', stagger: .08 }, .2);
      tl.from('.rig', { opacity: 0, y: 40, rotationX: 10, duration: 1.2, ease: 'power3.out' }, .3);
      tl.from('.cue', { opacity: 0, y: 12, duration: .7 }, 1.1);

      owlLife($('#owl'));

      var two = $('#owl2');
      if (two) {
        gsap.set(two, { opacity: 0, y: 26 });
        ScrollTrigger.create({ trigger: two, start: 'top 92%', once: true, onEnter: function () {
          gsap.to(two, { opacity: 1, y: 0, duration: .9, ease: 'power3.out' });
          drawOwl(two, 1.3);
          owlLife(two);
        } });
      }

      setTimeout(function () { ScrollTrigger.refresh(); }, 170);
    }

    if (reduced) { gsap.set('.rise', { opacity: 1, y: 0 }); open(); return; }

    gsap.set(lid, { scaleY: 0.05 });
    gsap.timeline()
      .to(lid, { scaleY: 1, duration: .75, ease: 'power3.out' }, .25)
      .to(lid, { scaleY: .06, duration: .2, ease: 'power2.in' }, '+=.45')
      .to(lid, { scaleY: 1, duration: .34, ease: 'power2.out' })
      .to('.boot-word', { letterSpacing: '.72em', opacity: .55, duration: .6, ease: 'power2.inOut' }, '-=.3');

    var done = false;
    function go() { if (done) return; done = true; open(); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(go, 1600); });
    setTimeout(go, 2700);
  })();

  /* ════════════════ 14 · resize ════════════════ */
  var rt = null;
  addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { ScrollTrigger.refresh(); }, 180);
  });

})();
