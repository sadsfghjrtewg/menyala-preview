import { CRYPTO, METHODS, HISTORY, QUIPS } from './data.js';
import { createMascot } from './mascot.js';
import { createPattern, miniPattern } from './pattern.js';

const gsap = window.gsap;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const icon = (id) => `<svg><use href="#${id}"/></svg>`;
const tg = window.Telegram?.WebApp;
const haptic = (t = 'light') => tg?.HapticFeedback?.impactOccurred?.(t);

/* ───────── formatting ───────── */
const nfCache = {};
const nf = (dp) => (nfCache[dp] ??= new Intl.NumberFormat('ru-RU', { maximumFractionDigits: dp }));
const fRub = (v) => nf(0).format(Math.round(v));
const fC = (v, c) => nf(c.dp).format(v);
const fRate = (v) => nf(v < 1000 ? 2 : 0).format(v);
const roundDp = (v, dp) => Math.round(v * 10 ** dp) / 10 ** dp;
const toRaw = (v, dp) => (dp ? v.toFixed(dp).replace(/\.?0+$/, '') : String(Math.round(v)));

/* ───────── number-flow (github.com/barvian/number-flow) + fallback ───────── */
const flows = new Set();
function flow(el, value, fmt = {}) {
  el._v = value; el._f = fmt; flows.add(el);
  if (typeof el.update === 'function') {
    el.format = fmt; el.locales = 'ru-RU'; el.update(value);
  } else {
    el.textContent = new Intl.NumberFormat('ru-RU', fmt).format(value);
  }
}
import('https://esm.sh/number-flow@0.6.2')
  .then(() => customElements.whenDefined('number-flow'))
  .then(() => flows.forEach((el) => { el.textContent = ''; flow(el, el._v, el._f); }))
  .catch(() => {});

/* ───────── state ───────── */
const SPREAD = 0.009, MIN_RUB = 5000, MAX_RUB = 3_000_000, LOCK = 60;
const live = Object.fromEntries(CRYPTO.map((c) => [c.id, c.rate]));
const S = { dir: 'sell', c: CRYPTO[0], m: METHODS[0], give: 1000, raw: '1000', tab: 'exchange', lock: LOCK, valid: 'ok', big: false };

const giveCrypto = () => S.dir === 'sell';
const rate = () => live[S.c.id] * (giveCrypto() ? 1 - SPREAD : 1 + SPREAD);
const getVal = () => (giveCrypto() ? S.give * rate() : S.give / rate());
const rubVal = () => (giveCrypto() ? S.give * rate() : S.give);
const giveDp = () => (giveCrypto() ? S.c.dp : 0);
const state = () => { const r = rubVal(); return S.give === 0 ? 'empty' : r < MIN_RUB ? 'low' : r > MAX_RUB ? 'high' : 'ok'; };

function applyTheme(c) {
  const r = document.documentElement.style;
  r.setProperty('--c1', c.c1); r.setProperty('--c2', c.c2); r.setProperty('--pat', c.pat);
}

/* ───────── mascot + pattern ───────── */
const pattern = createPattern($('#heroPattern'), { cx: 200, cy: 122 });
pattern.set(S.c.glyph, 'g-rub', false);
const mascot = createMascot($('#heroMascot'));

const bubble = $('#bubble');
let bubT;
function say(text, ms = 2600) {
  bubble.textContent = text;
  clearTimeout(bubT);
  gsap.killTweensOf(bubble);
  gsap.fromTo(bubble, { opacity: 0, scale: 0.5, y: 8, rotation: -8 }, { opacity: 1, scale: 1, y: 0, rotation: 0, duration: 0.5, ease: 'back.out(2.4)' });
  bubT = setTimeout(() => gsap.to(bubble, { opacity: 0, scale: 0.85, y: -4, duration: 0.25, ease: 'power2.in' }), ms);
}

addEventListener('pointermove', (e) => { mascot.look(e.clientX, e.clientY); fMascot.look(e.clientX, e.clientY); }, { passive: true });

let pokes = 0, pokeT;
$('#heroMascot').addEventListener('pointerdown', (e) => {
  mascot.look(e.clientX, e.clientY);
  mascot.poke();
  haptic('medium');
  say(QUIPS.poke[Math.min(pokes, QUIPS.poke.length - 1)], 1800);
  pokes++;
  clearTimeout(pokeT);
  pokeT = setTimeout(() => (pokes = 0), 4000);
});

/* ───────── currency buttons ───────── */
const coinHTML = (c) => `<span class="coin" style="--a:${c.c1};--b:${c.c2}">${icon(c.glyph)}</span>`;
const rubCoin = `<span class="coin coin-rub">${icon('g-rub')}</span>`;
function curHTML(kind) {
  if (kind === 'c') return `${coinHTML(S.c)}<span><b>${S.c.code}</b><small>${S.c.net}</small></span><svg class="chev"><use href="#i-chev"/></svg>`;
  return `${rubCoin}<span><b>RUB</b><small>${S.m.name}</small></span><svg class="chev"><use href="#i-chev"/></svg>`;
}
function renderCur() {
  const g = $('#giveCur'), r = $('#getCur');
  g.dataset.kind = giveCrypto() ? 'c' : 'f';
  r.dataset.kind = giveCrypto() ? 'f' : 'c';
  g.innerHTML = curHTML(g.dataset.kind);
  r.innerHTML = curHTML(r.dataset.kind);
}
$('#giveCur').addEventListener('click', (e) => openSheet(e.currentTarget.dataset.kind));
$('#getCur').addEventListener('click', (e) => openSheet(e.currentTarget.dataset.kind));

/* ───────── amount input ───────── */
const inp = $('#giveInput');
function displayRaw(raw) {
  if (!raw) return '';
  const [i, d] = raw.split('.');
  const int = nf(0).format(Number(i || 0));
  return d !== undefined ? `${int},${d}` : int;
}
function fit(el, len) {
  el.style.fontSize = len > 11 ? '21px' : len > 9 ? '25px' : len > 7 ? '29px' : '';
}
function setInput() {
  inp.value = displayRaw(S.raw);
  fit(inp, inp.value.length);
}
inp.addEventListener('input', () => {
  let v = inp.value.replace(/[\s  ]/g, '').replace(/,/g, '.').replace(/[^\d.]/g, '');
  const dot = v.indexOf('.');
  if (dot !== -1) v = v.slice(0, dot + 1) + v.slice(dot + 1).replace(/\./g, '');
  const dp = giveDp();
  if (dp === 0) v = v.split('.')[0];
  else if (dot !== -1) { const [a, b] = v.split('.'); v = (a || '0') + '.' + b.slice(0, dp); }
  v = v.replace(/^0+(?=\d)/, '').slice(0, 13);
  const prev = S.give;
  S.raw = v;
  S.give = parseFloat(v) || 0;
  setInput();
  if (S.give !== prev) mascot.nudge(S.give > prev ? 1 : -1);
  update();
  react();
});

let reactT;
function react() {
  clearTimeout(reactT);
  reactT = setTimeout(() => {
    const st = state();
    if (st !== S.valid) {
      if (st === 'low') { mascot.no(); say(pick(QUIPS.low)); haptic('rigid'); }
      if (st === 'high') { mascot.no(); say(pick(QUIPS.high)); haptic('rigid'); }
    }
    const big = st === 'ok' && rubVal() >= 300_000;
    if (big && !S.big) { mascot.wow(); say(pick(QUIPS.big)); haptic('soft'); }
    S.big = big; S.valid = st;
  }, 600);
}

/* ───────── quick amounts ───────── */
function nice(v) {
  const p = 10 ** Math.floor(Math.log10(v));
  return Math.round(v / p) * p;
}
function renderQuick() {
  const targets = [10_000, 50_000, 100_000, 500_000];
  const vals = targets.map((t) => (giveCrypto() ? nice(t / rate()) : t));
  const label = (v) => (giveCrypto() ? nf(giveDp()).format(v) : `${v / 1000}к ₽`);
  $('#quick').innerHTML = vals.map((v) => `<button class="q" data-v="${v}">${label(v)}</button>`).join('');
  markQuick();
}
function markQuick() { $$('.q').forEach((b) => b.classList.toggle('on', +b.dataset.v === S.give)); }
$('#quick').addEventListener('click', (e) => {
  const b = e.target.closest('.q'); if (!b) return;
  const prev = S.give;
  S.give = +b.dataset.v; S.raw = toRaw(S.give, giveDp());
  setInput();
  mascot.nudge(S.give >= prev ? 1 : -1);
  haptic();
  update(); react();
});

/* ───────── main render ───────── */
function update() {
  const c = S.c, r = rate(), get = getVal(), st = state();

  flow($('#getFlow'), get, { maximumFractionDigits: giveCrypto() ? 0 : c.dp });
  fit($('#getBox'), (giveCrypto() ? fRub(get) : fC(get, c)).length);
  flow($('#heroRate'), r, { maximumFractionDigits: r < 1000 ? 2 : 0 });
  $('#heroPair').textContent = giveCrypto() ? `${c.code} → RUB` : `RUB → ${c.code}`;
  $('#heroCode').textContent = c.code;
  $('#heroDelta').textContent = `24ч ${c.ch24}`;

  const minGive = giveCrypto() ? `${fC(Math.ceil((MIN_RUB / r) * 10 ** c.dp) / 10 ** c.dp, c)} ${c.code}` : `${fRub(MIN_RUB)} ₽`;
  const gh = $('#giveHint');
  gh.textContent = st === 'high' ? 'лимит 3 млн ₽' : `мин. ${minGive}`;
  gh.classList.toggle('bad', st === 'low' || st === 'high');
  $('#getHint').textContent = `по курсу ${fRate(r)} ₽`;

  // CTA
  const cta = $('#cta');
  cta.disabled = st !== 'ok';
  const giveTxt = giveCrypto() ? `${fC(S.give, c)} ${c.code}` : `${fRub(S.give)} ₽`;
  const getTxt = giveCrypto() ? `${fRub(get)} ₽ · ${S.m.name}` : `${fC(get, c)} ${c.code} · ${c.net}`;
  $('#ctaMain').textContent = st === 'empty' ? 'Введите сумму' : st === 'low' ? `Минимум ${minGive}` : st === 'high' ? 'Лимит — 3 млн ₽ за заявку' : `Обменять ${giveTxt}`;
  $('#ctaSub').textContent = st === 'ok' ? `получите ${getTxt}` : '';

  // gift-style attributes
  const rows = [
    ['Курс', `1 ${c.code} = ${fRate(r)} ₽`, `<span class="pill">${c.ch24}</span>`],
    ['Комиссия', '0 ₽', '<span class="pill ok">в курсе</span>'],
    ['Сеть', `${c.netName} · ${c.net}`, `<span class="pill mute">${c.eta}</span>`],
    [giveCrypto() ? 'Выплата' : 'Оплата', `${S.m.name} · ${S.m.sub}`, `<span class="pill mute">${S.m.eta}</span>`],
  ];
  $('#attrs').innerHTML = rows.map(([k, v, p]) => `<div class="attr"><dt>${k}</dt><dd><span>${v}</span>${p}</dd></div>`).join('');

  // destination
  const di = $('#destInput');
  if (giveCrypto()) {
    $('#destLabel').textContent = S.m.destLabel;
    di.placeholder = S.m.placeholder;
    di.classList.remove('mono');
    $('#destIco').innerHTML = icon(S.m.icon);
  } else {
    $('#destLabel').textContent = `Ваш адрес ${c.code} · ${c.net}`;
    di.placeholder = c.addr.slice(0, 6) + '…' + c.addr.slice(-4);
    di.classList.add('mono');
    $('#destIco').innerHTML = icon('i-wallet');
  }
  markQuick();
}

/* ───────── swap direction ───────── */
let swapRot = 0;
$('#swapBtn').addEventListener('click', () => {
  const carry = getVal();
  S.dir = giveCrypto() ? 'buy' : 'sell';
  S.give = roundDp(carry, giveDp());
  S.raw = toRaw(S.give, giveDp());
  $('#destInput').value = '';
  swapRot += 180;
  gsap.to('#swapBtn svg', { rotation: swapRot, duration: 0.55, ease: 'back.out(1.8)' });
  gsap.fromTo('.leg-row', { y: (i) => (i === 0 ? 16 : -16), opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out', stagger: 0.05 });
  renderCur(); setInput(); renderQuick(); update();
  S.valid = state(); S.big = S.valid === 'ok' && rubVal() >= 300_000;
  pattern.flip();
  mascot.swap();
  haptic('medium');
  say(pick(QUIPS.swap), 1800);
});

/* ───────── rate lock ───────── */
const ring = $('#lockRing');
const CIRC = 2 * Math.PI * 8;
ring.style.strokeDasharray = CIRC;
function renderLock() {
  $('#lockTime').textContent = `${Math.floor(S.lock / 60)}:${String(S.lock % 60).padStart(2, '0')}`;
  ring.style.strokeDashoffset = CIRC * (1 - S.lock / LOCK);
}
setInterval(() => {
  S.lock--;
  if (S.lock <= 0) {
    S.lock = LOCK;
    CRYPTO.forEach((c) => (live[c.id] *= 1 + (Math.random() - 0.48) * 0.004));
    update();
    mascot.turnKnob(120, 0.6, 'power3.out');
    if (S.tab === 'exchange') say(pick(QUIPS.rate), 1800);
  }
  renderLock();
}, 1000);

/* ───────── bottom sheet ───────── */
const sheetWrap = $('#sheet'), sheet = $('.sheet', sheetWrap), dim = $('.sheet-dim', sheetWrap);
gsap.set(sheet, { yPercent: 100 });

function cryptoGrid() {
  return `<div class="grid">${CRYPTO.map((c) => `
    <button class="tile ${c.id === S.c.id ? 'sel' : ''}" data-c="${c.id}" style="--a:${c.c1};--b:${c.c2};--p:${c.pat}">
      ${c.tag ? `<span class="ribbon">${c.tag}</span>` : ''}
      <span class="tile-art">${miniPattern(c.glyph)}<span class="tile-coin">${icon(c.glyph)}</span></span>
      <span class="tile-name">${c.code}</span>
      <span class="tile-rate">${fRate(live[c.id] * (giveCrypto() ? 1 - SPREAD : 1 + SPREAD))} ₽</span>
    </button>`).join('')}</div>`;
}
function methodList() {
  return `<div class="mlist">${METHODS.map((m) => `
    <button class="mrow ${m.id === S.m.id ? 'sel' : ''}" data-m="${m.id}">
      <span class="m-ico">${icon(m.icon)}</span>
      <span class="m-t"><b>${m.name}</b><small>${m.sub} · ${m.eta}</small></span>
      <span class="radio">${icon('i-check')}</span>
    </button>`).join('')}</div>`;
}
function openSheet(kind) {
  $('#sheetTitle').textContent = kind === 'c' ? 'Какую крипту?' : giveCrypto() ? 'Куда выплатить' : 'Чем платите';
  $('#sheetSub').textContent = kind === 'c' ? 'Курс за 1 монету, фиксируем на 60 секунд' : 'Комиссия везде одна — 0 ₽';
  $('#sheetBody').innerHTML = kind === 'c' ? cryptoGrid() : methodList();
  sheetWrap.classList.add('open');
  gsap.set(sheet, { y: 0 });
  gsap.to(dim, { opacity: 1, duration: 0.3 });
  gsap.fromTo(sheet, { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: 'expo.out' });
  gsap.from($$('.tile, .mrow', sheet), { y: 24, opacity: 0, duration: 0.45, stagger: 0.035, ease: 'power3.out', delay: 0.08 });
  haptic();
}
function closeSheet() {
  gsap.to(dim, { opacity: 0, duration: 0.25 });
  gsap.to(sheet, { yPercent: 100, duration: 0.32, ease: 'power3.in', onComplete: () => sheetWrap.classList.remove('open') });
}
dim.addEventListener('click', closeSheet);

// drag to close
let dragY = null, dragT = 0;
sheet.addEventListener('pointerdown', (e) => {
  if (e.target.closest('button') || sheet.scrollTop > 0) return;
  dragY = e.clientY; dragT = Date.now();
  sheet.setPointerCapture(e.pointerId);
});
sheet.addEventListener('pointermove', (e) => {
  if (dragY === null) return;
  gsap.set(sheet, { y: Math.max(0, e.clientY - dragY) });
});
sheet.addEventListener('pointerup', (e) => {
  if (dragY === null) return;
  const dy = e.clientY - dragY; dragY = null;
  if (dy > 110 || (dy > 40 && Date.now() - dragT < 260)) closeSheet();
  else gsap.to(sheet, { y: 0, duration: 0.35, ease: 'power3.out' });
});

$('#sheetBody').addEventListener('click', (e) => {
  const t = e.target.closest('[data-c]');
  if (t) {
    $$('.tile').forEach((x) => x.classList.toggle('sel', x === t));
    selectCrypto(t.dataset.c);
    setTimeout(closeSheet, 160);
    return;
  }
  const m = e.target.closest('[data-m]');
  if (m) {
    S.m = METHODS.find((x) => x.id === m.dataset.m);
    $$('.mrow').forEach((x) => x.classList.toggle('sel', x === m));
    renderCur(); update();
    haptic();
    setTimeout(closeSheet, 200);
  }
});

function selectCrypto(id) {
  if (id === S.c.id) return;
  const rv = rubVal();
  S.c = CRYPTO.find((x) => x.id === id);
  if (giveCrypto()) { S.give = roundDp(rv / rate(), S.c.dp) || 0; S.raw = toRaw(S.give, S.c.dp); }
  applyTheme(S.c);
  pattern.set(S.c.glyph, 'g-rub');
  renderCur(); setInput(); renderQuick(); update();
  S.valid = state();
  mascot.wow();
  haptic('medium');
  setTimeout(() => say(QUIPS.coin[S.c.id], 2200), 250);
}

/* ───────── tabs ───────── */
$$('.tab').forEach((t, i) => t.addEventListener('click', () => go(t.dataset.tab, i)));
function go(tab, i) {
  if (tab === S.tab) return;
  S.tab = tab;
  $('#tabInd').style.transform = `translateX(${i * 100}%)`;
  $$('.tab').forEach((t) => t.classList.toggle('on', t.dataset.tab === tab));
  $$('.screen').forEach((s) => s.classList.toggle('is-on', s.dataset.screen === tab));
  $('#dock').classList.toggle('no-cta', tab !== 'exchange');
  scrollTo({ top: 0 });
  const scr = $(`.screen[data-screen="${tab}"]`);
  gsap.fromTo(scr.children, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out' });
  if (tab === 'history') renderHistory();
  haptic();
}

/* ───────── history ───────── */
const bars = [3, 0, 5, 2, 0, 7, 4, 1, 0, 6, 3, 9, 2, 5];
$('#bars').innerHTML = bars.map((v, i) => `<i class="${i === bars.length - 1 ? 'hi' : ''}" style="height:${8 + v * 10}%"></i>`).join('');

function renderHistory() {
  $('#historyList').innerHTML = HISTORY.map((g) => `
    <div class="hdate">${g.day}</div>
    <div class="hlist">${g.items.map((it) => {
      const c = CRYPTO.find((x) => x.id === it.c);
      const sell = it.dir === 'sell';
      const coins = sell ? coinHTML(c) + rubCoin : rubCoin + coinHTML(c);
      return `<div class="hrow">
        <span class="pair">${coins}</span>
        <span class="h-t"><b>${sell ? `${c.code} → RUB` : `RUB → ${c.code}`}</b><small><i class="dot ${it.status}"></i>${it.status === 'pending' ? 'в процессе' : it.time} · ${it.via}</small></span>
        <span class="h-amt"><b>+${sell ? `${fRub(it.get)} ₽` : `${fC(it.get, c)} ${c.code}`}</b><small>−${sell ? `${fC(it.give, c)} ${c.code}` : `${fRub(it.give)} ₽`}</small></span>
      </div>`;
    }).join('')}</div>`).join('');
  gsap.from('#bars i', { scaleY: 0, duration: 0.6, stagger: 0.025, ease: 'back.out(1.6)' });
}

/* ───────── profile pattern ───────── */
createPattern($('#tierPattern'), {
  cx: 320, cy: 70, spin: 400,
  rings: [{ r: 60, s: 15, gap: 44 }, { r: 92, s: 16, gap: 44 }, { r: 126, s: 17, gap: 46 }, { r: 162, s: 18, gap: 48 }, { r: 200, s: 18, gap: 50 }, { r: 240, s: 19, gap: 52 }],
}).set('g-safe', 'g-rub', false);

/* ───────── order flow ───────── */
const flowEl = $('#flow');
const fPattern = createPattern($('#fPattern'), { cx: 200, cy: 100 });
const fMascot = createMascot($('#fMascot'));
let order = null, flowTimer = 0, flowTl = null;

function toast(text) {
  const t = $('#toast');
  t.textContent = text;
  gsap.killTweensOf(t);
  gsap.fromTo(t, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'back.out(2)' });
  gsap.to(t, { opacity: 0, y: -8, duration: 0.25, delay: 1.6 });
}

const addrHTML = (a) => `<b>${a.slice(0, 5)}</b>${a.slice(5, -5)}<b>${a.slice(-5)}</b>`;
const giveStr = (o) => (o.dir === 'sell' ? `${fC(o.give, o.c)} ${o.c.code}` : `${fRub(o.give)} ₽`);
const getStr = (o) => (o.dir === 'sell' ? `${fRub(o.get)} ₽` : `${fC(o.get, o.c)} ${o.c.code}`);

function setFlowHead(title, sub) {
  $('#fTitle').textContent = title;
  $('#fSub').textContent = sub;
}
function setFlowCta(text, disabled = false) {
  const b = $('#fCta');
  b.disabled = disabled;
  b.innerHTML = `<span class="cta-main">${text}</span>`;
}
function animBody() {
  gsap.from($('#fBody').children, { y: 20, opacity: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out' });
}

function openFlow() {
  order = {
    id: 48000 + Math.floor(Math.random() * 1900),
    dir: S.dir, c: S.c, m: S.m, give: S.give, get: getVal(), rate: rate(),
    dest: $('#destInput').value.trim(), t0: Date.now(), stage: 'pay',
  };
  fPattern.set(order.c.glyph, 'g-rub', false);
  $('#fId').textContent = `Заявка #${order.id}`;
  fMascot.reset();
  renderPay();
  flowEl.classList.add('open');
  flowEl.scrollTop = 0;
  gsap.fromTo(flowEl, { yPercent: 100 }, { yPercent: 0, duration: 0.65, ease: 'expo.out' });
  setTimeout(() => fMascot.wow(), 450);
  startTimer(30 * 60);
  haptic('medium');
}

function startTimer(sec) {
  clearInterval(flowTimer);
  const tick = () => {
    $('#fTimer').textContent = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
    sec = Math.max(0, sec - 1);
  };
  tick();
  flowTimer = setInterval(tick, 1000);
}

function renderPay() {
  const o = order, c = o.c, sell = o.dir === 'sell';
  setFlowHead(sell ? 'Ждём перевод' : 'Ждём оплату', `${giveStr(o)} → ${getStr(o)}`);
  const dest = o.dest || (sell ? (o.m.id === 'sbp' ? '+7 9•• •••-••-12' : '2200 •••• •••• 4417') : c.addr.slice(0, 6) + '…' + c.addr.slice(-4));

  $('#fBody').innerHTML = sell ? `
    <div class="f-sec">
      <div class="f-label">Переведите ровно</div>
      <div class="f-big">${fC(o.give, c)} <em>${c.code}</em><button class="copy" data-copy="${o.give}" aria-label="Скопировать сумму">${icon('i-copy')}</button></div>
    </div>
    <div class="box">
      <div class="box-head"><span>Адрес · ${c.netName} ${c.net}</span><span class="pill mute">${c.eta}</span></div>
      <div class="box-row"><span class="addr">${addrHTML(c.addr)}</span><button class="copy" data-copy="${c.addr}" aria-label="Скопировать адрес">${icon('i-copy')}</button></div>
    </div>
    <div class="note warn">${icon('i-warn')}<span>Только сеть ${c.net}. Монеты из другой сети потеряются — вернуть не выйдет.</span></div>
    <dl class="attrs">
      <div class="attr"><dt>Получите</dt><dd class="plain"><span>${fRub(o.get)} ₽</span><span class="pill ok">0 ₽ комиссия</span></dd></div>
      <div class="attr"><dt>Куда</dt><dd><span>${o.m.name} · ${dest}</span><span class="pill mute">${o.m.eta}</span></dd></div>
      <div class="attr"><dt>Курс</dt><dd><span>${fRate(o.rate)} ₽</span><span class="pill">зафиксирован</span></dd></div>
    </dl>` : `
    <div class="f-sec">
      <div class="f-label">Оплатите ровно</div>
      <div class="f-big">${fRub(o.give)} <em>₽</em><button class="copy" data-copy="${o.give}" aria-label="Скопировать сумму">${icon('i-copy')}</button></div>
    </div>
    <div class="box">
      <div class="box-head"><span>Реквизиты · ${o.m.name}</span><span class="pill mute">${o.m.eta}</span></div>
      <div class="box-row"><span class="k">Номер</span><span class="v">${o.m.id === 'card' ? '2200 7014 3398 0261' : '+7 912 408-31-17'}</span><button class="copy" data-copy="${o.m.id === 'card' ? '2200701433980261' : '+79124083117'}">${icon('i-copy')}</button></div>
      <div class="box-row"><span class="k">Получатель</span><span class="v">Алексей К.</span></div>
      <div class="box-row"><span class="k">Банк</span><span class="v">Т-Банк</span></div>
    </div>
    <div class="note info">${icon('i-shield')}<span>Платите одним переводом со своей карты. Комментарий к переводу не пишите.</span></div>
    <dl class="attrs">
      <div class="attr"><dt>Получите</dt><dd class="plain"><span>${fC(o.get, c)} ${c.code}</span><span class="pill">${c.net}</span></dd></div>
      <div class="attr"><dt>Куда</dt><dd><span style="font-family:var(--f-mono);font-size:13px">${dest}</span><span class="pill mute">${c.eta}</span></dd></div>
      <div class="attr"><dt>Курс</dt><dd><span>${fRate(o.rate)} ₽</span><span class="pill">зафиксирован</span></dd></div>
    </dl>`;
  setFlowCta(sell ? 'Я перевёл' : 'Я оплатил');
  animBody();
}

function renderProcess() {
  const o = order, c = o.c, sell = o.dir === 'sell';
  o.stage = 'process';
  setFlowHead('Проверяем', 'обычно 2–5 минут');
  fMascot.process();
  const steps = sell
    ? [['Заявка создана', ''], ['Ловим перевод в сети', c.netName], ['Подтверждения', `<number-flow class="conf"></number-flow>/${c.conf}`], [`Отправляем рубли`, o.m.name]]
    : [['Заявка создана', ''], ['Проверяем оплату', o.m.name], [`Отправляем ${c.code}`, c.net], ['Сеть подтверждает', `<number-flow class="conf"></number-flow>/${c.conf}`]];
  $('#fBody').innerHTML = `
    <div class="steps">${steps.map(([t, s]) => `<div class="step"><span class="st-ic">${icon('i-check')}</span><span>${t}</span><small>${s}</small></div>`).join('')}</div>
    <div class="note info">${icon('i-chat')}<span>Можно закрыть приложение — как всё дойдёт, напишем в чат с ботом.</span></div>`;
  const conf = $('#fBody .conf');
  flow(conf, 0);
  setFlowCta('Обычно 2–5 минут', true);
  animBody();

  const st = $$('#fBody .step');
  const confIdx = sell ? 2 : 3;
  const mark = (i, cls) => { st[i].classList.remove('active'); st[i].classList.add(cls); if (cls === 'done') haptic('light'); };
  flowTl = gsap.timeline()
    .call(() => mark(0, 'done'), null, 0.3)
    .call(() => mark(1, 'active'), null, 0.5)
    .call(() => mark(1, 'done'), null, 1.9)
    .call(() => mark(2, 'active'), null, 2.0);
  if (confIdx === 2) {
    const n = c.conf;
    for (let k = 1; k <= n; k++) flowTl.call(() => flow(conf, k), null, 2.1 + (k / n) * 1.6);
    flowTl.call(() => mark(2, 'done'), null, 3.8).call(() => mark(3, 'active'), null, 3.9).call(() => mark(3, 'done'), null, 5.0);
  } else {
    flowTl.call(() => mark(2, 'done'), null, 3.2).call(() => mark(3, 'active'), null, 3.3);
    const n = c.conf;
    for (let k = 1; k <= n; k++) flowTl.call(() => flow(conf, k), null, 3.4 + (k / n) * 1.4);
    flowTl.call(() => mark(3, 'done'), null, 5.0);
  }
  flowTl.call(renderDone, null, 5.5);
}

function renderDone() {
  const o = order, c = o.c, sell = o.dir === 'sell';
  o.stage = 'done';
  clearInterval(flowTimer);
  $('#fTimer').textContent = 'готово';
  setFlowHead('Обмен закрыт', `Заявка #${o.id}`);
  fMascot.success();
  burst($('#fMascot'));
  haptic('heavy');
  tg?.HapticFeedback?.notificationOccurred?.('success');
  const secs = 120 + Math.floor(Math.random() * 90);
  $('#fBody').innerHTML = `
    <div class="f-sec" style="text-align:center">
      <div class="f-label">Зачислено</div>
      <div class="f-big ok" style="justify-content:center">+${sell ? fRub(o.get) : fC(o.get, c)} <em>${sell ? '₽' : c.code}</em></div>
    </div>
    <dl class="attrs">
      <div class="attr"><dt>Отдали</dt><dd class="plain"><span>${giveStr(o)}</span></dd></div>
      <div class="attr"><dt>Получили</dt><dd class="plain"><span>${getStr(o)}</span><span class="pill ok">0 ₽ комиссия</span></dd></div>
      <div class="attr"><dt>Курс</dt><dd><span>1 ${c.code} = ${fRate(o.rate)} ₽</span></dd></div>
      <div class="attr"><dt>Время</dt><dd><span>${Math.floor(secs / 60)} мин ${secs % 60} с</span><span class="pill">быстрее 82%</span></dd></div>
    </dl>
    <button class="ghost" id="shareBtn">${icon('i-share')}Поделиться чеком</button>`;
  setFlowCta('Готово');
  animBody();

  HISTORY[0].items.unshift({ c: c.id, dir: o.dir, give: o.give, get: o.get, time: new Date().toTimeString().slice(0, 5), via: o.m.name, status: 'done' });
}

function closeFlow() {
  flowTl?.kill();
  clearInterval(flowTimer);
  const wasDone = order?.stage === 'done';
  gsap.to(flowEl, {
    yPercent: 100, duration: 0.4, ease: 'power3.in',
    onComplete: () => {
      flowEl.classList.remove('open');
      fMascot.reset();
      if (wasDone) { mascot.wow(); say(pick(QUIPS.done), 2400); }
    },
  });
}

$('#cta').addEventListener('click', () => { if (state() === 'ok') openFlow(); });
$('#fCta').addEventListener('click', () => {
  if (!order) return;
  if (order.stage === 'pay') renderProcess();
  else if (order.stage === 'done') closeFlow();
});
$('#flowClose').addEventListener('click', closeFlow);

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-copy]');
  if (b) {
    navigator.clipboard?.writeText(b.dataset.copy).catch(() => {});
    b.classList.add('done');
    b.innerHTML = icon('i-check');
    setTimeout(() => { b.classList.remove('done'); b.innerHTML = icon('i-copy'); }, 1400);
    toast('Скопировано');
    haptic();
  }
  if (e.target.closest('#shareBtn')) toast('Чек готов — отправим в чат');
});

$('#destPaste').addEventListener('click', async () => {
  try {
    const t = await navigator.clipboard.readText();
    if (t) $('#destInput').value = t.trim();
  } catch {
    toast('Нет доступа к буферу');
  }
});

/* coins + bills burst */
function burst(host) {
  const r = host.getBoundingClientRect();
  const x0 = r.left + r.width / 2, y0 = r.top + r.height * 0.45;
  const fx = $('#fx');
  for (let i = 0; i < 30; i++) {
    const d = document.createElement('i');
    d.className = i % 4 === 0 ? 'b' : 'c';
    fx.appendChild(d);
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.15;
    const v = 150 + Math.random() * 230;
    const dx = Math.cos(ang) * v, dy = Math.sin(ang) * v;
    gsap.set(d, { x: x0, y: y0, xPercent: -50, yPercent: -50, rotation: Math.random() * 360, scale: 0.3 });
    gsap.timeline({ onComplete: () => d.remove() })
      .to(d, { x: x0 + dx * 1.3, duration: 1.7, ease: 'power1.out' }, 0)
      .to(d, { y: y0 + dy, duration: 0.55, ease: 'power2.out' }, 0)
      .to(d, { y: y0 + dy + innerHeight * 0.9, duration: 1.15, ease: 'power2.in' }, 0.55)
      .to(d, { scale: 0.7 + Math.random() * 0.5, duration: 0.3 }, 0)
      .to(d, { rotation: `+=${Math.random() * 600 - 300}`, duration: 1.7, ease: 'none' }, 0)
      .to(d, { scaleX: 0.2, duration: 0.18, repeat: 7, yoyo: true, ease: 'sine.inOut' }, 0.1)
      .to(d, { opacity: 0, duration: 0.3 }, 1.4);
  }
}

/* ───────── boot ───────── */
tg?.ready?.(); tg?.expand?.();
applyTheme(S.c);
renderCur(); setInput(); renderQuick(); update(); renderLock();
S.valid = state();

gsap.from('.top > *', { y: -10, opacity: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out' });
gsap.from('#hero', { scale: 0.94, opacity: 0, duration: 0.7, ease: 'expo.out' });
gsap.from(['#swap', '#quick', '#dest', '#attrs', '.fine'], { y: 24, opacity: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out', delay: 0.15 });
gsap.from('#dock', { y: 40, opacity: 0, duration: 0.6, ease: 'power3.out', delay: 0.3 });
mascot.enter();
setTimeout(() => say(pick(QUIPS.hello)), 1000);
