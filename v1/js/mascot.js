// МЕНЯЛА — стальной сейф-циклоп.
// Глаз = кодовый диск, бровь = два стальных бруска, рот = купюроприёмник, золотой зуб.
// Всё на SVG + GSAP, без внешних ассетов.

const gsap = window.gsap;
let uid = 0;

const MOODS = {
  tough: { l: 10,  r: -10, y: 0,  lid: 0.27, low: 0 },
  calm:  { l: 4,   r: -4,  y: 0,  lid: 0.14, low: 0 },
  wow:   { l: -10, r: 10,  y: -7, lid: 0,    low: 0 },
  happy: { l: -7,  r: 7,   y: -4, lid: 0.05, low: 0.42 },
  angry: { l: 21,  r: -21, y: 3,  lid: 0.38, low: 0.1 },
  focus: { l: 15,  r: -15, y: 2,  lid: 0.44, low: 0.14 },
  closed:{ l: 3,   r: -3,  y: 3,  lid: 1,    low: 0 },
};

const EYE = { x: 100, y: 94, r: 31 };

function ticks() {
  let s = '';
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const major = i % 6 === 0;
    const r1 = major ? 22.5 : 25, r2 = 28.5;
    const p = (r) => [(EYE.x + Math.sin(a) * r).toFixed(2), (EYE.y - Math.cos(a) * r).toFixed(2)];
    const [x1, y1] = p(r1), [x2, y2] = p(r2);
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${major ? '#F2B94B' : '#56617A'}" stroke-width="${major ? 2.4 : 1.4}" stroke-linecap="round"/>`;
  }
  return s;
}

function tpl(id) {
  return `
<svg viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Меняла">
  <defs>
    <linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#E3E8F0"/><stop offset=".42" stop-color="#A9B3C6"/><stop offset="1" stop-color="#535E75"/>
    </linearGradient>
    <linearGradient id="${id}d" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#C3CBD9"/><stop offset="1" stop-color="#7C879C"/>
    </linearGradient>
    <linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#B5BED0"/><stop offset="1" stop-color="#8994AA"/>
    </linearGradient>
    <radialGradient id="${id}k" cx=".36" cy=".3" r=".85">
      <stop offset="0" stop-color="#F7F9FC"/><stop offset=".45" stop-color="#B3BCCD"/><stop offset="1" stop-color="#555F75"/>
    </radialGradient>
    <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFEBAE"/><stop offset=".5" stop-color="#F2B94B"/><stop offset="1" stop-color="#A86C14"/>
    </linearGradient>
    <linearGradient id="${id}m" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#07090F"/><stop offset="1" stop-color="#1D2333"/>
    </linearGradient>
    <clipPath id="${id}ce"><circle cx="${EYE.x}" cy="${EYE.y}" r="${EYE.r - 1}"/></clipPath>
    <clipPath id="${id}cb"><rect x="56" y="143" width="88" height="60"/></clipPath>
    <clipPath id="${id}cc"><rect x="60" y="-60" width="80" height="88"/></clipPath>
  </defs>

  <g class="m-shadow-f"><ellipse class="m-shadow" cx="100" cy="199" rx="56" ry="7" fill="#000" opacity=".32"/></g>

  <g class="m-float"><g class="m-rig">
    <!-- coin dropping into the head slot -->
    <g clip-path="url(#${id}cc)">
      <g class="m-coin" opacity="0">
        <ellipse cx="100" cy="8" rx="9" ry="9" fill="url(#${id}g)" stroke="#9A6512" stroke-width="1.2"/>
        <path d="M100 3.5v9M97.2 5.6h4.2a1.8 1.8 0 0 1 0 3.6h-3.2" fill="none" stroke="#9A6512" stroke-width="1.4" stroke-linecap="round"/>
      </g>
    </g>

    <!-- feet -->
    <rect x="57" y="170" width="26" height="21" rx="8" fill="#2E3648"/>
    <rect x="117" y="170" width="26" height="21" rx="8" fill="#2E3648"/>
    <rect x="60" y="172" width="20" height="4" rx="2" fill="#fff" opacity=".08"/>
    <rect x="120" y="172" width="20" height="4" rx="2" fill="#fff" opacity=".08"/>

    <!-- hinges -->
    <rect x="18" y="62" width="12" height="26" rx="5" fill="#3B4458"/>
    <rect x="18" y="122" width="12" height="26" rx="5" fill="#3B4458"/>

    <!-- body -->
    <rect x="26" y="30" width="148" height="150" rx="38" fill="url(#${id}b)"/>
    <rect x="26.75" y="30.75" width="146.5" height="148.5" rx="37.3" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="1.5"/>

    <!-- head slot -->
    <rect x="77" y="22" width="46" height="13" rx="6.5" fill="#4C566B"/>
    <rect x="83" y="25.5" width="34" height="6" rx="3" fill="#121624"/>

    <!-- door -->
    <rect x="40" y="44" width="120" height="122" rx="28" fill="url(#${id}d)"/>
    <rect x="40.75" y="44.75" width="118.5" height="120.5" rx="27.3" fill="none" stroke="#1E2536" stroke-opacity=".28" stroke-width="1.5"/>
    <rect x="42" y="46" width="116" height="118" rx="26" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width="1"/>

    <!-- rivets -->
    <g fill="url(#${id}k)" stroke="#3E475C" stroke-width=".8">
      <circle cx="54" cy="58" r="3.4"/><circle cx="146" cy="58" r="3.4"/>
      <circle cx="54" cy="152" r="3.4"/><circle cx="146" cy="152" r="3.4"/>
    </g>

    <!-- brow -->
    <g class="m-brow">
      <rect class="m-brow-l" x="61" y="49" width="42" height="10.5" rx="5.25" fill="#1F2636"/>
      <rect class="m-brow-r" x="97" y="49" width="42" height="10.5" rx="5.25" fill="#1F2636"/>
    </g>

    <!-- eye / dial -->
    <g class="m-eye">
      <circle cx="${EYE.x}" cy="${EYE.y}" r="${EYE.r}" fill="#181D2B"/>
      ${ticks()}
      <g class="m-pupil">
        <g class="m-knob">
          <circle cx="${EYE.x}" cy="${EYE.y}" r="18.5" fill="url(#${id}k)"/>
          <circle cx="${EYE.x}" cy="${EYE.y}" r="13" fill="none" stroke="#56607A" stroke-opacity=".55" stroke-width="1.2"/>
          <rect x="98.1" y="77.5" width="3.8" height="8" rx="1.9" fill="#181D2B"/>
        </g>
        <circle cx="93.5" cy="87.5" r="3.3" fill="#fff" opacity=".9"/>
      </g>
      <g clip-path="url(#${id}ce)">
        <g class="m-lid">
          <rect x="${EYE.x - 34}" y="${EYE.y - 32}" width="68" height="64" fill="url(#${id}l)"/>
          <rect x="${EYE.x - 34}" y="${EYE.y + 29}" width="68" height="3" fill="#222A3B"/>
        </g>
        <g class="m-lid-low">
          <rect x="${EYE.x - 34}" y="${EYE.y - 32}" width="68" height="64" fill="url(#${id}l)"/>
          <rect x="${EYE.x - 34}" y="${EYE.y - 32}" width="68" height="3" fill="#222A3B"/>
        </g>
      </g>
      <circle cx="${EYE.x}" cy="${EYE.y}" r="${EYE.r}" fill="none" stroke="#232A3A" stroke-width="3.5"/>
      <circle cx="${EYE.x}" cy="${EYE.y}" r="${EYE.r + 2.6}" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="1"/>
    </g>

    <!-- mouth: bill slot -->
    <g class="m-mouth">
      <g clip-path="url(#${id}cb)">
        <g class="m-bill">
          <rect x="81" y="143" width="38" height="25" rx="3" fill="#8EDCAE"/>
          <rect x="84" y="146" width="32" height="19" rx="2" fill="none" stroke="#3C8F60" stroke-width="1.2"/>
          <circle cx="100" cy="155.5" r="4.6" fill="none" stroke="#3C8F60" stroke-width="1.2"/>
        </g>
      </g>
      <rect x="67" y="136" width="66" height="14" rx="7" fill="url(#${id}m)"/>
      <rect x="67.5" y="136.5" width="65" height="13" rx="6.5" fill="none" stroke="#fff" stroke-opacity=".12"/>
      <rect class="m-tooth" x="110" y="136.6" width="10" height="8" rx="2" fill="url(#${id}g)"/>
      <path class="m-glint" d="M0-7L1.3-1.3 7 0 1.3 1.3 0 7-1.3 1.3-7 0-1.3-1.3z" transform="translate(121 137)" fill="#fff"/>
    </g>
  </g></g>
</svg>`;
}

export function createMascot(host) {
  const id = 'mz' + ++uid + '-';
  host.innerHTML = tpl(id);
  const svg = host.firstElementChild;
  const q = (s) => svg.querySelector(s);
  const el = {
    float: q('.m-float'), rig: q('.m-rig'), shadowF: q('.m-shadow-f'), shadow: q('.m-shadow'),
    brow: q('.m-brow'), browL: q('.m-brow-l'), browR: q('.m-brow-r'),
    pupil: q('.m-pupil'), knob: q('.m-knob'), lid: q('.m-lid'), lidLow: q('.m-lid-low'),
    bill: q('.m-bill'), glint: q('.m-glint'), coin: q('.m-coin'), mouth: q('.m-mouth'),
  };

  let mood = 'tough';
  let knob = 0;
  let loops = [];
  let moodT = 0;
  let lastCoin = 0;
  const KO = `${EYE.x} ${EYE.y}`;
  const BASE = '100 191';

  // initial pose
  gsap.set(el.browL, { rotation: MOODS.tough.l, svgOrigin: '100 54' });
  gsap.set(el.browR, { rotation: MOODS.tough.r, svgOrigin: '100 54' });
  gsap.set(el.lid, { scaleY: MOODS.tough.lid, transformOrigin: '50% 0%' });
  gsap.set(el.lidLow, { scaleY: 0, transformOrigin: '50% 100%' });
  gsap.set(el.glint, { scale: 0, transformOrigin: '50% 50%' });
  gsap.set(el.bill, { y: -28 });
  gsap.set(el.mouth, { rotation: -3, svgOrigin: '100 143' });

  // idle float
  gsap.timeline({ repeat: -1, yoyo: true, defaults: { duration: 1.9, ease: 'sine.inOut' } })
    .to(el.float, { y: -5 }, 0)
    .to(el.shadowF, { scaleX: 0.88, opacity: 0.7, svgOrigin: '100 199' }, 0);

  function setMood(name, d = 0.35) {
    const m = MOODS[name];
    mood = name;
    gsap.to(el.browL, { rotation: m.l, svgOrigin: '100 54', duration: d, ease: 'back.out(2)' });
    gsap.to(el.browR, { rotation: m.r, svgOrigin: '100 54', duration: d, ease: 'back.out(2)' });
    gsap.to(el.brow, { y: m.y, duration: d, ease: 'back.out(2)' });
    gsap.to(el.lid, { scaleY: m.lid, duration: d, ease: 'power2.out' });
    gsap.to(el.lidLow, { scaleY: m.low, duration: d, ease: 'power2.out' });
  }
  function moodFor(name, ms) {
    setMood(name);
    clearTimeout(moodT);
    moodT = setTimeout(() => setMood('tough'), ms);
  }

  function blink() {
    if (mood === 'closed') return;
    gsap.timeline()
      .to(el.lid, { scaleY: 1, duration: 0.07, ease: 'power2.in' })
      .to(el.lid, { scaleY: MOODS[mood].lid, duration: 0.13, ease: 'power2.out' });
  }
  (function blinkLoop() {
    setTimeout(() => {
      if (!document.hidden) {
        blink();
        if (Math.random() < 0.25) setTimeout(blink, 230);
      }
      blinkLoop();
    }, 2300 + Math.random() * 3300);
  })();

  // eye follows pointer
  const lx = gsap.quickTo(el.pupil, 'x', { duration: 0.45, ease: 'power3' });
  const ly = gsap.quickTo(el.pupil, 'y', { duration: 0.45, ease: 'power3' });
  function look(cx, cy) {
    const r = svg.getBoundingClientRect();
    if (!r.width) return;
    const ex = r.left + r.width * 0.5, ey = r.top + r.height * (EYE.y / 210);
    const dx = cx - ex, dy = cy - ey;
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, d / 200);
    lx((dx / d) * 4.6 * k);
    ly((dy / d) * 4 * k);
  }

  function turnKnob(deg, dur = 0.5, ease = 'back.out(2.5)') {
    knob += deg;
    return gsap.to(el.knob, { rotation: knob, svgOrigin: KO, duration: dur, ease });
  }

  function dropCoin() {
    const now = performance.now();
    if (now - lastCoin < 420) return;
    lastCoin = now;
    gsap.timeline()
      .set(el.coin, { y: -34, opacity: 1, scaleX: 1, transformOrigin: '50% 50%' })
      .to(el.coin, { y: 26, duration: 0.42, ease: 'power2.in' })
      .to(el.coin, { scaleX: 0.25, duration: 0.14, ease: 'sine.inOut', repeat: 2, yoyo: true }, 0)
      .set(el.coin, { opacity: 0 })
      .fromTo(el.rig, { scaleY: 0.965, scaleX: 1.02, svgOrigin: BASE }, { scaleY: 1, scaleX: 1, duration: 0.45, ease: 'elastic.out(1,.4)' });
  }

  // amount typed
  function nudge(dir = 1) {
    turnKnob(dir * (30 + Math.random() * 30));
    dropCoin();
  }

  function glint() {
    gsap.fromTo(el.glint,
      { scale: 0, rotation: 0 },
      { scale: 1.25, rotation: 90, duration: 0.32, ease: 'back.out(3)', yoyo: true, repeat: 1, repeatDelay: 0.12, transformOrigin: '50% 50%' });
  }

  function hop(h = 14) {
    return gsap.timeline()
      .to(el.rig, { scaleY: 0.9, scaleX: 1.07, svgOrigin: BASE, duration: 0.1, ease: 'power2.out' })
      .to(el.rig, { y: -h, scaleY: 1.04, scaleX: 0.97, duration: 0.2, ease: 'power2.out' })
      .to(el.shadow, { scaleX: 0.75, opacity: 0.18, svgOrigin: '100 199', duration: 0.2 }, '<')
      .to(el.rig, { y: 0, scaleY: 1, scaleX: 1, duration: 0.18, ease: 'power2.in' })
      .to(el.shadow, { scaleX: 1, opacity: 0.32, duration: 0.18 }, '<')
      .to(el.rig, { scaleY: 0.92, scaleX: 1.05, duration: 0.07 })
      .to(el.rig, { scaleY: 1, scaleX: 1, duration: 0.5, ease: 'elastic.out(1,.35)' });
  }

  function swap() {
    setMood('wow', 0.2);
    hop(30);
    turnKnob(360, 0.7, 'power3.out');
    clearTimeout(moodT);
    moodT = setTimeout(() => setMood('tough'), 700);
  }

  function no() {
    moodFor('angry', 1500);
    gsap.timeline()
      .to(el.rig, { x: -7, duration: 0.06 })
      .to(el.rig, { x: 7, duration: 0.09, repeat: 3, yoyo: true, ease: 'sine.inOut' })
      .to(el.rig, { x: 0, duration: 0.12 });
    turnKnob(-40);
  }

  function wow() {
    moodFor('wow', 1700);
    glint();
    hop(12);
  }

  function poke() {
    moodFor('angry', 1300);
    gsap.timeline()
      .to(el.rig, { scaleY: 0.86, scaleX: 1.1, svgOrigin: BASE, duration: 0.08 })
      .to(el.rig, { scaleY: 1, scaleX: 1, duration: 0.6, ease: 'elastic.out(1.1,.3)' });
    turnKnob(90, 0.4);
  }

  function stopProcess() {
    loops.forEach((t) => t.kill());
    loops = [];
    knob = gsap.getProperty(el.knob, 'rotation') || knob;
    gsap.to(el.rig, { x: 0, duration: 0.2 });
    gsap.to(el.bill, { y: -28, duration: 0.2 });
  }

  function process() {
    stopProcess();
    clearTimeout(moodT);
    setMood('focus');
    loops = [
      gsap.to(el.knob, { rotation: '+=360', svgOrigin: KO, duration: 0.9, ease: 'none', repeat: -1 }),
      gsap.to(el.rig, { x: 1.1, duration: 0.05, repeat: -1, yoyo: true, ease: 'none' }),
      gsap.timeline({ repeat: -1, repeatDelay: 0.12 })
        .to(el.bill, { y: 0, duration: 0.22, ease: 'power2.out' })
        .to(el.bill, { y: -28, duration: 0.18, ease: 'power2.in' }, '+=.06'),
    ];
  }

  function success() {
    stopProcess();
    setMood('happy');
    glint();
    gsap.timeline()
      .add(hop(26))
      .add(hop(12), '-=.45');
    turnKnob(720, 1.3, 'power3.out');
    gsap.to(el.bill, { y: 3, duration: 0.4, ease: 'back.out(2)', delay: 0.35 });
  }

  function enter() {
    gsap.timeline()
      .from(el.rig, { y: -170, duration: 0.55, ease: 'power3.in', svgOrigin: BASE })
      .from(el.shadow, { scaleX: 0.2, opacity: 0, svgOrigin: '100 199', duration: 0.55, ease: 'power3.in' }, 0)
      .to(el.rig, { scaleY: 0.84, scaleX: 1.12, duration: 0.08, svgOrigin: BASE })
      .to(el.rig, { scaleY: 1, scaleX: 1, duration: 0.7, ease: 'elastic.out(1.1,.3)' })
      .add(() => turnKnob(180, 0.8, 'power3.out'), '-=.6');
  }

  function reset() {
    stopProcess();
    clearTimeout(moodT);
    setMood('tough', 0.2);
    gsap.set(el.bill, { y: -28 });
  }

  // глаз закрыт (скрытый баланс)
  function sleep(on) {
    clearTimeout(moodT);
    setMood(on ? 'closed' : 'tough', 0.3);
  }

  return { el: svg, sleep, dropCoin, glint, hop, look, nudge, swap, no, wow, poke, process, stopProcess, success, enter, reset, blink, mood: setMood, turnKnob };
}
