/* wall.js — the act dividers.

   The chapter title sits flat in the wall, the same tone as the plaster,
   as if carved. Then the wall turns a few degrees, the letters push out
   toward the reader layer by layer — a real CSS extrusion, not a shadow
   trick — a light sweeps across their faces, the shadow they throw grows
   on the wall behind, and the line of copy settles under them.

   Driven by the deck: Wall.play(step) on arrival, Wall.stop(step) on
   leaving. Honours prefers-reduced-motion by showing the end state. */
(function (global) {
  'use strict';
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var DEPTH = { h: 30, n: 16 };     // layers
  var STEP  = { h: 1.7, n: 1.4 };   // px between layers

  // Build the layers once per element: shadow, N body layers, the face, the sheen.
  function build(ex, kind) {
    if (ex._built) return ex._built;
    var text = ex.dataset.text, n = DEPTH[kind], step = STEP[kind];
    ex.textContent = '';
    var shade = document.createElement('span'); shade.className = 'ly shade'; shade.textContent = text; ex.appendChild(shade);
    var layers = [];
    for (var i = 0; i < n; i++) {
      var ly = document.createElement('span');
      ly.className = 'ly' + (i === 0 ? ' base' : '') + (i === n - 1 ? ' face' : '');
      ly.textContent = text;
      ly._z = i * step;
      ex.appendChild(ly); layers.push(ly);
    }
    var sheen = document.createElement('span'); sheen.className = 'ly sheen'; sheen.textContent = text;
    sheen._z = (n - 1) * step + 0.6; ex.appendChild(sheen);
    ex._built = { layers: layers, shade: shade, sheen: sheen, face: layers[n - 1] };
    return ex._built;
  }

  function stop(step) {
    var wall = step && $('.wall', step);
    if (!wall) return;
    if (wall._tl) { wall._tl.kill(); wall._tl = null; }
    if (wall._idle) { wall._idle.kill(); wall._idle = null; }
  }

  var cssVar = function (n, d) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim() || d; };
  function flat(B, tone) {
    gsap.set(B.layers, { z: 0, opacity: 0 });
    gsap.set(B.face, { opacity: 1, color: tone, textShadow: 'inset 0 0 0 transparent' });
    gsap.set(B.shade, { opacity: 0 });
    gsap.set(B.sheen, { z: B.sheen._z, backgroundPosition: '150% 0', opacity: 0 });
  }
  function handles(wall) {
    return { rig: $('.wall-rig', wall), H: build($('.ex-h', wall), 'h'), N: build($('.ex-n', wall), 'n'),
      kick: $('.act-k', wall), copy: $('.act-p', wall),
      tone: cssVar('--paper-2', '#EDF5EF'), faceH: cssVar('--green', '#15893F'), faceN: cssVar('--gold', '#F7B500') };
  }

  // The start state — the letters flat in the wall — set the instant the
  // step becomes visible, before the deck's fade-in. Without it, a return
  // to this act shows the title already standing out for half a second.
  function prep(step) {
    var wall = $('.wall', step);
    if (!wall || !global.gsap) return;
    stop(step);
    var h = handles(wall);
    gsap.set(h.rig, { rotationX: 0, rotationY: 0, z: 0 });
    gsap.set([h.kick, h.copy], { opacity: 0, y: 10 });
    flat(h.H, h.tone); flat(h.N, h.tone);
    if (reduced) {
      [h.H, h.N].forEach(function (B) {
        B.layers.forEach(function (ly) { gsap.set(ly, { z: ly._z, opacity: 1 }); });
        gsap.set(B.shade, { opacity: 1 });
      });
      gsap.set(h.H.face, { color: h.faceH, clearProps: 'textShadow' });
      gsap.set(h.N.face, { color: h.faceN, clearProps: 'textShadow' });
      gsap.set(h.rig, { rotationX: 6, rotationY: -16 });
      gsap.set([h.kick, h.copy], { opacity: 1, y: 0 });
    }
  }

  function play(step) {
    var wall = $('.wall', step);
    if (!wall || !global.gsap) return;
    prep(step);
    if (reduced) return;
    var h = handles(wall), rig = h.rig, H = h.H, N = h.N, kick = h.kick, copy = h.copy, faceH = h.faceH, faceN = h.faceN;

    var tl = gsap.timeline();
    wall._tl = tl;

    // 1 · the wall turns, and the carved letters catch the light
    tl.to(rig, { rotationX: 6, rotationY: -16, duration: 1.4, ease: 'power3.out' }, 0)
      .to(kick, { opacity: 1, y: 0, duration: .5, ease: 'power2.out' }, .1);

    // 2 · the title pushes out of the wall, back layers first
    function extrude(B, at, dur, faceColor) {
      var n = B.layers.length;
      B.layers.forEach(function (ly, i) {
        tl.to(ly, { z: ly._z, opacity: 1, duration: dur, ease: 'power3.out' }, at + (i / n) * .35);
      });
      tl.to(B.face, { color: faceColor, duration: dur * .7, ease: 'power2.out' }, at + .15)
        .to(B.shade, { opacity: 1, duration: dur, ease: 'power2.out' }, at + .1)
        .set(B.sheen, { opacity: 1 }, at + dur * .6)
        .to(B.sheen, { backgroundPosition: '-150% 0', duration: .9, ease: 'power2.inOut' }, at + dur * .6)
        .set(B.sheen, { opacity: 0 }, at + dur * .6 + .9);
    }
    extrude(N, .25, .8, faceN);
    extrude(H, .45, 1.0, faceH);

    // 3 · the line of copy
    tl.to(copy, { opacity: 1, y: 0, duration: .6, ease: 'power2.out' }, 1.5);

    // then it breathes: the wall sways a few degrees so the depth keeps reading
    tl.add(function () {
      wall._idle = gsap.to(rig, { rotationY: -10, rotationX: 4, duration: 5.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    }, 2.0);
  }

  global.Wall = { prep: prep, play: play, stop: stop };
})(window);
