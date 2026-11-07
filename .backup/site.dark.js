/* ══════════════════════════════════════════════════════════════════
   OWL CODER — choreography
   One laptop carries the whole page. Each section owns an invisible
   slot; the laptop is flown to whichever slot the reader is standing
   in, and the screen inside it swaps to that beat's module.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = matchMedia('(max-width: 1000px)').matches;

  gsap.registerPlugin(ScrollTrigger);

  /* ════════════════════════ 1. SMOOTH SCROLL ════════════════════════ */
  var lenis = null;
  if (!reduced) {
    lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      smoothWheel: true
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  function scrollTo(target) {
    if (lenis) lenis.scrollTo(target, { duration: 1.25 });
    else target.scrollIntoView({ behavior: 'smooth' });
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var el = document.getElementById(a.getAttribute('href').slice(1));
    if (!el) return;
    e.preventDefault();
    scrollTo(el);
  });

  /* ════════════════════════ 2. BUILT CONTENT ════════════════════════
     Pieces that would be tedious and heavy as markup are generated.    */

  // the year-long contribution heatmap
  (function heatmap() {
    var heat = $('#heat');
    if (!heat) return;
    var html = '';
    for (var i = 0; i < 371; i++) {
      // a plausible pattern: quiet most of the year, busy in two bursts
      var r = Math.random();
      var burst = (i > 250 && i < 300) || (i > 150 && i < 172);
      var lvl = '';
      if (burst) lvl = r > 0.72 ? 'l4' : r > 0.48 ? 'l3' : r > 0.22 ? 'l2' : 'l1';
      else if (r > 0.955) lvl = 'l2';
      else if (r > 0.9) lvl = 'l1';
      html += '<i class="' + lvl + '"></i>';
    }
    heat.innerHTML = html;
  })();

  /* ════════════════════════ 3. THE LAPTOP ════════════════════════════
     Natural size of the device, used to work out the scale that fits a
     slot. The lid and base are laid out against these numbers in CSS.  */
  var DEV_W = 1180, DEV_H = 679;

  var rig     = $('#rig');
  var laptop  = $('#laptop');
  var screenEl = $('#screen');
  var apps    = $$('.app');
  var slotSecs = $$('main > section').filter(function (s) { return $('.slot', s); });

  var dev = {
    x: 0, y: 0, s: 1, tilt: -8, yaw: 9, dim: 1,
    tx: 0, ty: 0, ts: 1, ttilt: -8, tyaw: 9, tdim: 1,
    started: false
  };

  function slotOf(sec) { return $('.slot', sec); }

  function targetFor(slot) {
    if (slot.dataset.park) {
      // Receded and invisible. The device does not hover behind a band
      // of copy — it flies off into the dark and comes back for the
      // next scene, which is a cleaner read than a ghost at 14%.
      return {
        cx: innerWidth / 2, cy: innerHeight * 0.46,
        w: innerWidth * 0.52, h: innerHeight * 0.52,
        tilt: -20, yaw: 0, dim: 0
      };
    }
    var r = slot.getBoundingClientRect();
    return {
      cx: r.left + r.width / 2, cy: r.top + r.height / 2,
      w: r.width, h: r.height,
      tilt: parseFloat(slot.dataset.tilt || 0),
      yaw:  parseFloat(slot.dataset.yaw  || 0),
      dim: 1
    };
  }

  function placeDevice(dt) {
    /* Every section whose slot is on screen contributes, weighted by the
       share of the viewport it covers. A pinned scene owns the whole
       viewport and therefore the device outright; in the gap between two
       scenes the weights cross over and the device glides from one slot
       to the next rather than chasing the outgoing one off the top. */
    var cx = 0, cy = 0, sc = 0, tl = 0, yw = 0, dm = 0, wsum = 0;
    for (var i = 0; i < slotSecs.length; i++) {
      var r = slotSecs[i].getBoundingClientRect();
      var ov = (Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / innerHeight;
      if (ov <= 0.001) continue;
      var w = Math.pow(Math.min(ov, 1), 2.2);
      var t = targetFor(slotOf(slotSecs[i]));
      cx += t.cx * w; cy += t.cy * w;
      sc += Math.min(t.w / DEV_W, t.h / DEV_H) * w;
      tl += t.tilt * w; yw += t.yaw * w; dm += t.dim * w;
      wsum += w;
    }
    if (!wsum) return;
    cx /= wsum; cy /= wsum; sc /= wsum; tl /= wsum; yw /= wsum; dm /= wsum;

    var k = Math.min(1, Math.max(0.04, dev.started ? 1 - Math.pow(0.0009, dt) : 1));

    dev.tx = cx - DEV_W / 2;
    dev.ty = cy - DEV_H / 2;
    dev.ts = sc; dev.ttilt = tl; dev.tyaw = yw; dev.tdim = dm;

    dev.x    += (dev.tx    - dev.x)    * k;
    dev.y    += (dev.ty    - dev.y)    * k;
    dev.s    += (dev.ts    - dev.s)    * k;
    dev.tilt += (dev.ttilt - dev.tilt) * k;
    dev.yaw  += (dev.tyaw  - dev.yaw)  * k;
    dev.dim  += (dev.tdim  - dev.dim)  * k;
    dev.started = true;

    laptop.style.transform =
      'translate3d(' + dev.x.toFixed(2) + 'px,' + dev.y.toFixed(2) + 'px,0)' +
      ' scale(' + dev.s.toFixed(4) + ')' +
      ' rotateX(' + dev.tilt.toFixed(2) + 'deg)' +
      ' rotateY(' + dev.yaw.toFixed(2) + 'deg)';
    laptop.style.opacity = dev.dim.toFixed(3);
  }

  /* ── the screen's modules ──────────────────────────────────────── */
  var curApp = null;
  function setApp(key, set) {
    if (key && key !== curApp) {
      curApp = key;
      apps.forEach(function (a) { a.classList.toggle('on', a.dataset.app === key); });
      if (key === 'editor') runEditor();
      if (key === 'contest') runCountdown();
    }
    if (set != null) {
      $$('.ai-set').forEach(function (u) { u.classList.toggle('on', u.dataset.set === String(set)); });
      $$('.ai-tabs a').forEach(function (a) { a.classList.toggle('on', a.dataset.t === String(set)); });
      var msg = { 0: 'Start by restating the problem. You are summing only the edge cells, so you need a test for <b>i == 0</b>, <b>i == n-1</b>, <b>j == 0</b> or <b>j == m-1</b> rather than a full traversal.',
                  1: 'Your loop checks the wrong boundary. Compare against <b>n-1</b> and <b>m-1</b>, not <b>n</b> and <b>m</b> — the last valid index is one less than the size.',
                  2: 'This runs in O(n·m) time with O(1) extra space, which is optimal here since every cell must be read once. In an interview, say that first, then walk the boundary condition.' };
      var p = $('#ai-text');
      if (p && msg[set]) { p.style.opacity = 0; setTimeout(function () { p.innerHTML = msg[set]; p.style.opacity = 1; }, 180); }
    }
  }

  /* ── the editor types its own solution ─────────────────────────── */
  var CODE = [
    [['c-k', '#include'], ['', ' '], ['c-s', '<bits/stdc++.h>']],
    [['c-k', 'using namespace'], ['', ' std;']],
    [],
    [['c-k', 'int'], ['', ' '], ['c-f', 'main'], ['', '() {']],
    [['', '    '], ['c-k', 'int'], ['', ' n, m;']],
    [['', '    cin >> n >> m;']],
    [['', '    vector<vector<'], ['c-k', 'int'], ['', '>> mat(n, vector<'], ['c-k', 'int'], ['', '>(m));']],
    [['', '    '], ['c-k', 'for'], ['', ' ('], ['c-k', 'int'], ['', ' i = '], ['c-n', '0'], ['', '; i < n; i++)']],
    [['', '        '], ['c-k', 'for'], ['', ' ('], ['c-k', 'int'], ['', ' j = '], ['c-n', '0'], ['', '; j < m; j++)']],
    [['', '            cin >> mat[i][j];']],
    [],
    [['', '    '], ['c-k', 'int'], ['', ' sum = '], ['c-n', '0'], ['', ';']],
    [['', '    '], ['c-k', 'for'], ['', ' ('], ['c-k', 'int'], ['', ' i = '], ['c-n', '0'], ['', '; i < n; i++)']],
    [['', '        '], ['c-k', 'for'], ['', ' ('], ['c-k', 'int'], ['', ' j = '], ['c-n', '0'], ['', '; j < m; j++)']],
    [['', '            '], ['c-k', 'if'], ['', ' (i == '], ['c-n', '0'], ['', ' || i == n-'], ['c-n', '1'], ['', ' || j == '], ['c-n', '0'], ['', ' || j == m-'], ['c-n', '1'], ['', ')']],
    [['', '                sum += mat[i][j];']],
    [],
    [['', '    cout << sum;']],
    [['', '}']]
  ];

  // flatten into a character stream that remembers its class
  var CHARS = [];
  CODE.forEach(function (line, li) {
    line.forEach(function (tok) {
      for (var i = 0; i < tok[1].length; i++) CHARS.push([tok[0], tok[1][i]]);
    });
    if (li < CODE.length - 1) CHARS.push(['', '\n']);
  });

  function renderCode(n) {
    var out = '', cls = null, buf = '';
    function flush() {
      if (!buf) return;
      var safe = buf.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      out += cls ? '<span class="' + cls + '">' + safe + '</span>' : safe;
      buf = '';
    }
    for (var i = 0; i < n && i < CHARS.length; i++) {
      if (CHARS[i][0] !== cls) { flush(); cls = CHARS[i][0]; }
      buf += CHARS[i][1];
    }
    flush();
    return out;
  }

  var edTimer = null, edRun = false;
  function runEditor() {
    if (edRun || reduced) {
      if (reduced) {
        var c0 = $('#code'); if (c0) { c0.innerHTML = renderCode(CHARS.length); c0.classList.add('done'); }
        $$('.cases tr[data-case]').forEach(function (r) { r.classList.add('pass'); });
        var ap0 = $('#allpass'); if (ap0) ap0.classList.add('on');
      }
      return;
    }
    edRun = true;
    var code = $('#code'), sub = $('#btn-sub'), allpass = $('#allpass');
    var rows = $$('.cases tr[data-case]');
    if (!code) return;

    code.classList.remove('done');
    code.innerHTML = '';
    rows.forEach(function (r) { r.classList.remove('pass'); });
    if (allpass) allpass.classList.remove('on');
    if (sub) sub.classList.remove('hot');

    var n = 0;
    clearInterval(edTimer);
    edTimer = setInterval(function () {
      n += 4 + Math.floor(Math.random() * 5);
      code.innerHTML = renderCode(n);
      if (n >= CHARS.length) {
        clearInterval(edTimer);
        code.classList.add('done');
        if (sub) setTimeout(function () { sub.classList.add('hot'); }, 380);
        rows.forEach(function (r, i) {
          setTimeout(function () { r.classList.add('pass'); }, 900 + i * 340);
        });
        setTimeout(function () {
          if (allpass) allpass.classList.add('on');
          setTimeout(function () { edRun = false; }, 2600);
        }, 900 + rows.length * 340);
      }
    }, 26);
  }

  /* ── the contest counts down ───────────────────────────────────── */
  var cdTimer = null;
  function runCountdown() {
    if (cdTimer || reduced) return;
    var h = $('#cd-h'), m = $('#cd-m'), s = $('#cd-s');
    if (!h) return;
    var left = 18 * 3600 + 42 * 60 + 3;
    cdTimer = setInterval(function () {
      left--;
      if (left < 0) left = 18 * 3600 + 42 * 60 + 3;
      h.textContent = String(Math.floor(left / 3600)).padStart(2, '0');
      m.textContent = String(Math.floor(left / 60) % 60).padStart(2, '0');
      s.textContent = String(left % 60).padStart(2, '0');
    }, 1000);
  }

  /* ════════════════════════ 4. SCENES ════════════════════════════════
     Each scene is pinned for (beats x 0.85) viewports. Scroll progress
     across that run becomes a beat index, and the beat decides both the
     words on the left and the module on the screen.                    */
  var scenes = $$('.scene');

  scenes.forEach(function (sec) {
    var n = parseInt(sec.dataset.beats, 10) || 1;
    var beats = $$('.beat', sec);
    var ticks = $$('.ticks i', sec);
    var at = -1;

    function mark(i) {
      if (i === at) return;
      at = i;
      beats.forEach(function (b, k) { b.classList.toggle('on', k === i); });
      ticks.forEach(function (t, k) { t.classList.toggle('on', k === i); });
      var b = beats[i];
      if (b) setApp(b.dataset.app, b.dataset.set != null ? b.dataset.set : null);
    }

    if (touch || reduced) {
      // No pinning on small screens, and none when motion is reduced:
      // a pinned section that scrubs through nothing is worse than a
      // plain one. Reveal the beats as they arrive instead.
      beats.forEach(function (b) {
        ScrollTrigger.create({
          trigger: b, start: 'top 72%',
          onEnter: function () { setApp(b.dataset.app, b.dataset.set != null ? b.dataset.set : null); }
        });
      });
      return;
    }

    ScrollTrigger.create({
      trigger: sec,
      start: 'top top',
      end: function () { return '+=' + Math.round(innerHeight * 0.85 * n); },
      pin: $('.scene-pin', sec),
      pinSpacing: true,
      scrub: true,
      anticipatePin: 1,
      onUpdate: function (self) {
        mark(clamp(Math.floor(self.progress * n + 0.0001), 0, n - 1));
      },
      onEnter: function () { mark(0); },
      onEnterBack: function () { mark(n - 1); }
    });
  });

  // the hero and the parked bands own their own module
  $$('[data-app]').forEach(function (el) {
    if (!el.classList.contains('slot')) return;
    ScrollTrigger.create({
      trigger: el.closest('section'),
      start: 'top 60%', end: 'bottom 40%',
      onEnter: function () { setApp(el.dataset.app); },
      onEnterBack: function () { setApp(el.dataset.app); }
    });
  });

  /* ════════════════════════ 5. REVEALS ═══════════════════════════════ */
  $$('.reveal').forEach(function (el) {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.95, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 86%', once: true }
    });
  });

  // the scattered platforms collapse into one
  (function scatter() {
    var box = $('#scatter');
    if (!box) return;
    var chips = $$('.sc', box);
    var core = $('.sc-core', box);

    // lay them out on a ring
    chips.forEach(function (c, i) {
      var a = (i / chips.length) * Math.PI * 2 - Math.PI / 2;
      var rx = 40 + (i % 3) * 5, ry = 30 + (i % 4) * 4;
      gsap.set(c, { xPercent: -50, yPercent: -50, left: '50%', top: '50%',
        x: Math.cos(a) * rx + 'vmin', y: Math.sin(a) * ry * 0.78 + 'vmin', rotate: (i % 2 ? 1 : -1) * (2 + i % 4) });
    });

    gsap.timeline({ scrollTrigger: { trigger: box, start: 'top 75%', end: 'bottom 60%', scrub: 0.8 } })
      .to(chips, { x: 0, y: 0, rotate: 0, scale: 0.5, opacity: 0, stagger: { each: 0.03, from: 'random' }, ease: 'power2.in' }, 0)
      .to(core, { opacity: 1, scale: 1, ease: 'back.out(1.6)', duration: 0.6 }, 0.35);
  })();

  // counters
  $$('.count').forEach(function (el) {
    var to = parseFloat(el.dataset.to) || 0;
    var sfx = el.dataset.suffix || '';
    var o = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: function () {
        gsap.to(o, {
          v: to, duration: 1.9, ease: 'power3.out',
          onUpdate: function () { el.textContent = Math.round(o.v).toLocaleString('en-IN') + sfx; }
        });
      }
    });
  });

  /* ════════════════════════ 6. RAIL + OWL ════════════════════════════ */
  var railLinks = $$('.rail-list a');
  var railFill = $('#rail-fill');
  var topbar = $('#topbar');
  var railOn = null;

  function paintChrome(y) {
    var doc = document.documentElement.scrollHeight - innerHeight;
    var p = doc > 0 ? clamp(y / doc, 0, 1) : 0;

    if (railFill) railFill.style.height = (p * 100).toFixed(2) + '%';
    if (topbar) topbar.classList.toggle('stuck', y > 20);
    if (window.OWL && window.OWL.ready) window.OWL.setPath(p);

    // whichever section owns the upper third wins the rail
    var line = y + innerHeight * 0.34, on = null;
    railLinks.forEach(function (a) {
      var sec = document.getElementById(a.dataset.rail);
      if (sec && sec.getBoundingClientRect().top + y <= line) on = a.dataset.rail;
    });
    if (on !== railOn) {
      railOn = on;
      railLinks.forEach(function (a) { a.classList.toggle('on', a.dataset.rail === on); });
    }
  }

  /* ════════════════════════ 7. THE LOOP ══════════════════════════════
     One rAF for the device and the chrome. Everything else rides on
     ScrollTrigger, which Lenis already drives.                        */
  var last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    placeDevice(dt);
    paintChrome(window.scrollY);
  }
  requestAnimationFrame(frame);

  /* ════════════════════════ 8. BOOT ══════════════════════════════════ */
  var boot = $('#boot'), fill = $('#boot-fill');
  var pct = { v: 0 };

  function openUp() {
    document.body.classList.remove('lock');
    boot.classList.add('gone');
    laptop.classList.add('live');

    var tl = gsap.timeline({ delay: 0.1 });

    // the lid swings open
    tl.fromTo(laptop, { '--lid': 88 }, { '--lid': -6, duration: 1.5, ease: 'power3.out' }, 0);

    // the words come up behind it
    tl.to('.rise', {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      stagger: 0.085
    }, 0.25);

    tl.from('.scrollcue', { opacity: 0, y: 14, duration: 0.8 }, 1.1);

    setApp('dashboard');
    setTimeout(function () { ScrollTrigger.refresh(); }, 120);
  }

  document.body.classList.add('lock');

  // a short, honest load: wait for fonts and the 3D layer, cap at 2.2s
  var done = false;
  function finish() {
    if (done) return;
    done = true;
    gsap.to(pct, {
      v: 100, duration: 0.5, ease: 'power2.out',
      onUpdate: function () { if (fill) fill.style.width = pct.v + '%'; },
      onComplete: openUp
    });
  }

  gsap.to(pct, {
    v: 92, duration: 1.5, ease: 'power1.out',
    onUpdate: function () { if (fill) fill.style.width = pct.v + '%'; }
  });

  var ready = 0;
  function tick() { if (++ready >= 2) finish(); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(tick); else tick();
  if (window.OWL && window.OWL.ready) tick();
  else document.addEventListener('owl:ready', tick, { once: true });
  setTimeout(finish, 2600);

  /* ════════════════════════ 9. RESIZE ════════════════════════════════ */
  var rt = null;
  addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      touch = matchMedia('(max-width: 1000px)').matches;
      dev.started = false;
      ScrollTrigger.refresh();
    }, 180);
  });

})();
