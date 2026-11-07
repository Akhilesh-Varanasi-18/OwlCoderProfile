/* ══════════════════════════════════════════════════════════════════
   OWL CODER — presentation choreography
   Eleven slides. Each one is a real product screen rebuilt in code,
   and each one lifts something different out of the glass.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  gsap.registerPlugin(ScrollTrigger);

  /* ═══════ 1 · THE OWL ═══════
     One drawing, stamped into every slot that needs it. Assigning the
     markup as innerHTML on an <svg> parses it in the SVG namespace,
     which a <use> clone cannot do without losing the stylesheet.      */
  var tpl = $('#owl-tpl');
  var OWL = tpl && tpl.content && tpl.content.querySelector('.o-bird');
  if (OWL) $$('.owl, .boot-owl, .rail-owl').forEach(function (s) { s.appendChild(OWL.cloneNode(true)); });

  function owlLife(svg, opts) {
    if (!svg || reduced) return;
    opts = opts || {};
    var eyes = $$('.o-eye', svg), glows = $$('.o-glow', svg), bird = $('.o-bird', svg);

    if (bird && opts.bob !== false) {
      gsap.to(bird, { y: -7, rotation: 1.6, duration: 3.4, ease: 'sine.inOut',
        yoyo: true, repeat: -1, transformOrigin: '50% 96%' });
    }
    if (!eyes.length) return;

    /* The blink is the character. Long close, a beat held shut, long
       open, and the gold flares as the lids come back up. */
    function blink() {
      gsap.timeline({ onComplete: function () { gsap.delayedCall(2.4 + Math.random() * 3.6, blink); } })
        .to(eyes, { scaleY: 0.08, duration: 0.26, ease: 'power2.in' })
        .to(eyes, { scaleY: 1, duration: 0.42, ease: 'back.out(2.2)' }, '+=0.13')
        .fromTo(glows, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' }, '-=0.42')
        .to(glows, { opacity: 0, duration: 1.1, ease: 'power2.in' });
    }
    gsap.delayedCall(opts.delay || 1.2, blink);
  }

  /* ═══════ 2 · SMOOTH SCROLL ═══════ */
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
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var el = document.getElementById(a.getAttribute('href').slice(1));
    if (!el) return;
    e.preventDefault();
    goTo(el);
    document.body.classList.remove('rail-open');
  });

  /* ═══════ 3 · SHELL ═══════ */
  var slides = $$('.slide'), navLinks = $$('.rail-nav a');
  var dkNow = $('#dkNow'), dkAll = $('#dkAll'), dkBar = $('#dkBar');
  var goLbl = $('#dkPresent') && $('#dkPresent').querySelector('span');
  var at = -1;
  if (dkAll) dkAll.textContent = String(slides.length).padStart(2, '0');

  $('#railToggle').addEventListener('click', function () {
    if (innerWidth <= 1080) document.body.classList.toggle('rail-open');
    else document.body.classList.toggle('rail-min');
    setTimeout(function () { ScrollTrigger.refresh(); }, 520);
  });

  function setSlide(i) {
    i = clamp(i, 0, slides.length - 1);
    if (i === at) return;
    at = i;
    if (dkNow) dkNow.textContent = String(i + 1).padStart(2, '0');
    navLinks.forEach(function (a, k) { a.classList.toggle('on', k === i); });
  }
  $('#dkPrev').addEventListener('click', function () { goTo(slides[clamp(at - 1, 0, slides.length - 1)]); });
  $('#dkNext').addEventListener('click', function () { goTo(slides[clamp(at + 1, 0, slides.length - 1)]); });

  function toggleFS() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(function () {});
  }
  $('#dkFull').addEventListener('click', toggleFS);
  $('#dkPresent').addEventListener('click', function () {
    var on = document.body.classList.toggle('present');
    if (goLbl) goLbl.textContent = on ? 'Exit' : 'Present';
    if (on) { document.documentElement.requestFullscreen().catch(function () {}); goTo(slides[0]); }
    else if (document.fullscreenElement) document.exitFullscreen();
    setTimeout(function () { ScrollTrigger.refresh(); }, 580);
  });
  document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement && document.body.classList.contains('present')) {
      document.body.classList.remove('present');
      if (goLbl) goLbl.textContent = 'Present';
      setTimeout(function () { ScrollTrigger.refresh(); }, 580);
    }
  });
  addEventListener('keydown', function (e) {
    var t = e.target;
    if (t && t.closest && t.closest('input, textarea, [contenteditable]')) return;
    var k = e.key;
    if (k === 'ArrowDown' || k === 'ArrowRight' || k === 'PageDown' || k === ' ') { e.preventDefault(); goTo(slides[clamp(at + 1, 0, slides.length - 1)]); }
    else if (k === 'ArrowUp' || k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); goTo(slides[clamp(at - 1, 0, slides.length - 1)]); }
    else if (k === 'Home') { e.preventDefault(); goTo(slides[0]); }
    else if (k === 'End') { e.preventDefault(); goTo(slides[slides.length - 1]); }
    else if (k && k.toLowerCase() === 'f') toggleFS();
  });
  slides.forEach(function (s, i) {
    ScrollTrigger.create({ trigger: s, start: 'top 55%', end: 'bottom 45%',
      onEnter: function () { setSlide(i); }, onEnterBack: function () { setSlide(i); } });
  });
  setSlide(0);
  (function bar() {
    function paint() {
      var doc = document.documentElement.scrollHeight - innerHeight;
      if (dkBar) dkBar.style.width = (doc > 0 ? clamp(scrollY / doc, 0, 1) * 100 : 0).toFixed(2) + '%';
      requestAnimationFrame(paint);
    }
    requestAnimationFrame(paint);
  })();

  /* ═══════ 4 · COMING OUT OF THE GLASS ═══════
     Every .pop starts flat on the screen and is pushed toward the
     reader along the device's own normal, then left drifting. This is
     the one idea the whole deck is built on, so it is shared.          */
  function liftOut(scene, extra) {
    var pops = $$('.pop', scene);
    if (!pops.length) return;
    if (reduced) {
      pops.forEach(function (p) { gsap.set(p, { z: +p.dataset.z || 0, opacity: 1 }); });
      if (extra) extra();
      return;
    }
    gsap.set(pops, { z: 0, opacity: 0, scale: .88, y: 14 });
    var tl = gsap.timeline();
    tl.to(pops, {
      z: function (i, t) { return +t.dataset.z || 60; },
      opacity: 1, scale: 1, y: 0,
      duration: .95, ease: 'back.out(1.5)', stagger: .11
    });
    pops.forEach(function (p, i) {
      tl.to(p, { y: '+=7', duration: 2.6 + i * .3, ease: 'sine.inOut', yoyo: true, repeat: -1 }, '>-0.3');
    });
    if (extra) tl.add(extra, .4);
    return tl;
  }

  function onSlide(sel, start, fn) {
    var el = $(sel);
    if (!el) return;
    ScrollTrigger.create({ trigger: el, start: start || 'top 72%',
      onEnter: fn, onEnterBack: fn });
  }

  /* ═══════ 5 · heatmaps ═══════ */
  function heat(el, n) {
    if (!el) return;
    var h = '';
    for (var i = 0; i < n; i++) {
      var r = Math.random(), hot = (i > n * .68 && i < n * .83) || (i > n * .4 && i < n * .47);
      var c = '';
      if (hot) c = r > .72 ? 'l4' : r > .48 ? 'l3' : r > .22 ? 'l2' : 'l1';
      else if (r > .95) c = 'l2'; else if (r > .88) c = 'l1';
      h += '<i class="' + c + '"></i>';
    }
    el.innerHTML = h;
  }
  heat($('#hmHero'), 364);
  heat($('#hmTrack'), 364);

  /* ═══════ 6 · SLIDE 01 ═══════ */
  onSlide('#heroScene', 'top 80%', function () { liftOut($('#heroScene')); });

  /* ═══════ 7 · SLIDE 02 · the tangle ═══════ */
  (function tangle() {
    var box = $('#tangle'), svg = $('#tgWire');
    if (!box || !svg) return;
    var chips = $$('.tg-chip', box), core = $('.tg-core', box);

    function build() {
      var W = 1000, H = 440, d = '';
      chips.forEach(function (c, i) {
        var x = parseFloat(c.style.getPropertyValue('--x')) / 100 * W;
        var y = parseFloat(c.style.getPropertyValue('--y')) / 100 * H;
        var mx = (x + W / 2) / 2 + (i % 2 ? 46 : -46);
        var my = (y + H / 2) / 2 + 58 + (i % 3) * 36;
        d += 'M' + x.toFixed(0) + ' ' + y.toFixed(0) + 'Q' + mx.toFixed(0) + ' ' + my.toFixed(0) + ' 500 220 ';
      });
      svg.innerHTML = '<path d="' + d + '"/>';
    }
    build();
    addEventListener('resize', build);
    if (reduced) { gsap.set(core, { opacity: 1, scale: 1 }); return; }

    function dx(t) { return box.offsetWidth / 2 - t.offsetLeft - t.offsetWidth / 2; }
    function dy(t) { return box.offsetHeight / 2 - t.offsetTop - t.offsetHeight / 2; }

    var tl = gsap.timeline({ paused: true });
    tl.set(chips, { x: 0, y: 0, scale: 1, opacity: 1 }).set(svg, { opacity: 1 }).set(core, { opacity: 0, scale: .82 })
      .from(chips, { opacity: 0, scale: .6, duration: .5, ease: 'back.out(1.6)', stagger: { each: .05, from: 'random' } })
      .to({}, { duration: 1.1 })
      .to(chips, { x: dx, y: dy, scale: .45, opacity: 0, duration: .95, ease: 'power2.in', stagger: { each: .04, from: 'random' } })
      .to(svg, { opacity: 0, duration: .55, ease: 'power2.in' }, '<')
      .to(core, { opacity: 1, scale: 1, duration: .6, ease: 'back.out(1.7)' }, '-=.28');
    onSlide('#tangle', 'top 70%', function () { tl.restart(); });
  })();

  /* ═══════ 8 · SLIDE 03 · the road ═══════ */
  (function road() {
    var road = $('#road'), ink = $('#roadInk');
    if (!road || !ink) return;
    var stops = $$('.stop', road), L = 0;
    try { L = ink.getTotalLength(); } catch (e) {}
    gsap.set(ink, { strokeDasharray: L, strokeDashoffset: reduced ? 0 : L });
    if (reduced) { gsap.set(stops, { opacity: 1, y: 0, scale: 1 }); return; }

    var tl = gsap.timeline({ paused: true });
    tl.set(ink, { strokeDashoffset: L }).set(stops, { opacity: 0, y: 16, scale: .9 })
      .to(ink, { strokeDashoffset: 0, duration: 2.3, ease: 'power1.inOut' }, 0);
    stops.forEach(function (s, i) {
      tl.to(s, { opacity: 1, y: 0, scale: 1, duration: .45, ease: 'back.out(2)' }, .32 + i * .39);
    });
    onSlide('#road', 'top 68%', function () { tl.restart(); });
  })();

  /* ═══════ 9 · SLIDE 04 · learn ═══════ */
  onSlide('#learnScene', 'top 76%', function () { liftOut($('#learnScene')); });
  gsap.to($$('#ladder .rung'), { opacity: 1, y: 0, duration: .65, ease: 'power3.out', stagger: .09,
    scrollTrigger: { trigger: '#ladder', start: 'top 88%', once: true } });

  /* ═══════ 10 · SLIDE 05 · the editor ═══════ */
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
  function paint(n) {
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

  (function editor() {
    var scene = $('#codeScene'), code = $('#code');
    if (!scene || !code) return;
    var sub = $('#subBtn'), pops = $$('.pop', scene), busy = false, timer = null;

    if (reduced) {
      code.innerHTML = paint(CH.length); code.classList.add('done');
      if (sub) sub.classList.add('hot');
      pops.forEach(function (p) { gsap.set(p, { z: +p.dataset.z || 0, opacity: 1 }); });
      return;
    }
    gsap.set(pops, { opacity: 0, z: 0, scale: .88 });

    function run() {
      if (busy) return;
      busy = true;
      code.classList.remove('done');
      code.innerHTML = '';
      if (sub) sub.classList.remove('hot');
      gsap.set(pops, { opacity: 0, z: 0, scale: .88, y: 14 });

      var n = 0;
      clearInterval(timer);
      timer = setInterval(function () {
        n += 4 + Math.floor(Math.random() * 5);
        code.innerHTML = paint(n);
        if (n < CH.length) return;
        clearInterval(timer);
        code.classList.add('done');
        setTimeout(function () { if (sub) sub.classList.add('hot'); }, 320);
        // each case comes out of the screen as it passes
        var tl = gsap.timeline({ delay: .5 });
        pops.forEach(function (p, i) {
          tl.to(p, { z: +p.dataset.z || 60, opacity: 1, scale: 1, y: 0,
            duration: .7, ease: 'back.out(1.6)' }, i * .34);
        });
        tl.add(function () {
          pops.forEach(function (p, i) {
            gsap.to(p, { y: '+=6', duration: 2.4 + i * .3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
          });
          setTimeout(function () { busy = false; }, 2600);
        });
      }, 26);
    }
    onSlide('#codeScene', 'top 74%', run);
  })();

  /* ═══════ 11 · SLIDE 06 · the podium ═══════ */
  (function compete() {
    var scene = $('#boardScene');
    if (!scene) return;
    var steps = $$('.pd', scene);
    onSlide('#boardScene', 'top 76%', function () {
      if (!reduced) gsap.set(steps, { scaleY: 0, transformOrigin: 'bottom' });
      liftOut(scene, function () {
        if (!reduced) gsap.to(steps, { scaleY: 1, duration: .8, ease: 'back.out(1.6)', stagger: .12 });
      });
    });
    if (reduced) return;
    var h = $('#cdH'), m = $('#cdM'), s = $('#cdS'), left = 18 * 3600 + 42 * 60 + 3, iv = null;
    ScrollTrigger.create({ trigger: scene, start: 'top 95%', end: 'bottom 5%', onToggle: function (self) {
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

  /* ═══════ 12 · SLIDE 07 · the heatmap stands up ═══════ */
  (function isoYear() {
    var el = $('#iso'), scene = $('#trackScene');
    if (!el || !scene) return;
    var LV = [
      { c: '#EDF5EF', d: '#DCE8E0', m: '#E5EFE8', z: 0 },
      { c: '#BFE3CB', d: '#95C0A4', m: '#A9D2B7', z: 7 },
      { c: '#6CC78E', d: '#4C9F6C', m: '#5BB37D', z: 16 },
      { c: '#15893F', d: '#0D6A2E', m: '#117A36', z: 27 },
      { c: '#0B5D2C', d: '#064320', m: '#085026', z: 38 }
    ];
    var cells = [], html = '';
    for (var i = 0; i < 322; i++) {
      var r = Math.random(), hot = (i > 206 && i < 258) || (i > 112 && i < 138);
      var L = 0;
      if (hot) L = r > .7 ? 4 : r > .46 ? 3 : r > .2 ? 2 : 1;
      else if (r > .94) L = 2; else if (r > .85) L = 1;
      cells.push(L);
      var v = LV[L];
      html += '<i style="--c:' + v.c + ';--cd:' + v.d + ';--cm:' + v.m + ';--z:0"></i>';
    }
    el.innerHTML = html;
    var nodes = $$('i', el);

    onSlide('#trackScene', 'top 78%', function () {
      liftOut(scene, function () {
        nodes.forEach(function (n, k) {
          var z = LV[cells[k]].z;
          if (!z) return;
          if (reduced) { n.style.setProperty('--z', z); return; }
          var o = { v: 0 };
          gsap.to(o, { v: z, duration: .66, ease: 'back.out(2)', delay: Math.floor(k / 7) * 0.012,
            onUpdate: function () { n.style.setProperty('--z', o.v.toFixed(1)); } });
        });
      });
    });
  })();

  /* ═══════ 13 · SLIDE 08 · the mentor ═══════ */
  (function mentor() {
    var scene = $('#aiScene'), tabs = $$('.mtab'), say = $('#mSay');
    if (!scene) return;
    var SAY = [
      'Understand the problem first. Ask for an approach, a hint to begin, or a walk through the sample input and output.',
      'Stuck is a state it recognises. Hidden cases failing, a time limit exceeded, wrong output, or simply no idea what comes next.',
      'Accepted is not the end. Review code quality, get the time and space complexity, and rehearse how you would explain it in an interview.'
    ];
    var cur = 0, auto = null;
    function show(i) {
      cur = i;
      tabs.forEach(function (t, k) { t.classList.toggle('on', k === i); });
      $$('.ai-tabs a', scene).forEach(function (a, k) { a.classList.toggle('on', k === i); });
      if (!say) return;
      gsap.to(say, { opacity: 0, y: -6, duration: .2, onComplete: function () {
        say.textContent = SAY[i];
        gsap.to(say, { opacity: 1, y: 0, duration: .34, ease: 'power2.out' });
      } });
    }
    tabs.forEach(function (t, i) { t.addEventListener('click', function () { clearInterval(auto); show(i); }); });
    onSlide('#aiScene', 'top 76%', function () { liftOut(scene); });
    if (reduced) return;
    ScrollTrigger.create({ trigger: scene, start: 'top 74%', end: 'bottom 26%', onToggle: function (self) {
      clearInterval(auto);
      if (!self.isActive) return;
      auto = setInterval(function () { show((cur + 1) % 3); }, 3800);
    } });
  })();

  /* ═══════ 14 · reveals and counters ═══════ */
  $$('.sh, .eco, .mini, .facts, .flow, .note, .bignum, .cta-row, .cta-url, .cta-by, .cta-h, .ladder').forEach(function (el) {
    gsap.from(el, { opacity: 0, y: 22, duration: .85, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });
  $$('.count').forEach(function (el) {
    var to = parseFloat(el.dataset.to) || 0, sfx = el.dataset.sfx || '', o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () {
      gsap.to(o, { v: to, duration: 1.8, ease: 'power3.out',
        onUpdate: function () { el.textContent = Math.round(o.v).toLocaleString('en-IN') + sfx; } });
    } });
  });

  /* ═══════ 15 · BOOT ═══════ */
  (function boot() {
    var bootEl = $('#boot'), fill = $('#bootFill'), pct = { v: 0 };
    document.body.classList.add('lock');

    function open() {
      document.body.classList.remove('lock');
      bootEl.classList.add('gone');
      gsap.timeline({ delay: .1 })
        .to('.rise', { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .08 }, 0)
        .from('#heroScene', { opacity: 0, y: 44, rotationX: 12, duration: 1.15, ease: 'power3.out' }, .18)
        .from('.hero-owl', { opacity: 0, y: 30, scale: .8, duration: .9, ease: 'back.out(1.6)' }, .34)
        .from('.cue', { opacity: 0, y: 12, duration: .7 }, 1.0);

      owlLife($('#heroOwl'));
      owlLife($('.rail-owl'), { bob: false, delay: 2.4 });
      owlLife($('#aiOwl'), { delay: 2 });
      owlLife($('#ctaOwl'), { delay: 1.6 });
      setTimeout(function () { ScrollTrigger.refresh(); }, 170);
    }

    if (reduced) { gsap.set('.rise', { opacity: 1, y: 0 }); open(); return; }

    owlLife($('#bootOwl'), { delay: .5 });
    gsap.from('#bootOwl', { opacity: 0, scale: .72, y: 20, duration: .9, ease: 'back.out(1.7)' });
    gsap.to(pct, { v: 100, duration: 1.9, ease: 'power1.inOut',
      onUpdate: function () { if (fill) fill.style.width = pct.v + '%'; } });

    var done = false;
    function go() { if (done) return; done = true; open(); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(go, 1700); });
    setTimeout(go, 2800);
  })();

  var rt = null;
  addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { ScrollTrigger.refresh(); }, 180);
  });
})();
