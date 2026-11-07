// Run from the project root:  node tools/recolour-raster.js   (then tools/prep-lottie.js)
// Recolour the raster layers of the third animation, pixel by pixel.
// A flat hue rotation cannot work here: it takes the blues to green but drags the
// pink skin to purple with them. So only pixels whose hue sits in the blue/violet
// band are moved, and they are folded into our green band. Everything warm is left
// exactly as it was. Alpha is carried through untouched.
const fs = require('fs'), { execFileSync } = require('child_process');
const BASE = 'D:/ToriiMinds_Projects/OwlCoder_Profile/source/lottie-src/ltc/';
const SRC = BASE + 'images/', DST = BASE + 'images-green/';
fs.rmSync(DST, { recursive: true, force: true });
fs.mkdirSync(DST, { recursive: true });

const IN_LO = 170, IN_HI = 305;     // the blue / violet band in the artwork
const OUT_LO = 118, OUT_HI = 162;   // our green band

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) h = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, mx ? d / mx : 0, mx];
}
function hsvToRgb(h, s, v) {
  const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; } else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

const files = fs.readdirSync(SRC).filter(f => /\.png$/i.test(f));
let moved = 0;
files.forEach(f => {
  const probe = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', SRC + f], { encoding: 'utf8' }).trim();
  const [w, h] = probe.split(',').map(Number);
  if (!w || !h) { fs.copyFileSync(SRC + f, DST + f); return; }
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', SRC + f, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], { maxBuffer: 1 << 28 });
  let touched = 0;
  for (let i = 0; i < raw.length; i += 4) {
    if (!raw[i + 3]) continue;
    const [hu, sa, va] = rgbToHsv(raw[i], raw[i + 1], raw[i + 2]);
    if (sa < .12) continue;                                      // greys stay
    var nh = null, ns = sa, nv = va;
    if (hu >= IN_LO && hu <= IN_HI) {
      nh = OUT_LO + ((hu - IN_LO) / (IN_HI - IN_LO)) * (OUT_HI - OUT_LO);
      // the dark navy in this artwork is hair, outlines and shadow, not clothing.
      // Taken straight across it comes back as vivid green hair, so anything this
      // dark is folded down to a near-black green instead.
      if (va < .52) { ns = Math.min(sa, .48); nv = va * .44; }
    } else if (hu >= 312) {
      // the magenta in this one is the monitor's wallpaper and a few props. Sent to
      // gold it read as a sunset, so it is folded into the pale end of our green.
      nh = 126 + ((hu - 312) / 48) * 22; ns = sa * .72;
    }
    if (nh === null) continue;                                   // skin and warm tones stay
    const [r2, g2, b2] = hsvToRgb(nh, ns, nv);
    raw[i] = r2; raw[i + 1] = g2; raw[i + 2] = b2; touched++;
  }
  if (touched) moved++;
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', w + 'x' + h, '-i', 'pipe:0', DST + f], { input: raw });
});
console.log(`per-pixel recolour: ${files.length} layers, ${moved} had blue to move`);
