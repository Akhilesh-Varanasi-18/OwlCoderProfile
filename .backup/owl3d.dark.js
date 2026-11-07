/* ══════════════════════════════════════════════════════════════════
   OWL CODER — the 3D owl
   A procedural low-poly owl. No model file: every piece is built from
   primitives with flat shading, so it loads instantly and stays sharp
   at any size. The owl flies down the page as the reader scrolls.
   ══════════════════════════════════════════════════════════════════ */
import * as THREE from 'three';

const canvas = document.getElementById('owl-canvas');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas, antialias: true, alpha: true, powerPreference: 'high-performance'
  });
} catch (e) {
  window.OWL = { setPath() {}, ready: false };
  throw e;
}

renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
renderer.setSize(innerWidth, innerHeight, false);
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0, 14);

/* ── palette ─────────────────────────────────────────────────────── */
const C = {
  feather: 0x27362e,
  belly:   0x3b5045,
  face:    0x30423a,
  glow:    0x2fd16c,
  gold:    0xf7b500,
  dark:    0x0b100d
};

/* ── lights ──────────────────────────────────────────────────────────
   A dim ambient, a cool key from the upper right, and a hard green rim
   from behind. The rim is what makes the silhouette read on a near-black
   page; without it the owl disappears into the stage. */
scene.add(new THREE.AmbientLight(0x5c7f6b, 0.82));

const key = new THREE.DirectionalLight(0xdfffe9, 1.9);
key.position.set(4, 5, 6);
scene.add(key);

const rim = new THREE.DirectionalLight(C.glow, 3.4);
rim.position.set(-5, 2, -4);
scene.add(rim);

const fill = new THREE.DirectionalLight(C.gold, 0.5);
fill.position.set(3, -4, 2);
scene.add(fill);

/* ── materials (shared, so every mesh is cheap) ──────────────────── */
const mFeather = new THREE.MeshStandardMaterial({ color: C.feather, roughness: 0.82, metalness: 0.06, flatShading: true });
const mBelly   = new THREE.MeshStandardMaterial({ color: C.belly,   roughness: 0.88, metalness: 0.02, flatShading: true });
const mFace    = new THREE.MeshStandardMaterial({ color: C.face,    roughness: 0.9,  metalness: 0.02, flatShading: true });
const mGold    = new THREE.MeshStandardMaterial({ color: C.gold,    roughness: 0.38, metalness: 0.45, flatShading: true });
const mEyeBall = new THREE.MeshStandardMaterial({ color: 0xf2f7f3,  roughness: 0.35 });
const mIris    = new THREE.MeshStandardMaterial({ color: C.glow, emissive: C.glow, emissiveIntensity: 2.4, roughness: 0.4 });
const mPupil   = new THREE.MeshStandardMaterial({ color: C.dark, roughness: 0.5 });

/* ── the owl ─────────────────────────────────────────────────────── */
const owl = new THREE.Group();
const body = new THREE.Group();      // bobs
const head = new THREE.Group();      // turns
owl.add(body);

// torso
const torso = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), mFeather);
torso.scale.set(0.92, 1.12, 0.82);
body.add(torso);

// belly plate
const belly = new THREE.Mesh(new THREE.IcosahedronGeometry(0.78, 1), mBelly);
belly.scale.set(0.82, 1.0, 0.55);
belly.position.set(0, -0.12, 0.42);
body.add(belly);

// tail
const tail = new THREE.Mesh(new THREE.ConeGeometry(0.44, 0.8, 4), mFeather);
tail.rotation.set(Math.PI * 0.82, Math.PI * 0.25, 0);
tail.position.set(0, -1.02, -0.36);
tail.scale.set(1, 1, 0.38);
body.add(tail);

// head
head.position.set(0, 0.92, 0.06);
body.add(head);

const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(0.78, 1), mFeather);
skull.scale.set(1.06, 0.92, 0.94);
head.add(skull);

// facial disc
const disc = new THREE.Mesh(new THREE.SphereGeometry(0.66, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.52), mFace);
disc.rotation.x = Math.PI * 0.5;
disc.position.set(0, -0.02, 0.36);
disc.scale.set(1.04, 0.72, 1.0);
head.add(disc);

// ear tufts
[-1, 1].forEach(s => {
  const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.5, 4), mFeather);
  tuft.position.set(0.44 * s, 0.62, -0.04);
  tuft.rotation.set(-0.2, 0, -0.42 * s);
  head.add(tuft);
});

// eyes
const eyes = [];
[-1, 1].forEach(s => {
  const g = new THREE.Group();
  g.position.set(0.3 * s, 0.04, 0.52);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.045, 6, 18), mGold);
  ring.position.z = 0.055;
  g.add(ring);

  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.235, 16, 12), mEyeBall);
  g.add(ball);

  const iris = new THREE.Mesh(new THREE.SphereGeometry(0.155, 14, 10), mIris);
  iris.position.z = 0.115;
  g.add(iris);

  const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), mPupil);
  pupil.position.z = 0.21;
  g.add(pupil);

  head.add(g);
  eyes.push(g);
});

// beak
const beak = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 4), mGold);
beak.position.set(0, -0.3, 0.58);
beak.rotation.set(Math.PI * 0.5, Math.PI * 0.25, 0);
head.add(beak);

// wings
const wings = [];
[-1, 1].forEach(s => {
  const pivot = new THREE.Group();
  pivot.position.set(0.6 * s, 0.26, -0.06);
  pivot.rotation.z = 0.34 * s;          // folded, not spread

  const blade = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.26, 5), mFeather);
  blade.position.set(0.42 * s, -0.46, -0.04);
  blade.rotation.set(0.3, 0, Math.PI * 0.5 * s + 0.72 * s);
  blade.scale.set(1, 1, 0.46);
  pivot.add(blade);

  const cov = new THREE.Mesh(new THREE.ConeGeometry(0.31, 0.72, 5), mBelly);
  cov.position.set(0.2 * s, -0.1, 0.1);
  cov.rotation.set(0.22, 0, Math.PI * 0.5 * s + 0.5 * s);
  cov.scale.set(1, 1, 0.4);
  pivot.add(cov);

  body.add(pivot);
  wings.push(pivot);
});

// talons
[-1, 1].forEach(s => {
  const foot = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.32, 4), mGold);
  foot.position.set(0.26 * s, -1.02, 0.22);
  foot.rotation.x = Math.PI;
  body.add(foot);
});

scene.add(owl);

/* ── drifting motes ──────────────────────────────────────────────────
   Soft points behind the owl. They read as night air rather than as a
   particle effect, which is the point: atmosphere, not decoration. */
const MOTES = reduced ? 0 : 320;
let motes = null;
if (MOTES) {
  const pos = new Float32Array(MOTES * 3);
  const spd = new Float32Array(MOTES);
  for (let i = 0; i < MOTES; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 26;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 12 - 4;
    spd[i] = 0.12 + Math.random() * 0.35;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  // a soft round sprite, drawn once into a canvas
  const cv = document.createElement('canvas');
  cv.width = cv.height = 64;
  const cx = cv.getContext('2d');
  const grd = cx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.35, 'rgba(160,255,200,0.55)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  cx.fillStyle = grd;
  cx.fillRect(0, 0, 64, 64);

  const tex = new THREE.CanvasTexture(cv);
  motes = new THREE.Points(g, new THREE.PointsMaterial({
    size: 0.1, map: tex, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, opacity: 0.65, color: 0x9effc8
  }));
  motes.userData = { spd };
  scene.add(motes);
}

/* ── flight path ─────────────────────────────────────────────────────
   Waypoints keyed to progress through the whole document. The owl is
   lerped toward whatever the path says, never snapped, so a fast scroll
   reads as a fast flight rather than a jump cut. */
const PATH = [
  { p: 0.00, x:  4.60, y:  2.58, z:  1.4, s: 0.60, ry: -0.34 },
  { p: 0.09, x:  5.30, y:  2.35, z:  0.0, s: 0.52, ry: -0.34 },
  { p: 0.19, x: -5.90, y:  2.55, z: -1.2, s: 0.46, ry:  0.40 },
  { p: 0.31, x:  5.60, y:  2.45, z:  0.6, s: 0.40, ry: -0.48 },
  { p: 0.45, x: -5.60, y:  2.45, z:  0.6, s: 0.40, ry:  0.48 },
  { p: 0.57, x:  5.60, y:  2.45, z:  0.4, s: 0.40, ry: -0.42 },
  { p: 0.69, x: -5.60, y:  2.45, z:  0.4, s: 0.40, ry:  0.44 },
  { p: 0.79, x:  5.60, y:  2.45, z:  0.6, s: 0.40, ry: -0.46 },
  { p: 0.86, x: -5.50, y:  2.60, z: -0.6, s: 0.44, ry:  0.42 },
  { p: 0.93, x:  5.30, y:  1.60, z: -0.4, s: 0.50, ry: -0.40 },
  { p: 1.00, x:  4.80, y:  1.25, z:  1.2, s: 0.72, ry: -0.26 }
];

const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function sample(p) {
  p = Math.max(0, Math.min(1, p));
  let a = PATH[0], b = PATH[PATH.length - 1];
  for (let i = 0; i < PATH.length - 1; i++) {
    if (p >= PATH[i].p && p <= PATH[i + 1].p) { a = PATH[i]; b = PATH[i + 1]; break; }
  }
  const span = b.p - a.p;
  const t = ease(span <= 0 ? 0 : (p - a.p) / span);
  return {
    x:  a.x  + (b.x  - a.x)  * t,
    y:  a.y  + (b.y  - a.y)  * t,
    z:  a.z  + (b.z  - a.z)  * t,
    s:  a.s  + (b.s  - a.s)  * t,
    ry: a.ry + (b.ry - a.ry) * t
  };
}

/* ── state ───────────────────────────────────────────────────────── */
const st = {
  p: 0,                                   // target page progress
  cur: { x: 4.9, y: 1.3, z: 2.6, s: 1, ry: -0.38 },
  lastX: 4.9,
  vis: true,
  pointer: { x: 0, y: 0 }
};

window.OWL = {
  ready: true,
  setPath(p) { st.p = p; }
};

addEventListener('pointermove', e => {
  st.pointer.x = (e.clientX / innerWidth - 0.5) * 2;
  st.pointer.y = (e.clientY / innerHeight - 0.5) * 2;
}, { passive: true });

document.addEventListener('visibilitychange', () => { st.vis = !document.hidden; });

function resize() {
  const w = innerWidth, h = innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.setSize(w, h, false);
}
addEventListener('resize', resize);
resize();

/* ── loop ────────────────────────────────────────────────────────── */
const clock = new THREE.Clock();
let elapsed = 0;
let blinkAt = 2.5;

function frame() {
  requestAnimationFrame(frame);
  if (!st.vis) return;

  // one read per frame: getElapsedTime() would eat the delta
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;
  const t = elapsed;
  const want = sample(st.p);

  // lerp toward the path — this is what makes the flight feel weighted
  const k = reduced ? 1 : 1 - Math.pow(0.0015, dt);
  st.cur.x  += (want.x  - st.cur.x)  * k;
  st.cur.y  += (want.y  - st.cur.y)  * k;
  st.cur.z  += (want.z  - st.cur.z)  * k;
  st.cur.s  += (want.s  - st.cur.s)  * k;
  st.cur.ry += (want.ry - st.cur.ry) * k;

  // horizontal speed banks the owl into its turn
  const vx = st.cur.x - st.lastX;
  st.lastX = st.cur.x;

  owl.position.set(st.cur.x, st.cur.y + Math.sin(t * 1.15) * 0.14, st.cur.z);
  owl.scale.setScalar(st.cur.s);
  owl.rotation.y = st.cur.ry + st.pointer.x * 0.12;
  owl.rotation.z = -vx * 2.4;
  owl.rotation.x = Math.sin(t * 0.9) * 0.035 - st.pointer.y * 0.05;

  if (!reduced) {
    // wings: a slow hover flap that speeds up while travelling
    const travel = Math.min(Math.abs(vx) * 26, 1);
    const flap = Math.sin(t * (2.6 + travel * 7)) * (0.22 + travel * 0.66);
    wings[0].rotation.z =  0.34 + flap;
    wings[1].rotation.z = -0.34 - flap;
    wings[0].rotation.x = flap * 0.3;
    wings[1].rotation.x = flap * 0.3;

    // the head leads the turn, then settles
    head.rotation.y = -vx * 3.2 + st.pointer.x * 0.26 + Math.sin(t * 0.42) * 0.1;
    head.rotation.z = Math.sin(t * 0.33) * 0.05;

    // blink
    if (t > blinkAt) {
      const e = (t - blinkAt) / 0.14;
      const sq = e < 1 ? 1 - Math.sin(e * Math.PI) * 0.92 : 1;
      eyes[0].scale.y = eyes[1].scale.y = sq;
      if (e >= 1) blinkAt = t + 2.4 + Math.random() * 3.4;
    }

    if (motes) {
      const arr = motes.geometry.attributes.position.array;
      const spd = motes.userData.spd;
      for (let i = 0; i < MOTES; i++) {
        arr[i * 3 + 1] += spd[i] * dt * 0.5;
        if (arr[i * 3 + 1] > 8) arr[i * 3 + 1] = -8;
      }
      motes.geometry.attributes.position.needsUpdate = true;
      motes.rotation.y = t * 0.012;
    }
  }

  renderer.render(scene, camera);
}
frame();

document.dispatchEvent(new CustomEvent('owl:ready'));
