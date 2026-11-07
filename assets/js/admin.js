/* ══════════════════════════════════════════════════════════════════
   08 · ADMIN PANEL — "the control room"

   Beat 0 · the console is asleep on its stand, five college screens
            stand dim on an arc behind it, and the section's name is
            raised out of the back wall. The owl takes its one peek
            over the top edge of the console here, and nowhere else.
   Beat 1-5 · the console wakes and plays a recording of the panel. As
            each one opens, what it holds detaches from the screen as a
            packet, runs out along the feed lines, and lands in every
            college at once — the row it belongs to fills and its count
            ticks up. Leaving a beat runs that backwards.
            The last beat ends with the whole arc carrying everything:
            one panel, every organisation.

   Everything on stage is two layers: the wrapper carries placement,
   entrance and flight, the inner element carries the 3D pose. They never
   touch the same transform, so a tween can never take the pose with it.

   Lifecycle: prep (state before the fade-in) → play → stop.
   ══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function even(v) { v = Math.round(v); return v % 2 ? v + 1 : v; }
  var reduced = global.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ic(d) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>';
  }
  var TICK = 'M5 12.5l4.5 4.5L19 7';
  var CLIP_AR = 1918 / 888;        // every admin recording is this shape

  /* Beats are built at their natural pace and played at this rate, so the
     shape of the choreography is kept and only the clock moves. The same
     lesson as Reports: a first arrow that runs three seconds reads as
     waiting rather than watching. */
  var SPEED = 1.45;

  /* the section's name, standing out of the back wall on beat 0 */
  var WORD = 'ADMIN', WORD_N = 26;

  /* ───────── the five beats ─────────
     Every figure below is read off the recordings themselves. `row` is the
     line on each college screen this beat fills; beat 1 has none, because
     what it delivers is the college itself. */
  var VIEWS = [
    { key: 'orgs', clip: 'admin-orgs', tab: 'Organizations',
      h: 'One panel behind', h2: 'every college.',
      say: 'Technical Hub runs the platform; the colleges are granted what they need from it. Six organisations sit in one list, and Granted Content says exactly how much of the library each one currently holds.',
      pts: ['Add an organisation, map its courses, done',
            'Granted Content, counted per college',
            'Content Access decides who sees what'],
      row: -1, pk: '6 organisations',
      cfg: { to: 28.8, mark: 1.2, rate: 1.16 } },

    { key: 'company', clip: 'admin-company', tab: 'Company Problems',
      h: 'Where the company', h2: 'questions come from.',
      say: 'Company-tagged problems are loaded here once and surface inside every module they belong to. Each one carries its test cases and a reference solution per language, and the counts per company are kept as you go.',
      pts: ['2,781 company problems across 52 companies',
            'Amazon 119 · Adobe 57 · Accenture 30',
            'Visible and hidden test cases on every problem'],
      row: 0, pk: '2,781 problems',
      cfg: { to: 30.2, mark: 1.2, rate: 1.16 } },

    { key: 'dsa', clip: 'admin-dsa', tab: 'Problem List',
      h: 'Problems, authored', h2: 'once and reviewed.',
      say: 'A problem is written with its statement, complexity, tags and test cases, then a solution is attached in each language it should accept. Nothing reaches a student until its review status turns green.',
      pts: ['3,389 problems — plus 980 LeetCode and 205 AI Lab',
            'Python, Java, C++, C and Verilog, ticked per problem',
            'Reviewed or Not Reviewed, visible in the list'],
      row: 1, pk: '3,389 problems',
      cfg: { to: 29.4, mark: 1.2, rate: 1.16 } },

    { key: 'content', clip: 'admin-content', tab: 'Coding Course Content',
      h: 'The learning content,', h2: 'loaded once.',
      say: 'Articles, videos, trainer notes and lab problems attach to a module here, each one active or held back as a draft. Every organisation mapped to that course picks them up as soon as they go active.',
      pts: ['840 articles and 541 videos in the library',
            'Trainer notes, trainee and trainer problems, lab problems',
            'Module, topic and video order set by hand'],
      row: 2, pk: '1,381 articles & videos',
      cfg: { to: 31.0, mark: 1.2, rate: 1.16 } },

    { key: 'contests', clip: 'admin-contests', tab: 'Coding Contests',
      h: 'Every contest,', h2: 'run from one list.',
      say: 'Contests are created per organisation with their questions, their registered students and their window. When the clock stops the standings are there — and the panel that opened them is the panel that feeds every college on this arc.',
      pts: ['33 contests — 5 open, 28 closed',
            'Registration, questions and students per contest',
            'Final standings read back from Contest Reports'],
      row: 3, pk: '33 contests',
      cfg: { to: 28.0, mark: 1.2, rate: 1.16 } }
  ];

  /* ───────── the arc ─────────
     The five client colleges from the organisation list. Technical Hub is
     not among them: it is the console. `u` is the position across the arc,
     -1 to 1; the middle of the arc is the deepest point of the room, so the
     centre screen is the highest and the smallest. */
  var ORGS = [
    { code: 'AUS',  nm: 'Aditya University' },
    { code: 'GTH',  nm: 'Geetha University' },
    { code: 'NCET', nm: 'Nagarjuna College of Engineering' },
    { code: 'SRKR', nm: 'Sagi Rama Krishnam Raju Engg.' },
    { code: 'YCCE', nm: 'Yeshwantrao Chavan College' }
  ];
  /* the rows on a college screen, in the order the beats fill them */
  var ROWS = [
    { k: 'Company',  to: 2781 },
    { k: 'Problems', to: 3389 },
    { k: 'Content',  to: 1381 },
    { k: 'Contests', to: 33 }
  ];

  function fmt(n) { return Math.round(n).toLocaleString('en-IN'); }

  /* ───────── build ───────── */
  /* The room's watermark: the panel's own shape — a window with a sidebar
     and rows of records — drawn far wider than anything on stage, so the
     part that shows is the part either side of the console. */
  function markHtml() {
    var W = 1200, H = 648, r = '';
    for (var i = 0; i < 5; i++) r += '<path class="ad-mark-r" d="M300 ' + (206 + i * 76) + ' H1140"/>';
    var s = '';
    for (var j = 0; j < 5; j++) s += '<path class="ad-mark-r" d="M100 ' + (206 + j * 76) + ' H224"/>';
    return '<svg class="ad-mark" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet">' +
      '<g class="ad-mark-in">' +
      '<rect class="ad-mark-f" x="40" y="40" width="1120" height="568" rx="36"/>' +
      '<rect class="ad-mark-s" x="40" y="40" width="228" height="568" rx="36"/>' +
      '<path class="ad-mark-r" d="M40 122 H1160"/>' + s + r +
      '<path class="ad-mark-a" d="M300 126 H520"/>' +
      '</g></svg>';
  }

  function orgHtml(o) {
    return '<i class="og-lit"></i><i class="og-cast"></i><i class="og-bez"></i>' +
      '<div class="og-scr">' +
        '<b class="og-code">' + o.code + '</b>' +
        '<span class="og-nm">' + o.nm + '</span>' +
        '<b class="og-hd">Granted</b>' +
        '<div class="og-rows">' + ROWS.map(function () {
          return '<span class="og-row"><i><u></u></i><b>0</b></span>';
        }).join('') + '</div>' +
      '</div>' +
      '<i class="og-neck"></i><i class="og-foot"></i>';
  }

  function buildOnce(ad) {
    if (ad._built) return;
    ad._built = true;

    var h = '<div class="ad-bg" aria-hidden="true"><i class="ad-sky"></i><i class="ad-floor"></i>' +
      '<i class="ad-pool"></i>' + markHtml() + '</div>' +
      '<div class="ad-world" aria-hidden="true">';

    // one feed line per college, each with the pulse that runs down it
    ORGS.forEach(function (o, i) { h += '<i class="fd-ln" data-i="' + i + '"><u></u></i>'; });

    // the colleges, behind the console in the room
    ORGS.forEach(function (o, i) {
      h += '<div class="og" data-i="' + i + '"><div class="og-in">' + orgHtml(o) + '</div></div>';
    });

    // the one peek — an empty frame; the owl is cloned into it below. It is
    // written before the console so that, at the same depth in a preserve-3d
    // stage, the console is drawn over it and the owl can look over the edge
    // instead of floating in front of the screen.
    h += '<svg class="owl ad-peek" viewBox="40 20 280 230" aria-hidden="true"></svg>';

    // the console
    h += '<div class="ap"><div class="ap-in">' +
      '<i class="ap-halo"></i><i class="ap-cast"></i><i class="ap-bez"></i>' +
      '<div class="ap-scr"></div>' +
      '<div class="ap-sleep"><s>Technical Hub · the platform console</s></div>' +
      '<div class="aw"><div class="aw-pl"></div></div>' +
      '<i class="ap-glass"></i><i class="ap-led"></i>' +
      '<i class="ap-neck"></i><i class="ap-foot"></i>' +
      '</div></div>';

    // one packet per college, launched together
    ORGS.forEach(function (o, i) { h += '<div class="fd-pk" data-i="' + i + '"><i></i><span></span></div>'; });

    h += '</div>';

    // the opening title and the five descriptions
    h += '<div class="ad-hero"><div class="ad-kick"><b>08 · Admin Panel</b></div>' +
      '<h3>One panel behind <em>all of it.</em></h3>' +
      '<p>Every course, problem, article, video and contest a college sees is loaded here once, by Technical Hub, and granted out to the organisations that need it. This is that panel.</p></div>';

    VIEWS.forEach(function (v, i) {
      h += '<div class="ad-copy" data-i="' + i + '">' +
        '<div class="ad-kick"><b>08 · Admin Panel</b><s></s><em>' + v.tab + '</em></div>' +
        '<h2 class="ad-h">' + v.h + '<em>' + v.h2 + '</em></h2>' +
        '<p class="ad-say">' + v.say + '</p>' +
        '<div class="ad-list">' + v.pts.map(function (p) {
          return '<span><i>' + ic(TICK) + '</i>' + p + '</span>';
        }).join('') + '</div>' +
        '<div class="ad-dots">' + VIEWS.map(function (x, j) {
          return '<span class="ad-dot" data-k="' + (j + 1) + '"></span>';
        }).join('') + '<em>' + (i + 2) + ' / ' + (VIEWS.length + 1) + '</em></div></div>';
    });

    ad.innerHTML = h;

    ad._world = $('.ad-world', ad);
    ad._ap = $('.ap', ad);
    ad._apIn = $('.ap-in', ad);
    ad._scr = $('.ap-scr', ad);
    ad._sleep = $('.ap-sleep', ad);
    ad._led = $('.ap-led', ad);
    ad._neck = $('.ap-neck', ad);
    ad._foot = $('.ap-foot', ad);
    ad._ogs = $$('.og', ad);
    ad._ogIns = $$('.og-in', ad);
    ad._lns = $$('.fd-ln', ad);
    ad._pulses = $$('.fd-ln u', ad);
    ad._pks = $$('.fd-pk', ad);
    ad._hero = $('.ad-hero', ad);
    ad._copies = $$('.ad-copy', ad);
    ad._peek = $('.ad-peek', ad);
    ad._rly = [];
    // the rows of every college, as [college][row]
    ad._rows = ad._ogs.map(function (g) { return $$('.og-row', g); });
    buildWord(ad);

    // the owl is cloned into every .owl at boot, before this scene exists;
    // this frame is built later, so it fetches its own copy
    var tpl = $('#owlTpl');
    var src = tpl && tpl.content && tpl.content.querySelector('.o-bird');
    if (src && ad._peek && !ad._peek.firstChild) ad._peek.appendChild(src.cloneNode(true));

    // one Recordly host per beat, stacked inside the console's screen
    VIEWS.forEach(function (v, i) {
      var host = document.createElement('div');
      host.className = 'ap-rly';
      ad._scr.appendChild(host);
      if (!global.Recordly) return;
      global.Recordly.load(host, 'assets/video/' + v.clip + '.mp4', 'assets/video/' + v.clip + '.cues.json',
        // 1.18 rather than Recordly's usual 1.5: the admin panel is a wide
        // table of records and the usual hunt for the cursor crops columns
        // clean off the screen
        { autoplay: false, pad: 0, bg: '#0D1511', loop: true, zoom: 1.18,
          to: v.cfg.to, mark: v.cfg.mark, rate: v.cfg.rate })
        .then(function (r) { ad._rly[i] = r; });
    });

    var step = ad.closest('.step');
    $$('.ad-dot', ad).forEach(function (d) {
      d.addEventListener('click', function () { if (global.deckSetSub && step) global.deckSetSub(step, +d.dataset.k); });
    });
    if (step) step.addEventListener('substep', function (e) { show(step, e.detail.k, e.detail.d); });
  }

  /* ══════ the word on the back wall ══════
     One span per layer stepped along z, the front one wearing a glass face
     and a light that runs across it once — the same extrusion the act
     dividers use. It is the only thing on beat 0 that says in words what
     the room is, and it sinks back into the wall as the console wakes. */
  function buildWord(ad) {
    var pl = $('.aw-pl', ad), lay = [];
    function span(cls) {
      var e = document.createElement('span');
      e.className = cls; e.textContent = WORD; pl.appendChild(e); return e;
    }
    var shade = span('aw-ly aw-shade');
    for (var i = 0; i < WORD_N; i++) {
      var face = i === WORD_N - 1;
      var ly = span('aw-ly' + (i === 0 ? ' aw-base' : '') + (face ? ' aw-face' : ''));
      // the body of the letter is one tone laid down many times, thin at the
      // back and denser towards the face, so the thickness reads as depth
      // rather than as a slab of flat colour
      if (!face) ly.style.color = 'rgba(21,137,63,' + (.022 + (i / WORD_N) * .07).toFixed(3) + ')';
      ly._z = 0; lay.push(ly);
    }
    var sheen = span('aw-ly aw-sheen');
    ad._word = $('.aw', ad); ad._wpl = pl; ad._wly = lay;
    ad._wshade = shade; ad._wsheen = sheen;
  }
  function wordParts(ad) { return ad._wly.concat([ad._wpl, ad._wshade, ad._wsheen]); }
  /* How deep the letters stand off the wall, measured from the type itself —
     the room's size sets the type size, so the step cannot be a constant. */
  function wordDepth(ad) {
    var fs = parseFloat(getComputedStyle(ad._wly[0]).fontSize) || 90;
    var step = fs * .0062;
    ad._wly.forEach(function (ly, i) { ly._z = i * step; });
    ad._wsheen._z = (WORD_N - 1) * step + step;
  }
  function wordRest(ad, out) {
    if (!ad._word) return;
    gsap.killTweensOf(wordParts(ad));
    ad._wly.forEach(function (ly) { gsap.set(ly, { z: out ? ly._z : 0, opacity: out ? 1 : 0 }); });
    gsap.set(ad._wshade, { opacity: out ? 1 : 0 });
    gsap.set(ad._wsheen, { z: ad._wsheen._z, opacity: 0, backgroundPosition: '150% 0' });
  }
  function wordOut(ad, at, tl) {
    if (!ad._word) return;
    var n = ad._wly.length;
    ad._wly.forEach(function (ly, i) {
      tl.fromTo(ly, { z: 0, opacity: 0 }, { z: ly._z, opacity: 1, duration: .9, ease: 'power3.out' }, at + (i / n) * .34);
    });
    tl.fromTo(ad._wshade, { opacity: 0 }, { opacity: 1, duration: .9, ease: 'power2.out' }, at + .14)
      .set(ad._wsheen, { opacity: 1, backgroundPosition: '150% 0' }, at + .6)
      .to(ad._wsheen, { backgroundPosition: '-150% 0', duration: 1.05, ease: 'power2.inOut' }, at + .6)
      .set(ad._wsheen, { opacity: 0 }, at + 1.66);
  }
  function wordIn(ad, at, tl) {
    if (!ad._word) return;
    var n = ad._wly.length;
    ad._wly.forEach(function (ly, i) {
      tl.to(ly, { z: 0, opacity: 0, duration: .44, ease: 'power2.in' }, at + ((n - i) / n) * .14);
    });
    tl.to(ad._wshade, { opacity: 0, duration: .34, ease: 'power2.in' }, at);
  }

  /* ───────── geometry ─────────
     One layout, computed up front: the words in the left quarter, the console
     filling what is left, the colleges on an arc above and behind it, and one
     feed line from the top of the console to the base of each college. */
  function layout(ad) {
    var W = ad.clientWidth || innerWidth, H = ad.clientHeight || innerHeight, narrow = W <= 1080;
    ad.classList.toggle('narrow', narrow);
    var k = narrow ? clamp(W / 860, .6, 1) : clamp(Math.min(W / 1600, H / 880), .72, 1.24);
    ad.style.setProperty('--k', k.toFixed(3));

    var gut = Math.round(44 * k);
    var cw = even(clamp(narrow ? 320 * k : 372 * k, 250, 420));
    ad.style.setProperty('--cw', cw + 'px');

    // the console: everything right of the words. Its height comes from the
    // clip's own shape, so nothing is ever cropped.
    var left = narrow ? gut : gut + cw + Math.round(46 * k);
    var maxW = W - left - gut;
    // the arc needs the top third of the room and the stand needs the bottom,
    // so the screen is sized by whichever of the two runs out first
    var byH = (H * .46) * CLIP_AR;
    var apW = even(clamp(Math.min(maxW, byH), 380, 1060));
    var apH = Math.round(apW / CLIP_AR);
    var neckH = Math.round(clamp(apH * .14, 26, 62));
    var footH = Math.max(8, Math.round(apH * .035));
    var rigH = apH + neckH + footH;
    // the whole rig is seated low in the room, leaving the arc its sky
    var apY = Math.round(clamp(H - rigH - Math.round(54 * k), H * .3, H * .5));
    var apX = Math.round(left + (maxW - apW) / 2);
    var cx = apX + apW / 2;

    // the arc: five screens across the back of the room. u runs -1 to 1; the
    // middle of the arc is the furthest point, so the centre screen is the
    // highest and the smallest and the outer ones come forward.
    var ogW0 = even(clamp(apW * .185, 96, 176));
    // The widest the arc can be: the outer screens are the big ones, so half
    // of one has to fit between the arc's end and the edge of the room — and,
    // on the left, between its end and the words. Measured, not guessed: the
    // first pass used a share of the viewport and put one college through the
    // headline and another clean off the right-hand edge.
    var arcL = (narrow ? gut : gut + cw + Math.round(36 * k)) + ogW0 / 2;
    var arcR = W - gut - ogW0 / 2;
    var rx = Math.max(ogW0 * .6, Math.min(cx - arcL, arcR - cx));
    var sky = Math.round(clamp(apY - Math.round(26 * k), 90 * k, H * .46));
    var drop = Math.round(clamp(apH * .3, 46, 136));
    var orgs = ORGS.map(function (o, i) {
      var u = (i - 2) / 2;                       // -1 … 1
      var au = Math.abs(u);
      var sc = .74 + au * .26;                   // nearer at the edges
      var w = even(ogW0 * sc), hh = Math.round(w * .92);
      var nk = Math.round(clamp(hh * .2, 9, 26)), ft = Math.max(4, Math.round(hh * .06));
      var x = Math.round(cx + u * rx - w / 2);
      var y = Math.round(sky - hh - nk - ft - (1 - au) * drop);
      return { x: x, y: y, w: w, h: hh, neck: nk, foot: ft, u: u,
        // turned to face the middle of the room, and tipped back with depth
        ry: -u * 26, rx: 4 + (1 - au) * 3, z: -220 - (1 - au) * 260 };
    });

    var g = ad._geo = { W: W, H: H, k: k, narrow: narrow, gut: gut, cw: cw,
      ap: { x: apX, y: apY, w: apW, h: apH, neck: neckH, foot: footH }, cx: cx, orgs: orgs };

    // the watermark hides behind the console rather than beside the words
    var mk = $('.ad-mark', ad);
    if (mk) { mk.style.left = Math.round(apX + apW / 2) + 'px'; mk.style.width = Math.round(apW * .96) + 'px'; }

    // the console, placed once
    var ap = ad._ap;
    ap.style.left = apX + 'px'; ap.style.top = apY + 'px';
    ap.style.width = apW + 'px'; ap.style.height = apH + 'px';
    ap.style.fontSize = Math.round(clamp(apW * .026, 11, 26)) + 'px';
    // turned a few degrees, never face-on: a flat rectangle reads as a
    // diagram, a turned one as a machine standing in a room
    ad._apIn.style.transform = 'rotateX(4deg) rotateY(-5deg)';
    ad._neck.style.cssText = 'position:absolute;left:50%;translate:-50% 0;top:100%;' +
      'width:' + Math.round(apW * .09) + 'px;height:' + neckH + 'px';
    ad._foot.style.cssText = 'position:absolute;left:50%;translate:-50% 0;top:' + (apH + neckH) + 'px;' +
      'width:' + Math.round(apW * .34) + 'px;height:' + footH + 'px';

    // the colleges
    orgs.forEach(function (p, i) {
      var el = ad._ogs[i];
      el.style.left = p.x + 'px'; el.style.top = p.y + 'px';
      el.style.width = p.w + 'px'; el.style.height = p.h + 'px';
      el.style.fontSize = Math.round(clamp(p.w * .15, 9, 22)) + 'px';
      el.style.zIndex = String(10 + Math.round(Math.abs(p.u) * 10));
      ad._ogIns[i].style.transform = 'translateZ(' + p.z + 'px) rotateY(' + p.ry.toFixed(1) + 'deg) rotateX(' + p.rx.toFixed(1) + 'deg)';
      $('.og-neck', el).style.cssText = 'position:absolute;left:50%;translate:-50% 0;top:100%;' +
        'width:' + Math.max(4, Math.round(p.w * .08)) + 'px;height:' + p.neck + 'px';
      $('.og-foot', el).style.cssText = 'position:absolute;left:50%;translate:-50% 0;top:' + (p.h + p.neck) + 'px;' +
        'width:' + Math.round(p.w * .36) + 'px;height:' + p.foot + 'px';
    });

    // the feed lines: from the top edge of the console to the foot of each
    // college. Measured in the flat plane — the lines are the one thing that
    // reads better without perspective, because they are light, not objects.
    var fromX = cx, fromY = apY + Math.round(apH * .06);
    orgs.forEach(function (p, i) {
      var tx = p.x + p.w / 2, ty = p.y + p.h + p.neck + p.foot;
      var dx = tx - fromX, dy = ty - fromY;
      var len = Math.sqrt(dx * dx + dy * dy);
      var ang = Math.atan2(dy, dx) * 180 / Math.PI;
      var ln = ad._lns[i];
      ln.style.cssText = 'position:absolute;left:' + fromX + 'px;top:' + fromY + 'px;' +
        'width:' + Math.round(len) + 'px;transform:rotate(' + ang.toFixed(2) + 'deg)';
      p.len = len; p.ang = ang; p.fromX = fromX; p.fromY = fromY;
      // the packet rides the same line, upright, so its label stays readable
      var pk = ad._pks[i];
      pk.style.left = fromX + 'px'; pk.style.top = fromY + 'px';
      pk.style.fontSize = Math.round(clamp(apW * .026, 11, 22)) + 'px';
    });

    // the words
    ad._copies.concat([ad._hero]).forEach(function (c) {
      var ch = c.offsetHeight || 380;
      if (narrow) {
        c.style.left = gut + 'px';
        c.style.top = Math.round(clamp(28 * k, 16, H * .06)) + 'px';
      } else {
        c.style.left = gut + 'px';
        c.style.top = Math.round(clamp(H * .5 - ch / 2, 20, H - ch - 20)) + 'px';
      }
    });

    // the word is raised off the console's own glass, so it is sized by the
    // screen it stands on rather than by the viewport
    ad._wpl.style.fontSize = Math.round(clamp(apW * .17, 42, 150)) + 'px';
    wordDepth(ad);

    // The peek straddles the top edge: the owl is drawn behind the console, so
    // only the head and shoulders clear the bezel. Its own art has the bird
    // sitting in the lower two thirds of the box, so the box is pulled up by
    // rather more than half its height to leave the right amount showing.
    var pw = Math.round(clamp(apW * .15, 78, 150));
    ad._peek.style.cssText = 'position:absolute;width:' + pw + 'px;' +
      'left:' + Math.round(apX + apW * .72) + 'px;' +
      'top:' + Math.round(apY - pw * .8) + 'px;z-index:25';
    return g;
  }

  /* ───────── the console ───────── */
  function clipHost(ad, i) { return $$('.ap-rly', ad._scr)[i]; }
  function playClip(ad, i, on) {
    var r = ad._rly[i]; if (!r) return;
    if (on) r.restart().catch(function () {}); else r.rewind();
  }

  /* ───────── the feed ─────────
     One run of the whole thing: the line brightens, a pulse travels it, the
     packet rides behind the pulse, and the college it reaches lights up and
     fills the row this beat owns. All five go together with a small stagger,
     so it reads as one delivery rather than five errands. */
  function fire(ad, i, at, tl) {
    var v = VIEWS[i], g = ad._geo;
    if (!g) return;
    ad._pks.forEach(function (pk, j) {
      var p = g.orgs[j], el = ad._ogs[j], d = at + j * .07;
      var tx = p.x + p.w / 2 - g.cx, ty = p.y + p.h + p.neck + p.foot - p.fromY;
      $('span', pk).textContent = v.pk;

      tl.to(ad._lns[j], { opacity: 1, duration: .3, ease: 'power2.out' }, d);
      tl.fromTo(ad._pulses[j], { opacity: 1, left: '0%' },
        { left: '82%', duration: .62, ease: 'power2.inOut' }, d + .06)
        .to(ad._pulses[j], { opacity: 0, duration: .16 }, d + .62);

      tl.fromTo(pk, { opacity: 0, x: 0, y: 0, scale: .6 },
        { opacity: 1, x: tx * .18, y: ty * .18, scale: 1, duration: .32, ease: 'back.out(1.8)' }, d + .04)
        .to(pk, { x: tx, y: ty, scale: .5, duration: .62, ease: 'power2.in' }, d + .36)
        .to(pk, { opacity: 0, duration: .18, ease: 'power2.in' }, d + .82);

      // it lands
      tl.call(function () { el.classList.add('on'); }, null, d + .94);
      tl.fromTo($('.og-lit', el), { opacity: 0 }, { opacity: 1, duration: .2, ease: 'power2.out' }, d + .92)
        .to($('.og-lit', el), { opacity: 0, duration: .7, ease: 'power2.inOut' }, d + 1.14);
      tl.fromTo(ad._ogIns[j], { scale: 1 }, { scale: 1.055, duration: .18, ease: 'power2.out' }, d + .92)
        .to(ad._ogIns[j], { scale: 1, duration: .5, ease: 'elastic.out(1,.55)' }, d + 1.1);
      tl.to(ad._lns[j], { opacity: .34, duration: .5, ease: 'power2.inOut' }, d + 1.0);

      if (v.row >= 0) fillRow(ad, j, v.row, d + .94, tl);
    });
  }

  /* a row filling on one college screen: the bar runs out and the number
     counts up to it, both on the beat's own clock */
  function fillRow(ad, j, r, at, tl) {
    var row = ad._rows[j][r], bar = $('u', row), num = $('b', row);
    var target = ROWS[r].to, proxy = { v: 0 };
    row.classList.add('hot');
    tl.fromTo(bar, { width: '0%' }, { width: '100%', duration: .9, ease: 'power2.out' }, at);
    tl.to(proxy, { v: target, duration: .9, ease: 'power2.out',
      onUpdate: function () { num.textContent = fmt(proxy.v); } }, at);
  }
  /* and emptying again, when the beat is left backwards */
  function clearRow(ad, j, r, at, tl) {
    var row = ad._rows[j][r], bar = $('u', row), num = $('b', row);
    var from = ROWS[r].to, proxy = { v: from };
    row.classList.remove('hot');
    tl.to(bar, { width: '0%', duration: .4, ease: 'power2.in' }, at);
    tl.to(proxy, { v: 0, duration: .4, ease: 'power2.in',
      onUpdate: function () { num.textContent = fmt(proxy.v); } }, at);
  }

  /* every row at or below beat k is full; everything above it is empty.
     Called whenever the scene has to be put at a known pose. */
  function settleRows(ad, k) {
    ad._ogs.forEach(function (el, j) {
      el.classList.toggle('on', k >= 1);
      gsap.set($('.og-lit', el), { opacity: 0 });
      gsap.set(ad._ogIns[j], { scale: 1 });
      ROWS.forEach(function (r, ri) {
        var view = -1;
        VIEWS.forEach(function (v, vi) { if (v.row === ri) view = vi + 1; });
        var full = view > 0 && k >= view;
        var row = ad._rows[j][ri];
        row.classList.toggle('hot', full);
        gsap.set($('u', row), { width: full ? '100%' : '0%' });
        $('b', row).textContent = full ? fmt(r.to) : '0';
      });
    });
  }

  /* the slow life of the arc: each screen breathes on its own period, so the
     room never freezes between beats and never looks mechanical either */
  function startFloat(ad) {
    stopFloat(ad);
    if (reduced) return;
    var t = [];
    ad._ogs.forEach(function (el, i) {
      t.push(gsap.to(el, { y: '+=' + (4 + i % 3), duration: 3.6 + i * .42, ease: 'sine.inOut',
        yoyo: true, repeat: -1, delay: i * .3 }));
    });
    t.push(gsap.to(ad._ap, { y: '+=3', duration: 5.2, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    t.push(gsap.to(ad._led, { opacity: .35, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    ad._float = t;
  }
  function stopFloat(ad) {
    (ad._float || []).forEach(function (t) { t.kill(); });
    ad._float = null;
    if (ad._built) gsap.set(ad._ogs.concat([ad._ap]), { y: 0 });
  }

  /* ───────── beats ───────── */
  /* put the whole scene at beat j with no motion: every beat starts from a
     known pose, so an arrow pressed mid-flight can never leave a stale
     recording playing out of sight or a packet stranded on a line */
  function settleTo(ad, j) {
    var wake = j > 0;
    gsap.set(ad._sleep, { opacity: wake ? 0 : 1 });
    $$('.ap-rly', ad._scr).forEach(function (hst, i) {
      gsap.set(hst, { opacity: wake && i === j - 1 ? 1 : 0 });
      playClip(ad, i, wake && i === j - 1);
    });
    gsap.set(ad._pks, { opacity: 0, x: 0, y: 0, scale: .6 });
    gsap.set(ad._pulses, { opacity: 0, left: '0%' });
    gsap.set(ad._lns, { opacity: wake ? .34 : 0 });
    gsap.set(ad._hero, { opacity: j === 0 ? 1 : 0, y: 0 });
    ad._copies.forEach(function (c, i) { gsap.set(c, { opacity: i === j - 1 ? 1 : 0, x: 0 }); });
    gsap.set(ad._peek, { opacity: j === 0 ? 1 : 0, y: 0 });
    settleRows(ad, j);
    wordRest(ad, j === 0);
    paintDots(ad, j);
  }

  function show(step, k, d) {
    var ad = $('.admin', step); if (!ad || !ad._h) return;
    var from = ad._k; if (from === k) return;
    killRun(ad);
    settleTo(ad, from);                  // start every beat from a known pose
    ad._k = k;
    paintDots(ad, k);
    var tl = ad._tl = gsap.timeline({ onComplete: function () { ad._tl = null; } });

    if (from === 0) {
      // the room hands over to the machine: the word sinks, the console wakes
      tl.to(ad._hero, { opacity: 0, y: -18, duration: .4, ease: 'power2.in' }, 0);
      tl.to(ad._peek, { opacity: 0, y: 34, duration: .45, ease: 'power2.in' }, 0);
      wordIn(ad, .05, tl);
      wake(ad, k - 1, .3, tl);
      tl.fromTo(ad._copies[k - 1], { opacity: 0, x: -22 },
        { opacity: 1, x: 0, duration: .6, ease: 'power3.out', clearProps: 'x' }, .84);
      fire(ad, k - 1, 1.1, tl);
    } else if (k === 0) {
      // back to the room: the feed empties, the console sleeps, the word rises
      unfire(ad, from - 1, 0, tl);
      tl.to(ad._copies[from - 1], { opacity: 0, x: -16, duration: .36, ease: 'power2.in' }, .05);
      sleep(ad, from - 1, .46, tl);
      wordOut(ad, .9, tl);
      tl.fromTo(ad._hero, { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: .55, ease: 'power3.out', clearProps: 'transform' }, 1.1);
      tl.fromTo(ad._peek, { opacity: 0, y: 48 },
        { opacity: 1, y: 0, duration: .8, ease: 'back.out(1.5)' }, 1.3);
    } else {
      // between two beats the console never sleeps: the old recording is
      // swapped for the new one behind a short dim, and the feed fires again
      var back = k < from;
      if (back) unfire(ad, from - 1, 0, tl);
      tl.to(ad._copies[from - 1], { opacity: 0, x: -16, duration: .36, ease: 'power2.in' }, 0);
      swap(ad, from - 1, k - 1, back ? .34 : .1, tl);
      tl.fromTo(ad._copies[k - 1], { opacity: 0, x: -22 },
        { opacity: 1, x: 0, duration: .6, ease: 'power3.out', clearProps: 'x' }, back ? .72 : .5);
      if (!back) fire(ad, k - 1, .8, tl);
      else settleBack(ad, k, 1.0, tl);
    }
    tl.timeScale(SPEED);
  }

  /* the console coming awake: the sleeping face dissolves, the recording
     fades up behind it and the lines come on */
  function wake(ad, i, at, tl) {
    var host = clipHost(ad, i);
    tl.call(function () { playClip(ad, i, true); }, null, at);
    tl.to(ad._sleep, { opacity: 0, duration: .5, ease: 'power2.inOut' }, at)
      .fromTo(host, { opacity: 0 }, { opacity: 1, duration: .5, ease: 'power2.out' }, at + .18);
  }
  function sleep(ad, i, at, tl) {
    var host = clipHost(ad, i);
    tl.to(host, { opacity: 0, duration: .4, ease: 'power2.in' }, at)
      .call(function () { playClip(ad, i, false); }, null, at + .4)
      .fromTo(ad._sleep, { opacity: 0 }, { opacity: 1, duration: .5, ease: 'power2.out' }, at + .22);
    tl.to(ad._lns, { opacity: 0, duration: .4, ease: 'power2.in' }, at);
  }
  /* one recording out, the next in, without the console going dark between */
  function swap(ad, a, b, at, tl) {
    var oh = clipHost(ad, a), nh = clipHost(ad, b);
    tl.to(oh, { opacity: 0, duration: .34, ease: 'power2.in' }, at)
      .call(function () { playClip(ad, a, false); playClip(ad, b, true); }, null, at + .34)
      .fromTo(nh, { opacity: 0 }, { opacity: 1, duration: .46, ease: 'power2.out' }, at + .36);
  }

  /* leaving a beat backwards: the row this beat filled empties again and the
     lines drop back to rest */
  function unfire(ad, i, at, tl) {
    var v = VIEWS[i];
    ad._ogs.forEach(function (el, j) {
      if (v.row >= 0) clearRow(ad, j, v.row, at + j * .04, tl);
    });
    if (i === 0) {
      // beat 1 delivered the colleges themselves, so they go dark again
      tl.call(function () { ad._ogs.forEach(function (el) { el.classList.remove('on'); }); }, null, at + .3);
    }
  }
  /* and the pose that leaves behind */
  function settleBack(ad, k, at, tl) {
    tl.call(function () { settleRows(ad, k); }, null, at);
  }

  function paintDots(ad, k) {
    ad._copies.forEach(function (c) {
      $$('.ad-dot', c).forEach(function (d) { d.classList.toggle('on', +d.dataset.k === k); });
    });
  }

  function killRun(ad) {
    if (ad._tl) { ad._tl.kill(); ad._tl = null; }
    if (ad._wly) gsap.killTweensOf(wordParts(ad));
    gsap.killTweensOf([ad._sleep, ad._hero, ad._peek, ad._ap, ad._apIn]
      .concat(ad._pks, ad._pulses, ad._lns, ad._copies, ad._ogs, ad._ogIns,
        $$('.ap-rly', ad._scr), $$('.og-lit', ad), $$('.og-row u', ad)));
  }

  /* ───────── lifecycle ───────── */
  function prep(step) {
    var ad = $('.admin', step); if (!ad || !global.gsap) return null;
    stop(step);
    buildOnce(ad);
    ad._k = step._subAt | 0;
    layout(ad);
    settleTo(ad, ad._k);
    // the entrance plays from nothing, so everything that arrives is hidden
    gsap.set($('.ad-bg', ad), { opacity: 0 });
    gsap.set(ad._ap, { opacity: 0 });
    gsap.set(ad._ogs, { opacity: 0 });
    gsap.set(ad._lns, { opacity: 0 });
    gsap.set([ad._hero].concat(ad._copies), { opacity: 0 });
    gsap.set(ad._peek, { opacity: 0 });
    wordRest(ad, false);
    ad._h = true;
    if (!ad._onResize) {
      // The stage moves under this scene for a whole .45s while the rail
      // slides, and the event arrives on every frame of it. Re-seating costs
      // a layout and a handful of gsap.sets, so it is done on the frame it is
      // asked for: the scene travels with the stage instead of jumping once
      // the stage has stopped.
      ad._onResize = function () {
        if (!ad._built || !ad._h) return;
        // a resize is already a disruption; a beat caught mid-flight is
        // dropped and the scene re-seated, so pose and geometry agree
        killRun(ad);
        stopFloat(ad);
        layout(ad);
        settleTo(ad, ad._k);
        startFloat(ad);
      };
      addEventListener('resize', ad._onResize);
    }
    return ad._h;
  }

  function play(step) {
    var ad = $('.admin', step); if (!ad) return;
    if (!ad._h && !prep(step)) return;
    var k = ad._k, tl = ad._tl = gsap.timeline({ onComplete: function () { ad._tl = null; } });

    tl.to($('.ad-bg', ad), { opacity: 1, duration: .6, ease: 'power2.out' }, 0);
    // the console arrives first and the arc builds outward behind it, so the
    // room is read as "one panel, then the colleges it feeds" in that order
    tl.fromTo(ad._ap, { opacity: 0, y: 38, scale: .95 },
      { opacity: 1, y: 0, scale: 1, duration: .75, ease: 'power3.out' }, .08);
    var order = [2, 1, 3, 0, 4];
    order.forEach(function (j, n) {
      tl.fromTo(ad._ogs[j], { opacity: 0, y: 24, scale: .9 },
        { opacity: 1, y: 0, scale: 1, duration: .6, ease: 'power3.out' }, .34 + n * .08);
    });
    var last = .34 + order.length * .08 + .6;
    if (k > 0) tl.to(ad._lns, { opacity: .34, duration: .5, ease: 'power2.out' }, last - .2);
    // the drift only begins once every entrance has landed, so it takes over
    // from a settled pose rather than interrupting one
    tl.call(function () { startFloat(ad); }, null, last);

    if (k === 0) {
      wordOut(ad, .3, tl);
      tl.fromTo(ad._hero, { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: .6, ease: 'power3.out', clearProps: 'transform' }, .5);
      // the one peek in the whole deck
      if (!reduced) {
        tl.fromTo(ad._peek, { opacity: 0, y: 56 },
          { opacity: 1, y: 0, duration: .9, ease: 'back.out(1.5)' }, 1.05);
        tl.call(function () { blink(ad); }, null, 1.5);
      } else {
        tl.set(ad._peek, { opacity: 1 }, 1.0);
      }
    } else {
      // the beat's own choreography runs on its own clock at the beat speed,
      // so the packets and the recording stay in step with each other
      var sub = gsap.timeline();
      wake(ad, k - 1, 0, sub);
      sub.fromTo(ad._copies[k - 1], { opacity: 0, x: -22 },
        { opacity: 1, x: 0, duration: .6, ease: 'power3.out', clearProps: 'x' }, .3);
      // on a step opened directly at this beat the rows below it are already
      // full; only this beat's own row is delivered
      sub.call(function () { settleRows(ad, k - 1); }, null, .02);
      fire(ad, k - 1, .62, sub);
      sub.timeScale(SPEED);
      tl.add(sub, .5);
    }
  }

  /* the peek blinks on its own slow cycle while it is up */
  function blink(ad) {
    var eyes = $$('.o-eye', ad._peek);
    if (!eyes.length || reduced) return;
    stopBlink(ad);
    (function loop() {
      ad._blink = gsap.timeline({ onComplete: function () {
        ad._blinkWait = gsap.delayedCall(2 + Math.random() * 3, loop);
      } })
        .to(eyes, { scaleY: .08, duration: .24, ease: 'power2.in' })
        .to(eyes, { scaleY: 1, duration: .4, ease: 'back.out(2.2)' }, '+=0.12');
    })();
  }
  function stopBlink(ad) {
    if (ad._blink) { ad._blink.kill(); ad._blink = null; }
    if (ad._blinkWait) { ad._blinkWait.kill(); ad._blinkWait = null; }
    if (ad._peek) gsap.set($$('.o-eye', ad._peek), { scaleY: 1 });
  }

  function stop(step) {
    var ad = $('.admin', step); if (!ad || !ad._built) return;
    killRun(ad);
    stopFloat(ad);
    stopBlink(ad);
    $$('.ap-rly', ad._scr).forEach(function (h, i) { playClip(ad, i, false); });
    ad._h = null;
  }

  global.Admin = { prep: prep, play: play, stop: stop, show: show, VIEWS: VIEWS, ORGS: ORGS };
})(window);
