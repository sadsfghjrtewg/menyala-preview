// Узор «как у подарков»: кольца символов вокруг маскота.
// Чётные кольца — монета, нечётные — рубль. flip() разворачивает их местами.

const NS = 'http://www.w3.org/2000/svg';
const gsap = window.gsap;

const RINGS = [
  { r: 96,  s: 15, gap: 46 },
  { r: 128, s: 16, gap: 44 },
  { r: 162, s: 17, gap: 44 },
  { r: 198, s: 18, gap: 46 },
  { r: 236, s: 19, gap: 48 },
  { r: 276, s: 19, gap: 50 },
];

const rnd = (i, k) => {
  const x = Math.sin(i * 78.233 + k * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const make = (tag, attrs) => {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
};

export function createPattern(svg, { cx = 200, cy = 122, rings = RINGS, spin = 260 } = {}) {
  const root = make('g', {});
  svg.appendChild(root);
  let items = [];
  let a = 'g-usdt', b = 'g-rub', flipped = false;

  const glyphFor = (ring) => ((ring % 2 === 1) !== flipped ? b : a);

  function build() {
    root.replaceChildren();
    items = [];
    rings.forEach((rg, i) => {
      const n = Math.max(6, Math.round((2 * Math.PI * rg.r) / rg.gap));
      const off = (i % 2 ? 0.5 : 0) * ((2 * Math.PI) / n);
      for (let k = 0; k < n; k++) {
        const t = off + (k * 2 * Math.PI) / n;
        const x = cx + Math.cos(t) * rg.r;
        const y = cy + Math.sin(t) * rg.r;
        const tilt = (rnd(i, k) - 0.5) * 22;
        const g = make('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${tilt.toFixed(1)})` });
        const inner = make('g', { opacity: (1 - i * 0.12).toFixed(2) });
        const u = make('use', { href: '#' + glyphFor(i), x: -rg.s / 2, y: -rg.s / 2, width: rg.s, height: rg.s });
        inner.appendChild(u);
        g.appendChild(inner);
        root.appendChild(g);
        items.push({ inner, u, i });
      }
    });
  }

  function set(glyphA, glyphB = 'g-rub', animate = true) {
    const doBuild = () => {
      a = glyphA; b = glyphB;
      build();
      if (animate) {
        gsap.from(items.map((it) => it.inner), {
          scale: 0, transformOrigin: '50% 50%',
          duration: 0.5, ease: 'back.out(2.2)',
          stagger: (idx) => items[idx].i * 0.05 + rnd(idx, 3) * 0.06,
        });
      }
    };
    if (animate && items.length) {
      gsap.to(items.map((it) => it.inner), {
        scale: 0, transformOrigin: '50% 50%', duration: 0.18, ease: 'power2.in',
        stagger: { each: 0.002, from: 'random' },
        onComplete: doBuild,
      });
    } else doBuild();
  }

  function flip() {
    flipped = !flipped;
    items.forEach((it, idx) => {
      gsap.to(it.inner, {
        scaleX: 0, transformOrigin: '50% 50%',
        duration: 0.14, ease: 'power1.in',
        delay: it.i * 0.055 + rnd(idx, 7) * 0.05,
        onComplete() {
          it.u.setAttribute('href', '#' + glyphFor(it.i));
          gsap.to(it.inner, { scaleX: 1, duration: 0.32, ease: 'back.out(3)' });
        },
      });
    });
  }

  if (spin) gsap.to(root, { rotation: 360, svgOrigin: `${cx} ${cy}`, duration: spin, repeat: -1, ease: 'none' });

  return { set, flip, get flipped() { return flipped; } };
}

// статичный мини-узор для плиток выбора монеты
export function miniPattern(glyph) {
  let s = '';
  const ring = (r, n, size, off, op) => {
    for (let k = 0; k < n; k++) {
      const t = off + (k * 2 * Math.PI) / n;
      const x = 50 + Math.cos(t) * r, y = 43 + Math.sin(t) * r;
      s += `<use href="#${glyph}" x="${(x - size / 2).toFixed(1)}" y="${(y - size / 2).toFixed(1)}" width="${size}" height="${size}" opacity="${op}"/>`;
    }
  };
  ring(34, 8, 9, 0, 1);
  ring(52, 12, 10, Math.PI / 12, 0.7);
  return `<svg class="tile-pat" viewBox="0 0 100 86" preserveAspectRatio="xMidYMid slice">${s}</svg>`;
}
