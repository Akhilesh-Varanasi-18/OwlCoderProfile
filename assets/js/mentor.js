/* ══════════════════════════════════════════════════════════════════
   05 · AI MENTOR — "three moments"
   Before you start, while you code, after you submit. Each moment is one
   slide: the words on the left, a live screen in the middle carrying the
   mentor, and the person at their desk on the right. The arrow sends the
   whole slide away into the depth of the room and brings the next one in
   from outside it — words, screen and person together.
   The people are the three supplied Lottie animations, recoloured onto
   our palette by scratchpad/mentor/prep_lottie2.js into assets/lottie/.
   Lifecycle: prep (state before the fade-in) → play → stop.
   ══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function even(v) { v = Math.round(v); return v % 2 ? v + 1 : v; }
  var reduced = global.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var SVG = {
    check: 'M5 12.5l4.5 4.5L19 7',
    cross: 'M6 6l12 12M18 6L6 18',
    arrow: 'M5 12h14M13 6l6 6-6 6',
    back: 'M19 12H5M11 18l-6-6 6-6',
    // the mentor's own mark: a small round-shouldered robot, antenna up
    bot: 'M12 3v2.4M7.6 8.6h8.8a2 2 0 0 1 2 2v5.2a2 2 0 0 1-2 2H7.6a2 2 0 0 1-2-2v-5.2a2 2 0 0 1 2-2zM9.8 12.6v1.2M14.2 12.6v1.2M3.4 11.8v2.8M20.6 11.8v2.8'
  };
  function ic(n) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + SVG[n] + '"/></svg>'; }
  // the three tabs the product shows, in the product's own words
  var TABS = ['Before Start', 'After Start', 'Submitted'];

  /* ───────── the three moments ─────────
     Each one runs the same cycle the recordings show: the tab for the moment,
     the five real questions, a hover that lifts one, a click, the mentor
     thinking, then the answer. Back, and a second question is asked. Two
     pairs per moment — enough to read, short enough not to drag. */
  var STAGES = [
    {
      key: 'before', lot: 'ltb', ratio: 1330 / 920,
      name: 'Before you start', tab: 0,
      h: 'Understand it', h2: 'before you write.',
      say: 'Open the mentor with an empty editor and it works on your understanding, not your code. A plain restatement, an analogy, the shape of an approach.',
      vows: [[1, 'Restates the problem in plain words'], [1, 'Gives you an analogy to hold on to'], [0, 'Never writes the solution']],
      qs: ['What approach should I consider?', 'Give me a hint to start coding?', 'Explain this problem in simple terms', 'Walk me through the sample I/O', 'Explain with 3 additional test cases?'],
      asks: [
        { q: 2, hover: [0, 4], ans: {
          h: 'Simple Explanation',
          ol: ['<b>What you’re given:</b> a list of numbers and a target count <code>k</code>.',
            '<b>What you need to find:</b> how many contiguous chunks hold <b>exactly k odd numbers</b>.',
            '<b>Real-world analogy:</b> a row of houses, lights on for the odd ones — count the consecutive stretches with exactly <code>k</code> lit.'],
          note: '<b>Careful:</b> a subarray is consecutive. In <code>[1,1,2,1,1]</code> you may take <code>[1,1,2,1]</code>, but not <code>[1,2,1]</code>.'
        } },
        { q: 1, hover: [3], ans: {
          h: 'Hint to Get Started',
          sub: 'Variables you’ll need',
          ul: ['<code>n</code> — the size of the array',
            '<code>nums</code> — the array of integers',
            '<code>k</code> — the required number of odd numbers',
            'a <b>counter / frequency map</b> to track prefix odd counts'],
          note: '<b>Next step:</b> walk the array once, keeping a running count of odd numbers seen so far. Then ask what that count has to have been earlier for the chunk ending here to hold exactly <code>k</code>.'
        } }
      ]
    },
    {
      key: 'during', lot: 'ltc', ratio: 1920 / 1080,
      name: 'While you code', tab: 1,
      h: 'Stuck, but', h2: 'not stuck for long.',
      say: 'Failing cases, a timeout, output that is almost right. It reads what you wrote, points at the cause, and asks you the question that gets you moving again.',
      vows: [[1, 'Reads your code and finds the cause'], [1, 'Asks the question that unblocks you'], [0, 'Never hands over the fix']],
      qs: ['Hidden test cases are failing', 'My code is too slow (TLE)', 'My code gives wrong output', 'I’m stuck, give me the next step', 'Explain this error'],
      asks: [
        { q: 1, hover: [4], ans: {
          h: 'Why it runs out of time',
          ol: ['You start a fresh count at <b>every</b> index, so the work grows as <code>n²</code>. At <code>n = 10⁵</code> that is far past the limit.',
            'Each restart recomputes odd counts you already had one step earlier.'],
          note: '<b>Ask yourself:</b> if you knew how many odd numbers appear before position <code>i</code>, could you get the answer without scanning backwards at all?'
        } },
        { q: 0, hover: [2, 3], ans: {
          h: 'What the hidden cases hit',
          sub: 'Three shapes worth checking',
          ul: ['<code>k</code> equal to the total number of odds — the whole array is one answer',
            'an array with <b>no odd numbers at all</b>',
            'the even numbers at the two ends, which belong to more chunks than you think'],
          note: '<b>Ask yourself:</b> for a valid chunk, how many even numbers can sit on its left before the first odd, and does your count include every one of them?'
        } }
      ]
    },
    {
      key: 'after', lot: 'lta', ratio: 1,
      name: 'After you submit', tab: 2,
      h: 'The review you’d get', h2: 'from a senior.',
      say: 'Accepted is not the end of it. It rates the style, puts a number on the cost, frames the problem the way an interviewer would, and names a better approach.',
      vows: [[1, 'Puts a number on time and space'], [1, 'Names a better approach'], [0, 'Never writes it for you']],
      qs: ['How would I explain this in an interview?', 'Rate my coding style and solution accuracy', 'Review my code quality', 'What is the time & space complexity of my code?', 'Can this be solved in a more optimized way?'],
      asks: [
        { q: 3, hover: [1], ans: {
          h: 'Time &amp; Space',
          stats: [['Time', 'O(n)', 'one pass'], ['Space', 'O(n)', 'prefix map']],
          ol: ['You walk the array once and each lookup is constant, so the running time is linear in <code>n</code>.',
            'The map can hold up to <code>n</code> distinct prefix counts, which is where the space goes.'],
          note: '<b>Worth trying next:</b> the same idea as a sliding window holds a handful of counters instead of a map and brings the space down to <code>O(1)</code>.'
        } },
        { q: 0, hover: [4, 2], ans: {
          h: 'How to tell it in an interview',
          sub: 'Thirty seconds, in this order',
          ul: ['Name the trap first: the obvious nested loop is <code>O(n²)</code>.',
            'State the reframe: counting chunks with exactly <code>k</code> odds is counting <b>pairs of prefix counts</b> that differ by <code>k</code>.',
            'Close with the cost — one pass, linear time — and the sliding-window variant as the follow-up.'],
          note: '<b>They are listening for</b> why you changed approach, not the code. Say the <code>n²</code> sentence out loud before you say the fix.'
        } }
      ]
    }
  ];

  /* ───────── the backdrop ─────────
     The section is about a machine that thinks with you, so the room behind it
     is a network: four layers of nodes with every link drawn, and signals that
     travel along them the whole time it is on screen. It is kept to a whisper —
     a texture you notice on the second look, never something the panel has to
     compete with. Under it a wordmark drifts, the promise of the section
     repeated across the back of the room. */
  var MARK = 'AI MENTOR · GUIDES, NEVER SOLVES · ';
  var LAYERS = [3, 5, 5, 2];      // the shape of the network
  var NET_W = 1600, NET_H = 900;

  function netNodes() {
    var cols = [], x0 = NET_W * .07, span = NET_W * .86;
    LAYERS.forEach(function (n, c) {
      var x = x0 + span * (c / (LAYERS.length - 1)), gap = NET_H / (n + 1), col = [];
      for (var r = 0; r < n; r++) col.push({ x: x, y: Math.round(gap * (r + 1)) });
      cols.push(col);
    });
    return cols;
  }
  function netSvg() {
    var cols = netNodes(), lines = '', dots = '';
    cols.forEach(function (col, c) {
      if (c < cols.length - 1) col.forEach(function (a) {
        cols[c + 1].forEach(function (b) {
          lines += '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '"/>';
        });
      });
      col.forEach(function (a) { dots += '<circle cx="' + a.x + '" cy="' + a.y + '" r="7"/>'; });
    });
    var pulses = '';
    for (var i = 0; i < 7; i++) pulses += '<circle class="mn-pulse" r="5" cx="-20" cy="-20"/>';
    return '<svg class="mn-net" viewBox="0 0 ' + NET_W + ' ' + NET_H + '" preserveAspectRatio="xMidYMid slice">' +
      '<g class="mn-net-in"><g class="mn-links">' + lines + '</g><g class="mn-nodes">' + dots + '</g>' + pulses + '</g></svg>';
  }
  // every link in the graph, as a pair of points a signal can run along
  function netLinks() {
    var cols = netNodes(), out = [];
    cols.forEach(function (col, c) {
      if (c >= cols.length - 1) return;
      col.forEach(function (a) { cols[c + 1].forEach(function (b) { out.push([a, b]); }); });
    });
    return out;
  }

  /* ───────── build ───────── */
  function buildOnce(mn) {
    if (mn._built) return;
    mn._built = true;
    var h = '<div class="mn-bg" aria-hidden="true"><i class="mn-sky"></i>' + netSvg() +
      '<div class="mn-mark"><div class="mn-mark-pl"><span>' + MARK + MARK + '</span></div></div>' +
      new Array(10).join('<i class="mn-mote"></i>') + '</div>' +
      '<div class="mn-world" aria-hidden="true">';
    STAGES.forEach(function (s, i) {
      h += '<div class="mn-slide" data-i="' + i + '">' +
        '<div class="mn-copy"><div class="mn-eyebrow"><b>05 · AI Mentor</b><s></s>' + s.name + '</div>' +
        '<h3 class="mn-h">' + s.h + '<em>' + s.h2 + '</em></h3>' +
        '<p class="mn-say">' + s.say + '</p>' +
        '<div class="mn-vow">' + s.vows.map(function (v) {
          return '<span class="' + (v[0] ? '' : 'no') + '"><i>' + ic(v[0] ? 'check' : 'cross') + '</i>' + v[1] + '</span>';
        }).join('') + '</div>' +
        '<div class="mn-dots">' + STAGES.map(function (t, j) {
          return '<span class="mn-dot' + (j === i ? ' on' : '') + '" data-k="' + j + '" role="button" title="' + t.name + '"></span>';
        }).join('') + '<em>' + (i + 1) + ' / ' + STAGES.length + '</em></div></div>' +
        '<div class="mn-screen">' +
        '<div class="am-bar"><span class="am-bot">' + ic('bot') + '</span>' +
        '<span class="am-name">AI Mentor<s>guided help</s></span><span class="am-dot-live"><i></i>live</span></div>' +
        '<div class="am-tabs">' + TABS.map(function (t, j) {
          return '<span class="am-tab' + (j === s.tab ? ' on' : '') + '">' + t + '</span>';
        }).join('') + '<i class="am-ink"></i></div>' +
        '<div class="am-body"><div class="am-qs">' + s.qs.map(function (q, j) {
          return '<span class="am-q" data-q="' + j + '"><span>' + q + '</span><i>' + ic('bot') + '</i></span>';
        }).join('') + '</div>' +
        '<div class="am-think"><span class="am-code">&lt;<s>/</s>&gt;</span>Thinking about your question<i></i><i></i><i></i></div>' +
        '<div class="am-ans"><span class="am-back">' + ic('back') + 'Back</span><div class="am-out">' +
        s.asks.map(function (ask, j) { return '<div class="am-doc" data-n="' + j + '">' + answerHtml(ask.ans) + '</div>'; }).join('') +
        '</div></div></div>' +
        '<div class="am-track"><i></i></div></div>' +
        '<div class="mn-fig"><i class="mn-fig-glow"></i><div class="mn-lot"></div></div>' +
        '<i class="mn-link"></i><i class="mn-link"></i><i class="mn-link"></i>' +
        '</div>';
    });
    h += '</div>';
    mn.innerHTML = h;
    mn._slides = $$('.mn-slide', mn);
    mn._copies = $$('.mn-copy', mn);
    mn._screens = $$('.mn-screen', mn);
    mn._figs = $$('.mn-fig', mn);
    mn._lots = [];
    if (global.lottie) {
      STAGES.forEach(function (s, i) {
        try {
          mn._lots[i] = global.lottie.loadAnimation({
            container: $('.mn-lot', mn._figs[i]), renderer: 'svg', loop: true, autoplay: false,
            path: 'assets/lottie/' + s.lot + '.json',
            rendererSettings: { progressiveLoad: false, preserveAspectRatio: 'xMidYMid meet' }
          });
        } catch (e) { mn._lots[i] = null; }
      });
    }
    var step = mn.closest('.step');
    $$('.mn-dot', mn).forEach(function (d) { d.addEventListener('click', function () { if (global.deckSetSub && step) global.deckSetSub(step, +d.dataset.k); }); });
    if (step) step.addEventListener('substep', function (e) { show(step, e.detail.k, e.detail.d); });
  }

  /* ───────── geometry ───────── */
  function layout(mn) {
    var W = mn.clientWidth || innerWidth, H = mn.clientHeight || innerHeight, narrow = W <= 1080;
    mn.classList.toggle('narrow', narrow);
    var k, cw, cx, cy, pw, px, py, fw, fx, fy;
    if (narrow) {
      k = clamp(W / 820, .62, 1);
      cw = W - 40; cx = 20; cy = Math.round(H * .05);
      pw = even(clamp(W - 48, 280, 520)); px = Math.round((W - pw) / 2); py = Math.round(H * .52);
      fw = even(clamp(W * .74, 280, 500)); fx = Math.round((W - fw) / 2); fy = Math.round(H * .28);
    } else {
      k = clamp(Math.min(W / 1600, H / 880), .72, 1.22);
      var gut = Math.round(56 * k);
      cw = even(clamp(425 * k, 300, 500)); cx = gut;
      pw = even(clamp(600 * k, 400, 690));
      fw = even(clamp(Math.min(W * .365, H * .78), 380, 700));
      fx = Math.round(W - fw - Math.round(26 * k));
      px = Math.round(cx + cw + 44 * k);
      if (px + pw > fx + fw * .36) px = Math.round(fx + fw * .36 - pw);
      px = Math.max(px, cx + cw + Math.round(22 * k));
      py = Math.round(H * .18);
      cy = 0;
    }
    mn.style.setProperty('--k', k.toFixed(3));
    mn.style.setProperty('--cw', cw + 'px');
    mn.style.setProperty('--pw', pw + 'px');
    mn.style.setProperty('--fw', fw + 'px');
    var g = mn._geo = { W: W, H: H, k: k, cw: cw, cx: cx, cy: cy, pw: pw, px: px, py: py, fw: fw, fx: fx, fy: fy, narrow: narrow };
    mn._copies.forEach(function (c) {
      c.style.left = cx + 'px';
      var ch = c.offsetHeight || 380;
      c.style.top = (narrow ? cy : Math.round(clamp(H * .5 - ch / 2, 18, H - ch - 18))) + 'px';
    });
    // Each panel is centred on the same optical line as the words. The height that
    // matters is the one it ends on, with the answer in place — measured once per
    // width on a hidden copy, so a panel never drifts down while it fills.
    measure(mn, pw);
    mn._screens.forEach(function (s, i) {
      s.style.left = px + 'px';
      var sh = mn._sh[i] || s.offsetHeight || 300;
      s.style.top = (narrow ? py : Math.round(clamp(H * .47 - sh / 2, 20, Math.max(20, H - sh - 20)))) + 'px';
    });
    mn._figs.forEach(function (f, i) {
      f.style.left = fx + 'px';
      var fh = fw / STAGES[i].ratio;
      g['fh' + i] = fh;
      f.style.top = (narrow ? fy : Math.round(clamp(H * .54 - fh / 2, 10, Math.max(10, H - fh - 10)))) + 'px';
    });
    return g;
  }
  // The panel runs through four states — the question list, the mentor thinking,
  // and two answers — and they are not the same height. If the body were left to
  // size itself the panel would grow and shrink under the reader all cycle, so
  // the body is pinned to the tallest of them, measured on a copy parked
  // off-stage. The panel then holds one position from start to finish.
  function measure(mn, pw) {
    if (mn._shw === pw && mn._sh) return;
    var ghost = mn._ghost;
    if (!ghost) {
      ghost = mn._ghost = document.createElement('div');
      ghost.className = 'mn-ghost';
      ghost.setAttribute('aria-hidden', 'true');
      mn.appendChild(ghost);
    }
    ghost.style.width = pw + 'px';
    mn._sh = STAGES.map(function (s, i) {
      ghost.innerHTML = mn._screens[i].outerHTML;
      var sc = ghost.firstChild, body = $('.am-body', sc);
      var list = $('.am-qs', sc), think = $('.am-think', sc), ans = $('.am-ans', sc), out = $('.am-out', sc);
      body.style.height = '';
      function tallest(show) {
        [list, think, ans].forEach(function (n) { n.style.display = n === show ? '' : 'none'; });
        return body.offsetHeight;
      }
      var docs = $$('.am-doc', sc);
      var tall = tallest(list);          // the thinking card floats over the body
      docs.forEach(function (d, j) {
        docs.forEach(function (o, m) { o.style.display = m === j ? '' : 'none'; });
        tall = Math.max(tall, tallest(ans));
      });
      body.style.height = tall + 'px';
      [list, think, ans].forEach(function (n) { n.style.display = ''; });
      $('.am-body', mn._screens[i]).style.height = tall + 'px';
      return sc.offsetHeight;
    });
    ghost.innerHTML = '';
    mn._shw = pw;
  }

  function slidePose(mn, rel) {
    var g = mn._geo;
    if (rel === 0) return { z: 0, x: 0, opacity: 1, filter: 'blur(0px)' };
    if (rel > 0) return { z: -820, x: -g.W * .06, opacity: 0, filter: 'blur(6px)' };
    return { z: 560, x: g.W * .16, opacity: 0, filter: 'blur(9px)' };
  }
  function setSlide(s, p) { gsap.set(s, { z: p.z, x: p.x, opacity: p.opacity, filter: p.filter, transformOrigin: '50% 50%' }); }

  /* ───────── what the screen says ───────── */
  function answerHtml(a) {
    var h = '<div class="am-h">' + a.h + '</div>';
    if (a.sub) h += '<div class="am-sub">' + a.sub + '</div>';
    if (a.stats) h += '<div class="am-row">' + a.stats.map(function (s) {
      return '<span class="am-stat"><small>' + s[0] + '</small><b>' + s[1] + '</b><em>' + s[2] + '</em></span>';
    }).join('') + '</div>';
    if (a.ol) h += '<div class="am-ol">' + a.ol.map(function (t) { return '<div class="am-li"><p>' + t + '</p></div>'; }).join('') + '</div>';
    if (a.ul) h += '<div class="am-ul">' + a.ul.map(function (t) { return '<div class="am-bullet"><p>' + t + '</p></div>'; }).join('') + '</div>';
    if (a.note) h += '<div class="am-note">' + a.note + '</div>';
    return h;
  }
  // every block the answer is built from, in reading order — what fades in and out
  function blocks(out) { return $$('.am-h, .am-sub, .am-stat, .am-li, .am-bullet, .am-note', out); }

  /* ───────── the cycle the recordings show ─────────
     tab → the five questions → a hover runs down them and lifts one → it is
     clicked → the mentor thinks → the answer fades in a block at a time → back,
     the answer vanishes → a second question → a second answer. Then it loops.
     Nothing types: text arrives and leaves by fading, as asked. */
  var READ = 7.4;        // how long an answer is left up to be read
  var HOVER = .62;       // how long the pointer rests on a question it passes

  function runScreen(mn, i) {
    var sc = mn._screens[i], s = STAGES[i];
    var qs = $$('.am-q', sc), list = $('.am-qs', sc), think = $('.am-think', sc);
    var ans = $('.am-ans', sc), back = $('.am-back', sc), track = $('.am-track i', sc);
    var docs = $$('.am-doc', sc);
    var tl = gsap.timeline({ repeat: -1 });

    function rest() {
      qs.forEach(function (q) { q.classList.remove('hot', 'on'); });
      gsap.set(qs, { opacity: 0, y: 8, x: 0, scale: 1 });
      gsap.set(list, { opacity: 1, display: '' });
      gsap.set(think, { opacity: 0, display: 'none', y: 6 });
      gsap.set(ans, { opacity: 0, display: 'none' });
      docs.forEach(function (d) { gsap.set(d, { display: 'none' }); gsap.set(blocks(d), { opacity: 0, y: 10 }); });
      gsap.set(back, { opacity: 0, x: -6 });
    }
    rest();
    gsap.set(track, { width: '0%' });

    var at = 0;
    // the rule slides under the tab for this moment, then the list arrives
    var tab = $$('.am-tab', sc)[s.tab], ink = $('.am-ink', sc);
    gsap.set(ink, { left: Math.round(tab.offsetLeft) + 'px', width: Math.round(tab.offsetWidth), scaleX: .6, opacity: 0, transformOrigin: '50% 50%' });
    tl.to(ink, { scaleX: 1, opacity: 1, duration: .5, ease: 'power3.out' }, .05)
      .to(qs, { opacity: 1, y: 0, duration: .4, stagger: .07, ease: 'power3.out' }, .15);
    at += .9;

    s.asks.forEach(function (ask, n) {
      var chosen = qs[ask.q];
      // the pointer runs down a couple of questions on its way — each one lifts
      (ask.hover || []).concat([ask.q]).forEach(function (j) {
        tl.call(function () {
          qs.forEach(function (q) { q.classList.remove('hot'); });
          qs[j].classList.add('hot');
        }, null, at);
        at += HOVER;
      });
      // the click
      tl.call(function () { chosen.classList.remove('hot'); chosen.classList.add('on'); }, null, at)
        .to(chosen, { scale: .985, duration: .09, yoyo: true, repeat: 1, ease: 'power2.inOut' }, at);
      at += .34;
      // the list gives way to the mentor thinking
      tl.to(list, { opacity: 0, y: -6, duration: .3, ease: 'power2.in' }, at)
        .call(function () {
          gsap.set(list, { display: 'none' });
          gsap.set(think, { display: '', opacity: 0, y: 6 });
        }, null, at + .3)
        .to(think, { opacity: 1, y: 0, duration: .32, ease: 'power3.out' }, at + .32);
      at += 1.9;                                            // it thinks
      // the answer takes the thinking card's place and fades in, block by block
      var doc = docs[n], bl = blocks(doc);
      tl.to(think, { opacity: 0, y: -6, duration: .3, ease: 'power2.in' }, at)
        .call(function () {
          gsap.set(think, { display: 'none' });
          docs.forEach(function (d) { gsap.set(d, { display: d === doc ? '' : 'none' }); });
          gsap.set(ans, { display: '', opacity: 1 });
        }, null, at + .3)
        .fromTo(back, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: .3, ease: 'power2.out' }, at + .36)
        // the text arrives by fading, a block at a time — never typed
        .fromTo(bl, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .5, stagger: .11, ease: 'power2.out' }, at + .4);
      at += READ;                                           // left up to be read
      // back: the answer vanishes and the list comes home
      tl.to(bl.slice().reverse(), { opacity: 0, y: -8, duration: .34, stagger: .05, ease: 'power2.in' }, at)
        .to(back, { opacity: 0, duration: .24 }, at + .1)
        .call(function () {
          gsap.set(ans, { display: 'none' });
          gsap.set(doc, { display: 'none' });
          qs.forEach(function (q) { q.classList.remove('hot', 'on'); });
          gsap.set(list, { display: '', opacity: 0, y: 8 });
          gsap.set(qs, { opacity: 1, y: 0 });
        }, null, at + .78)
        .to(list, { opacity: 1, y: 0, duration: .38, ease: 'power3.out' }, at + .8);
      at += 1.5;
      if (n === s.asks.length - 1) at += .4;                // a breath before it loops
    });

    // the bar along the bottom measures the whole cycle, so it reads as progress
    tl.fromTo(track, { width: '0%' }, { width: '100%', duration: at, ease: 'none' }, 0);
    tl.set({}, {}, at);                                     // hold the loop open to the end
    return tl;
  }

  /* ───────── the motes that travel from the desk to the screen ───────── */
  function linkIn(mn, i, at, tl) {
    var sl = mn._slides[i], g = mn._geo, ls = $$('.mn-link', sl);
    mn._float = mn._float || [];
    var x0 = g.fx + g.fw * .20, y0 = g.H * .52, x1 = g.px + g.pw * .86, y1 = g.py + 150;
    ls.forEach(function (p, j) {
      var t = (j + 1) / (ls.length + 1);
      gsap.set(p, { left: Math.round(x0 + (x1 - x0) * t) + 'px', top: Math.round(y0 + (y1 - y0) * t) + 'px', opacity: 0, scale: .4, y: 0 });
      tl.to(p, { opacity: .8, scale: 1, duration: .3, ease: 'back.out(2)' }, at + j * .09);
      // the drift is endless, so it is kept OUT of the timeline — an infinite repeat
      // inside it would mean the timeline never completes and nothing after it runs
      if (!reduced) mn._float.push(gsap.to(p, { y: -9, duration: 1.8 + j * .3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: at + .4 }));
    });
  }

  /* ───────── ambience ───────── */
  function startAmbient(mn) {
    stopAmbient(mn);
    if (reduced) return;
    var a = mn._amb = [];
    // the whole graph breathes, so it never reads as a printed diagram
    var inner = $('.mn-net-in', mn);
    if (inner) a.push(gsap.fromTo(inner, { xPercent: -1.1, yPercent: -.7 },
      { xPercent: 1.1, yPercent: .7, duration: 26, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    // signals travel the links, one after another, each picking a new link
    var links = mn._links || (mn._links = netLinks());
    mn._pulseCalls = [];
    $$('.mn-pulse', mn).forEach(function (p, i) {
      function run() {
        var l = links[(Math.random() * links.length) | 0];
        gsap.set(p, { attr: { cx: l[0].x, cy: l[0].y }, opacity: 0 });
        var t = gsap.timeline({ delay: Math.random() * 1.7, onComplete: run });
        t.to(p, { opacity: .9, duration: .3 })
         .to(p, { attr: { cx: l[1].x, cy: l[1].y }, duration: 1.6, ease: 'sine.inOut' }, 0)
         .to(p, { opacity: 0, duration: .45 }, 1.15);
        a.push(t);
      }
      mn._pulseCalls.push(gsap.delayedCall(i * .44, run));
    });
    // the promise of the section, drifting across the back of the room
    var mark = $('.mn-mark span', mn);
    if (mark) a.push(gsap.fromTo(mark, { xPercent: 0 }, { xPercent: -50, duration: 96, ease: 'none', repeat: -1 }));
    $$('.mn-mote', mn).forEach(function (m, i) {
      gsap.set(m, { left: ((i * 83) % 88 + 6) + '%', top: ((i * 57) % 76 + 12) + '%', opacity: 0, scale: .5 + (i % 4) * .2 });
      a.push(gsap.to(m, { opacity: .45, duration: 1.4, delay: i * .2 }));
      a.push(gsap.to(m, { y: -22 - (i % 5) * 10, x: (i % 2 ? 14 : -14), duration: 7 + (i % 4), ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * .16 }));
    });
  }
  function stopAmbient(mn) {
    (mn._amb || []).forEach(function (t) { if (t) t.kill(); });
    gsap.killTweensOf($$('.mn-pulse', mn));
    (mn._pulseCalls || []).forEach(function (c) { c.kill(); }); mn._pulseCalls = [];
    mn._amb = null;
  }

  function playLot(mn, i, on) {
    var a = mn._lots && mn._lots[i]; if (!a) return;
    try { if (on) a.goToAndPlay(0, true); else a.pause(); } catch (e) {}
  }

  /* ───────── walking the three ───────── */
  function show(step, k, d) {
    var mn = $('.mentor', step); if (!mn || !mn._h) return;
    var from = mn._k; if (from === k) return;
    killRun(mn);
    // A flight that was cut off short leaves its slide stranded in the middle of
    // the room, still lit and still animating. Before starting a new one, park
    // every slide this flight does not touch.
    mn._slides.forEach(function (sl, j) {
      if (j === from || j === k) return;
      gsap.killTweensOf(sl); setSlide(sl, slidePose(mn, 1)); playLot(mn, j, false);
    });
    mn._k = k;
    paintDots(mn, k);
    placeWatch(k);
    var out = mn._slides[from], into = mn._slides[k];
    var tl = mn._tl = gsap.timeline({ onComplete: function () {
      mn._tl = null;
      // the backstop: when the flight does land, nothing but k is on stage
      mn._slides.forEach(function (sl, j) { if (j !== k) { setSlide(sl, slidePose(mn, 1)); playLot(mn, j, false); } });
    } });
    // the screen starts filling while the slide is still on its way in — a panel
    // that arrives empty and waits reads as a white box, not as a running screen
    tl.call(function () { mn._run = runScreen(mn, k); }, null, .42);
    // the whole slide leaves together into the depth of the room, and the next
    // arrives from outside it — words, screen and person at once
    // The travel is long so the depth reads, but the two slides must not sit on top
    // of each other half-lit, so opacity is handed over in half the time.
    tl.to(out, { z: -820, x: -mn._geo.W * .06, filter: 'blur(6px)', duration: .82, ease: 'power2.in' }, 0)
      .to(out, { opacity: 0, duration: .44, ease: 'power2.in' }, .04)
      .call(function () { playLot(mn, from, false); setSlide(out, slidePose(mn, 1)); }, null, .86);
    tl.call(function () { setSlide(into, slidePose(mn, -1)); playLot(mn, k, true); }, null, 0)
      .to(into, { z: 0, x: 0, filter: 'blur(0px)', duration: .95, ease: 'power3.out' }, .34)
      .to(into, { opacity: 1, duration: .5, ease: 'power2.out' }, .38);
    linkIn(mn, k, 1.15, tl);
  }
  // the watcher moves with the moment: a different corner for each of the three
  var WATCH = ['p-mn0', 'p-mn1', 'p-mn2'];
  function placeWatch(k) {
    var w = document.getElementById('watch');
    if (w) w.className = 'watch ' + (WATCH[k] || WATCH[0]);
  }
  function paintDots(mn, k) {
    mn._copies.forEach(function (c) { $$('.mn-dot', c).forEach(function (d) { d.classList.toggle('on', +d.dataset.k === k); }); });
  }
  function killRun(mn) {
    if (mn._tl) { mn._tl.kill(); mn._tl = null; }
    if (mn._run) { mn._run.kill(); mn._run = null; }
    mn._screens.forEach(function (sc) {
      gsap.killTweensOf($$('.am-q', sc).concat([$('.am-qs', sc), $('.am-think', sc), $('.am-ans', sc),
        $('.am-back', sc), $('.am-ink', sc), $('.am-track i', sc)]));
      gsap.killTweensOf($$('.am-doc', sc).concat($$('.am-doc > *, .am-doc .am-stat', sc)));
    });
    (mn._float || []).forEach(function (t) { t.kill(); }); mn._float = [];
    mn._slides.forEach(function (sl) { gsap.killTweensOf($$('.mn-link', sl)); });
  }

  /* ───────── lifecycle ───────── */
  function prep(step) {
    var mn = $('.mentor', step); if (!mn || !global.gsap) return null;
    stop(step);
    buildOnce(mn);
    layout(mn);
    var k = step._subAt | 0;
    mn._k = k;
    mn._slides.forEach(function (sl, i) {
      gsap.killTweensOf(sl);
      if (i === k) gsap.set(sl, { z: 220, x: mn._geo.W * .05, opacity: 0, filter: 'blur(5px)' });
      else setSlide(sl, slidePose(mn, i < k ? 1 : -1));
    });
    mn._screens.forEach(function (sc) {
      // the answers are part of the panel now; they are hidden, never removed
      $$('.am-doc', sc).forEach(function (d) { gsap.set(d, { display: 'none' }); gsap.set(blocks(d), { opacity: 0, y: 10 }); });
      gsap.set($('.am-back', sc), { opacity: 0, x: -6 });
      gsap.set($('.am-ans', sc), { opacity: 0, display: 'none', clearProps: 'transform' });
      gsap.set($('.am-think', sc), { opacity: 0, display: 'none' });
      gsap.set($('.am-qs', sc), { opacity: 1, display: '', clearProps: 'transform' });
      gsap.set($('.am-ink', sc), { width: 0 });
      gsap.set($('.am-track i', sc), { width: '0%' });
      $$('.am-q', sc).forEach(function (q) {
        q.classList.remove('on', 'hot');
        gsap.set(q, { clearProps: 'transform' });
        gsap.set(q, { opacity: 0, y: 8 });
      });
    });
    mn._slides.forEach(function (sl) { gsap.set($$('.mn-link', sl), { opacity: 0 }); });
    gsap.set($$('.mn-mote', mn), { opacity: 0 });
    (mn._lots || []).forEach(function (a) { if (a) { try { a.goToAndStop(0, true); } catch (e) {} } });
    paintDots(mn, k);
    mn._h = true;
    if (!mn._onResize) {
      mn._onResize = function () {
        if (!mn._h) return;
        layout(mn);
        if (!mn._tl) mn._slides.forEach(function (sl, i) { setSlide(sl, slidePose(mn, i === mn._k ? 0 : i < mn._k ? 1 : -1)); });
      };
      addEventListener('resize', mn._onResize);
    }
    return mn._h;
  }

  function play(step) {
    var mn = $('.mentor', step); if (!mn) return;
    if (!mn._h && !prep(step)) return;
    var k = mn._k;
    placeWatch(k);
    startAmbient(mn);
    mn._slides.forEach(function (sl, j) { if (j !== k) { gsap.killTweensOf(sl); setSlide(sl, slidePose(mn, 1)); playLot(mn, j, false); } });
    playLot(mn, k, true);
    var tl = mn._tl = gsap.timeline({ onComplete: function () { mn._tl = null; } });
    tl.to(mn._slides[k], { z: 0, x: 0, opacity: 1, filter: 'blur(0px)', duration: .95, ease: 'power3.out' }, .05);
    tl.call(function () { mn._run = runScreen(mn, k); }, null, .3);
    linkIn(mn, k, .8, tl);
  }

  function stop(step) {
    var mn = $('.mentor', step); if (!mn || !mn._built) return;
    killRun(mn);
    stopAmbient(mn);
    (mn._lots || []).forEach(function (a, i) { playLot(mn, i, false); });
    mn._slides.forEach(function (sl) { gsap.killTweensOf(sl); });
    mn._h = null;
  }

  global.Mentor = { prep: prep, play: play, stop: stop, show: show, STAGES: STAGES };
})(window);
