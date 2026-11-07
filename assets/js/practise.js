/* ══════════════════════════════════════════════════════════════════
   04 · PRACTISE — "the deck"
   The Courses laptop glides in and becomes a plain monitor; a deck of
   monitors builds behind it in 3D. One card per practice set. On the
   top card the components of the live page cut out of the glass one at
   a time — one clean rise toward the viewer with a shape-following shadow,
   the page behind stepping back, a tag naming the piece — and the action of
   that beat plays inside it while the rest of the page stays on the glass. The arrow switches the top card off and drops it;
   the deck tilts, shuffles, and the next monitor lands on top. Copy on
   the left; the owl's eyes take the alternate corner with every card.
   Lifecycle: prep (state before the fade-in) → play → stop.
   ══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function even(v) { v = Math.round(v); return v % 2 ? v + 1 : v; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  var reduced = global.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ───────── icons ───────── */
  var SVG = {
    code: 'M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16',
    check: 'M5 12.5l4.5 4.5L19 7',
    lock: 'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z',
    unlock: 'M7 11V8a5 5 0 0 1 9.6-2M5 11h14v10H5z',
    play: 'M7 5v14l12-7z',
    send: 'M12 19V6M6 12l6-6 6 6',
    list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
    tag: 'M20 12l-8 8-9-9V4h7l10 8zM7.5 7.5h.01',
    bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
    ext: 'M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5',
    user: 'M20 21a8 8 0 1 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    trophy: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3',
    owl: 'M12 3a7 7 0 0 0-7 7v4a7 7 0 0 0 14 0v-4a7 7 0 0 0-7-7zM9.5 10.5h.01M14.5 10.5h.01M12 12.5l-1.3 1.5h2.6z',
    chev: 'M9 6l6 6-6 6',
    board: 'M4 19h16M6 15V9M10 15V5M14 15v-4M18 15V7',
    mon: 'M3 4h18v12H3zM8 20h8M12 16v4',
    target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    minus: 'M6 12h12',
    out: 'M9 6h11M9 12h11M9 18h11M4 6l2 2-2 2',
    fire: 'M12 22c4 0 7-3 7-7 0-3-2-5-3-7-1 2-2 3-3 3 0-3-1-6-4-8 0 4-4 6-4 12 0 4 3 7 7 7z',
    layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5'
  };
  function ic(n, cls) { return '<svg class="crs-ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + SVG[n] + '"/></svg>'; }

  /* ───────── a small C++ tokeniser for the editors ───────── */
  var KW = /^(using|namespace|int|for|return|if|else|while|auto|const|void|char|bool|long|double|break|continue|class|public|struct)$/;
  var TY = /^(vector|string|std|size_t|pair|map|set)$/;
  function tokens(line) {
    var out = [], i = 0, n = line.length;
    if (/^\s*#/.test(line)) return [{ c: 'pu-pp', t: line }];
    while (i < n) {
      var ch = line[i];
      if (/\s/.test(ch)) { var j = i; while (j < n && /\s/.test(line[j])) j++; out.push({ c: '', t: line.slice(i, j) }); i = j; continue; }
      if (/[A-Za-z_]/.test(ch)) { var k = i; while (k < n && /[A-Za-z0-9_]/.test(line[k])) k++; var w = line.slice(i, k);
        var cls = KW.test(w) ? 'pu-k' : TY.test(w) ? 'pu-t' : (line[k] === '(' ? 'pu-f' : ''); out.push({ c: cls, t: w }); i = k; continue; }
      if (/[0-9]/.test(ch)) { var m = i; while (m < n && /[0-9.]/.test(line[m])) m++; out.push({ c: 'pu-n', t: line.slice(i, m) }); i = m; continue; }
      if (ch === '"' || ch === "'") { var q = line.indexOf(ch, i + 1); q = q < 0 ? n : q + 1; out.push({ c: 'pu-s', t: line.slice(i, q) }); i = q; continue; }
      if (ch === '/' && line[i + 1] === '/') { out.push({ c: 'pu-cm', t: line.slice(i) }); break; }
      out.push({ c: 'pu-p', t: ch }); i++;
    }
    return out;
  }
  function tokHtml(toks, upto) {
    var h = '', left = upto == null ? Infinity : upto;
    toks.forEach(function (t) { if (left <= 0) return; var s = t.t.slice(0, left); left -= t.t.length; h += t.c ? '<span class="' + t.c + '">' + esc(s) + '</span>' : esc(s); });
    return h;
  }
  function codeLines(lines, blank) {
    return lines.map(function (l) { return '<div class="pu-ln">' + (blank ? '<span></span>' : '<span>' + tokHtml(tokens(l)) + '</span>') + '</div>'; }).join('');
  }

  /* ───────── content: the four cards ───────── */
  var CODE = {
    trainer: ['#include <iostream>', '#include <vector>', 'using namespace std;', 'int main() {', '    int M, N;  cin >> M >> N;', '    vector<vector<int>> arr(M, vector<int>(N));', '    int sum = 0;', '    for (int i = 0; i < M; i++)', '        for (int j = 0; j < N; j++) {', '            cin >> arr[i][j];', '            sum += arr[i][j];', '        }', '    cout << sum;', '    return 0;', '}'],
    trainee: ['#include <bits/stdc++.h>', 'using namespace std;', 'int main() {', '    int n;  cin >> n;', '    vector<int> a(n);', '    for (int &x : a) cin >> x;', '    int best = 0;', '    for (int i = 0; i + 1 < n; i++)', '        best = max(best, a[i] + a[i + 1]);', '    cout << best;', '    return 0;', '}'],
    ground: ['#include <bits/stdc++.h>', 'using namespace std;', 'int main() {', '    int n;  cin >> n;', '    vector<int> a(n);', '    for (int &x : a) cin >> x;', '    for (int r = 0; r < 2; r++)', '        for (int x : a) cout << x << \' \';', '    return 0;', '}']
  };
  var MODS = [['DSA', 'Vectors & matrices', 0, true], ['Articles', '3 / 1', 33], ['Trainer', '3 / 3', 100], ['Practice', '4 / 3', 75]];
  // the module's own set (the Maya tab) and the LeetCode set (the Leet tab)
  var MAYA_SET = [{ t: '1. Sum of all Boundary Values in a Matrix', ok: 1 }, { t: '2. Candy Jars', solve: 1, id: 2 }, { t: '3. Matrix Diagonal Sum', solve: 1 }, { t: '4. Spiral Order Traversal', solve: 1 }];
  var LEET_SET = [{ t: '1. Richest Customer Wealth', lc: 1, ok: 1 }, { t: '2. Minimum Operations to Make Array Sum Divisible by K', lc: 1, ok: 1, on: 1 }, { t: '3. Running Sum of 1d Array', lc: 1, ok: 1 }];

  var CARDS = [
    { key: 'trainer', name: 'Trainer problems', short: 'Trainer', icon: 'board',
      h: 'What the trainer <em>teaches from.</em>',
      say: 'Every module carries two sets. The trainer set is the worked one — <mark>explained in class</mark>, in the order it is taught, and <mark>locked or unlocked</mark> for the batch with one click.',
      beats: [
        { c: 'mods', label: 'Module tabs', dur: 2.8, scale: 1.1 },
        { c: 'list', label: 'The trainer set', dur: 3.0, scale: 1.12 },
        { c: 'lock', label: 'Lock & unlock for the batch', dur: 3.8, scale: 1.1 }
      ] },
    { key: 'trainee', name: 'Trainee problems', short: 'Trainee', icon: 'owl',
      h: 'What you <em>practise on.</em>',
      say: 'The same concept, your own problems. Pick one, <mark>solve it in the browser</mark>, and your first accepted submission <mark>adds to your points</mark> — with a small celebration.',
      beats: [
        { c: 'list', label: 'Your practice set', dur: 3.0, scale: 1.12 },
        { c: 'head', label: 'Points so far', dur: 2.4, scale: 1.1 },
        { c: 'desc', label: 'The problem', dur: 4.0, scale: 1.14 }
      ] },
    { key: 'ground', name: 'Coding Ground', short: 'Ground', icon: 'code',
      h: 'Write it. Run it. <em>Pass it.</em>',
      say: 'Description on the left, editor on the right. <mark>C, C++, Python and Java</mark>, every test case coming straight back, and <mark>an accepted submit</mark> lands on your heatmap.',
      beats: [
        { c: 'editor', label: 'Code arena', dur: 5.4, scale: 1.08 },
        { c: 'run', label: 'Run code', dur: 2.6, scale: 1.14 },
        { c: 'results', label: 'Test cases', dur: 3.6, scale: 1.1, scroll: 'results' },
        { c: 'submit', label: 'Submit · Accepted', dur: 4.0, scale: 1.12, scroll: 'submit' }
      ] },
    { key: 'leet', name: 'Company & LeetCode problems', short: 'Company', icon: 'layers',
      h: 'Company problems, <em>in the same module.</em>',
      say: 'LeetCode problems on the topic sit beside the module’s own set — <mark>solved there, counted here</mark>. Company-tagged questions, loaded by your admin, sit with them.',
      beats: [
        { c: 'list', label: 'The LeetCode tab', dur: 3.2, scale: 1.12 },
        { c: 'acc', label: 'Solved there, counted here', dur: 4.0, scale: 1.1 },
        { c: 'company', label: 'Company-tagged problems', dur: 3.6, scale: 1.1, scroll: 'company' }
      ] }
  ];
  var EYES = [{ l: 17, t: 17, r: -3 }, { l: 17, t: 83, r: 3 }, { l: 20, t: 15, r: -2 }, { l: 15, t: 85, r: 3 }];
  var DIM = [0, .2, .32, .44];

  /* ───────── UI builders ───────── */
  function nav() {
    return '<div class="pu-c pu-nav" data-c="nav"><span class="pu-brand"><i>' + ic('owl') + '</i>Owl Coder</span><a>Owl Dashboard</a><a>Coding Contest</a>' +
      '<span class="pu-user"><i>' + ic('user') + '</i>K. Prasanth</span></div>';
  }
  function mods(on) {
    return '<div class="pu-c pu-mods" data-c="mods">' + MODS.map(function (m) {
      return '<div class="pu-mod' + (m[0] === on ? ' on' : '') + '" data-m="' + m[0] + '" style="--p:' + m[2] + '%"><b>' + m[0] + '</b><small>' + m[1] + '</small>' + (m[3] ? '<em>module</em>' : '<u></u>') + '</div>';
    }).join('') + '</div>';
  }
  function li(it) {
    var badges = '';
    if (it.lc) badges += '<i class="lc"><img src="assets/img/logos/lc.png" alt="LeetCode"></i>';
    if (it.lock) badges += '<i class="lk">' + ic('unlock') + '</i>';
    if (it.ok) badges += '<i class="ok">' + ic('check') + '</i>';
    if (it.solve) badges += '<s>Solve</s>';
    if (it.co) badges += '<b>' + it.co + '</b>';
    return '<div class="pu-li' + (it.on ? ' on' : '') + '" data-p="' + (it.id || '') + '">' + ic('code') + '<span>' + it.t + '</span><em>' + badges + '</em></div>';
  }
  function list(title, items, tabs) {
    var t = '';
    if (tabs) t = '<div class="pu-lt"><span class="' + (tabs.on === 0 ? 'on' : '') + '" data-t="0">' + ic('owl') + 'Maya</span><span class="' + (tabs.on === 1 ? 'on' : '') + '" data-t="1"><img class="pu-lcm" src="assets/img/logos/lc.png" alt="">Leet</span><i class="pu-ul" style="--w:4.6em;--x:' + (tabs.on === 1 ? '4.8em' : '0em') + '"></i></div>';
    return '<div class="pu-lpanel"><div class="pu-c pu-list" data-c="list"><div class="pu-lh">' + title + '<i><b>' + ic('minus') + '</b><b>' + ic('out') + '</b></i></div>' + t +
      '<div class="pu-lis">' + items.map(li).join('') + '</div></div></div>';
  }
  function lockbar() {
    return '<div class="pu-c pu-bar unl" data-c="lock">' + ic('unlock') + '<span>Unlocked for students in this batch</span><span class="pu-btn red">' + ic('lock') + '<span>Lock for Students</span><i class="pu-rip"></i></span></div>';
  }
  function head(pts, subs, c) {
    return '<div class="pu-c pu-head" data-c="' + (c || 'head') + '"><span><b>Home</b> / <b class="g">Coding Ground</b></span><span>Points: <b class="pu-pt" data-v="' + pts + '">' + pts + '</b></span><span>Submissions: <b class="pu-pt" data-v="' + subs + '">' + subs + '</b></span>' +
      '<span class="pu-lang">' + ic('code') + 'C++ · GCC 11.1.0</span></div>';
  }
  function sec(b, p) { return '<div class="pu-sec"><b>' + b + '</b><p>' + p + '</p></div>'; }
  function io(b, v) { return '<div class="pu-io"><b>' + b + '</b><pre>' + v + '</pre></div>'; }
  function desc(c, title, blocks) {
    return '<div class="pu-c pu-desc" data-c="' + c + '"><div class="pu-dh">Description</div>' + (title ? '<div class="pu-ttl">' + title + '</div>' : '') + blocks.join('') + '</div>';
  }
  function editor(key, blank) {
    return '<div class="pu-c pu-code" data-c="editor"><div class="pu-ch"><i></i><i></i><i></i><span>main.cpp</span><em>C++ · GCC 11.1.0</em></div><div class="pu-lines">' + codeLines(CODE[key], blank) + '</div></div>';
  }
  function runbar(withStatus) {
    return '<div class="pu-c pu-run" data-c="run"><span class="pu-btn">' + ic('play') + '<span>Run Code</span><i class="pu-rip"></i></span><span class="pu-btn ink">' + ic('send') + '<span>Submit</span><i class="pu-rip"></i></span>' +
      (withStatus ? '<span class="pu-st"><i></i><span>Compiling…</span></span>' : '') + '</div>';
  }
  function results(rows, withRun, done) {
    var tr = rows.map(function (r, i) {
      return '<tr class="pu-row"><td>' + (i + 1) + '</td><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td><td class="ps">Pass</td></tr>';
    }).join('');
    var st = '<span class="pu-st' + (done ? ' ok pu-ready' : '') + '"><i></i><span>' + (done ? 'Compiled · 0.42 s' : 'Compiling…') + '</span></span>';
    return '<div class="pu-c pu-out" data-c="results">' + (withRun ? '<div class="pu-run" style="padding:0;border:0"><span class="pu-btn">' + ic('play') + '<span>Run Code</span><i class="pu-rip"></i></span>' + st + '</div>' : '') +
      '<div class="pu-cr">Compiler Response</div><table class="pu-tbl"><thead><tr><th>#</th><th>Input</th><th>Expected</th><th>Your output</th><th>Memory</th><th>CPU time</th><th>Result</th></tr></thead><tbody>' + tr + '</tbody></table>' +
      '<div class="pu-hid' + (done ? ' ok' : '') + '">' + ic('check') + '<span>' + (done ? 'All hidden test cases passed' : 'Hidden test cases…') + '</span></div></div>';
  }
  function submit(kind, done) {
    var rdy = done ? ' pu-ready' : '';
    var ver = kind === 'congrats'
      ? '<div class="pu-ver' + rdy + '"><span class="pu-stamp">' + ic('trophy') + '</span><span><b>Congratulations!</b><small>Candy Jars solved on the first submission</small></span><span class="pu-pts">+20 pts</span></div>'
      : '<div class="pu-ver' + rdy + '"><span class="pu-stamp">' + ic('check') + '</span><span><b>Accepted</b><small>8 / 8 test cases · added to your heatmap</small></span><span class="pu-heat">' + heat() + '</span><span class="pu-pts">+20 pts</span></div>';
    return '<div class="pu-c pu-sub" data-c="submit"><span class="pu-btn ink">' + ic('send') + '<span>Submit</span><i class="pu-rip"></i></span>' + ver + '</div>';
  }
  function heat() {
    var lv = [0, 1, 0, 2, 1, 0, 0, 3, 1, 2, 0, 1, 1, 0, 2, 3, 0, 1, 0, 0, 2, 1, 3, 0, 1, 0, 2, 0, 1, 2, 0, 0, 1, 3, 0, 0], h = '';
    lv.forEach(function (l, i) { h += '<i class="' + (l ? 'l' + l : '') + (i === 35 ? ' today' : '') + '"></i>'; });
    return h;
  }
  function jars() {
    var a = [3, 8, 1, 9, 4];
    return '<div class="pu-jars">' + a.map(function (v, i) { return '<span class="pu-jar" data-j="' + i + '"><i style="--h:' + Math.round(v / 9 * 80) + '%"></i><b>' + v + '</b></span>'; }).join('') + '</div>';
  }
  function arr() {
    return '<div class="pu-arr"><i>1</i><i>2</i><i>1</i><s>→</s><i>1</i><i>2</i><i>1</i><i class="g pu-dup">1</i><i class="g pu-dup">2</i><i class="g pu-dup">1</i></div>';
  }

  var UI = {
    trainer: function () {
      return nav() + mods('Trainer') +
        '<div class="pu-body">' + list('Trainer', [{ t: '1. Sum of Matrix Elements', ok: 1, lock: 1, id: 1 }, { t: '2. Find Numbers with Even Number of Digits', ok: 1, lock: 1 }, { t: '3. Concatenation of Array', ok: 1, lock: 1 }]) +
        '<div class="pu-main">' + lockbar() +
        '<div class="pu-cols">' + desc('desc', 'Sum of Matrix Elements', [
          sec('Program Description', 'Given a 2-D array of M × N order, find the sum of all the elements present in the array.'),
          sec('Input Format', 'M and N, the size of the array, then M rows of N integers.'),
          sec('Output Format', 'Print the sum of all the elements.'),
          sec('Constraints', '<code>1 ≤ M, N ≤ 10</code>')]) + editor('trainer') + '</div>' +
        results([['3 2\n4 5\n6 9\n0 3', '27', '1408 KB', '4.337 ms'], ['2 2\n1 2\n3 4', '10', '1408 KB', '3.538 ms']], true, true) +
        '</div></div>';
    },
    trainee: function () {
      return nav() + mods('Practice') +
        '<div class="pu-body">' + list('Practice', MAYA_SET, { on: 0 }) +
        '<div class="pu-main">' + head(40, 13) +
        '<div class="pu-cols">' + desc('desc', 'Candy Jars', [
          sec('Program Description', 'N candy jars stand in a row; the i-th holds <code>a[i]</code> candies. Maya may empty exactly two neighbouring jars. Find the most candies she can take.'),
          jars(),
          '<div class="pu-io2">' + io('Input-1', '5\n3 8 1 9 4') + io('Output-1', '13') + '</div>',
          sec('Constraints', '<code>2 ≤ N ≤ 10⁵</code> · <code>1 ≤ a[i] ≤ 10⁴</code>')]) + editor('trainee') + '</div>' +
        results([['5\n3 8 1 9 4', '13', '1408 KB', '3.902 ms'], ['4\n2 2 2 2', '4', '1408 KB', '3.114 ms']], true, true) + submit('congrats', true) +
        '</div></div>';
    },
    ground: function () {
      return nav() +
        '<div class="pu-body pu-nolist">' +
        '<div class="pu-main">' + head(20, 0) +
        '<div class="pu-cols"><div class="pu-col">' + desc('desc', 'Concatenation of Array', [
          sec('Program Description', 'Given an array <code>nums</code> of length n, build the array <code>ans</code> of length 2n where <code>ans[i] = nums[i]</code> and <code>ans[i + n] = nums[i]</code> — that is, <code>nums</code> followed by itself.'),
          arr()]) +
          '<div class="pu-c pu-desc" data-c="cons">' + sec('Input Format', 'n, then the n integers.') + sec('Output Format', 'The 2n integers of <code>ans</code>, space-separated.') + sec('Constraints', '<code>1 ≤ n ≤ 1000</code> · <code>1 ≤ nums[i] ≤ 1000</code>') +
          '<div class="pu-io2">' + io('Input-1', '3\n1 2 1') + io('Output-1', '1 2 1 1 2 1') + '</div></div></div>' +
          '<div class="pu-col">' + editor('ground', true) + runbar(true) + '</div></div>' +
        results([['3\n1 2 1', '1 2 1 1 2 1', '1408 KB', '2.871 ms'], ['4\n1 3 2 1', '1 3 2 1 1 3 2 1', '1408 KB', '3.106 ms']], false) + submit('accepted') +
        '</div></div>';
    },
    leet: function () {
      return nav() + mods('Practice') +
        '<div class="pu-body">' + list('Practice', MAYA_SET, { on: 0 }) +
        '<div class="pu-main">' +
        '<div class="pu-c pu-prob" data-c="problem"><h4>3512. Minimum Operations to Make Array Sum Divisible by K<span class="pu-solved">' + ic('check') + 'Solved</span></h4>' +
          '<div class="pu-chips"><span class="pu-chip e">Easy</span><span class="pu-chip">' + ic('tag') + 'Topics</span><span class="pu-chip">' + ic('lock') + 'Companies</span><span class="pu-chip">Hint</span></div>' +
          '<p>You are given an integer array <code>nums</code> and an integer <code>k</code>. In one operation, select an index <code>i</code> and replace <code>nums[i]</code> with <code>nums[i] − 1</code>. Return the minimum number of operations required to make the sum of the array divisible by <code>k</code>.</p>' +
          '<p><b>Example:</b> <code>nums = [3, 9, 7]</code>, <code>k = 5</code> → <code>4</code></p><span class="pu-ext">Open on LeetCode ' + ic('ext') + '</span></div>' +
        '<div class="pu-c pu-acc" data-c="acc"><div class="pu-ah">' + ic('check') + 'Accepted<small><b class="pu-n855">855</b> / 855 test cases</small><span class="pu-lcb"><img src="assets/img/logos/lc.png" alt="">LeetCode submission</span></div>' +
          '<div class="pu-am"><div><small>Runtime</small><b>0 ms</b><em>beats <span class="pu-b1">100.00</span>%</em></div><div><small>Memory</small><b>45.36 MB</b><em>beats <span class="pu-b2">34.07</span>%</em></div></div>' +
          '<div class="pu-bars"><i class="me" style="--h:100%"></i><i style="--h:8%"></i><i style="--h:5%"></i><i style="--h:4%"></i><i style="--h:3%"></i><i style="--h:3%"></i><i style="--h:2%"></i><i style="--h:2%"></i></div>' +
          '<div class="pu-sync"><i>' + ic('check') + '</i>Solved on LeetCode — counted on your Owl Coder heatmap</div></div>' +
        '<div class="pu-c pu-co" data-c="company"><div class="pu-dh">Company problems <small>loaded by your admin</small></div>' +
          '<div class="pu-tags"><span class="pu-tg on">Amazon<b>184</b></span><span class="pu-tg">Microsoft<b>141</b></span><span class="pu-tg">Google<b>132</b></span><span class="pu-tg">TCS Digital<b>96</b></span><span class="pu-tg">Infosys<b>88</b></span><span class="pu-tg">Wipro<b>74</b></span></div>' +
          '<div class="pu-cop">' + li({ t: 'Richest Customer Wealth', ok: 1, co: 'Amazon' }) + li({ t: 'Search in Rotated Sorted Array', co: 'Amazon' }) + li({ t: 'Two Sum', ok: 1, co: 'Amazon' }) + '</div></div>' +
        '</div></div>';
    }
  };
  function pageHtml(i) { return '<div class="pu"><div class="pu-page">' + UI[CARDS[i].key]() + '</div></div>'; }

  var MAC_HTML =
    '<div class="mac"><div class="mac-lid"><div class="mac-bezel"><i class="mac-notch"></i><div class="mac-scr">' +
    '<div class="mac-chrome"><i></i><i></i><i></i><span class="tab"><b></b>Owl Coder</span><span class="url">owlcoder.technicalhub.io/<em>practise</em></span></div>' +
    '<div class="mac-view"></div><span class="mac-glass"></span><span class="mac-off"></span>' +
    '</div></div></div><span class="mac-hinge"></span>' +
    '<span class="mac-base"><i class="mac-spk l"></i><i class="mac-spk r"></i><i class="mac-keys"></i><i class="mac-pad"></i></span><span class="mac-shadow"></span></div>';

  /* ───────── build ───────── */
  function buildOnce(prac) {
    if (prac._built) return;
    prac._built = true;
    var h = '<div class="pz-bg" aria-hidden="true"><i class="pz-bloom g"></i><i class="pz-bloom y"></i><i class="pz-bloom m"></i><i class="pz-grid"></i><i class="pz-floor"></i><i class="pz-pool"></i><i class="pz-refl"></i></div>' +
      '<div class="pz-stage" aria-hidden="true"><div class="pz-deck">';
    CARDS.forEach(function (c, i) {
      h += '<div class="pz-card" data-i="' + i + '"><div class="pz-mon"><i class="pz-side r"></i><i class="pz-side b"></i><div class="pz-bezel"><i class="pz-cam"></i><div class="pz-scr">' + pageHtml(i) +
        '<span class="pz-glass"></span><span class="pz-dim"></span><span class="pz-off"></span></div><i class="pz-brand"></i></div></div><i class="pz-cshadow"></i></div>';
    });
    h += '</div></div><div class="pz-lap" aria-hidden="true">' + MAC_HTML + '</div><div class="pz-over" aria-hidden="true"></div>';
    CARDS.forEach(function (c, i) {
      h += '<div class="pz-copy" data-i="' + i + '"><b class="pz-num">0' + (i + 1) + '</b><span class="pz-k"><i>' + ic(c.icon) + '</i>04 · Practise <s>·</s> ' + c.name + '</span><h3 class="pz-h">' + c.h + '</h3><p class="pz-say">' + c.say + '</p>' +
        '<ol class="pz-beats">' + c.beats.map(function (b, j) { return '<li data-b="' + j + '"><i>' + (j + 1) + '</i><span>' + b.label + '</span></li>'; }).join('') + '</ol>' +
        '<div class="pz-dots">' + CARDS.map(function (d, j) { return '<span class="pz-dot' + (j === i ? ' on' : '') + '" data-k="' + j + '" role="button" title="' + d.name + '"></span>'; }).join('') + '<em>' + (i + 1) + ' / ' + CARDS.length + '</em></div></div>';
    });
    prac.innerHTML = h;
    var kb = $('.mac-keys', prac);
    var rows = [14, 14, 14, 13, 12].map(function (n) { return '<div class="kr">' + new Array(n + 1).join('<i></i>') + '</div>'; });
    rows.push('<div class="kr"><i></i><i></i><i></i><i class="w"></i><i class="sp"></i><i class="w"></i><i></i><i></i><i></i></div>');
    kb.innerHTML = rows.join('');
    prac._cards = $$('.pz-card', prac).map(function (c, i) {
      return { i: i, el: c, mon: $('.pz-mon', c), scr: $('.pz-scr', c), pu: $('.pu', c), page: $('.pu-page', c), dim: $('.pz-dim', c), off: $('.pz-off', c) };
    });
    prac._copies = $$('.pz-copy', prac);
    prac._over = $('.pz-over', prac);
    var step = prac.closest('.step');
    $$('.pz-dot', prac).forEach(function (d) { d.addEventListener('click', function () { if (global.deckSetSub && step) global.deckSetSub(step, +d.dataset.k); }); });
    if (step) step.addEventListener('substep', function (e) { show(step, e.detail.k, e.detail.d); });
  }

  /* ───────── geometry ───────── */
  function layout(prac) {
    var W = prac.clientWidth || innerWidth, H = prac.clientHeight || innerHeight, narrow = W <= 1080;
    prac.classList.toggle('narrow', narrow);
    var mw, deckX, deckY, copyL, copyW, copyTop;
    if (narrow) { mw = even(clamp(Math.min(W - 40, (H - 300) / .83), 320, 720)); }
    else { mw = even(clamp(Math.min(W * .53, H * .78 / .67), 480, 1160)); }
    var k = clamp(mw / 780, .62, 1.4);
    var bz = Math.round(mw * .016), r = Math.round(mw * .022), th = Math.round(mw * .02);
    var sw = mw - 4 - 2 * bz, fs = Math.round(sw / 62 * 10) / 10;
    var mh = Math.round(sw * .625 + 4 + bz * 2.3);
    prac.style.setProperty('--k', k.toFixed(3)); prac.style.setProperty('--mw', mw + 'px'); prac.style.setProperty('--mh', mh + 'px');
    prac.style.setProperty('--bz', bz + 'px'); prac.style.setProperty('--r', r + 'px'); prac.style.setProperty('--th', th + 'px'); prac.style.setProperty('--fs', fs + 'px');
    var ox = Math.round(mw * .05), oy = Math.round(mw * .052), zd = Math.round(mw * .17);
    var gut = Math.round(48 * k), gap = Math.round(34 * k);
    if (narrow) {
      deckX = Math.round(W / 2); deckY = Math.round(oy * 3 + 28 + mh / 2);
      copyL = 20; copyW = W - 40; copyTop = deckY + Math.round(mh / 2) + 22;
    } else {
      deckX = W - Math.round(44 * k) - ox * 3 - Math.round(mw / 2); deckY = Math.round(H * .53);
      copyL = gut; copyW = Math.min(Math.round(560 * k), deckX - Math.round(mw / 2) - gap - gut); copyTop = null;
    }
    var g = prac._geo = { W: W, H: H, k: k, mw: mw, mh: mh, sw: sw, fs: fs, ox: ox, oy: oy, zd: zd, deckX: deckX, deckY: deckY, copyL: copyL, copyW: copyW, copyTop: copyTop, narrow: narrow, gut: gut };
    var deck = $('.pz-deck', prac), stage = $('.pz-stage', prac);
    deck.style.left = deckX + 'px'; deck.style.top = deckY + 'px';
    stage.style.perspectiveOrigin = Math.round(deckX + mw * .12) + 'px ' + Math.round(deckY - mh * .6) + 'px';
    // the floor under the deck
    var pool = $('.pz-pool', prac), refl = $('.pz-refl', prac);
    pool.style.width = Math.round(mw * 1.25) + 'px'; pool.style.height = Math.round(mh * .26) + 'px';
    pool.style.left = Math.round(deckX - mw * .625) + 'px'; pool.style.top = Math.round(deckY + mh / 2 - mh * .08) + 'px';
    refl.style.width = mw + 'px'; refl.style.height = Math.round(mh * .32) + 'px';
    refl.style.left = Math.round(deckX - mw / 2) + 'px'; refl.style.top = Math.round(deckY + mh / 2 + 6) + 'px';
    // copy columns
    prac._copies.forEach(function (c) {
      c.style.left = copyL + 'px'; c.style.width = copyW + 'px';
      var ch = c.offsetHeight || 320;
      c.style.top = (copyTop != null ? copyTop : Math.round(clamp(H * .5 - ch / 2, 24, H - ch - 24))) + 'px';
    });
    return g;
  }
  function rel(prac, node) { var a = node.getBoundingClientRect(), c = prac.getBoundingClientRect(); return { left: a.left - c.left, top: a.top - c.top, width: a.width, height: a.height }; }
  function slot(prac, j, extra) {
    var g = prac._geo, p = { x: j * g.ox, y: -j * g.oy, z: -j * g.zd, rotationX: 0, rotationY: 0, opacity: 1 };
    if (extra) for (var k in extra) p[k] = extra[k];
    return p;
  }
  function orderFor(k) { var o = []; for (var j = 0; j < CARDS.length; j++) o.push((k + j) % CARDS.length); return o; }
  // every card to its exact slot for the current top; the top card rests with no transform
  function settleDeck(prac) {
    var order = orderFor(prac._k), deck = $('.pz-deck', prac);
    gsap.killTweensOf(deck); gsap.set(deck, { clearProps: 'transform' });
    order.forEach(function (ci, j) {
      var c = prac._cards[ci]; gsap.killTweensOf([c.el, c.dim, c.off]);
      if (j === 0) gsap.set(c.el, { clearProps: 'transform', opacity: 1 }); else gsap.set(c.el, slot(prac, j));
      gsap.set(c.dim, { opacity: DIM[j] }); gsap.set(c.off, { opacity: 0 });
      c.page.classList.remove('pz-recede');
      c.el.style.zIndex = String(10 - j);
    });
  }
  function resetCard(prac, i) {
    var c = prac._cards[i];
    c.page.innerHTML = UI[CARDS[i].key]();
    gsap.set(c.page, { clearProps: 'transform' });
  }

  /* ───────── the owl's eyes: alternate corners on the copy side ───────── */
  function eyes(k) {
    var w = $('#watch'); if (!w) return;
    var e = EYES[k % EYES.length];
    w.style.transitionDuration = '1.1s';
    w.style.left = e.l + '%'; w.style.top = e.t + '%'; w.style.rotate = e.r + 'deg';
  }
  function eyesOff() {
    var w = $('#watch'); if (!w) return;
    w.style.left = ''; w.style.top = ''; w.style.rotate = ''; w.style.transitionDuration = '';
  }

  /* ───────── copy state ───────── */
  function paintCopy(prac, k) {
    prac._copies.forEach(function (c, i) { $$('.pz-dot', c).forEach(function (d) { d.classList.toggle('on', +d.dataset.k === k); }); });
  }
  function paintBeat(prac, k, b) {
    $$('.pz-beats li', prac._copies[k]).forEach(function (li, j) {
      li.classList.toggle('on', j === b); li.classList.toggle('done', b != null && j < b);
      var i = $('i', li); i.textContent = (b != null && j < b) ? '✓' : String(j + 1);
    });
  }

  /* ───────── the cut-outs ───────── */
  function ripple(tl, btn, at) {
    var r = $('.pu-rip', btn); if (!r) return;
    tl.fromTo(r, { scale: 0, opacity: .9 }, { scale: 9, opacity: 0, duration: .55, ease: 'power2.out' }, at);
    tl.fromTo(btn, { scale: 1 }, { scale: .94, duration: .09, yoyo: true, repeat: 1, ease: 'power1.inOut', clearProps: 'transform' }, at);
  }
  function countTo(tl, node, to, dur, at, fmt) {
    var o = { v: +(node.dataset.from || 0) };
    tl.to(o, { v: to, duration: dur, ease: 'power2.out', onUpdate: function () { node.textContent = fmt ? fmt(o.v) : Math.round(o.v); } }, at);
  }
  function rows(tl, clone, at, gap) {
    var rs = $$('.pu-row', clone), hid = $('.pu-hid', clone), st = $('.pu-st', clone), btn = $('.pu-btn', clone);
    if (btn) ripple(tl, btn, at);
    if (st) { tl.set(st, { opacity: 1 }, at + .1); tl.call(function () { st.classList.add('ok'); $('span', st).textContent = 'Compiled · 0.42 s'; }, null, at + .9); }
    rs.forEach(function (r, i) { tl.fromTo(r, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: .45, ease: 'power3.out', clearProps: 'transform' }, at + 1.0 + i * (gap || .4)); });
    if (hid) tl.call(function () { hid.classList.add('ok'); $('span', hid).textContent = 'All hidden test cases passed'; }, null, at + 1.0 + rs.length * (gap || .4) + .25);
  }
  function confetti(prac, rect) {
    var over = prac._over, cols = ['#15893F', '#3CB371', '#F7B500', '#FFCE52', '#FFFFFF', '#7FD39B'], n = reduced ? 0 : 42;
    for (var i = 0; i < n; i++) {
      var p = el('i', 'pz-cf'); p.style.background = cols[i % cols.length];
      var x0 = rect.left + rect.width * (0.15 + Math.random() * .7), y0 = rect.top + rect.height * .3;
      over.appendChild(p);
      gsap.set(p, { x: x0, y: y0, rotation: Math.random() * 360, scale: .7 + Math.random() * .7, opacity: 1 });
      gsap.to(p, { x: x0 + (Math.random() - .5) * rect.width * .9, y: y0 + rect.height * (1.6 + Math.random() * 2.4), rotation: '+=' + (Math.random() * 540 - 270), duration: 1.3 + Math.random() * .9, ease: 'power1.in', delay: Math.random() * .25 });
      gsap.to(p, { opacity: 0, duration: .45, delay: 1.25 + Math.random() * .7, onComplete: (function (q) { return function () { if (q.parentNode) q.parentNode.removeChild(q); }; })(p) });
    }
  }

  // the per-beat actions: (clone, timeline, at, ctx) — the clone is the lifted copy
  var ACT = {
    trainer: {
      mods: function (c, tl, at) {
        var on = $('.pu-mod.on', c), bar = on && $('u', on), small = on && $('small', on);
        if (!on) return;
        tl.fromTo(on, { boxShadow: '0 0 0 0 rgba(21,137,63,0)' }, { boxShadow: '0 10px 22px -12px rgba(21,137,63,.7)', duration: .5 }, at);
        var o = { v: 0 }; tl.to(o, { v: 3, duration: .9, ease: 'power2.out', onUpdate: function () { small.textContent = Math.round(o.v) + ' / 3'; } }, at + .2);
        tl.fromTo(on, { '--p': '0%' }, { '--p': '100%', duration: .9, ease: 'power2.out' }, at + .2);
      },
      list: function (c, tl, at) {
        var items = $$('.pu-li', c);
        tl.fromTo(items, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: .45, stagger: .12, ease: 'power3.out', clearProps: 'transform' }, at);
        tl.call(function () { items[0].classList.add('on'); }, null, at + .8);
        tl.fromTo($$('.pu-li em i', c), { scale: .4 }, { scale: 1, duration: .4, stagger: .05, ease: 'back.out(2)', clearProps: 'transform' }, at + .9);
      },
      lock: function (c, tl, at) {
        var btn = $('.pu-btn', c), txt = $('.pu-bar > span', c), bt = $('.pu-btn span', c), bi = $('.pu-bar > svg path', c), ii = $('.pu-btn svg path', c);
        ripple(tl, btn, at + .3);
        tl.call(function () { c.classList.remove('unl'); c.classList.add('lkd'); txt.textContent = 'Locked for students in this batch'; bt.textContent = 'Unlock for Students'; btn.classList.remove('red'); bi.setAttribute('d', SVG.lock); ii.setAttribute('d', SVG.unlock); }, null, at + .5);
        ripple(tl, btn, at + 1.9);
        tl.call(function () { c.classList.add('unl'); c.classList.remove('lkd'); txt.textContent = 'Unlocked for students in this batch'; bt.textContent = 'Lock for Students'; btn.classList.add('red'); bi.setAttribute('d', SVG.unlock); ii.setAttribute('d', SVG.lock); }, null, at + 2.1);
      },
      desc: function (c, tl, at) {
        tl.fromTo($$('.pu-ttl, .pu-sec', c), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .5, stagger: .22, ease: 'power3.out', clearProps: 'transform' }, at);
      },
      editor: function (c, tl, at) {
        var ls = $$('.pu-ln', c);
        ls.forEach(function (l, i) { tl.call(function () { ls.forEach(function (m) { m.classList.remove('hl'); }); l.classList.add('hl'); }, null, at + i * .16); });
        tl.call(function () { ls.forEach(function (m) { m.classList.remove('hl'); }); }, null, at + ls.length * .16 + .3);
      },
      results: function (c, tl, at) { rows(tl, c, at); }
    },
    trainee: {
      list: function (c, tl, at) {
        var items = $$('.pu-li', c);
        tl.fromTo(items, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: .45, stagger: .11, ease: 'power3.out', clearProps: 'transform' }, at);
        tl.call(function () { items[1].classList.add('on'); }, null, at + .9);
        tl.fromTo($$('.pu-li em', c), { scale: .5 }, { scale: 1, duration: .4, stagger: .06, ease: 'back.out(2)', clearProps: 'transform' }, at + .5);
      },
      head: function (c, tl, at) {
        var pts = $$('.pu-pt', c);
        countTo(tl, pts[0], 40, 1.1, at + .1); countTo(tl, pts[1], 13, 1.1, at + .25);
      },
      desc: function (c, tl, at) {
        tl.fromTo($$('.pu-ttl, .pu-sec, .pu-io2', c), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .5, stagger: .2, ease: 'power3.out', clearProps: 'transform' }, at);
        tl.fromTo($$('.pu-jar i', c), { scaleY: 0 }, { scaleY: 1, duration: .6, stagger: .08, ease: 'power3.out', clearProps: 'transform' }, at + .5);
        tl.call(function () { $$('.pu-jar', c).forEach(function (j) { j.classList.toggle('hot', j.dataset.j === '3' || j.dataset.j === '4'); }); }, null, at + 1.6);
      },
      editor: function (c, tl, at) {
        var ls = $$('.pu-ln', c);
        tl.call(function () { ls.forEach(function (l, i) { $('span', l).innerHTML = tokHtml(tokens(CODE.trainee[i] || '')); }); gsap.set(ls, { opacity: 0, x: -6 }); }, null, at - .4);
        tl.to(ls, { opacity: 1, x: 0, duration: .25, stagger: .07, ease: 'power2.out', clearProps: 'transform' }, at - .35);
      },
      results: function (c, tl, at) { rows(tl, c, at); },
      submit: function (c, tl, at, ctx) {
        var btn = $('.pu-btn', c), ver = $('.pu-ver', c);
        ripple(tl, btn, at + .2);
        tl.fromTo(ver, { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: .55, ease: 'power3.out', clearProps: 'transform' }, at + .55);
        tl.fromTo($('.pu-stamp', c), { scale: .3, rotation: -30 }, { scale: 1, rotation: 0, duration: .6, ease: 'back.out(2.2)', clearProps: 'transform' }, at + .55);
        tl.call(function () { confetti(ctx.prac, rel(ctx.prac, ctx.lift)); }, null, at + .6);
        // the page behind reacts: the problem ticks, the tile count moves, the points move
        tl.call(function () {
          var scr = ctx.top.scr, row = $('.pu-li[data-p="2"]', scr), tile = $('.pu-mod[data-m="Practice"]', scr), pt = $$('.pu-head .pu-pt', scr)[0];
          if (row) { var em = $('em', row); em.innerHTML = '<i class="ok">' + ic('check') + '</i>'; }
          if (tile) { $('small', tile).textContent = '4 / 4'; tile.style.setProperty('--p', '100%'); }
          if (pt) { var o = { v: 40 }; gsap.to(o, { v: 60, duration: .8, ease: 'power2.out', onUpdate: function () { pt.textContent = Math.round(o.v); } }); }
        }, null, at + .9);
      }
    },
    ground: {
      desc: function (c, tl, at) {
        tl.fromTo($$('.pu-ttl, .pu-sec', c), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .5, stagger: .22, ease: 'power3.out', clearProps: 'transform' }, at);
        var src = $$('.pu-arr i:not(.pu-dup)', c), dup = $$('.pu-dup', c), ar = $('.pu-arr s', c);
        tl.fromTo(src, { opacity: 0, scale: .6 }, { opacity: 1, scale: 1, duration: .35, stagger: .08, ease: 'back.out(2)', clearProps: 'transform' }, at + .6);
        tl.fromTo(ar, { opacity: 0 }, { opacity: 1, duration: .3 }, at + 1.0);
        tl.fromTo(dup, { opacity: 0, x: -34, scale: .6 }, { opacity: 1, x: 0, scale: 1, duration: .5, stagger: .09, ease: 'back.out(1.6)', clearProps: 'transform' }, at + 1.15);
      },
      cons: function (c, tl, at) {
        tl.fromTo($$('.pu-sec, .pu-io2', c), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .5, stagger: .2, ease: 'power3.out', clearProps: 'transform' }, at);
      },
      editor: function (c, tl, at) {
        var ls = $$('.pu-ln > span', c), t = at, cps = 58;
        CODE.ground.forEach(function (line, i) {
          var toks = tokens(line), n = line.length, o = { c: 0 }, node = ls[i];
          (function (node, toks, n, o, i) {
            tl.call(function () { node.innerHTML = '<i class="pu-caret"></i>'; }, null, t);
            tl.to(o, { c: n, duration: Math.max(.12, n / cps), ease: 'none', onUpdate: function () { node.innerHTML = tokHtml(toks, Math.round(o.c)) + '<i class="pu-caret"></i>'; },
              onComplete: function () { node.innerHTML = tokHtml(toks) + (i === CODE.ground.length - 1 ? '<i class="pu-caret"></i>' : ''); } }, t);
          })(node, toks, n, o, i);
          t += Math.max(.12, n / cps) + .06;
        });
        tl.call(function () { var cr = $('.pu-caret', c); if (cr) cr.remove(); }, null, t + .4);
      },
      run: function (c, tl, at) {
        var btn = $$('.pu-btn', c)[0], st = $('.pu-st', c);
        ripple(tl, btn, at + .2);
        tl.fromTo(st, { opacity: 0 }, { opacity: 1, duration: .25 }, at + .3);
        tl.call(function () { st.classList.add('ok'); $('span', st).textContent = 'Compiled · 0.42 s · 2 test cases ran'; }, null, at + 1.25);
      },
      results: function (c, tl, at) { rows(tl, c, at - .9, .45); },
      submit: function (c, tl, at, ctx) {
        var btn = $('.pu-btn', c), ver = $('.pu-ver', c), today = $('.pu-heat .today', c);
        ripple(tl, btn, at + .2);
        tl.fromTo(ver, { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: .55, ease: 'power3.out', clearProps: 'transform' }, at + .55);
        tl.fromTo($('.pu-stamp', c), { scale: .3, rotation: -30 }, { scale: 1, rotation: 0, duration: .6, ease: 'back.out(2.2)', clearProps: 'transform' }, at + .55);
        tl.fromTo($$('.pu-heat i', c), { opacity: 0 }, { opacity: 1, duration: .3, stagger: { each: .012, from: 'start' } }, at + .7);
        tl.call(function () { today.classList.add('l3'); }, null, at + 1.4);
        tl.fromTo(today, { scale: 1 }, { scale: 1.8, duration: .25, yoyo: true, repeat: 1, ease: 'power2.inOut', clearProps: 'transform' }, at + 1.4);
        tl.call(function () {
          var pt = $$('.pu-head .pu-pt', ctx.top.scr)[0]; if (!pt) return;
          var o = { v: 20 }; gsap.to(o, { v: 40, duration: .8, ease: 'power2.out', onUpdate: function () { pt.textContent = Math.round(o.v); } });
          var sb = $$('.pu-head .pu-pt', ctx.top.scr)[1]; if (sb) sb.textContent = '1';
        }, null, at + 1.0);
      }
    },
    leet: {
      list: function (c, tl, at) {
        var tabs = $$('.pu-lt span', c), ul = $('.pu-ul', c), box = $('.pu-lis', c);
        // the module's own set is showing; the Leet tab is picked and the rows change over
        tl.to(box, { opacity: 0, y: 6, duration: .22, ease: 'power2.in' }, at + .5);
        tl.call(function () { tabs[0].classList.remove('on'); tabs[1].classList.add('on'); }, null, at + .55);
        tl.fromTo(ul, { '--x': '0em' }, { '--x': '4.8em', duration: .42, ease: 'power3.inOut' }, at + .55);
        tl.call(function () { box.innerHTML = LEET_SET.map(li).join(''); }, null, at + .74);
        tl.to(box, { opacity: 1, y: 0, duration: .3, ease: 'power3.out', clearProps: 'transform' }, at + .76);
        // the LC badges and the solved ticks land one by one
        tl.call(function () {
          var marks = $$('.pu-li em i', c);
          gsap.fromTo(marks, { scale: .3 }, { scale: 1, duration: .4, stagger: .07, ease: 'back.out(2.5)', clearProps: 'transform' });
        }, null, at + 1.0);
      },
      problem: function (c, tl, at) {
        tl.fromTo($$('h4, .pu-chips, p, .pu-ext', c), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .5, stagger: .16, ease: 'power3.out', clearProps: 'transform' }, at);
      },
      acc: function (c, tl, at) {
        var n = $('.pu-n855', c), b1 = $('.pu-b1', c), b2 = $('.pu-b2', c);
        tl.fromTo($('.pu-ah', c), { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: .45, ease: 'power3.out', clearProps: 'transform' }, at);
        countTo(tl, n, 855, 1.1, at + .2);
        tl.fromTo($$('.pu-am div', c), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .45, stagger: .15, ease: 'power3.out', clearProps: 'transform' }, at + .5);
        countTo(tl, b1, 100, 1.0, at + .6, function (v) { return v.toFixed(2); });
        countTo(tl, b2, 34.07, 1.0, at + .75, function (v) { return v.toFixed(2); });
        tl.fromTo($$('.pu-bars i', c), { scaleY: 0 }, { scaleY: 1, duration: .6, stagger: .06, ease: 'power3.out', clearProps: 'transform' }, at + .9);
        tl.fromTo($('.pu-sync', c), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .45, ease: 'power3.out', clearProps: 'transform' }, at + 1.7);
      },
      company: function (c, tl, at) {
        tl.fromTo($$('.pu-tg', c), { opacity: 0, scale: .6 }, { opacity: 1, scale: 1, duration: .4, stagger: .07, ease: 'back.out(1.8)', clearProps: 'transform' }, at);
        tl.fromTo($$('.pu-cop .pu-li', c), { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: .45, stagger: .12, ease: 'power3.out', clearProps: 'transform' }, at + .7);
      }
    }
  };

  function topCard(prac) { return prac._cards[prac._k]; }
  function scrollFor(prac, key) {
    var top = topCard(prac), node = $('[data-c="' + key + '"]', top.scr); if (!node) return 0;
    var scrH = top.scr.clientHeight, pageH = top.page.offsetHeight;
    var want = node.offsetTop + node.offsetHeight + Math.round(prac._geo.fs * .9) - scrH;
    return clamp(Math.round(want), 0, Math.max(0, pageH - scrH));
  }
  function liftBeat(prac, b) {
    var top = topCard(prac), node = $('[data-c="' + b.c + '"]', top.scr); if (!node) return;
    settleBeat(prac, true);
    var r = rel(prac, node), s = rel(prac, top.scr), g = prac._geo;
    var L = el('div', 'pz-lift');
    L.style.left = Math.round(r.left) + 'px'; L.style.top = Math.round(r.top) + 'px'; L.style.width = Math.round(r.width) + 'px'; L.style.height = Math.round(r.height) + 'px';
    var clone = node.cloneNode(true); clone.classList.remove('pz-sock');
    var tag = el('span', 'pz-tag', '<i></i>' + esc(b.label));
    L.appendChild(clone); L.appendChild(tag);
    prac._over.appendChild(L);
    node.classList.add('pz-sock');
    var sc = b.scale || 1.12, cx = r.left + r.width / 2, cy = r.top + r.height / 2, sx = s.left + s.width / 2, sy = s.top + s.height / 2;
    var dx = Math.round((cx - sx) * .16), dy = Math.round((cy - sy) * .16);
    // keep the lifted piece on the stage
    var hw = r.width * sc / 2, hh = r.height * sc / 2, m = 10;
    dx = Math.round(clamp(dx, m + hw - cx, g.W - m - hw - cx)); dy = Math.round(clamp(dy, m + hh - cy, g.H - m - hh - cy));
    prac._lift = { L: L, node: node, clone: clone, b: b, top: top };
    var bt = prac._bt = gsap.timeline();
    // one clean rise toward the viewer; the shadow grows under it; the page steps back; the tag names it
    bt.to(L, { x: dx, y: dy, scale: sc, duration: .5, ease: 'power3.out' }, 0)
      .to(L, { '--lf': 1, duration: .5, ease: 'power2.out' }, 0)
      .to(top.dim, { opacity: .09, duration: .34, ease: 'power2.out' }, 0)
      .call(function () { top.page.classList.add('pz-recede'); }, null, 0)
      .fromTo(tag, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .28, ease: 'power2.out', clearProps: 'transform' }, .2);
    // while it hovers the shadow breathes; the piece itself never moves, so its type stays sharp
    if (!reduced) prac._hover = gsap.to(L, { '--lf': .8, duration: 2.1, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: .6 });
    var act = ACT[CARDS[prac._k].key][b.c];
    if (act) act(clone, bt, .34, { prac: prac, top: top, lift: L, node: node });
    return bt;
  }
  // put the lifted piece back and let the page keep its end state
  function settleBeat(prac, instant) {
    var lf = prac._lift; if (!lf) return;
    prac._lift = null;
    if (prac._bt) { prac._bt.progress(1).kill(); prac._bt = null; }
    if (prac._hover) { prac._hover.kill(); prac._hover = null; }
    var L = lf.L, node = lf.node, clone = lf.clone, top = lf.top, tag = $('.pz-tag', L);
    top.page.classList.remove('pz-recede');
    function commit() {
      if (node.parentNode) { node.innerHTML = clone.innerHTML; node.className = clone.className; node.classList.remove('pz-sock'); }
      if (L.parentNode) L.parentNode.removeChild(L);
    }
    gsap.killTweensOf([L, top.dim]);
    if (instant || reduced) { gsap.set(top.dim, { opacity: DIM[0] }); commit(); return; }
    gsap.to(top.dim, { opacity: DIM[0], duration: .3 });
    if (tag) gsap.to(tag, { opacity: 0, duration: .15 });
    gsap.to(L, { x: 0, y: 0, scale: 1, '--lf': 0, duration: .36, ease: 'power3.inOut', onComplete: commit });
  }

  /* ───────── the beats of the top card ───────── */
  function beginBeats(prac) {
    if (prac._tl) { prac._tl.kill(); prac._tl = null; }
    settleBeat(prac, true);
    var k = prac._k, card = CARDS[k], top = topCard(prac), t = .1;
    var tl = prac._tl = gsap.timeline();
    card.beats.forEach(function (b, i) {
      if (b.scroll) {
        tl.call(function () { var y = scrollFor(prac, b.scroll); gsap.to(top.page, { y: -y, duration: .45, ease: 'power2.inOut' }); }, null, t);
        t += .5;
      }
      tl.call(function () { paintBeat(prac, k, i); liftBeat(prac, b); }, null, t);
      t += b.dur;
      tl.call(function () { settleBeat(prac); }, null, t);
      t += .42;
    });
    tl.call(function () { paintBeat(prac, k, card.beats.length); }, null, t);
  }
  function killBeats(prac) {
    if (prac._tl) { prac._tl.kill(); prac._tl = null; }
    settleBeat(prac, true);
    $$('.pz-cf', prac._over).forEach(function (p) { gsap.killTweensOf(p); p.remove(); });
  }

  /* ───────── arrow: the top card falls, the deck tilts and shuffles ───────── */
  function show(step, k, d) {
    var prac = $('.prac', step); if (!prac || !prac._h) return;
    var h = prac._h, g = prac._geo, prevK = prac._k;
    if (k === prevK) return;
    killBeats(prac);
    if (prac._tr) { prac._tr.progress(1).kill(); prac._tr = null; }
    if (prac._intro) { prac._intro.progress(1).kill(); prac._intro = null; }
    settleDeck(prac);
    var prevOrder = orderFor(prevK);
    var oldTop = prac._cards[prevK], newTop = prac._cards[k], deck = $('.pz-deck', prac);
    prac._k = k;
    paintCopy(prac, k); paintBeat(prac, k, null);
    resetCard(prac, k);
    var tr = prac._tr = gsap.timeline({ onComplete: function () { prac._tr = null; settleDeck(prac); beginBeats(prac); } });
    tr.to(prac._copies[prevK], { opacity: 0, y: -14, duration: .3, ease: 'power2.in' }, 0);
    tr.call(function () { eyes(k); }, null, .05);
    if (!g.narrow) tr.to(deck, { rotationY: -24, rotationX: 9, duration: .65, ease: 'power2.inOut' }, .05);
    if (d >= 0) {
      // switch off, tip forward, fall
      tr.to(oldTop.off, { opacity: .55, duration: .25 }, .08);
      tr.to(oldTop.el, { rotationX: -34, y: Math.round(g.mh * 1.05), opacity: 0, duration: .7, ease: 'power2.in', transformOrigin: '50% 100%' }, .12);
      // the rest advance one slot
      prevOrder.slice(1).forEach(function (ci, j) {
        var c = prac._cards[ci];
        tr.to(c.el, slot(prac, j, { duration: .8, ease: 'power3.inOut' }), .42);
        tr.to(c.dim, { opacity: DIM[j], duration: .6 }, .5);
        tr.call(function () { c.el.style.zIndex = String(10 - j); }, null, .42);
      });
      // the fallen card comes back at the rear
      tr.set(oldTop.el, slot(prac, 4, { opacity: 0, rotationX: 0, transformOrigin: '50% 50%' }), .9);
      tr.set(oldTop.off, { opacity: 0 }, .9);
      tr.set(oldTop.dim, { opacity: DIM[3] }, .9);
      tr.call(function () { oldTop.el.style.zIndex = '7'; }, null, .9);
      tr.to(oldTop.el, slot(prac, 3, { duration: .6, ease: 'power2.out' }), .92);
    } else {
      // the rear card lifts out and lands on top; the rest step back
      tr.to(newTop.el, { opacity: 0, y: '-=' + Math.round(g.mh * .5), duration: .4, ease: 'power2.in' }, .08);
      prevOrder.slice(0, 3).forEach(function (ci, j) {
        var c = prac._cards[ci];
        tr.to(c.el, slot(prac, j + 1, { duration: .8, ease: 'power3.inOut' }), .4);
        tr.to(c.dim, { opacity: DIM[j + 1], duration: .6 }, .5);
        tr.call(function () { c.el.style.zIndex = String(10 - j - 1); }, null, .4);
      });
      tr.set(newTop.el, { x: 0, y: -Math.round(g.mh * .8), z: 140, rotationX: 70, rotationY: 0, opacity: 0, transformOrigin: '50% 50%' }, .75);
      tr.call(function () { newTop.el.style.zIndex = '10'; }, null, .75);
      tr.set(newTop.dim, { opacity: 0 }, .75);
      tr.to(newTop.el, { x: 0, y: 0, z: 0, rotationX: 0, opacity: 1, duration: .75, ease: 'power3.out' }, .78);
    }
    if (!g.narrow) tr.to(deck, { rotationY: 0, rotationX: 0, duration: .85, ease: 'power3.out' }, 1.0);
    tr.fromTo(prac._copies[k], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .55, ease: 'power3.out' }, 1.15);
    tr.call(function () { prac._copies[k].classList.add('go'); }, null, 1.2);
  }

  /* ───────── ambient ───────── */
  function startAmbient(prac) {
    stopAmbient(prac);
    if (reduced) return;
    var a = prac._amb = [];
    a.push(gsap.to($('.pz-bloom.g', prac), { x: -30, y: 24, duration: 11, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    a.push(gsap.to($('.pz-bloom.y', prac), { x: 28, y: -18, duration: 13, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
  }
  function stopAmbient(prac) { (prac._amb || []).forEach(function (t) { t.kill(); }); prac._amb = null; }

  /* ───────── lifecycle ───────── */
  // Courses' laptop geometry, recomputed here so the hand-off lines up to the pixel
  function coursesLap(W, H) {
    var kC = clamp(Math.min(W / 1560, H / 780), .62, 1.4), mwC = even(640 * kC), gutC = Math.round(48 * kC);
    return { mw: mwC, x: W - gutC - mwC / 2, y: Math.round(H * .49) };
  }
  function prep(step, old) {
    var prac = $('.prac', step); if (!prac || !global.gsap) return null;
    stop(step);
    buildOnce(prac);
    var g = layout(prac);
    var k = step._subAt | 0;
    prac._k = k;
    var hand = !!(old && $('.crs', old)) && k === 0 && !g.narrow;
    prac._hand = hand;
    CARDS.forEach(function (c, i) { resetCard(prac, i); });
    settleDeck(prac);
    prac._copies.forEach(function (c) { c.classList.remove('go'); gsap.killTweensOf(c); gsap.set(c, { opacity: 0, y: 0 }); });
    paintCopy(prac, k); paintBeat(prac, k, null);
    gsap.set($$('.pz-bloom, .pz-floor, .pz-pool, .pz-refl', prac), { opacity: 0 });
    var lap = $('.pz-lap', prac), mac = $('.mac', prac), lid = $('.mac-lid', prac), base = $('.mac-base', prac), hinge = $('.mac-hinge', prac), msh = $('.mac-shadow', prac), chrome = $('.mac-chrome', prac), view = $('.mac-view', prac), off = $('.mac-off', prac);
    lap.classList.remove('pz-fold');
    gsap.set([lap, mac, lid], { clearProps: 'transform,opacity' });
    gsap.set(chrome, { clearProps: 'height,opacity,paddingTop,paddingBottom,borderBottomWidth' });
    var order = orderFor(k);
    if (hand) {
      // the laptop stands where Courses left it, already showing the practice page
      var L = coursesLap(g.W, g.H);
      lap.style.display = 'block'; lap.style.setProperty('--mw', L.mw + 'px');
      view.innerHTML = pageHtml(0);
      var vw = L.mw * (1 - .012 * 2 - .009 * 2);
      $('.pu', view).style.fontSize = (Math.round(vw / 62 * 10) / 10) + 'px';
      gsap.set(lap, { x: L.x, y: L.y, scale: 1, opacity: 1 });
      gsap.set(mac, { xPercent: -50, yPercent: -50, rotationY: -11 });
      gsap.set(lid, { rotationX: -8 }); gsap.set(off, { opacity: 0 });
      order.forEach(function (ci) { gsap.set(prac._cards[ci].el, { opacity: 0 }); });
    } else {
      lap.style.display = 'none';
      order.forEach(function (ci, j) { gsap.set(prac._cards[ci].el, j === 0 ? { opacity: 0, y: 70, z: -160 } : slot(prac, j, { opacity: 0, y: -j * g.oy + 70, z: -j * g.zd - 160 })); });
    }
    prac._h = { lap: lap, mac: mac, lid: lid, base: base, hinge: hinge, msh: msh, chrome: chrome, g: g };
    eyes(k);
    if (!prac._onResize) {
      /* The lifted piece is an overlay placed in pixels taken from the room
         as it was, so a room of a new width strands it. Put it back, re-lay
         the deck out, and raise the same beat again from the new geometry —
         the reader keeps the component they were looking at, and it is in
         the right place. */
      prac._onResize = function () {
        if (!prac._h) return;
        var beat = prac._lift && prac._lift.b;
        settleBeat(prac, true);
        prac._h.g = layout(prac);
        if (prac._tr || prac._intro) return;
        settleDeck(prac);
        if (beat) liftBeat(prac, beat);
      };
      addEventListener('resize', prac._onResize);
    }
    return prac._h;
  }

  function play(step) {
    var prac = $('.prac', step); if (!prac) return;
    var h = prac._h || prep(step); if (!h) return;
    var g = h.g, k = prac._k, order = orderFor(k), top = prac._cards[k];
    startAmbient(prac);
    var tl = prac._intro = gsap.timeline({ onComplete: function () { prac._intro = null; settleDeck(prac); beginBeats(prac); } });
    tl.to($$('.pz-bloom', prac), { opacity: 1, duration: 1.2, ease: 'power2.out', stagger: .08 }, 0);
    var t0 = 0;
    if (prac._hand) {
      var L = coursesLap(g.W, g.H), sc = g.mw / L.mw;
      // glide to the deck and face the viewer
      tl.to(h.lap, { x: g.deckX, y: g.deckY, duration: 1.05, ease: 'power2.inOut' }, 0)
        .to(h.mac, { rotationY: 0, duration: 1.05, ease: 'power2.inOut' }, 0)
        .to(h.lid, { rotationX: 0, duration: .95, ease: 'power2.inOut' }, 0)
        // the base folds up behind the lid, the hinge goes, the browser chrome collapses: a plain monitor
        .call(function () { h.lap.classList.add('pz-fold'); }, null, .2)
        .to(h.chrome, { height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0, borderBottomWidth: 0, duration: .45, ease: 'power2.in' }, .5)
        // the lid grows into the monitor while the monitor fades up underneath it
        .to(h.lap, { scale: sc, duration: .8, ease: 'power2.inOut' }, .6)
        .fromTo(top.el, { opacity: 0, scale: 1 / sc, y: 0, z: 0 }, { opacity: 1, scale: 1, duration: .8, ease: 'power2.inOut' }, .6)
        .to(h.lap, { opacity: 0, duration: .32, ease: 'power2.in' }, 1.05)
        .call(function () { h.lap.style.display = 'none'; gsap.set(top.el, { clearProps: 'transform' }); }, null, 1.4);
      t0 = 1.15;
    } else {
      tl.to(top.el, { opacity: 1, y: 0, z: 0, duration: .9, ease: 'power3.out' }, .05);
      t0 = .3;
    }
    // the deck builds behind the monitor
    order.slice(1).forEach(function (ci, j) {
      var c = prac._cards[ci];
      tl.to(c.el, slot(prac, j + 1, { duration: .9, ease: 'power3.out' }), t0 + .1 + j * .14);
    });
    tl.to($$('.pz-floor, .pz-pool, .pz-refl', prac), { opacity: 1, duration: .9, ease: 'power2.out' }, t0 + .1);
    tl.fromTo(prac._copies[k], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .6, ease: 'power3.out' }, t0 + .55);
    tl.call(function () { prac._copies[k].classList.add('go'); }, null, t0 + .6);
    tl.to({}, { duration: .5 }, t0 + 1.0);
  }

  function stop(step) {
    var prac = $('.prac', step); if (!prac || !prac._built) return;
    killBeats(prac);
    if (prac._tr) { prac._tr.kill(); prac._tr = null; }
    if (prac._intro) { prac._intro.kill(); prac._intro = null; }
    stopAmbient(prac);
    prac._cards.forEach(function (c) { gsap.killTweensOf([c.el, c.dim, c.off, c.page]); });
    if (prac._h) gsap.killTweensOf([prac._h.lap, prac._h.mac, prac._h.lid, prac._h.chrome, $('.pz-deck', prac)]);
    prac._copies.forEach(function (c) { gsap.killTweensOf(c); });
    eyesOff();
    prac._h = null;
  }

  global.Practise = { prep: prep, play: play, stop: stop, show: show, CARDS: CARDS };
})(window);
