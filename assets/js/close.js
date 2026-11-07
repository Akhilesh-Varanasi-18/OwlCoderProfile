/* ══════════════════════════════════════════════════════════════════
   09 · CLOSE — "who runs it, and on what"

   Two steps, one scene file, because they are one thought: the colleges
   the control room was feeding come forward out of the arc and stand in
   a row at the front of the room, lit and legible; then the three
   machines Owl Coder runs on stand together and the deck ends on the
   invitation.

   The organisations and their figures are the ones in the admin panel's
   own Organizations and Granted Content tables — nothing here is made up,
   and a college we hold no granted figures for shows none.

   Lifecycle: prep (state before the fade-in) → play → stop.
   ══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function even(v) { v = Math.round(v); return v % 2 ? v + 1 : v; }
  var reduced = global.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ───────── the colleges ─────────
     The six whose marks the client supplied. Four of them (SRKR, NCET, YCCE,
     GTH) are rows in the admin panel's own Organizations list and carry the
     figures its Granted Content and contest tables record; the two Nagarjuna
     colleges are not in that list, so their badges carry no figures rather
     than a guess, and say so on the back. */
  var COLLEGES = [
    { code: 'SRKR', logo: 'srkr.png',
      nm: 'Sagi Rama Krishnam Raju Engineering College',
      loc: 'Bhimavaram · Andhra Pradesh', since: 'Client college',
      st: [['12', 'Contests']] },
    { code: 'NCET', logo: 'ncet.png',
      nm: 'Nagarjuna College of Engineering and Technology',
      loc: 'Bengaluru · Karnataka', since: 'Client college',
      st: [['593', 'Modules'], ['2,345', 'Problems'], ['15', 'Contests']] },
    { code: 'YCCE', logo: 'ycce.png',
      nm: 'Yeshwantrao Chavan College of Engineering',
      loc: 'Nagpur · Maharashtra', since: 'Client college',
      st: [['365', 'Modules'], ['2,410', 'Problems'], ['6', 'Contests']] },
    { code: 'GTH', logo: 'geetha.png',
      nm: 'Geetha University', loc: null, since: 'Client college',
      st: [['399', 'Modules'], ['2,346', 'Problems']] },
    { code: 'NCMS', logo: 'ncms.webp',
      nm: 'Nagarjuna College of Management Science and Studies',
      loc: null, since: 'Onboarding', st: null },
    { code: 'NDC', logo: 'ndc.jpg',
      nm: 'Nagarjuna Degree College', loc: null, since: 'Onboarding', st: null }
  ];
  /* how far below the wire each badge hangs, as a share of the card's height —
     a straight row of six reads as a chart, a staggered one reads as a wall */
  var CORD = [.06, .18, .11, .22, .08, .15];
  /* the platform's own figures, from the admin dashboard */
  var BAND = [
    ['3,797', 'Students'],
    ['16', 'Courses'],
    ['3,389', 'Problems'],
    ['33', 'Contests']
  ];

  /* ───────── the three machines ─────────
     w is the share of the group's width, ar the screen's own shape. No phone:
     Owl Coder is a browser product that also runs on a tablet with a keyboard. */
  var DEVS = [
    { cls: 'm1', w: .52, ar: 16 / 10, ry: -5, rx: 4, z: -40, sm: false },   // monitor
    { cls: 'm2', w: .4,  ar: 16 / 10, ry: 12, rx: 6, z: 120, sm: false },   // laptop
    { cls: 'm3', w: .24, ar: 4 / 3,   ry: -14, rx: 7, z: 190, sm: true }    // tablet
  ];

  /* the heatmap that closes the deck, as a fixed pattern — the same shape the
     Dashboard section ends on, small enough here to read as texture */
  function heatHtml(cols, rows, cls) {
    var s = '', seed = 7;
    for (var i = 0; i < cols * (rows || 5); i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      var r = (seed >> 16) % 100;
      var lv = r < 34 ? '' : r < 56 ? ' class="l1"' : r < 76 ? ' class="l2"' : r < 92 ? ' class="l3"' : ' class="l4"';
      s += '<i' + lv + '></i>';
    }
    return '<div class="' + (cls || 'dv-heat') + '">' + s + '</div>';
  }

  function faceHtml(d) {
    var tiles = [['1,142', 'Solved'], ['16', 'Courses'], ['38', 'Streak']];
    return '<div class="dv-ui">' +
      '<div class="dv-nav"><i></i><b>Owl Coder</b><u></u></div>' +
      '<div class="dv-bd">' +
        (d.sm ? '' : '<div class="dv-side"><i></i><i></i><i></i><i></i><i></i></div>') +
        '<div class="dv-main">' +
          '<div class="dv-tiles">' + tiles.slice(0, d.sm ? 2 : 3).map(function (t) {
            return '<div class="dv-tile"><b>' + t[0] + '</b><s>' + t[1] + '</s></div>';
          }).join('') + '</div>' +
          heatHtml(d.sm ? 14 : 26, 5) +
        '</div>' +
      '</div></div>';
  }

  /* One badge. The front is the college — its own mark on a white plate, its
     name and where it is. The back is our side of the same card: the owl, and
     what that college actually holds on the platform. Front says who they are,
     back says what they do with us; the same mark on both sides would say
     nothing twice. */
  function collegeHtml(c, i) {
    var n = '0' + (i + 1);
    return '<i class="bg-clip"></i>' +
      '<div class="bg-hang"><div class="bg-flip">' +
        '<div class="bg-face bg-f">' +
          '<div class="bg-hd"><b>College</b><s></s><em>' + n + '</em></div>' +
          '<div class="bg-mark"><img src="assets/img/colleges/' + c.logo +
            '" alt="" draggable="false" loading="eager"></div>' +
          '<div class="bg-id">' + c.code + '</div>' +
          '<div class="bg-nm">' + c.nm + '</div>' +
          (c.loc ? '<div class="bg-loc">' + c.loc + '</div>' : '') +
          '<div class="bg-ft"><i class="bg-dot"></i><span>Owl Coder</span><u>' + c.since + '</u></div>' +
          '<i class="bg-sheen"></i>' +
        '</div>' +
        '<div class="bg-face bg-b"><i class="bg-foil"></i>' +
          '<div class="bg-hd"><b>Owl Coder</b><s></s><em>' + n + '</em></div>' +
          '<svg class="owl bg-owl" viewBox="0 0 360 390" aria-hidden="true"></svg>' +
          '<div class="bg-bt">' + c.code + ' runs on<em>Owl Coder</em></div>' +
          (c.st ? '<div class="bg-st">' + c.st.map(function (t) {
              return '<span><b>' + t[0] + '</b><s>' + t[1] + '</s></span>';
            }).join('') + '</div>'
            : '<p class="bg-note">No granted content recorded for this college yet.</p>') +
          '<div class="bg-bf"><span>owlcoder.technicalhub.io</span></div>' +
        '</div>' +
      '</div></div>';
  }

  /* ───────── build ───────── */
  function buildOnce(cz) {
    if (cz._built) return;
    cz._built = true;
    var view = cz.dataset.view;

    var h = '<div class="cz-bg" aria-hidden="true"><i class="cz-sky"></i><i class="cz-floor"></i>' +
      '<i class="cz-pool"></i><i class="cz-grid"></i>' +
      (view === 'colleges' ? '<div class="cz-word">TRUSTED</div>' : '') +
      '</div><div class="cz-world" aria-hidden="true">';

    if (view === 'colleges') {
      h += '<svg class="cz-wire" aria-hidden="true"><path class="cz-wire-l" d=""/>' +
        '<g class="cz-wire-c"></g><g class="cz-wire-a"></g></svg>';
      COLLEGES.forEach(function (c, i) {
        h += '<div class="cg" data-i="' + i + '">' + collegeHtml(c, i) + '</div>';
      });
      h += '</div>';
      h += '<header class="cz-head"><span class="cz-kick">09 · Get started</span>' +
        '<h2 class="cz-h">The colleges<br><em>already on it.</em></h2>' +
        '<p class="cz-say">Six institutions run their coding programme on Owl Coder — their own students, their own granted slice of one library, their own contests. Every figure on a badge is read off the admin panel in the section before this one.</p>' +
        '<p class="cz-hint"><i></i>Move across them to set them swinging · point at one to turn it over</p></header>';
      h += '<div class="cz-band">' + BAND.map(function (b, i) {
        return (i ? '<i class="cz-bs"></i>' : '') +
          '<span class="cz-bi"><b>' + b[0] + '</b><s>' + b[1] + '</s></span>';
      }).join('') + '</div>';
    } else {
      DEVS.forEach(function (d, i) {
        h += '<div class="dv ' + d.cls + (d.sm ? ' sm' : '') + '" data-i="' + i + '"><div class="dv-in">' +
          '<i class="dv-cast"></i><i class="dv-body"></i>' +
          '<div class="dv-scr">' + faceHtml(d) + '</div><i class="dv-glass"></i>' +
          (d.cls === 'm1' ? '<i class="dv-neck"></i><i class="dv-foot"></i>' : '') +
          (d.cls === 'm2' ? '<i class="dv-base"></i>' : '') +
          (d.cls === 'm3' ? '<i class="dv-kbd"></i>' : '') +
          '</div></div>';
      });
      h += '</div>';
      h += '<svg class="owl cz-owl" viewBox="0 0 360 390" aria-hidden="true"></svg>';
      h += '<div class="cz-cta"><span class="cz-kick">Your coding journey starts here</span>' +
        '<h2 class="cz-ch">Don’t just think.<br><em>Make it happen.</em></h2>' +
        '<p class="cz-say">In the browser, on a monitor, a laptop, or a tablet with a keyboard. One account, the same Owl Coder on every one of them.</p>' +
        '<div class="cz-row">' +
          '<a class="cz-btn" href="https://owlcoder.technicalhub.io/coding-courses-dashboard" target="_blank" rel="noopener">Open Owl Coder</a>' +
          '<a class="cz-btn ghost" href="mailto:support@technicalhub.io">Talk to us</a>' +
        '</div>' +
        '<p class="cz-url">owlcoder.technicalhub.io</p>' +
        '<p class="cz-by">A product of <b>Technical Hub</b> · © 2026</p></div>';
    }

    cz.innerHTML = h;
    cz._view = view;
    cz._cgs = $$('.cg', cz);
    cz._cgIns = $$('.cg-in', cz);
    cz._dvs = $$('.dv', cz);
    cz._dvIns = $$('.dv-in', cz);
    cz._wire = $('.cz-wire', cz);
    cz._word = $('.cz-word', cz);
    cz._head = $('.cz-head', cz);
    cz._band = $('.cz-band', cz);
    cz._cta = $('.cz-cta', cz);
    cz._owl = $('.cz-owl', cz);

    // the owl is cloned into every .owl at boot, before this scene is built
    var tpl = $('#owlTpl');
    var src = tpl && tpl.content && tpl.content.querySelector('.o-bird');
    if (src && cz._owl && !cz._owl.firstChild) cz._owl.appendChild(src.cloneNode(true));
    if (src) $$('.bg-owl', cz).forEach(function (o) {
      if (!o.firstChild) o.appendChild(src.cloneNode(true));
    });
    if (cz._view === 'colleges') wireFlips(cz);
  }

  /* ───────── geometry ───────── */
  function layout(cz) {
    var W = cz.clientWidth || innerWidth, H = cz.clientHeight || innerHeight, narrow = W <= 1080;
    cz.classList.toggle('narrow', narrow);
    var k = narrow ? clamp(W / 860, .6, 1) : clamp(Math.min(W / 1600, H / 880), .72, 1.24);
    cz.style.setProperty('--k', k.toFixed(3));
    var gut = Math.round(44 * k);

    if (cz._view === 'colleges') return layoutColleges(cz, W, H, k, gut, narrow);
    return layoutDevices(cz, W, H, k, gut, narrow);
  }

  /* the wall: one wire across the room with six badges clipped to it at
     different depths down their cords, the way a lanyard rack actually hangs */
  function layoutColleges(cz, W, H, k, gut, narrow) {
    var head = cz._head, band = cz._band;
    head.style.left = gut + 'px';
    var headTop = Math.round(clamp(44 * k, 18, H * .07));
    head.style.top = headTop + 'px';
    head.style.width = even(clamp(560 * k, 320, 640)) + 'px';
    var hh = head.offsetHeight || 240;

    var bandH = band.offsetHeight || 60;
    var bottom = H - Math.round(60 * k);
    var span = W - gut * 2;
    var cw = even(clamp(span / COLLEGES.length * .86, 132, 268));
    var ch = Math.round(cw * 1.33);
    var maxCord = Math.round(ch * Math.max.apply(null, CORD));

    // the wire clears the words, and the longest cord plus a card clears the band
    var wire = Math.round(clamp(headTop + hh + 40 * k, H * .26, H * .42));
    var need = maxCord + ch + Math.round(34 * k) + bandH;
    if (wire + need > bottom) {
      var f = (bottom - wire - Math.round(34 * k) - bandH) / (maxCord + ch);
      cw = even(cw * f); ch = Math.round(ch * f);
      maxCord = Math.round(ch * Math.max.apply(null, CORD));
    }
    cz._wireY = wire;

    var step = COLLEGES.length > 1 ? (span - cw) / (COLLEGES.length - 1) : 0;
    var cords = [], anchors = [], lowest = 0;
    COLLEGES.forEach(function (c, i) {
      var el = cz._cgs[i];
      var x = Math.round(gut + step * i);
      var cord = Math.round(ch * CORD[i]);
      var top = wire + cord;
      el.style.left = x + 'px';
      el.style.top = top + 'px';
      el.style.width = cw + 'px';
      el.style.height = ch + 'px';
      el.style.fontSize = Math.round(clamp(cw * .066, 8, 17)) + 'px';
      el.style.zIndex = String(20 + (i % 2 ? 1 : 0) + (i === 2 || i === 3 ? 2 : 0));
      cords.push([x + cw / 2, wire, top]);
      anchors.push(x + cw / 2);
      lowest = Math.max(lowest, top + ch);
    });

    // the wire itself: a line that sags between its anchors, the cords under it
    var svg = cz._wire;
    if (svg) {
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.style.cssText = 'position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px;z-index:6';
      var a0 = anchors[0], a1 = anchors[anchors.length - 1];
      var d = 'M' + Math.round(gut * .3) + ' ' + (wire - Math.round(16 * k));
      anchors.forEach(function (ax, i) {
        var prev = i ? anchors[i - 1] : gut * .3;
        var mid = (prev + ax) / 2;
        d += ' Q' + mid.toFixed(1) + ' ' + (wire + Math.round(9 * k)) + ' ' + ax.toFixed(1) + ' ' + wire;
      });
      d += ' Q' + ((a1 + W - gut * .3) / 2).toFixed(1) + ' ' + (wire + Math.round(9 * k)) +
        ' ' + Math.round(W - gut * .3) + ' ' + (wire - Math.round(16 * k));
      $('.cz-wire-l', svg).setAttribute('d', d);
      $('.cz-wire-c', svg).innerHTML = cords.map(function (q) {
        return '<line class="cz-cord" x1="' + q[0].toFixed(1) + '" y1="' + q[1] +
          '" x2="' + q[0].toFixed(1) + '" y2="' + (q[2] + 2) + '"/>';
      }).join('');
      $('.cz-wire-a', svg).innerHTML = anchors.map(function (ax) {
        return '<circle class="cz-anchor" cx="' + ax.toFixed(1) + '" cy="' + wire + '" r="' +
          Math.max(2.5, 3.4 * k).toFixed(1) + '"/>';
      }).join('');
    }

    // the band has to clear the deck's own step chips along the bottom
    band.style.top = Math.round(clamp(lowest + 26 * k, 0, H - bandH - Math.round(100 * k))) + 'px';
    if (cz._word) cz._word.style.fontSize = Math.round(clamp(W * .102, 70, 215)) + 'px';
    return true;
  }

  /* the three together: the monitor behind and centred, the laptop forward
     and to the left, the tablet forward and to the right, all on one
     baseline so they read as standing on the same desk */
  function layoutDevices(cz, W, H, k, gut, narrow) {
    var cta = cz._cta;
    var ch = cta.offsetHeight || 380;
    // the invitation owns the bottom of the frame; the machines take what is
    // left above it, never less than a third of the room
    var ctaTop = Math.round(clamp(H - ch - Math.round(104 * k), H * .4, H - ch - 16));
    cta.style.top = ctaTop + 'px';

    var room = ctaTop - Math.round(36 * k);
    var span = Math.min(W - gut * 2, Math.round(1180 * k));
    var cx = W / 2;
    // the monitor's width sets the group; the other two are shares of it
    var mw = even(clamp(span * .46, 300, 620));
    var mh = Math.round(mw / DEVS[0].ar);
    var neck = Math.round(clamp(mh * .15, 20, 54)), foot = Math.max(7, Math.round(mh * .04));
    var need = mh + neck + foot;
    if (need > room) {
      var f = room / need;
      mw = even(mw * f); mh = Math.round(mh * f);
      neck = Math.round(neck * f); foot = Math.max(5, Math.round(foot * f));
    }
    var baseline = Math.round(clamp(room - foot - neck, Math.round(40 * k), room));

    var place = [
      { w: mw, x: cx - mw / 2, y: baseline - mh },
      { w: even(mw * .76), x: 0, y: 0 },
      { w: even(mw * .46), x: 0, y: 0 }
    ];
    place[1].h = Math.round(place[1].w / DEVS[1].ar);
    place[2].h = Math.round(place[2].w / DEVS[2].ar);
    place[0].h = mh;
    // the laptop sits in front of the monitor's left shoulder, the tablet in
    // front of its right — overlapping, because three objects in a line read
    // as a diagram and three overlapping read as a desk
    place[1].x = Math.round(cx - mw * .62 - place[1].w * .3);
    place[1].y = Math.round(baseline + neck * .3 - place[1].h);
    place[2].x = Math.round(cx + mw * .56 - place[2].w * .16);
    place[2].y = Math.round(baseline + neck * .5 - place[2].h);

    DEVS.forEach(function (d, i) {
      var p = place[i], el = cz._dvs[i];
      el.style.left = Math.round(p.x) + 'px'; el.style.top = Math.round(p.y) + 'px';
      el.style.width = p.w + 'px'; el.style.height = p.h + 'px';
      el.style.fontSize = Math.round(clamp(p.w * .052, 9, 30)) + 'px';
      el.style.zIndex = String(10 + i * 2);
      cz._dvIns[i].style.transform = 'translateZ(' + d.z + 'px) rotateY(' + d.ry + 'deg) rotateX(' + d.rx + 'deg)';
    });
    // the monitor's stand
    var m = cz._dvs[0];
    $('.dv-neck', m).style.cssText = 'position:absolute;left:50%;translate:-50% 0;top:100%;' +
      'width:' + Math.round(mw * .085) + 'px;height:' + neck + 'px';
    $('.dv-foot', m).style.cssText = 'position:absolute;left:50%;translate:-50% 0;top:' + (mh + neck) + 'px;' +
      'width:' + Math.round(mw * .32) + 'px;height:' + foot + 'px';

    // the owl stands beside the group, on the floor, looking at the viewer
    var ow = Math.round(clamp(mw * .22, 90, 190));
    cz._owl.style.cssText = 'position:absolute;width:' + ow + 'px;' +
      'left:' + Math.round(clamp(cx - mw * .86 - ow, gut, W - ow - gut)) + 'px;' +
      'top:' + Math.round(baseline + neck + foot - ow * 1.02) + 'px;z-index:8';
    return true;
  }

  /* ───────── the wall of badges ─────────
     Each badge is a pendulum hanging from its clip: a spring pulling it back
     to a slow breath of air, damped, and shoved by the cursor as it goes past.
     One rAF for all six, writing one transform each — the wrapper carries the
     swing so the flip inside it is left alone. */
  var SWING = { k: 10, damp: 1.75, push: .17, reach: 380, maxV: 90, maxA: 12 };

  function startSway(cz) {
    stopSway(cz);
    if (cz._view !== 'colleges' || !cz._cgs.length) return;
    var cards = cz._sway = cz._cgs.map(function (el, i) {
      return { h: $('.bg-hang', el), el: el, a: 0, v: 0,
        ph: i * 1.17, amp: reduced ? 0 : .5 + (i % 3) * .2, sp: .5 + (i % 4) * .08 };
    });
    var t0 = performance.now(), last = t0;
    (function tick(now) {
      cz._raf = requestAnimationFrame(tick);
      var dt = Math.min(.05, (now - last) / 1000); last = now;
      var t = (now - t0) / 1000;
      for (var i = 0; i < cards.length; i++) {
        var c = cards[i];
        var air = Math.sin(t * c.sp * 2 + c.ph) * c.amp;
        c.v += ((air - c.a) * SWING.k - c.v * SWING.damp) * dt;
        c.v = clamp(c.v, -SWING.maxV, SWING.maxV);
        c.a = clamp(c.a + c.v * dt, -SWING.maxA, SWING.maxA);
        c.h.style.transform = 'rotate(' + c.a.toFixed(3) + 'deg)';
      }
    })(t0);

    if (reduced) return;
    cz._onMove = function (e) {
      var r = cz.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      var vx = cz._mx == null ? 0 : x - cz._mx;
      cz._mx = x;
      if (!vx) return;
      cards.forEach(function (c) {
        var b = c.el;
        var bx = b.offsetLeft + b.offsetWidth / 2, by = b.offsetTop + b.offsetHeight * .4;
        var d = Math.sqrt((x - bx) * (x - bx) + (y - by) * (y - by));
        var f = 1 - d / SWING.reach;
        if (f > 0) c.v += vx * f * f * SWING.push;
      });
    };
    cz.addEventListener('pointermove', cz._onMove);
  }
  function stopSway(cz) {
    if (cz._raf) { cancelAnimationFrame(cz._raf); cz._raf = 0; }
    if (cz._onMove) { cz.removeEventListener('pointermove', cz._onMove); cz._onMove = null; }
    cz._mx = null;
    (cz._sway || []).forEach(function (c) { c.h.style.transform = ''; });
    cz._sway = null;
  }

  /* pointing at a badge turns it over; clicking one keeps it turned */
  function wireFlips(cz) {
    cz._cgs.forEach(function (el) {
      el.addEventListener('pointerenter', function () {
        clearTimeout(el._ft);
        el._ft = setTimeout(function () { el.classList.add('flip'); }, 110);
      });
      el.addEventListener('pointerleave', function () {
        clearTimeout(el._ft);
        if (!el._lock) el.classList.remove('flip');
      });
      el.addEventListener('click', function () {
        el._lock = !el._lock;      // it is showing its back either way right now
        el.classList.add('flip');
      });
    });
  }

  /* ───────── the slow life of the room ───────── */
  function startFloat(cz) {
    stopFloat(cz);
    if (reduced || cz._view === 'colleges') return;
    var t = [];
    cz._dvs.forEach(function (el, i) {
      t.push(gsap.to(el, { y: '+=' + (3 + i % 3), duration: 3.8 + i * .5, ease: 'sine.inOut',
        yoyo: true, repeat: -1, delay: i * .26 }));
    });
    cz._float = t;
  }
  function stopFloat(cz) {
    (cz._float || []).forEach(function (t) { t.kill(); });
    cz._float = null;
    if (cz._built && cz._view !== 'colleges') gsap.set(cz._dvs, { y: 0 });
  }

  function killRun(cz) {
    if (cz._tl) { cz._tl.kill(); cz._tl = null; }
    gsap.killTweensOf([cz._head, cz._band, cz._cta, cz._owl, cz._wire, cz._word, $('.cz-bg', cz)]
      .concat(cz._cgs, cz._dvs, cz._cgIns, cz._dvIns));
  }

  /* ───────── lifecycle ───────── */
  function prep(step) {
    var cz = $('.close', step); if (!cz || !global.gsap) return null;
    stop(step);
    buildOnce(cz);
    layout(cz);
    gsap.set($('.cz-bg', cz), { opacity: 0 });
    gsap.set(cz._cgs.concat(cz._dvs), { opacity: 0 });
    [cz._head, cz._band, cz._cta, cz._owl, cz._wire, cz._word]
      .forEach(function (e) { if (e) gsap.set(e, { opacity: 0 }); });
    cz._h = true;
    if (!cz._onResize) {
      // The stage moves under this scene for a whole .45s while the rail
      // slides, and the event arrives on every frame of it. Re-seating costs
      // a layout and a handful of gsap.sets, so it is done on the frame it is
      // asked for: the scene travels with the stage instead of jumping once
      // the stage has stopped.
      cz._onResize = function () {
        if (!cz._built || !cz._h) return;
        // the swing is a physics loop over .bg-hang, which the layout only
        // moves and never replaces — stopping and starting it would snap all
        // six badges upright on every frame of the rail's slide
        killRun(cz); layout(cz); rest(cz);
        if (!cz._raf) startSway(cz);
        if (!cz._float) startFloat(cz);
      };
      addEventListener('resize', cz._onResize);
    }
    return cz._h;
  }

  /* everything visible and settled — the pose a resize lands on */
  function rest(cz) {
    gsap.set($('.cz-bg', cz), { opacity: 1 });
    gsap.set(cz._cgs.concat(cz._dvs), { opacity: 1, y: 0, scale: 1 });
    [cz._head, cz._band, cz._cta, cz._owl, cz._wire, cz._word]
      .forEach(function (e) { if (e) gsap.set(e, { opacity: 1, y: 0 }); });
  }

  function play(step) {
    var cz = $('.close', step); if (!cz) return;
    if (!cz._h && !prep(step)) return;
    var tl = cz._tl = gsap.timeline({ onComplete: function () { cz._tl = null; } });
    tl.to($('.cz-bg', cz), { opacity: 1, duration: .6, ease: 'power2.out' }, 0);

    if (cz._view === 'colleges') {
      tl.fromTo(cz._head, { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: .65, ease: 'power3.out', clearProps: 'transform' }, .1);
      // the wire is strung first, then the badges drop onto it one by one
      if (cz._wire) tl.fromTo(cz._wire, { opacity: 0 }, { opacity: 1, duration: .5 }, .28);
      if (cz._word) tl.fromTo(cz._word, { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: .9, ease: 'power3.out' }, .2);
      cz._cgs.forEach(function (el, n) {
        tl.fromTo(el, { opacity: 0, y: -26 },
          { opacity: 1, y: 0, duration: .66, ease: 'back.out(1.5)' }, .44 + n * .09);
      });
      tl.fromTo(cz._band, { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: .6, ease: 'power3.out', clearProps: 'transform' }, 1.1);
      tl.call(function () { startSway(cz); }, null, 1.25);
    } else {
      // the monitor lands first, then the two in front of it
      tl.fromTo(cz._dvs[0], { opacity: 0, y: 36, scale: .94 },
        { opacity: 1, y: 0, scale: 1, duration: .8, ease: 'power3.out' }, .1);
      tl.fromTo(cz._dvs[1], { opacity: 0, y: 30, x: -26 },
        { opacity: 1, y: 0, x: 0, duration: .75, ease: 'power3.out', clearProps: 'x' }, .34);
      tl.fromTo(cz._dvs[2], { opacity: 0, y: 26, x: 22 },
        { opacity: 1, y: 0, x: 0, duration: .75, ease: 'power3.out', clearProps: 'x' }, .48);
      tl.fromTo(cz._owl, { opacity: 0, y: 30, scale: .86 },
        { opacity: 1, y: 0, scale: 1, duration: .8, ease: 'back.out(1.5)' }, .66);
      tl.fromTo(cz._cta, { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: .7, ease: 'power3.out', clearProps: 'transform' }, .8);
      tl.call(function () { startFloat(cz); owlLife(cz); }, null, 1.5);
    }
  }

  /* the closing owl breathes and blinks; it has watched every step, so at the
     end it is allowed to be looked at */
  function owlLife(cz) {
    if (!cz._owl || reduced) return;
    var bird = $('.o-bird', cz._owl);
    if (bird) cz._life = gsap.to(bird, { y: -6, rotation: 1.4, duration: 3.4, ease: 'sine.inOut',
      yoyo: true, repeat: -1, transformOrigin: '50% 96%' });
    var eyes = $$('.o-eye', cz._owl);
    if (!eyes.length) return;
    (function loop() {
      cz._blink = gsap.timeline({ onComplete: function () {
        cz._blinkWait = gsap.delayedCall(2.4 + Math.random() * 3.6, loop);
      } })
        .to(eyes, { scaleY: .08, duration: .24, ease: 'power2.in' })
        .to(eyes, { scaleY: 1, duration: .4, ease: 'back.out(2.2)' }, '+=0.12');
    })();
  }
  function stopOwl(cz) {
    if (cz._life) { cz._life.kill(); cz._life = null; }
    if (cz._blink) { cz._blink.kill(); cz._blink = null; }
    if (cz._blinkWait) { cz._blinkWait.kill(); cz._blinkWait = null; }
    if (cz._owl) {
      gsap.set($$('.o-eye', cz._owl), { scaleY: 1 });
      var bird = $('.o-bird', cz._owl);
      if (bird) gsap.set(bird, { y: 0, rotation: 0 });
    }
  }

  function stop(step) {
    var cz = $('.close', step); if (!cz || !cz._built) return;
    killRun(cz);
    stopFloat(cz);
    stopSway(cz);
    cz._cgs.forEach(function (el) { clearTimeout(el._ft); el._lock = false; el.classList.remove('flip'); });
    stopOwl(cz);
    cz._h = null;
  }

  global.Close = { prep: prep, play: play, stop: stop, COLLEGES: COLLEGES };
})(window);
