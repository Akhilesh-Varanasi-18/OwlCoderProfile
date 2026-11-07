// The dangerous case only: a rule whose selector is a BARE single class (no ancestor to
// scope it), where the same class is also styled by an earlier stylesheet. Those silently
// restyle another scene.
const fs = require('fs');
const DIR = require('path').join(__dirname, '..', 'assets', 'css') + require('path').sep;
// The load order is taken from index.html, never hard-coded: a list kept by
// hand goes stale the moment a module is added, and the stylesheet it misses
// is exactly the one most likely to be colliding.
// The load order is read from index.html, never hard-coded: a list kept by
// hand goes stale the moment a module is added, and the stylesheet it misses
// is exactly the one most likely to be colliding.
const HTML = fs.readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
const ORDER = [];
HTML.replace(/<link[^>]+href="assets[/]css[/]([-\w.]+[.]css)"/g, function (m, f) {
  if (!ORDER.includes(f)) ORDER.push(f);
  return m;
});
if (!ORDER.length) throw new Error('no stylesheets found in index.html');
const bare = new Map();   // class -> [files declaring it bare]
const any = new Map();    // class -> [files mentioning it at all]
ORDER.forEach(f => {
  const css = fs.readFileSync(DIR + f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  css.replace(/(^|\})([^{}]+)\{/g, (m, _b, selList) => {
    if (/^\s*@/.test(selList)) return m;
    selList.split(',').forEach(sel => {
      sel = sel.trim();
      sel.replace(/\.(-?[A-Za-z_][\w-]*)/g, (mm, n) => { if (!any.has(n)) any.set(n, []); if (!any.get(n).includes(f)) any.get(n).push(f); return mm; });
      // bare: the whole selector is one class, optionally with pseudo-elements/states
      const mm = sel.match(/^\.(-?[A-Za-z_][\w-]*)((:+[\w-()]+)|(\[[^\]]*\]))*$/);
      if (mm) { const n = mm[1]; if (!bare.has(n)) bare.set(n, []); if (!bare.get(n).includes(f)) bare.get(n).push(f); }
    });
    return m;
  });
});
const risky = [...bare.entries()]
  .filter(([n, files]) => (any.get(n) || []).length > 1)
  .map(([n, files]) => ({ n, bareIn: files, allIn: any.get(n) }))
  .filter(r => r.allIn.length > 1)
  .sort((a, b) => a.n.localeCompare(b.n));
// The hard case first: the same bare class declared in two stylesheets. The
// later one wins, silently, and the earlier module is restyled wherever it
// uses that name.
const clashes = [...bare.entries()].filter(function (e) { return e[1].length > 1; });
if (clashes.length) {
  console.log('COLLISION - the same bare class is declared in more than one stylesheet:');
  clashes.forEach(function (e) { console.log('  .' + e[0].padEnd(14) + e[1].join('  <-  ') + '   (the last one wins)'); });
  console.log('');
}
console.log('reading ' + ORDER.length + ' stylesheets: ' + ORDER.join(' '));
console.log('');
console.log('bare single-class rules whose class another stylesheet also styles:\n');
risky.forEach(r => {
  const later = r.bareIn[r.bareIn.length - 1];
  const others = r.allIn.filter(f => f !== later);
  console.log('  .' + r.n.padEnd(14) + 'bare in: ' + r.bareIn.join(', ').padEnd(26) + ' also used by: ' + others.join(', '));
});
console.log('\ntotal: ' + risky.length + ' shared, ' + clashes.length + ' hard collisions');
