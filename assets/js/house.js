/* ══════════════════════════════════════════════════════════════════
   08 · ADMIN PANEL — "the admin house"

   The institution's machinery drawn as one building: a white isometric
   cutaway, drawn line by line, with five lit points standing beside the
   parts of it that matter. The route along the floor fills as you walk
   the section; each point in turn lights, and the recording for that
   part rises out of it with its description typing alongside.

   The model is generated, not drawn by hand — every box is placed in
   world coordinates and projected, so the geometry is exact at any
   size and the five points sit precisely over their own machinery.

   Lifecycle: prep (state before the fade-in) → play → stop.
   ══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function even(v) { v = Math.round(v); return v % 2 ? v + 1 : v; }
  var reduced = global.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var CLIP_AR = 1918 / 888;          // every admin recording is this shape
  /* The panel's picture is deliberately NOT that shape. Its width is pinned by
     the house beside it, so the only way to give it more picture is to give it
     more height — and the player fills the pane from the recording's top-left
     rather than fitting the whole frame into it. More rows, bigger, and the
     left-hand nav still in view. */
  var VID_AR = 1.55;

  /* How far the house steps back and aside while a point is open. It has
     to clear the panel, which takes most of the right of the room. */
  var AWAY = { s: .56, x: -33 }, AWAY_N = { s: .5, x: -39 };
  function away(hs) { return hs._geo && hs._geo.narrow ? AWAY_N : AWAY; }
  /* At rest the house sits right of centre, so the opening words have the
     left of the room to themselves instead of running under the roof. */
  var REST_X = 9;
  function restX(hs) { return hs._geo && hs._geo.narrow ? 0 : REST_X; }

  /* ───────── isometric projection ─────────
     x runs right-and-down, y runs left-and-down, z runs up. A box shows
     three faces: the top, the +x face on the right and the +y face on
     the left. Everything in the model is built from those. */
  var CO = Math.cos(Math.PI / 6), SI = 0.5, U = 15;
  function iso(x, y, z) { return [(x - y) * CO * U, (x + y) * SI * U - z * U]; }
  function pt(p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }
  function poly(pts, cls) {
    return '<polygon class="' + cls + '" points="' + pts.map(pt).join(' ') + '"/>';
  }
  function line(a, b, cls) {
    return '<line class="' + cls + '" x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) +
      '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '"/>';
  }
  /* one box: three faces and the three bright edges that catch the light */
  function box(x, y, z, w, d, h, tone) {
    tone = tone || '';
    var A = iso(x, y, z + h), B = iso(x + w, y, z + h), C = iso(x + w, y + d, z + h), D = iso(x, y + d, z + h);
    var b1 = iso(x + w, y, z), b2 = iso(x + w, y + d, z), b3 = iso(x, y + d, z);
    return poly([A, B, C, D], 'hs-top ' + tone) +
      poly([b1, b2, C, B], 'hs-rgt ' + tone) +
      poly([b3, b2, C, D], 'hs-lft ' + tone) +
      line(A, B, 'hs-ed') + line(B, C, 'hs-ed') + line(C, D, 'hs-ed') + line(D, A, 'hs-ed') +
      line(B, b1, 'hs-ed') + line(C, b2, 'hs-ed') + line(D, b3, 'hs-ed');
  }

  /* ───────── the five points ─────────
     Each one stands on the aisle beside the part of the building it
     belongs to — never on top of it, so the walk between them never has
     to climb over a rack — and carries what its recording actually shows. */
  var POINTS = [
    { key: 'orgs', clip: 'admin-orgs', tab: 'The panel',
      label: 'One panel, every college',
      h: 'One panel,', h2: 'every college.',
      say: 'Everything the platform holds, counted in one place — and granted out college by college.',
      pts: ['3,797 users · 1,14,271 programs solved',
            '16 courses · 952 modules · 3,194 topics · 3,389 problems',
            'Content Access grants a course to a college; Granted Content shows what each one holds'],
      at: [9.0, 5.0] },
    { key: 'company', clip: 'admin-company', tab: 'Company problems',
      label: 'Company problems',
      h: 'The company bank,', h2: 'tagged and counted.',
      say: 'Every problem a company has actually asked, filterable by company, complexity and tag — with the languages it is solvable in.',
      pts: ['2,781 problems across 52 companies',
            'Amazon 119 · Google 93 · Goldman Sachs 36 · Adobe 57',
            'C, C++, Java and Python shown present or missing, problem by problem'],
      at: [13.4, 5.2] },
    { key: 'dsa', clip: 'admin-dsa', tab: 'DSA problems',
      label: 'DSA problems',
      h: 'The practice bank,', h2: 'linked and tagged.',
      say: 'The data-structures bank: every problem carries its source link, its complexity, its tags and the trainer who added it.',
      pts: ['980 LeetCode-linked problems, tagged by technique',
            '205 AI Lab problems on OOPs and exception handling',
            'Sliding Window · Stack · Graph · Binary Tree · Dynamic Programming'],
      at: [16.3, 11.8] },
    { key: 'contests', clip: 'admin-contests', tab: 'Contest management',
      label: 'Contest management',
      h: 'Every contest,', h2: 'run from here.',
      say: 'Contests are created, opened and closed for each college from one list — with their questions, their registered students and their final standings.',
      pts: ['33 contests · 5 open · 28 closed · 3 organisations',
            'Window, registration and year set per contest',
            'Contest Reports opens the final standings for any of them'],
      at: [11.2, 15.1] },
    { key: 'content', clip: 'admin-content', tab: 'Videos and articles',
      label: 'Videos and articles',
      h: 'The teaching content,', h2: 'loaded once.',
      say: 'Videos and articles attach to a technology, a module and a topic — and every college mapped to that course picks them up.',
      pts: ['541 coding videos · 840 coding articles',
            'Mapped by technology, module and topic, each live or held back',
            'Topic, module and video order set here, with trainer notes and lab problems'],
      at: [8.6, 12.6] }
  ];

  /* The walk along the floor, in at the side door and round the building.
     Every leg runs down an aisle, and every point sits part way along a
     leg rather than on a corner, so the route passes cleanly through it
     instead of turning on top of it. */
  var ROUTE = [[0.6, 7.4], [9.0, 7.4], [9.0, 4.2], [13.4, 4.2], [13.4, 9.6],
               [16.3, 9.6], [16.3, 12.6], [11.2, 12.6], [11.2, 16.0],
               [8.6, 16.0], [8.6, 12.6]];

  var hs_routeD = '';
  /* Every prop's footprint, collected as the model is built, so the plan
     drawn behind the room is the same building and cannot drift from it. */
  var PLAN = [];

  /* a polyline with its corners rounded off, so the walk reads as a walk */
  function roundPath(ps, r) {
    function f(p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }
    if (ps.length < 3) return 'M' + ps.map(f).join('L');
    var d = 'M' + f(ps[0]), i;
    for (i = 1; i < ps.length - 1; i++) {
      var a = ps[i - 1], b = ps[i], c = ps[i + 1];
      var d1 = Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]));
      var d2 = Math.sqrt((c[0] - b[0]) * (c[0] - b[0]) + (c[1] - b[1]) * (c[1] - b[1]));
      if (!d1 || !d2) continue;
      var rr = Math.min(r, d1 / 2, d2 / 2);
      var p1 = [b[0] + (a[0] - b[0]) / d1 * rr, b[1] + (a[1] - b[1]) / d1 * rr];
      var p2 = [b[0] + (c[0] - b[0]) / d2 * rr, b[1] + (c[1] - b[1]) / d2 * rr];
      d += 'L' + f(p1) + 'Q' + f(b) + ' ' + f(p2);
    }
    return d + 'L' + f(ps[ps.length - 1]);
  }

  /* ───────── the building ───────── */
  var W = 24, D = 18, WALL = 8, ROOF_X = 8.6;   // footprint, wall height, roof span
  /* Every point stands clear of the roof. A point under it has to rise
     above the roof to be seen, and a pill floating over the roof lands on
     the house's name — so the two left-hand points stand at the mouth of
     their bay, on the aisle, rather than inside it. */
  function headZ(q) { return q.at[0] < ROOF_X - .5 ? WALL + 2.6 : 5.6; }
  POINTS.forEach(function (q) { q.z = headZ(q); });

  function rack(x, y, rows, tone) {
    var s = '', i, L;
    PLAN.push([x, y, 1.3, (rows - 1) * 2.6 + 2]);
    for (i = 0; i < rows; i++) {
      var yy = y + i * 2.6;
      s += box(x, yy, 0, 1.3, 2, 4.2, tone);
      // the plates, so a block of white reads as a shelf stack
      for (L = 1; L <= 2; L++) s += box(x - .07, yy - .07, L * 1.35, 1.44, 2.14, .16, 'hs-plate');
      s += box(x - .1, yy - .1, 4.2, 1.5, 2.2, .2, 'hs-plate');
      // and a crate or two sitting on it
      if ((i + x) % 2 < 1) s += box(x + .18, yy + .3, 4.4, .9, .9, .62, 'hs-crate');
    }
    return s;
  }
  function crates(x, y, n, tone) {
    var s = '', i;
    PLAN.push([x, y, Math.min(n, 2) * .95, Math.ceil(n / 2) * .95]);
    for (i = 0; i < n; i++) s += box(x + (i % 2) * .95, y + Math.floor(i / 2) * .95, 0, .8, .8, .7, tone);
    return s;
  }

  // a box that also leaves its footprint on the plan
  function pbox(x, y, z, w, d, h, tone) { PLAN.push([x, y, w, d]); return box(x, y, z, w, d, h, tone); }

  function buildModel() {
    var s = '', i, j;
    PLAN.length = 0;

    // ── the ground: fine graph paper, as in the reference ──
    var g = '';
    for (i = -5; i <= W + 5; i += 2) g += line(iso(i, -5, 0), iso(i, D + 5, 0), 'hs-grid');
    for (j = -5; j <= D + 5; j += 2) g += line(iso(-5, j, 0), iso(W + 5, j, 0), 'hs-grid');
    s += '<g class="hs-ground">' + g + '</g>';

    // ── the slab, with a little thickness ──
    s += '<g class="hs-slab">' + box(0, 0, -.5, W, D, .5, 'hs-floor') + '</g>';

    // ── the two standing walls ──
    s += '<g class="hs-wall">' +
      box(0, 0, 0, W, .4, WALL, 'hs-pale') +            // the back wall
      box(0, .4, 0, .4, D - .4, WALL, 'hs-pale') +      // the left wall
      '</g>';

    // ── the roof over the left third, with the house's name on it ──
    s += '<g class="hs-roof">' + box(-.5, -.5, WALL, ROOF_X, D + 1, .45, 'hs-roofTone') + '</g>';

    // ── the machinery ──
    // Nothing here may stand on an aisle the route uses, and nothing may
    // stand inside anything else: every block below is placed clear of its
    // neighbours, which is what keeps the structure lines reading cleanly.
    var p = '';
    // the control desk: the panel itself, back-left under the roof
    p += pbox(2.4, 1.6, 0, 4.6, 2.4, .9, 'hs-desk');
    p += box(2.4, 1.6, .9, 4.6, .25, 1.9, 'hs-screen');      // the big board on it
    p += box(3.2, 4.6, 0, 1.1, 1.1, .5, 'hs-pale');
    p += box(5.2, 4.6, 0, 1.1, 1.1, .5, 'hs-pale');
    // the content shelves, front-left: videos and articles
    p += rack(3.2, 10.4, 3, 'hs-rack');
    p += rack(5.6, 10.4, 3, 'hs-rack');
    p += crates(1.0, 12.4, 4, 'hs-crate');                   // stacked against the left wall
    // the company bank, back-right
    p += rack(14.4, 1.8, 3, 'hs-rack');
    p += rack(16.8, 1.8, 3, 'hs-rack');
    p += rack(19.2, 1.8, 3, 'hs-rack');
    // the practice bank, mid-right — set clear of the company bank's front edge
    p += rack(17.4, 10.2, 3, 'hs-rack');
    p += rack(19.8, 10.2, 3, 'hs-rack');
    // the contest stage, front-right
    p += pbox(12.4, 13.4, 0, 4.4, 3.2, .5, 'hs-dais');
    p += box(13.1, 13.9, .5, 1, 1, 1.5, 'hs-podium');       // first
    p += box(14.4, 14.2, .5, 1, 1, 1.05, 'hs-podium');      // second
    p += box(15.7, 14.2, .5, 1, 1, .75, 'hs-podium');       // third
    p += box(12.4, 13.4, 2.6, 4.4, .22, 1.5, 'hs-screen');  // the board over it
    // the van at the dock, front edge
    p += pbox(8.6, 16.6, 0, 3.4, 1.7, 1.5, 'hs-van');
    p += box(11.6, 16.9, 0, 1.4, 1.2, 1.2, 'hs-vanCab');
    s += '<g class="hs-props">' + p + '</g>';

    // ── the route along the floor ──
    hs_routeD = roundPath(ROUTE.map(function (q) { return iso(q[0], q[1], .06); }), 9);

    return s;
  }

  /* The stems belong to the walk, not to the building: they ride in the
     route's layer so that the line from a pill down to its own place on the
     floor is still readable once the building has dimmed behind the panel. */
  function buildStems() {
    var st = '';
    POINTS.forEach(function (q) {
      st += line(iso(q.at[0], q.at[1], .1), iso(q.at[0], q.at[1], q.z), 'hs-stem');
    });
    return '<g class="hs-stems">' + st + '</g>';
  }

  /* The room's watermark: the plan the model was drawn from. The deck gives
     each room one of these — a report sheet for Reports, a console for the old
     admin — and for a building it can only be its own floor plan, flat and
     square against the isometric view, at a whisper. */
  function planHtml() {
    var M = 2.4, VW = W + M * 2, VH = D + M * 2 + 3.6, i, j;
    var s = '<svg class="hs-plan" viewBox="0 0 ' + VW.toFixed(1) + ' ' + VH.toFixed(1) +
      '" preserveAspectRatio="xMidYMid meet" aria-hidden="true">';
    s += '<g transform="translate(' + M + ',' + M + ')">';
    s += '<rect class="hs-pl-roof" x="-.5" y="-.5" width="' + ROOF_X + '" height="' + (D + 1) + '"/>';
    s += '<rect class="hs-pl-slab" x="0" y="0" width="' + W + '" height="' + D + '"/>';
    s += '<rect class="hs-pl-wall" x="0" y="0" width="' + W + '" height=".4"/>';
    s += '<rect class="hs-pl-wall" x="0" y=".4" width=".4" height="' + (D - .4) + '"/>';
    PLAN.forEach(function (q) {
      s += '<rect class="hs-pl-p" x="' + q[0] + '" y="' + q[1] + '" width="' + q[2] + '" height="' + q[3] + '"/>';
    });
    s += '<path class="hs-pl-rt" d="M' + ROUTE.map(function (q) { return q[0] + ' ' + q[1]; }).join('L') + '"/>';
    POINTS.forEach(function (q) {
      s += '<circle class="hs-pl-n" cx="' + q.at[0] + '" cy="' + q.at[1] + '" r=".42"/>';
    });
    // the ticks a drawing carries along its edges
    for (i = 0; i <= W; i += 2) s += '<path class="hs-pl-tk" d="M' + i + ' ' + D + 'v.8"/>';
    for (j = 0; j <= D; j += 2) s += '<path class="hs-pl-tk" d="M' + W + ' ' + j + 'h.8"/>';
    s += '</g>';
    // and its title block
    s += '<g transform="translate(' + M + ',' + (M + D + 2) + ')">' +
      '<path class="hs-pl-rule" d="M0 0H' + W + '"/>' +
      '<text class="hs-pl-t1" x="0" y="1.7">OWL CODER</text>' +
      '<text class="hs-pl-t2" x="' + W + '" y="1.7" text-anchor="end">ADMIN PANEL · PLAN</text>' +
      '</g>';
    return s + '</svg>';
  }

  /* where a point's pill sits, in the svg's own coordinates */
  function headOf(q) { return iso(q.at[0], q.at[1], q.z || 5.6); }

  function viewBox() {
    // every corner the model can reach, plus room for the grid and the pills
    var xs = [], ys = [], m = 1.4;
    [[-m, -m, 0], [W + m, -m, 0], [W + m, D + m, 0], [-m, D + m, 0],
     [0, 0, WALL + 1], [W, 0, WALL + 1], [0, D, WALL + 1]].forEach(function (q) {
      var p = iso(q[0], q[1], q[2]); xs.push(p[0]); ys.push(p[1]);
    });
    POINTS.forEach(function (q) { var p = headOf(q); ys.push(p[1] - 22); });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
    var y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }

  /* An svg with preserveAspectRatio="meet" letterboxes its own contents, so
     a point's position is NOT its share of the element's width. This is the
     real mapping, and it is what keeps every pill standing on its own stem. */
  function fit(hs) {
    var vb = hs._vb, SW = hs._geo.W, SH = hs._geo.H;
    var s = Math.min(SW / vb.w, SH / vb.h);
    return { s: s, ox: (SW - vb.w * s) / 2, oy: (SH - vb.h * s) / 2 };
  }

  /* ───────── build ───────── */
  /* The room's own motion. Rings go out from three places in it, the way a
     panel reaches the colleges it serves, and motes drift up through the
     drawing. Both move on transform and opacity alone, so the whole thing is
     handed to the compositor and costs the scene nothing. */
  function airHtml() {
    var rings = [[17, 70, 0], [84, 26, 2.6], [58, 88, 5.1], [31, 18, 3.8]];
    var s = '<div class="hs-air" aria-hidden="true">';
    rings.forEach(function (r) {
      s += '<i class="hs-ring" style="--x:' + r[0] + '%;--y:' + r[1] + '%;--d:-' + r[2] + 's"></i>';
    });
    for (var i = 0; i < 14; i++) {
      var x = (i * 37 + 11) % 97, y = (i * 53 + 23) % 92;
      s += '<i class="hs-mote" style="--x:' + x + '%;--y:' + y + '%;--d:-' +
        (i * 1.31).toFixed(2) + 's;--s:' + (0.6 + (i % 4) * 0.22).toFixed(2) + '"></i>';
    }
    return s + '</div>';
  }

  function buildOnce(hs) {
    if (hs._built) return;
    hs._built = true;
    var vb = hs._vb = viewBox();
    var VB = vb.x.toFixed(1) + ' ' + vb.y.toFixed(1) + ' ' + vb.w.toFixed(1) + ' ' + vb.h.toFixed(1);

    // the model is built first: the plan behind the room is made of the
    // footprints it collects on the way
    var model = buildModel();

    var h = '<div class="hs-room" aria-hidden="true"><i class="hs-sky"></i>' +
      '<i class="hs-weave"></i>' + planHtml() + '<i class="hs-wash"></i>' +
      airHtml() + '<i class="hs-vig"></i></div>';

    h += '<div class="hs-stage" aria-hidden="true">' +
      '<svg class="hs-svg hs-model" viewBox="' + VB + '" preserveAspectRatio="xMidYMid meet">' +
      model + '</svg>' +
      // the route rides in its own layer so it keeps its colour while the
      // building dims: it is the one thing that says how far through you are
      '<svg class="hs-svg hs-routetop" viewBox="' + VB + '" preserveAspectRatio="xMidYMid meet">' +
      buildStems() +
      '<path class="hs-route-bed" d="' + hs_routeD + '"/>' +
      '<path class="hs-route-lit" d="' + hs_routeD + '"/>' +
      POINTS.map(function (q) {
        var f = iso(q.at[0], q.at[1], .06);
        return '<circle class="hs-node" cx="' + f[0].toFixed(1) + '" cy="' + f[1].toFixed(1) + '" r="2.8"/>';
      }).join('') +
      '<circle class="hs-route-head" cx="0" cy="0" r="2.6" opacity="0"/>' +
      '</svg>';

    // the name on the roof, laid on the roof plane
    // the name runs down the roof's long axis: text-x maps to world +y and
    // text-y to world +x, which is what lays type flat on an isometric plane
    var o = iso(3.3, 16.2, WALL + .45);
    var mx = (CO * U).toFixed(3), my = (SI * U).toFixed(3);
    h += '<svg class="hs-svg hs-rooftext" viewBox="' + VB + '" preserveAspectRatio="xMidYMid meet">' +
      '<g transform="matrix(' + mx + ',' + (-my) + ',' + mx + ',' + my + ',' +
      o[0].toFixed(1) + ',' + o[1].toFixed(1) + ')">' +
      '<text class="hs-rt" x="0" y="0">ADMIN</text>' +
      '<text class="hs-rt2" x=".12" y="1.9">OWL CODER</text>' +
      '</g></svg>';

    // the five points — placed in pixels by layout(), never in percentages
    POINTS.forEach(function (q, i) {
      h += '<button class="hs-pin" data-i="' + i + '"><i class="hs-dot"></i><b>' + q.label + '</b></button>';
    });
    h += '</div>';

    // the opening words
    h += '<div class="hs-copy hs-hero"><div class="hs-kick"><b>08 · Admin Panel</b></div>' +
      '<h2 class="hs-h">The house <em>it all runs from.</em></h2>' +
      '<p class="hs-say">One panel behind every college: the problem banks, the teaching content, the contests and who may see what. Five rooms of it, in order.</p></div>';

    // the panel that rises out of a point
    h += '<div class="hs-pop" aria-hidden="true">' +
      '<svg class="hs-lead"><path class="hs-lead-p" d=""/></svg>' +
      '<div class="hs-card">' +
      '<div class="hs-show">' +
      '<div class="hs-slate"><i class="hs-slate-dot"></i>' +
      '<span class="hs-slate-t"><b class="hs-slate-b"></b><b class="hs-slate-f"></b></span>' +
      '<s class="hs-slate-r"></s><em class="hs-slate-n"></em></div>' +
      '<div class="hs-vid"><div class="hs-rly"></div><i class="hs-gloss"></i></div></div>' +
      '<div class="hs-txt"><div class="hs-kick"><b></b><s></s><em></em></div>' +
      '<h3 class="hs-ph"></h3><p class="hs-psay"></p><div class="hs-plist"></div></div>' +
      '</div></div>';

    h += '<div class="hs-nav">' + POINTS.map(function (_, j) {
      return '<span class="hs-dotn" data-k="' + (j + 1) + '"></span>';
    }).join('') + '<em></em></div>';

    hs.innerHTML = h;
    hs._svg = $('.hs-model', hs);
    hs._stage = $('.hs-stage', hs);
    hs._pins = $$('.hs-pin', hs);
    // the pill stands its foot on its head point — see house.css
    gsap.set(hs._pins, { xPercent: -50, yPercent: -100, transformOrigin: '50% 100%' });
    hs._route = $('.hs-route-lit', hs);
    hs._nodes = $$('.hs-node', hs);
    hs._head = $('.hs-route-head', hs);
    hs._pop = $('.hs-pop', hs);
    hs._card = $('.hs-card', hs);
    hs._lead = $('.hs-lead-p', hs);
    hs._hero = $('.hs-hero', hs);
    hs._nav = $('.hs-nav', hs);
    hs._rlyHost = $('.hs-rly', hs);
    hs._ph = $('.hs-ph', hs);
    hs._psay = $('.hs-psay', hs);
    hs._plist = $('.hs-plist', hs);
    hs._pkick = $('.hs-txt .hs-kick', hs);
    hs._plate = $('.hs-slate', hs);
    hs._plateB = $('.hs-slate-b', hs);
    hs._plateF = $('.hs-slate-f', hs);
    hs._plateR = $('.hs-slate-r', hs);
    hs._plateN = $('.hs-slate-n', hs);
    hs._rly = [];
    hs._fo = { f: 0 };
    hs._draw = $$('.hs-grid, .hs-ed, .hs-stem', hs);

    var L = hs._route.getTotalLength();
    hs._routeLen = L;
    gsap.set(hs._route, { strokeDasharray: L, strokeDashoffset: L });

    // one player per recording, all sharing the single panel
    POINTS.forEach(function (q, i) {
      if (!global.Recordly) return;
      var host = document.createElement('div');
      host.className = 'hs-one';
      host.style.opacity = '0';
      hs._rlyHost.appendChild(host);
      global.Recordly.load(host, 'assets/video/' + q.clip + '.mp4', 'assets/video/' + q.clip + '.cues.json',
        { autoplay: false, pad: 0, bg: '#F6FAF8', loop: true,
          // the panel is 780px wide and the recordings are 1918px, so the
          // camera never shows one whole: it rests held in on the top-left,
          // where the admin's nav, breadcrumb and first columns live
          base: 1.08, baseAt: [0, 0], gain: 1, fill: true, align: 'start',
          blur: 1 / 1100, maxBlur: 1.6 })
        .then(function (r) {
          hs._rly[i] = r;
          if (hs._h && hs._k === i + 1) playClip(hs, i, true);
        });
    });

    var step = hs.closest('.step');
    $$('.hs-dotn', hs).forEach(function (d) {
      d.addEventListener('click', function () { if (global.deckSetSub && step) global.deckSetSub(step, +d.dataset.k); });
    });
    hs._pins.forEach(function (b) {
      b.addEventListener('click', function () { if (global.deckSetSub && step) global.deckSetSub(step, +b.dataset.i + 1); });
    });
    if (step) step.addEventListener('substep', function (e) { show(step, e.detail.k, e.detail.d); });
  }

  /* ───────── geometry ───────── */
  function layout(hs) {
    var SW = hs.clientWidth || innerWidth, SH = hs.clientHeight || innerHeight, narrow = SW <= 1080;
    hs.classList.toggle('narrow', narrow);
    var k = narrow ? clamp(SW / 880, .6, 1) : clamp(Math.min(SW / 1600, SH / 880), .72, 1.2);
    hs.style.setProperty('--k', k.toFixed(3));

    var gut = Math.round(58 * k);
    hs._hero.style.left = gut + 'px';
    hs._hero.style.top = Math.round(gut * .62) + 'px';
    hs._hero.style.width = even(clamp(470 * k, 320, 520)) + 'px';

    // the model takes the whole stage; the words sit over its empty top-left
    var st = hs._stage;
    st.style.left = '0px'; st.style.top = '0px';
    st.style.width = SW + 'px'; st.style.height = SH + 'px';

    hs._nav.style.cssText = 'position:absolute;left:' + gut + 'px;bottom:' +
      Math.round(34 * k) + 'px;font-size:' + (16 * k).toFixed(1) + 'px';

    hs._geo = { W: SW, H: SH, k: k, gut: gut, narrow: narrow };

    // every pill stands on the top of its own stem
    var F = fit(hs), vb = hs._vb;
    POINTS.forEach(function (q, i) {
      var p = headOf(q), b = hs._pins[i];
      b.style.left = (F.ox + (p[0] - vb.x) * F.s).toFixed(1) + 'px';
      b.style.top = (F.oy + (p[1] - vb.y) * F.s).toFixed(1) + 'px';
    });
    // and its natural size, read with every label open and transitions off
    hs.classList.add('hs-measuring');
    hs._pinNat = hs._pins.map(function (b) { return { w: b.offsetWidth, h: b.offsetHeight }; });
    hs.classList.remove('hs-measuring');

    sizeCard(hs);
    return hs._geo;
  }

  /* the panel's box, and where it sits relative to the point it came from */
  function sizeCard(hs) {
    var g = hs._geo, SW = g.W, SH = g.H, k = g.k, cw, vw, vh, ch;
    if (g.narrow) {
      cw = even(clamp(SW * .78, 420, 760));
      vw = cw - Math.round(34 * k);
      vh = Math.round(vw / VID_AR);
      ch = Math.min(Math.round(SH - 90 * k), vh + Math.round(334 * k));
    } else {
      cw = even(clamp(SW * .615, 560, 1140));
      vw = Math.round(cw * .66);
      vh = Math.round(vw / VID_AR);
      ch = Math.max(vh + Math.round(80 * k), Math.round(372 * k));
    }
    hs._card.style.width = cw + 'px';
    hs._card.style.height = ch + 'px';
    hs._card.style.setProperty('--vw', vw + 'px');
    // the picture's box is the picture's own shape, so the player never has to
    // letterbox it inside a taller frame
    $('.hs-vid', hs).style.height = vh + 'px';
    hs._card.style.fontSize = (16 * k).toFixed(1) + 'px';
    hs._cardBox = { w: cw, h: ch };
  }

  /* ───────── the recordings ───────── */
  function playClip(hs, i, on) {
    var r = hs._rly && hs._rly[i]; if (!r) return;
    try {
      var pr = on ? (r.restart ? r.restart() : r.play()) : (r.pause ? r.pause() : r.stop && r.stop());
      if (pr && pr.catch) pr.catch(function () {});
    } catch (e) {}
  }
  function showClip(hs, i) {
    $$('.hs-one', hs._rlyHost).forEach(function (h, j) {
      gsap.set(h, { opacity: j === i ? 1 : 0 });
      if (j !== i) playClip(hs, j, false);
    });
    if (i >= 0) playClip(hs, i, true);
  }

  /* ───────── the words that type themselves ───────── */
  function typeInto(el, text, dur) {
    var tl = gsap.timeline(), o = { n: 0 };
    el.textContent = '';
    el.classList.add('hs-typing');
    tl.to(o, { n: text.length, duration: dur, ease: 'none',
      onUpdate: function () { el.textContent = text.slice(0, Math.round(o.n)); } })
      .call(function () { el.classList.remove('hs-typing'); });
    return tl;
  }

  /* ───────── a point opens ───────── */
  /* A pill's box, worked out rather than measured. Measuring is wrong here:
     at the moment the panel is placed, the pill is still growing — its label
     is unfolding and its counter-scale is still running — so a measured right
     edge lands inside the name and the line to the panel strikes through it.
     Everything needed is known instead: layout() put the pill's foot at a
     fixed point, the step-aside is a known transform about the stage's
     middle, and the pill is counter-scaled, so it renders at its natural
     size whatever the house is doing. */
  function pinBox(hs, i, open) {
    var A = away(hs), g = hs._geo, n = (hs._pinNat || [])[i] || { w: 0, h: 0 }, b = hs._pins[i];
    var fx = parseFloat(b.style.left) || 0, fy = parseFloat(b.style.top) || 0;
    var s = open ? A.s : 1, tx = (open ? A.x : restX(hs)) / 100 * g.W;
    return { x: g.W / 2 + s * (fx - g.W / 2) + tx,      // the foot, where the stem lands
             y: g.H / 2 + s * (fy - g.H / 2),
             w: n.w, h: n.h };
  }
  function pinCentre(hs, i, open) { var p = pinBox(hs, i, open); return { x: p.x, y: p.y - p.h / 2 }; }
  /* where the line to the panel leaves the pill: clear of its right-hand edge */
  function pinEdge(hs, i, open) { var p = pinBox(hs, i, open); return { x: p.x + p.w / 2 + 6, y: p.y - p.h / 2 }; }

  function placeCard(hs, i, open) {
    var g = hs._geo, b = hs._cardBox, c = pinEdge(hs, i, open !== false);
    // the house has stepped aside, so the panel takes the right of the room
    var x = Math.round(g.W - b.w - g.gut * .9);
    var y = Math.round(clamp(g.H * .5 - b.h / 2, g.H * .14, Math.max(g.H * .14, g.H - b.h - 40 * g.k)));
    hs._pop.style.left = x + 'px';
    hs._pop.style.top = y + 'px';
    hs._pop.style.width = b.w + 'px';
    hs._pop.style.height = b.h + 'px';
    return { x: x, y: y, c: c };
  }

  function leadPath(hs, box, dy) {
    // from the point, across the room, into the panel's near edge
    var x0 = box.c.x - box.x, y0 = box.c.y - box.y + (dy || 0);
    var y1 = clamp(y0, 30, hs._cardBox.h - 30);
    var mx = x0 / 2;
    hs._lead.setAttribute('d', 'M' + x0.toFixed(1) + ' ' + y0.toFixed(1) +
      'C' + mx.toFixed(1) + ' ' + y0.toFixed(1) + ' ' + mx.toFixed(1) + ' ' + y1.toFixed(1) +
      ' 0 ' + y1.toFixed(1));
  }
  function drawLead(hs, box) {
    leadPath(hs, box, 0);
    var L = hs._lead.getTotalLength();
    gsap.set(hs._lead, { strokeDasharray: L, strokeDashoffset: L });
    return L;
  }

  /* ───────── the house breathes ─────────
     While a point is open the house is small and still, and the slide has
     nothing moving in it but the recording. So it floats, gently and for as
     long as the point is open. The tween drives a plain object rather than the
     stage, so killRun's sweep of the stage's tweens never stops it — and the
     line to the panel is re-struck each frame from the point's new height, so
     it stays fixed to the pill at one end and the panel at the other. */
  function floatStart(hs) {
    // a re-seat mid-resize restarts the float; picking the phase back up keeps
    // the house bobbing through it instead of snapping to the top of the arc
    var phase = hs._float ? hs._float.totalTime() : 0;
    floatStop(hs);
    var o = hs._fl = { y: 0 };
    hs._float = gsap.to(o, { y: -13, duration: 1.75, ease: 'sine.inOut',
      repeat: -1, yoyo: true, onUpdate: function () {
        gsap.set(hs._stage, { y: o.y });
        if (hs._k > 0 && hs._box) leadPath(hs, hs._box, o.y);
      } });
    if (phase) hs._float.totalTime(phase);
  }
  function floatStop(hs, soft) {
    if (hs._float) { hs._float.kill(); hs._float = null; }
    if (!hs._stage) return;
    // mid-float the house is up to 13px off its mark; on a beat change let it
    // come down rather than snap
    if (soft) gsap.to(hs._stage, { y: 0, duration: .35, ease: 'sine.out' });
    else gsap.set(hs._stage, { y: 0 });
  }

  /* ───────── the walk along the floor ─────────
     One number drives all three things that show it: how much of the lit
     line is drawn, where its head sits, and which floor nodes have been
     reached. They cannot disagree, because there is only one of them. */
  function paintRoute(hs, f) {
    hs._fo.f = f;
    hs._route.style.strokeDashoffset = (hs._routeLen * (1 - f)).toFixed(2);
    var p = hs._route.getPointAtLength(hs._routeLen * clamp(f, 0, 1));
    hs._head.setAttribute('cx', p.x.toFixed(1));
    hs._head.setAttribute('cy', p.y.toFixed(1));
    hs._head.setAttribute('opacity', f > .004 ? '1' : '0');
    hs._nodes.forEach(function (n, i) { n.classList.toggle('on', f >= routeFrac(i) - .006); });
  }
  function fillTo(hs, k, dur, tl, at) {
    var to = k <= 0 ? 0 : routeFrac(k - 1), o = hs._fo;
    tl.to(o, { f: to, duration: dur, ease: 'power2.inOut',
      onUpdate: function () { paintRoute(hs, o.f); } }, at);
  }
  /* how far along the route each point stands */
  function routeFrac(i) {
    if (hs_frac) return hs_frac[i];
    return (i + 1) / POINTS.length;
  }
  var hs_frac = null;
  function measureRoute(hs) {
    // walk the path and find the length at which it passes each point
    var p = hs._route, L = hs._routeLen, out = [];
    POINTS.forEach(function (q) {
      var want = iso(q.at[0], q.at[1], .06), best = 0, bd = 1e9;
      for (var s = 0; s <= L; s += L / 600) {
        var g = p.getPointAtLength(s);
        var d = (g.x - want[0]) * (g.x - want[0]) + (g.y - want[1]) * (g.y - want[1]);
        if (d < bd) { bd = d; best = s; }
      }
      out.push(best / L);
    });
    out[out.length - 1] = 1;              // the last point is the end of the walk
    hs_frac = out;
  }

  /* ───────── poses ─────────
     The pills ride inside the stage, so when the house steps back they would
     shrink with it and the names would be unreadable. Each one is scaled by
     the inverse, about its own foot, so the name stays the size it was — and
     the four that are not open fold away to just their dot. */
  function posePins(hs, k, tl, at) {
    var A = away(hs), comp = k > 0 ? 1 / A.s : 1, lit = k - 1;
    var rest = comp * (k > 0 ? .84 : .92);
    if (tl) tl.to(hs._pins, { scale: rest, duration: .5, ease: 'power2.inOut',
      transformOrigin: '50% 100%' }, at);
    else hs._pins.forEach(function (b, i) {
      gsap.set(b, { autoAlpha: 1, scale: i === lit ? comp : rest, transformOrigin: '50% 100%' });
    });
    return comp;
  }

  function settleTo(hs, k) {
    killRun(hs);
    hs._k = k;
    var lit = k - 1, A = away(hs);
    hs._pins.forEach(function (b, i) { b.classList.toggle('on', i === lit); });
    hs._stage.classList.toggle('dim', k > 0);
    hs._stage.classList.toggle('away', k > 0);
    // the room behind moves out of the house's way — see house.css
    hs.classList.toggle('hs-open', k > 0);
    posePins(hs, k, null, 0);
    gsap.set(hs._stage, k > 0 ? { scale: A.s, xPercent: A.x, transformOrigin: '50% 50%' }
                              : { scale: 1, xPercent: restX(hs), transformOrigin: '50% 50%' });
    paintRoute(hs, k <= 0 ? 0 : routeFrac(k - 1));
    gsap.set(hs._hero, { autoAlpha: k === 0 ? 1 : 0, y: 0 });
    gsap.set(hs._pop, { autoAlpha: k > 0 ? 1 : 0 });
    gsap.set(hs._card, { autoAlpha: k > 0 ? 1 : 0, scale: 1, y: 0 });
    gsap.set(hs._lead, { opacity: k > 0 ? 1 : 0 });
    if (k > 0) {
      fillText(hs, lit);
      var bx = placeCard(hs, lit); drawLead(hs, bx);
      gsap.set(hs._lead, { strokeDashoffset: 0 });
      showClip(hs, lit);
      plateRest(hs);
      hs._box = bx;
      floatStart(hs);
    } else { showClip(hs, -1); floatStop(hs); }
    paintDots(hs, k);
  }

  function fillText(hs, i) {
    var q = POINTS[i];
    hs._pkick.innerHTML = '<b>08 · Admin Panel</b>';
    hs._plateB.textContent = hs._plateF.textContent = q.tab;
    hs._plateN.textContent = '0' + (i + 1) + ' / 0' + POINTS.length;
    hs._ph.innerHTML = q.h + ' <em>' + q.h2 + '</em>';
    hs._psay.textContent = q.say;
    hs._plist.innerHTML = q.pts.map(function (t) { return '<span>' + t + '</span>'; }).join('');
  }

  /* The plate at rest: the name filled in, the rule drawn. */
  function plateRest(hs) {
    gsap.set(hs._plate, { autoAlpha: 1, x: 0 });
    gsap.set(hs._plateF, { clipPath: 'inset(0 0% 0 0)', x: 0 });
    gsap.set(hs._plateR, { scaleX: 1, transformOrigin: '0% 50%' });
  }
  /* and the state it fills from */
  function plateArm(hs) {
    gsap.set(hs._plate, { autoAlpha: 1, x: 0 });
    gsap.set(hs._plateF, { clipPath: 'inset(0 100% 0 0)', x: 0 });
    gsap.set(hs._plateR, { scaleX: 0, transformOrigin: '0% 50%' });
  }

  function paintDots(hs, k) {
    $$('.hs-dotn', hs._nav).forEach(function (d) { d.classList.toggle('on', +d.dataset.k === k); });
    $('em', hs._nav).textContent = k === 0 ? 'the house' : k + ' / ' + POINTS.length;
  }

  function killRun(hs) {
    if (hs._tl) { hs._tl.kill(); hs._tl = null; }
    if (hs._type) { hs._type.kill(); hs._type = null; }
    if (hs._plateF) gsap.killTweensOf([hs._plateF, hs._plateR, hs._plateN]);
    if (hs._warm) { hs._warm.kill(); hs._warm = null; }
    gsap.killTweensOf([hs._route, hs._pop, hs._card, hs._lead, hs._hero, hs._fo, hs._stage].concat(hs._pins));
  }

  /* The first time the panel is shown the browser has to paint the whole of
     it — a recording and a column of type — and that is most of a second of
     main thread. The same lesson as the contest sheets: it is painted once at
     a five-hundredth of an opacity while the house is just standing there. */
  function warmCard(hs) {
    if (hs._warmed) return;
    hs._warmed = true;
    fillText(hs, 0);
    placeCard(hs, 0);
    gsap.set([hs._pop, hs._card], { autoAlpha: .002 });
    // and every recording in turn: each one's first frame costs its own decode,
    // so all five are paid for here rather than one per point as you walk
    var tl = hs._warm = gsap.timeline({ onComplete: function () {
      hs._warm = null;
      if (hs._k === 0) {
        // back to exactly the pose the beat rests in
        gsap.set([hs._pop, hs._card], { autoAlpha: 0 });
        showClip(hs, -1);
      }
    } });
    POINTS.forEach(function (_, i) {
      tl.call(function () { if (hs._k === 0) showClip(hs, i); }, null, i * .24);
    });
    tl.to({}, { duration: .3 }, POINTS.length * .24);
  }

  /* ───────── walking the five ───────── */
  function show(step, k, d) {
    var hs = $('.house', step); if (!hs || !hs._h) return;
    var from = hs._k; if (from === k) return;
    killRun(hs);
    settleTo(hs, from);
    floatStop(hs);          // it holds still while it travels
    hs._k = k;
    paintDots(hs, k);
    var A = away(hs);
    var tl = hs._tl = gsap.timeline({ onComplete: function () { hs._tl = null; } });

    // 1 · what is open goes back into its point
    if (from > 0) {
      var oc = pinCentre(hs, from - 1, true), ob = hs._pop.getBoundingClientRect(), hb = hs.getBoundingClientRect();
      tl.to(hs._lead, { opacity: 0, duration: .22 }, 0)
        .to(hs._card, { autoAlpha: 0, scale: .82, duration: .34, ease: 'power2.in',
          transformOrigin: ((oc.x - (ob.left - hb.left)) / ob.width * 100).toFixed(1) + '% ' +
            ((oc.y - (ob.top - hb.top)) / ob.height * 100).toFixed(1) + '%' }, 0)
        .call(function () { showClip(hs, -1); }, null, .34);
      tl.call(function () { hs._pins[from - 1].classList.remove('on'); }, null, .3);
    } else {
      tl.to(hs._hero, { autoAlpha: 0, y: -16, duration: .34, ease: 'power2.in' }, 0);
    }

    // 2 · the house steps aside (or back), and the route runs on
    hs._stage.classList.toggle('dim', k > 0);
    hs._stage.classList.toggle('away', k > 0);
    hs.classList.toggle('hs-open', k > 0);
    tl.to(hs._stage, { scale: k > 0 ? A.s : 1, xPercent: k > 0 ? A.x : restX(hs),
      duration: .62, ease: 'power3.inOut', transformOrigin: '50% 50%' }, .16);
    var comp = posePins(hs, k, tl, .16);
    fillTo(hs, k, .75, tl, .22);

    if (k === 0) {
      floatStop(hs, true);
      tl.fromTo(hs._hero, { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: .5, ease: 'power3.out' }, .8);
      tl.set(hs._pop, { autoAlpha: 0 }, .4);
      return;
    }

    // 3 · the point lights, and its panel rises out of it
    var lit = k - 1;
    tl.call(function () {
      hs._pins[lit].classList.add('on');
      fillText(hs, lit);
      hs._box = placeCard(hs, lit);
      drawLead(hs, hs._box);
      gsap.set(hs._pop, { autoAlpha: 1 });
      showClip(hs, lit);
      plateArm(hs);
    }, null, .62);
    // and breathes once everything has arrived — a float running through the
    // move costs the change a third of its frame rate for motion no one sees
    tl.call(function () { floatStart(hs); }, null, 1.7);
    tl.to(hs._pins[lit], { scale: comp, duration: .5, ease: 'back.out(2)',
      transformOrigin: '50% 100%' }, .62);
    tl.fromTo(hs._lead, { opacity: 1, strokeDashoffset: function () { return hs._lead.getTotalLength(); } },
      { strokeDashoffset: 0, duration: .42, ease: 'power2.out' }, .68);
    tl.fromTo(hs._card, { autoAlpha: 0, scale: .72, y: 22 },
      { autoAlpha: 1, scale: 1, y: 0, duration: .62, ease: 'back.out(1.3)',
        transformOrigin: function () {
          var c = pinCentre(hs, lit, true), b = hs._box;
          return ((c.x - b.x) / hs._cardBox.w * 100).toFixed(1) + '% ' +
                 ((c.y - b.y) / hs._cardBox.h * 100).toFixed(1) + '%';
        } }, .74);

    // 4 · and the words type themselves alongside
    tl.call(function () {
      var q = POINTS[lit];
      hs._type = gsap.timeline();
      // the name fills in from the left, with one flick of the machine
      // catching up with itself, then the rule runs out beside it
      hs._type.fromTo(hs._plateF, { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: .62, ease: 'power2.inOut' }, 0)
        .fromTo(hs._plateF, { x: -2.5 }, { x: 0, duration: .22, ease: 'steps(4)' }, .04)
        .fromTo(hs._plateR, { scaleX: 0 }, { scaleX: 1, duration: .52, ease: 'power2.out',
          transformOrigin: '0% 50%' }, .16)
        .fromTo(hs._plateN, { opacity: 0 }, { opacity: 1, duration: .3 }, .5);
      hs._type.add(typeInto(hs._ph, q.h + ' ' + q.h2, .5), .18)
        .fromTo(hs._psay, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .4 }, .2)
        .fromTo($$('span', hs._plist), { opacity: 0, x: -10 },
          { opacity: 1, x: 0, duration: .34, stagger: .12, ease: 'power2.out' }, .4);
      hs._ph.innerHTML = '';
    }, null, 1.04);
  }

  /* ───────── lifecycle ───────── */
  function prep(step) {
    var hs = $('.house', step); if (!hs || !global.gsap) return null;
    stop(step);
    buildOnce(hs);
    hs._k = step._subAt | 0;
    layout(hs);
    if (!hs_frac) measureRoute(hs);
    settleTo(hs, hs._k);
    gsap.set($('.hs-room', hs), { opacity: 0 });
    gsap.set(hs._stage, { autoAlpha: 0 });
    gsap.set(hs._hero, { autoAlpha: 0 });
    gsap.set(hs._pop, { autoAlpha: 0 });
    hs._h = true;
    if (!hs._onResize) {
      // The stage moves under this scene for a whole .45s while the rail
      // slides, and the event arrives on every frame of it. Re-seating costs
      // a layout and a handful of gsap.sets, so it is done on the frame it is
      // asked for: the scene travels with the stage instead of jumping once
      // the stage has stopped.
      hs._onResize = function () {
        if (!hs._built || !hs._h) return;
        killRun(hs); layout(hs); settleTo(hs, hs._k);
      };
      addEventListener('resize', hs._onResize);
    }
    return hs._h;
  }

  function play(step) {
    var hs = $('.house', step); if (!hs) return;
    if (!hs._h && !prep(step)) return;
    var k = hs._k, tl = hs._tl = gsap.timeline({ onComplete: function () { hs._tl = null; } });
    hs.classList.add('hs-live');          // the room's own motion runs
    tl.to($('.hs-room', hs), { opacity: 1, duration: .6, ease: 'power2.out' }, 0)
      .to(hs._stage, { autoAlpha: 1, duration: .5, ease: 'power2.out' }, .1);
    // the building draws itself in
    if (!reduced) {
      tl.fromTo(hs._draw, { opacity: 0 }, { opacity: 1, duration: .5, stagger: { amount: .7, from: 'start' },
        ease: 'power2.out' }, .15);
      tl.fromTo($$('.hs-top, .hs-lft, .hs-rgt', hs), { opacity: 0 },
        { opacity: 1, duration: .5, stagger: { amount: .8, from: 'start' } }, .3);
      tl.fromTo($$('.hs-rt, .hs-rt2', hs), { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: .6, ease: 'power3.out' }, 1);
    }
    if (k === 0) {
      tl.fromTo(hs._hero, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .6, ease: 'power3.out' }, .5);
      tl.fromTo(hs._pins, { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: .5, stagger: .09, ease: 'back.out(1.6)' }, 1.1);
      tl.call(function () { warmCard(hs); }, null, 2.1);
    } else {
      gsap.set(hs._pins, { autoAlpha: 1 });
      tl.set(hs._pop, { autoAlpha: 1 }, .8);
      tl.fromTo(hs._card, { autoAlpha: 0, scale: .8 },
        { autoAlpha: 1, scale: 1, duration: .6, ease: 'back.out(1.3)' }, .9);
      tl.call(function () { showClip(hs, k - 1); }, null, .9);
    }
  }

  function stop(step) {
    var hs = $('.house', step); if (!hs || !hs._built) return;
    killRun(hs);
    floatStop(hs);
    hs.classList.remove('hs-live');
    clearTimeout(hs._warmT);
    POINTS.forEach(function (_, i) { playClip(hs, i, false); });
    hs._h = null;
  }

  global.House = { prep: prep, play: play, stop: stop, show: show, POINTS: POINTS };
})(window);
