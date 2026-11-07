/* assembly.js — the opening scene.

   Glowing nodes hang in a cloud, then fly to the intersections of a 3D
   grid shaped like a desktop: the foot first, then the stand, then the
   display row by row up from the bottom. As each row lands, grid lines
   draw through it, so the skeleton is a wireframe, not a dotted outline. A
   flash makes it solid. A scan line reads the dark screen, the desktop
   turns a full circle, and as it settles the real landing page loads into
   the glass. The Owl Coder mark rises into the top-right corner, the
   desktop eases right and the words take the left column. Last, the owl's
   eyes open in the bottom-left corner and watch the pointer.

   Driven by the deck: Assembly.play(step) on arrival, Assembly.stop(step)
   on leaving. Honours prefers-reduced-motion by showing the end state. */
(function (global) {
  'use strict';
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rnd = function (a, b) { return a + Math.random() * (b - a); };

  var ASPECT = 2.1622;  // the landing recording, 1280 × 592 — the screen is cut to it
  var BEZEL  = 7;
  var CHIN   = .075;    // fractions of the display width
  var NECK_W = .17, NECK_H = .12, FOOT_W = .30, FOOT_D = .19;
  var CELL   = 58;      // grid pitch in px
  var SIZE   = 7;       // node cube size, matches --s in the CSS
  var FINAL_SCALE = .88;
  var COPY_W = 400, GUTTER = 30;

  // Size the desktop from the room it has.
  function layout(asm) {
    var W = asm.clientWidth || innerWidth, H = asm.clientHeight || innerHeight;
    var mw = Math.min(1000, W * 0.68, (H - 200) / 0.72);
    mw = Math.max(440, Math.round(mw));
    asm.style.setProperty('--mw', mw + 'px');
    return mw;
  }

  // Fill one plane: lines into linesEl, node cubes into nodesEl. Each node
  // remembers its layer so the build runs in the order a thing is built.
  function grid(linesEl, nodesEl, w, h, cell, layerOf, parts) {
    linesEl.innerHTML = ''; nodesEl.innerHTML = '';
    var nx = Math.max(1, Math.round(w / cell)), ny = Math.max(1, Math.round(h / cell)), i, j, el;
    for (i = 0; i <= nx; i++) {
      el = document.createElement('i');
      el.className = 'gl v' + (i === 0 || i === nx ? ' f' : '');
      el.style.left = (i * w / nx) + 'px';
      linesEl.appendChild(el);
    }
    for (j = 0; j <= ny; j++) {
      el = document.createElement('i');
      el.className = 'gl h' + (j === 0 || j === ny ? ' f' : '');
      el.style.top = (j * h / ny) + 'px';
      linesEl.appendChild(el);
    }
    for (i = 0; i <= nx; i++) for (j = 0; j <= ny; j++) {
      var px = i * w / nx, py = j * h / ny;
      el = document.createElement('i');
      el.className = (i === 0 || i === nx || j === 0 || j === ny) ? 'pt edge' : 'pt';
      el.style.left = (px - SIZE / 2) + 'px';
      el.style.top  = (py - SIZE / 2) + 'px';
      el.innerHTML = '<i></i>';
      nodesEl.appendChild(el);
      parts.push({ el: el, layer: layerOf(px, py) });
    }
  }

  function build(asm) {
    var mw = layout(asm);
    var sw = mw - BEZEL * 2, chin = Math.round(mw * CHIN);
    var ph = Math.round(sw / ASPECT) + BEZEL * 2 + chin;
    var nw = Math.round(mw * NECK_W), nh = Math.round(mw * NECK_H);
    var fw = Math.round(mw * FOOT_W), fd = Math.round(mw * FOOT_D);
    var parts = [];
    // foot: front edge to back          → layer 0 … 1
    grid($('.sk-foot .gl-set', asm),  $('.sk-foot .pt-set', asm),  fw, fd, CELL * .8,
      function (x, y) { return (fd - y) / fd; }, parts);
    // stand: bottom to top              → layer 1 … 1.5
    grid($('.sk-neck .gl-set', asm),  $('.sk-neck .pt-set', asm),  nw, nh, CELL,
      function (x, y) { return 1 + (nh - y) / nh * .5; }, parts);
    // display: bottom row to top row    → layer 1.5 … 3
    var gPanel = $('.sk-panel .gl-set', asm);
    grid(gPanel, $('.sk-panel .pt-set', asm), mw, ph, CELL,
      function (x, y) { return 1.5 + (ph - y) / ph * 1.5; }, parts);
    // the line where the screen meets the chin
    var chinLine = document.createElement('i');
    chinLine.className = 'gl h f';
    chinLine.style.top = (ph - chin - BEZEL) + 'px';
    gPanel.appendChild(chinLine);
    asm._parts = parts;
    return { parts: parts, mw: mw };
  }

  // Somewhere in a loose sphere around the desktop, tumbling.
  function scatter() {
    var r = rnd(360, 900), th = rnd(0, Math.PI * 2), ph = Math.acos(rnd(-1, 1));
    return {
      x: r * Math.sin(ph) * Math.cos(th),
      y: r * Math.sin(ph) * Math.sin(th) * 0.7,
      z: r * Math.cos(ph) * 0.6 + 120,
      rotationX: rnd(-180, 180), rotationY: rnd(-180, 180),
      opacity: 0, scale: 1
    };
  }

  // Where the desktop ends up: centred in the room right of the copy column,
  // never past the right edge. The yaw brings the near side toward the
  // viewer, so it reads ~4% wider on the right; both terms allow for that.
  function finalX(asm, mw) {
    var W = asm.clientWidth || innerWidth;
    var copyR = W * .045 + COPY_W + GUTTER;
    var half = mw * FINAL_SCALE / 2;
    return Math.min(copyR / 2 - mw * .09, W / 2 - half - mw * .08);
  }

  function stop(step) {
    var asm = step && $('.asm', step);
    if (!asm) return;
    if (asm._tl) { asm._tl.kill(); asm._tl = null; }
    if (asm._idle) { asm._idle.forEach(function (t) { t.kill(); }); asm._idle = null; }
    if (asm._parts) gsap.killTweensOf(asm._parts.map(function (p) { return p.el; }));
    var v = $('.land', asm);
    if (v) v.pause();
    var w = $('#watch');
    if (w) w.classList.remove('asm-hide');
  }

  // The start state — nodes scattered and invisible, display dark and hidden
  // — set the instant the step becomes visible, before the deck's fade-in.
  // Without it, a return to the opening shows the finished desktop (or the
  // landed grid) for half a second before the build restarts.
  function prep(step) {
    var asm = $('.asm', step);
    if (!asm || !global.gsap) return null;
    stop(step);

    var b = build(asm);
    var h = { parts: b.parts, mw: b.mw, W: asm.clientWidth || innerWidth };
    h.els   = h.parts.map(function (p) { return p.el; });
    h.rig   = $('.asm-rig', asm);   h.skel  = $('.skel', asm);      h.mon  = $('.mon-hero', asm);
    h.scr   = $('.scr', h.mon);     h.bar   = $('.scan-bar', asm);  h.veil = $('.scan-veil', asm);
    h.glow  = $('.scr-glow', asm);  h.flash = $('.asm-flash', asm); h.ring = $('.asm-ring', asm);
    h.vid   = $('.land', asm);      h.logo  = $('.asm-logo', asm);  h.copy = $$('.asm-copy > *', asm);
    h.gFoot = $('.sk-foot .gl-set', asm); h.gNeck = $('.sk-neck .gl-set', asm); h.gPanel = $('.sk-panel .gl-set', asm);
    h.gDeep = $$('.sk-back, .sk-depth', asm);
    h.lines = $$('.gl-set', asm).concat(h.gDeep);
    h.watch = $('#watch');
    h.fx    = finalX(asm, h.mw);

    h.vid.pause(); h.vid.removeAttribute('poster');
    try { h.vid.currentTime = 0; } catch (e) {}
    if (h.watch) h.watch.classList.add('asm-hide');
    gsap.set(h.rig,  { xPercent: -50, yPercent: -50, rotationX: 4, rotationY: -9, x: 0, y: 0, scale: 1 });
    gsap.set(h.skel, { opacity: 1, rotationY: 0 });
    gsap.set(h.mon,  { opacity: 0, scale: .985 });
    gsap.set(h.scr,  { backgroundColor: '#0C1711' });
    gsap.set([h.gFoot, h.gNeck, h.gPanel], { clipPath: 'inset(100% 0 0 0)', opacity: 1 });
    gsap.set(h.gDeep, { opacity: 0 });
    gsap.set(h.flash,{ opacity: 0 });
    gsap.set(h.ring, { opacity: 0, scale: .2, xPercent: -50, yPercent: -50 });
    gsap.set(h.bar,  { top: '-6%', opacity: 0 });
    gsap.set(h.veil, { clipPath: 'inset(0 0 100% 0)', opacity: 1 });
    gsap.set(h.glow, { opacity: 0 });
    gsap.set(h.vid,  { opacity: 0 });
    gsap.set(h.logo, { opacity: 0, x: -h.W * .22, y: 240, scale: .5 });
    gsap.set(h.copy, { opacity: 0, y: 16 });
    // the cloud: every node somewhere in the air, not yet lit
    h.parts.forEach(function (p) { gsap.set(p.el, scatter()); });

    if (reduced) {
      h.vid.poster = 'assets/img/landing-poster.jpg';
      if (h.watch) h.watch.classList.remove('asm-hide');
      gsap.set(h.skel, { opacity: 0 });
      gsap.set(h.mon,  { opacity: 1, scale: 1 });
      gsap.set(h.scr,  { backgroundColor: '#EFF4F4' });
      gsap.set(h.vid,  { opacity: 1 });
      gsap.set(h.logo, { opacity: 1, x: 0, y: 0, scale: 1 });
      gsap.set(h.copy, { opacity: 1, y: 0 });
      gsap.set(h.rig,  { x: h.fx, scale: FINAL_SCALE });
    }
    asm._h = h;
    return h;
  }

  function play(step) {
    var asm = $('.asm', step);
    if (!asm || !global.gsap) return;
    var h = asm._h || prep(step);
    asm._h = null;
    if (!h || reduced) return;
    var parts = h.parts, mw = h.mw, els = h.els, rig = h.rig, skel = h.skel, mon = h.mon, scr = h.scr, bar = h.bar, veil = h.veil,
        glow = h.glow, flash = h.flash, ring = h.ring, vid = h.vid, logo = h.logo, copy = h.copy,
        gFoot = h.gFoot, gNeck = h.gNeck, gPanel = h.gPanel, gDeep = h.gDeep, lines = h.lines, watch = h.watch, fx = h.fx;

    var tl = gsap.timeline();
    asm._tl = tl;

    // The whole thing runs in about five seconds.

    // 1 · the cloud (scattered by prep) lights up
    tl.to(els, { opacity: 1, duration: .25, stagger: { each: .0006, from: 'random' } }, 0);

    // the skeleton sways gently while it forms
    var sway = gsap.to(skel, { rotationY: 4, duration: 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });

    // 2 · nodes fly in by layer; the lines draw through each row as it lands
    var T0 = .2, LAYER = .36, FLY = .6;
    parts.forEach(function (p) {
      tl.to(p.el, { x: 0, y: 0, z: 0, rotationX: -22, rotationY: -28, duration: FLY, ease: 'power3.inOut',
        onComplete: function () { p.el.classList.add('on'); } }, T0 + p.layer * LAYER + rnd(0, .05));
    });
    var land = function (layer) { return T0 + layer * LAYER + FLY; };   // when a layer has landed
    tl.to(gFoot,  { clipPath: 'inset(0% 0 0 0)', duration: land(1) - land(0), ease: 'none' }, land(0) - .03)
      .to(gNeck,  { clipPath: 'inset(0% 0 0 0)', duration: land(1.5) - land(1), ease: 'none' }, land(1) - .03)
      .to(gPanel, { clipPath: 'inset(0% 0 0 0)', duration: land(3) - land(1.5), ease: 'none' }, land(1.5) - .03)
      .to(gDeep,  { opacity: 1, duration: .25 }, land(3) - .18);
    var BUILT = land(3) + .05;                                           // ≈ 1.6

    // 3 · flash, and the skeleton becomes the machine
    var F = BUILT + .15;
    tl.add(function () { sway.kill(); }, F - .2)
      .to(skel, { rotationY: 0, duration: .2, ease: 'power2.out' }, F - .2)
      .to(flash, { opacity: 1, duration: .08, ease: 'power1.in' }, F)
      .to(flash, { opacity: 0, duration: .4, ease: 'power2.out' }, F + .08)
      .set(ring, { opacity: .9, scale: .2 }, F)
      .to(ring, { opacity: 0, scale: 2.6, duration: .6, ease: 'power2.out' }, F)
      .to(mon, { opacity: 1, scale: 1, duration: .3, ease: 'power2.out' }, F + .03)
      .to(els, { scale: .2, opacity: 0, duration: .3, ease: 'power2.in', stagger: { each: .0004, from: 'random' } }, F + .03)
      .to(lines, { opacity: 0, duration: .3, ease: 'power2.in' }, F + .06)
      .set(skel, { opacity: 0 }, F + .45);

    // 4 · the scan
    var S = F + .35, SCAN = .7;
    tl.to(glow, { opacity: 1, duration: .2 }, S)
      .set(bar, { opacity: 1 }, S)
      .to(bar,  { top: '103%', duration: SCAN, ease: 'power1.inOut' }, S)
      .to(veil, { clipPath: 'inset(0 0 0% 0)', duration: SCAN, ease: 'power1.inOut' }, S)
      .to(bar,  { opacity: 0, duration: .12 }, S + SCAN)
      .to(glow, { opacity: .4, duration: .2 }, S + SCAN);

    // 5 · a full turn
    var R = S + SCAN + .05, TURN = 1.4;
    tl.to(rig, { rotationY: -9 + 360, duration: TURN, ease: 'power2.inOut' }, R)
      .to(rig, { rotationX: 12, duration: TURN / 2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, R)
      .set(rig, { rotationY: -9 }, R + TURN);

    // 6 · the page loads as it comes round; the mark rises to its corner;
    //     the desktop eases right; the words arrive; the eyes open
    var L = R + TURN - .4;
    tl.add(function () { vid.play().catch(function () {}); }, L)
      .to(scr,  { backgroundColor: '#EFF4F4', duration: .4 }, L)
      .to(vid,  { opacity: 1, duration: .4 }, L)
      .to(veil, { opacity: 0, duration: .4 }, L + .03)
      .to(glow, { opacity: 0, duration: .4 }, L + .03)
      .to(logo, { opacity: 1, x: 0, y: 0, scale: 1, duration: .8, ease: 'power3.out' }, L + .35)
      .to(rig,  { x: fx, scale: FINAL_SCALE, duration: .8, ease: 'power3.inOut' }, L + .4)
      .to(copy, { opacity: 1, y: 0, duration: .5, ease: 'power3.out', stagger: .06 }, L + .55)
      .add(function () { if (watch) watch.classList.remove('asm-hide'); }, L + .85);

    // then it breathes
    tl.add(function () {
      asm._idle = [
        gsap.to(logo, { y: -6, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 }),
        gsap.to(rig,  { rotationY: -6.5, duration: 6.5, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      ];
    }, L + 1.25);
  }

  global.Assembly = { prep: prep, play: play, stop: stop };
})(window);
