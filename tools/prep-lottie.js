// Run from the project root:  node tools/prep-lottie.js
// Prepare the three supplied animations for the deck.
//  · inline raster assets as data URIs (the bundles flag them embedded while still
//    naming a file, which is why they never loaded)
//  · recolour onto Owl Coder's palette. Explicit maps, not guesswork: skin, hair and
//    neutrals are listed as keep, everything else is named.
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const ROOT = 'D:/ToriiMinds_Projects/OwlCoder_Profile/';
const SRC = ROOT + 'source/lottie-src/', OUT = ROOT + 'assets/lottie/';
fs.mkdirSync(OUT, { recursive: true });

const G = { deep: '#0B5D2C', green: '#15893F', mid: '#2FA45C', light: '#6FCB94', pale: '#BFE4CB', wash: '#E9F6EC', gold: '#F7B500', goldD: '#C48A00', ink: '#121A15' };

// hex -> hex. Anything not listed is left exactly as the artist drew it.
const MAP = {
  lta: {   // man at a floating screen. The blues, the browns and the cream screen move;
           // skin, hair and his trousers are left as the artist drew them.
    '#455afb': G.green, '#3645ee': G.deep, '#ff7500': G.gold, '#8a5e01': G.goldD, '#402707': G.ink,
    '#007e7a': G.deep, '#339895': G.mid, '#003f3d': G.ink,
    // the slab behind him and the cube: muddy brown in the artwork, our gold here
    '#7d4400': G.goldD, '#997234': '#D9A42E', '#402800': G.ink,
    '#7d4c00': G.goldD, '#997f34': '#D9A42E', '#402400': G.ink,
    '#997034': '#D9A42E', '#402600': G.ink,
    // the big screen reads salmon-cream; it becomes the palest end of our green
    '#f6dbd8': '#E4F2E8', '#fae7dd': '#EFF8F1', '#fff2e1': '#F7FBF8',
    '#e8dfd1': '#E4EFE7', '#e8e1d1': '#E4EFE7', '#ede6dd': '#EDF5EF', '#f0eee9': '#F2F8F4',
    '#f7ada2': G.pale
  },
  ltb: {   // man at a laptop with chat bubbles. All the blues become our greens.
    '#00a1ee': G.green, '#29a0ff': G.mid, '#29c3ff': G.light, '#42aaff': G.mid,
    '#3150bc': G.deep, '#274096': G.deep, '#192961': G.ink, '#2e3192': G.deep,
    '#0000c7': G.deep, '#690059': G.deep, '#70b2dd': G.light, '#abdaf7': G.pale,
    '#e4ebf7': G.wash, '#263238': G.ink,
    '#296fff': G.mid, '#2987ff': G.light, '#e5f2ff': G.wash, '#edf4fa': G.wash, '#33c88e': G.light,
    '#6956ab': G.mid, '#867fc0': G.light, '#a4a8d5': G.pale, '#3997de': G.mid, '#3574cd': G.green,
    '#f5f5f5': '#F2F8F4'
  },
  ltc: { '#f00505': G.gold }  // colour lives in its raster layers; only a stray red marker is vector
};

function hex(c) { return '#' + c.slice(0, 3).map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join(''); }
function toArr(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }

// ── the white plate ──────────────────────────────────────────────────
// Each of these animations ships with its own opaque background: a white
// solid layer in one, a canvas-sized flat PNG in another. On the page that
// reads as a pasted rectangle, so it is dropped and the artwork floats on
// our own background instead.
function flatWhite(file) {
  try {
    const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', 'scale=24:24', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], { maxBuffer: 1 << 22 });
    let pale = 0, n = 0;
    for (let i = 0; i < raw.length; i += 4) { n++; if (raw[i + 3] > 200 && raw[i] > 228 && raw[i + 1] > 228 && raw[i + 2] > 228) pale++; }
    return n && pale / n > .94;
  } catch (e) { return false; }
}
function stripPlates(j, dir) {
  let gone = 0;
  const assets = j.assets || [];
  const plateIds = new Set();
  assets.forEach(a => {
    if (!a.p || !a.w || !a.h) return;
    if (a.w < j.w * .92 || a.h < j.h * .92) return;             // only canvas-sized ones
    const img = fs.existsSync(dir + 'images/' + a.p) ? dir + 'images/' + a.p : null;
    if (img && flatWhite(img)) plateIds.add(a.id);
  });
  function sweep(layers) {
    if (!Array.isArray(layers)) return layers;
    return layers.filter(L => {
      if (L.ty === 1 && L.sc && /^#(f|e)/i.test(L.sc) && L.sw >= j.w * .92 && L.sh >= j.h * .92) { gone++; return false; }
      if (L.ty === 2 && plateIds.has(L.refId)) { gone++; return false; }
      return true;
    });
  }
  j.layers = sweep(j.layers);
  assets.forEach(a => { if (a.layers) a.layers = sweep(a.layers); });
  // an asset nobody references any more does not need inlining
  const used = new Set();
  const note = ls => (ls || []).forEach(L => { if (L.refId) used.add(L.refId); });
  note(j.layers); assets.forEach(a => note(a.layers));
  j.assets = assets.filter(a => !a.layers ? used.has(a.id) : true);
  return gone;
}

function recolourWith(node, map) {
  let n = 0, unseen = new Map();
  // anything blue or purple that the explicit map did not name is rotated onto our
  // green, keeping its lightness. Skin, hair and warm neutrals never match this.
  function auto(c) {
    const mx = Math.max(c[0],c[1],c[2]), mn = Math.min(c[0],c[1],c[2]);
    if (mx - mn < .07) return null;
    let h2;
    if (mx === c[0]) h2 = ((c[1]-c[2])/(mx-mn) + 6) % 6; else if (mx === c[1]) h2 = (c[2]-c[0])/(mx-mn) + 2; else h2 = (c[0]-c[1])/(mx-mn) + 4;
    const deg = h2 * 60;
    if (deg < 195 || deg > 320) return null;
    const l = (mx + mn) / 2, sat = (mx - mn) / (1 - Math.abs(2*l - 1) || 1);
    const tgt = toArr(l > .72 ? G.wash : l > .5 ? G.light : l > .3 ? G.mid : G.deep);
    return [tgt[0]*(1-sat*0)+0, tgt[1], tgt[2]].map((v,i)=>tgt[i]);
  }
  const sub = c => { const h = hex(c); if (map[h]) { n++; return toArr(map[h]); }
    const a2 = auto(c); if (a2) { n++; return a2; }
    unseen.set(h, (unseen.get(h) || 0) + 1); return null; };
  (function walk(o) {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o)) { o.forEach(walk); return; }
    if ((o.ty === 'fl' || o.ty === 'st') && o.c && Array.isArray(o.c.k) && typeof o.c.k[0] === 'number') {
      const next = sub(o.c.k); if (next) o.c.k = next.concat(o.c.k.length > 3 ? [o.c.k[3]] : []);
    }
    if (o.ty === 'gf' || o.ty === 'gs') {
      const g = o.g && o.g.k && o.g.k.k;
      if (Array.isArray(g) && typeof g[0] === 'number')
        for (let i = 0; i + 3 < g.length; i += 4) {
          const next = sub([g[i + 1], g[i + 2], g[i + 3]]);
          if (next) { g[i + 1] = next[0]; g[i + 2] = next[1]; g[i + 3] = next[2]; }
        }
    }
    Object.values(o).forEach(walk);
  })(node);
  return { n, unseen };
}

['lta', 'ltb', 'ltc'].forEach(key => {
  const file = SRC + key + '/anim.json';
  if (!fs.existsSync(file)) { console.log(key + ': missing'); return; }
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  delete j.bg;
  const dropped = stripPlates(j, SRC + key + '/');
  let inlined = 0;
  (j.assets || []).forEach(a => {
    if (!a.p || /^data:/.test(a.p)) return;
    var greened = SRC + key + '/images-green/' + a.p;
    const img = fs.existsSync(greened) ? greened : SRC + key + '/images/' + a.p;
    if (!fs.existsSync(img)) return;
    const ext = path.extname(a.p).slice(1).toLowerCase();
    a.u = ''; a.e = 1;
    a.p = 'data:image/' + (ext === 'jpg' ? 'jpeg' : ext) + ';base64,' + fs.readFileSync(img).toString('base64');
    inlined++;
  });
  const { n, unseen } = recolourWith(j, MAP[key] || {});
  fs.writeFileSync(OUT + key + '.json', JSON.stringify(j));
  const kb = (fs.statSync(OUT + key + '.json').size / 1024) | 0;
  console.log(`${key}: ${j.w}x${j.h} ${((j.op - j.ip) / (j.fr || 30)).toFixed(1)}s — ${dropped} plate(s) dropped, ${inlined} images inlined, ${n} fills recoloured — ${kb} KB`);
  const left = [...unseen.entries()].sort((a, b) => b[1] - a[1]).slice(0, 18).map(e => e[0]).join(' ');
  if (left) console.log('    left as drawn: ' + left);
});
