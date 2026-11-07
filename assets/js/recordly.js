/* recordly.js — Recordly-style playback of an ordinary screen recording.

   The video is never re-encoded. It plays inside a rounded, shadowed
   "window" on a gradient, and a cue track (see tools/cues.js) says when a
   click lands and where. From that, this file reproduces what was measured
   off the reference: a fixed 1.5x zoom that starts ~1 s before the click,
   settles with a critically damped spring (no overshoot, ~0.75 s), holds
   through the click, then either eases back out or — if another click is
   coming within ~1.5 s — pans straight to it while still zoomed. Motion
   blur rises and falls with the speed of the move.

   Usage:
     var r = Recordly.mount(hostEl, { src, cues, poster, loop, autoplay });
     r.play(); r.pause(); r.seek(t); r.destroy();
   Options match the numbers in docs/RECORDLY-ANALYSIS.md. */
(function (global) {
  'use strict';

  var DEF = {
    zoom: 1.5,        // Recordly never zooms to any other level
    lead: 1.0,        // zoom-in begins this long before the click
    settle: 0.2,      // hold after the click before easing out
    chain: 1.5,       // a next click within this window = pan, don't zoom out
    omega: 9,         // spring stiffness; 9 reproduces the measured curve
    blur: 1 / 420,    // px of blur per px/s of on-screen motion
    maxBlur: 7,
    loop: true,
    autoplay: true,
    muted: true,
    pad: null,        // px of margin around the window; null = 4.5% of the host
    bg: null,         // override the gradient behind the window
    // segment control (Courses): stop at `to`; then either loop back to
    // `loopFrom` or, with `freeze`, hold the last frame. `mark` fires
    // onMark(api) once per run when playback crosses it — the deck uses it
    // as "the view has opened".
    to: null, loopFrom: 0, freeze: false, mark: null, onMark: null,
    // a run starts at `from` (not 0) and plays at `rate` until the mark,
    // then at normal speed — a short lead-in to the click, not the whole trip
    from: 0, rate: 1,
    // Where the camera rests, and how hard it leans in on a cue. A recording
    // shown whole in a pane much smaller than the file is soft before anything
    // touches it: 1918px of admin screen in a 780px window is a 2.5x reduction,
    // and small type does not survive that. `base` keeps the camera in so the
    // picture is never shown whole; `baseAt` is the point it rests on, in
    // fractions of the frame, centred where it can be and clamped to the edges.
    // `gain` multiplies what each cue asks for, so the lean-in keeps its shape.
    base: 1, baseAt: [.5, .5], gain: 1,
    // `fill` covers the pane instead of fitting inside it, so a pane that is
    // not the recording's shape shows more of one axis rather than bars on the
    // other; `align` says which corner of the picture the pane keeps.
    fill: false, align: null
  };
  var RM = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mount(host, opt) {
    var o = Object.assign({}, DEF, opt || {});
    var cues = (o.cues && o.cues.cues) || o.cues || [];
    var aspect = (o.cues && o.cues.w && o.cues.h) ? o.cues.w / o.cues.h : 16 / 9;

    // ---- DOM ----
    host.classList.add('rly');
    if (o.bg) host.style.background = o.bg;
    if (o.align) host.style.placeItems = o.align;
    var win = el('div', 'rly-win');
    var v = document.createElement('video');
    v.className = 'rly-v';
    v.muted = o.muted; v.loop = o.loop && o.to == null; v.playsInline = true; v.preload = 'auto';
    if (o.poster) v.poster = o.poster;
    v.src = o.src;
    win.appendChild(v);
    host.appendChild(win);

    // ---- state ----
    var s = { z: 1, x: 0, y: 0, vz: 0, vx: 0, vy: 0 };
    var cw = 0, ch = 0, raf = 0, last = 0, dead = false;

    /* Not laid out at zoom size and scaled down. That was tried — the theory
       being that a transform on a <video> blows up a raster made at window
       size — and measured: 0.5% sharper, because Chrome already draws video at
       composite scale, and the bigger layer cost the house a third of its frame
       rate with five of them on the page. The zoom itself is what sharpens the
       picture; see `base` and `gain`. */
    function fit() {
      var hw = host.clientWidth, hh = host.clientHeight;
      var pad = o.pad != null ? o.pad : Math.max(10, Math.round(Math.min(hw, hh) * 0.045));
      var aw = hw - pad * 2, ah = hh - pad * 2, wide = aw / ah > aspect;
      if (o.fill ? !wide : wide) { ch = ah; cw = Math.round(ah * aspect); }
      else { cw = aw; ch = Math.round(aw / aspect); }
      win.style.width = cw + 'px'; win.style.height = ch + 'px';
      win.style.borderRadius = Math.round(Math.max(6, cw * 0.012)) + 'px';
    }

    // Where should the camera be at video time t?
    function targetAt(t) {
      var base = frameAt(o.baseAt[0], o.baseAt[1], o.base);
      if (RM || !cues.length) return base;
      var i = -1;
      for (var k = 0; k < cues.length; k++) { if (cues[k].t - o.lead <= t) i = k; else break; }
      if (i < 0) return base;
      var c = cues[i], n = cues[i + 1];
      if (!(c.z > 1)) return base;                           // nav cue: show it whole
      var holdUntil = c.t + (c.hold != null ? c.hold : o.settle);   // a cue may ask to linger
      var chained = n && n.z > 1 && (n.t - o.lead) <= holdUntil + o.chain;
      if (t <= holdUntil || chained) return frame(c);
      return base;
    }
    // Camera for a point in the frame: that point at the window centre,
    // clamped so the picture never leaves an edge showing.
    function frameAt(fx, fy, z) {
      z = Math.max(1, z || 1);
      var x = cw / 2 - fx * cw * z, y = ch / 2 - fy * ch * z;
      x = Math.min(0, Math.max(cw - cw * z, x));
      y = Math.min(0, Math.max(ch - ch * z, y));
      return { z: z, x: x, y: y };
    }
    function frame(c) {
      return frameAt(c.x, c.y, Math.max(o.base, (c.z || o.zoom) * o.gain));
    }

    function tick(now) {
      if (dead) return;
      raf = requestAnimationFrame(tick);
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60; last = now;
      if (!v.paused && !v.seeking) {
        var vt = v.currentTime;
        if (o.mark != null && !marked && vt >= o.mark) { marked = true; v.playbackRate = 1; if (o.onMark) o.onMark(api); }
        if (o.to != null && vt >= o.to) {
          if (o.freeze) { v.pause(); }
          else { v.currentTime = o.loopFrom || 0; }
        }
      }
      var g = targetAt(v.currentTime);

      // critically damped spring toward the goal
      var w = o.omega;
      var az = w * w * (g.z - s.z) - 2 * w * s.vz;
      var ax = w * w * (g.x - s.x) - 2 * w * s.vx;
      var ay = w * w * (g.y - s.y) - 2 * w * s.vy;
      s.vz += az * dt; s.vx += ax * dt; s.vy += ay * dt;
      s.z += s.vz * dt; s.x += s.vx * dt; s.y += s.vy * dt;

      // on-screen speed of the picture → motion blur
      var speed = Math.abs(s.vz) * cw * 0.5 + Math.hypot(s.vx, s.vy);
      var b = RM ? 0 : Math.min(o.maxBlur, speed * o.blur);

      v.style.transform = 'translate3d(' + s.x.toFixed(2) + 'px,' + s.y.toFixed(2) + 'px,0) scale(' + s.z.toFixed(4) + ')';
      v.style.filter = b > 0.15 ? 'blur(' + b.toFixed(2) + 'px)' : '';
      host.dataset.z = s.z.toFixed(2);
    }

    fit();
    var ro = global.ResizeObserver ? new ResizeObserver(fit) : null;
    if (ro) ro.observe(host); else global.addEventListener('resize', fit);
    var marked = false;
    /* A play() that is interrupted by a pause() before it resolves rejects with
       an AbortError. That is never news here — the deck pauses a recording the
       moment its beat leaves — so it is swallowed at the source rather than at
       each of the six call sites, two of which used to let it reach the console. */
    function safePlay() { var p = v.play(); if (p && p.catch) p.catch(function () {}); return p; }
    var api = {
      video: v,
      play: function () { return safePlay(); },
      pause: function () { v.pause(); },
      seek: function (t) { v.currentTime = t; },
      // back to the start of the run, camera reset, mark armed again
      restart: function () {
        marked = false; s.z = 1; s.x = 0; s.y = 0; s.vz = s.vx = s.vy = 0;
        v.style.transform = ''; v.style.filter = '';
        // seek only if not already parked there — a redundant seek costs a decode
        try { if (Math.abs(v.currentTime - (o.from || 0)) > 0.05) v.currentTime = o.from || 0; } catch (e) {}
        v.playbackRate = (o.mark != null && o.rate) ? o.rate : 1;
        return safePlay();
      },
      // parked at the start of the run, not playing
      rewind: function () { v.pause(); v.playbackRate = 1; try { v.currentTime = o.from || 0; } catch (e) {} },
      marked: function () { return marked; },
      state: function () { return { t: v.currentTime, z: s.z, x: s.x, y: s.y, goal: targetAt(v.currentTime) }; },
      destroy: function () {
        dead = true; cancelAnimationFrame(raf);
        if (ro) ro.disconnect(); else global.removeEventListener('resize', fit);
        v.pause(); v.removeAttribute('src'); v.load();
        host.classList.remove('rly'); host.innerHTML = '';
      }
    };
    raf = requestAnimationFrame(tick);
    if (o.autoplay) safePlay();
    return api;
  }

  function el(tag, cls) { var e = document.createElement(tag); e.className = cls; return e; }

  // Convenience: fetch a cue file then mount.
  function load(host, src, cueUrl, opt) {
    return fetch(cueUrl).then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; })
      .then(function (cues) { return mount(host, Object.assign({ src: src, cues: cues }, opt || {})); });
  }

  global.Recordly = { mount: mount, load: load, defaults: DEF };
})(window);
