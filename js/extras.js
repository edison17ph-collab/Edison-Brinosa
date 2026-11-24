/* extras.js - additions only. script.js is untouched. */
(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fine = matchMedia('(pointer:fine)').matches, calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
const body = document.body;

// Toast + copy
const toastEl = $('#toast'); let tt;
const toast = m => { toastEl.textContent = m; toastEl.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove('show'), 2200); };
$$('.copy').forEach(b => b.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(b.dataset.copy); } catch { const t = document.createElement('textarea'); t.value = b.dataset.copy; document.body.append(t); t.select(); document.execCommand('copy'); t.remove(); }
  toast('Copied: ' + b.dataset.copy);
}));

// Intro / front page
const intro = $('#intro'); const roles = ['Game Developer', 'Website Developer', 'UI Designer', 'Computer Science Student'];
const h = new Date().getHours(); $('#greet').textContent = (h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening') + ', and welcome.';
let ri = 0, ci = 0, del = false; const typeEl = $('#type');
(function type() {
  if (!intro.isConnected || intro.classList.contains('out')) return;
  const w = roles[ri]; ci += del ? -1 : 1; typeEl.textContent = w.slice(0, ci);
  let d = del ? 35 : 80;
  if (!del && ci === w.length) { del = true; d = 1400; } else if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; d = 350; }
  setTimeout(type, calm ? 9999 : d);
})();
function enter(instant) {
  if (intro.classList.contains('out')) return;
  if (instant) intro.style.transition = 'none';
  intro.classList.add('out'); intro.setAttribute('aria-hidden', 'true'); intro.inert = true;
  body.classList.remove('intro-on'); body.classList.add('entered'); scrollTo(0, location.hash ? $(location.hash)?.offsetTop || 0 : 0);
}
$('#enter').addEventListener('click', () => enter()); $('#skip').addEventListener('click', () => enter());
if (location.hash) enter(true); else setTimeout(() => $('#enter').focus({ preventScroll: true }), 900);
addEventListener('wheel', e => { if (!intro.classList.contains('out') && e.deltaY > 30) enter(); }, { passive: true });
let ty; addEventListener('touchstart', e => ty = e.touches[0].clientY, { passive: true });
addEventListener('touchend', e => { if (!intro.classList.contains('out') && ty - e.changedTouches[0].clientY > 60) enter(); });

// Scroll progress, back to top, hero parallax
const bar = $('#bar'), up = $('#totop'), ring = $('#totop circle');
const onScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight, p = max > 0 ? scrollY / max : 0;
  bar.style.transform = `scaleX(${p})`; ring.style.strokeDashoffset = 132 - 132 * p; up.classList.toggle('show', scrollY > 600);
};
addEventListener('scroll', onScroll, { passive: true }); onScroll();
up.addEventListener('click', () => scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' }));
const hp = $('.hero-photo');
if (fine && !calm && hp) addEventListener('mousemove', e => { if (scrollY < innerHeight) hp.style.transform = `translate3d(${(e.clientX / innerWidth - .5) * -18}px,${(e.clientY / innerHeight - .5) * -12}px,0)`; });

// Custom cursor + magnetic buttons
if (fine && !calm) {
  const c = $('#cur'); let x = 0, y = 0, cx = 0, cy = 0;
  addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; c.classList.add('on'); });
  document.addEventListener('mouseleave', () => c.classList.remove('on'));
  (function loop() { cx += (x - cx) * .2; cy += (y - cy) * .2; c.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
  document.addEventListener('mouseover', e => c.classList.toggle('hot', !!e.target.closest('a,button,.tile,.tabs li,.chips li,.hex,input,textarea')));
  $$('.more,.enter,.totop,.lb-x,.lb-n').forEach(el => {
    el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .25}px)`; });
    el.addEventListener('mouseleave', () => el.style.transform = '');
  });
}

// Works: reveal, count-up, filter, tilt
const tiles = $$('.tile'), filt = $$('.filters button');
new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); } }), { threshold: .04 }).observe($('.works-head'));
const grid = $('.collage'); new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); countUp(); o.unobserve(e.target); } }), { threshold: .02 }).observe(grid);
filt.forEach(b => { const f = b.dataset.f; $('.count', b).dataset.to = f === 'all' ? tiles.length : tiles.filter(t => t.dataset.cat === f).length; });
$('#total').dataset.to = tiles.length;
function countUp() { $$('.count').forEach(el => { const to = +el.dataset.to, t0 = performance.now(); (function s(t) { const k = Math.min(1, (t - t0) / 900); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(s); })(t0); }); }
tiles.forEach(t => { const im = $('img', t); im.complete ? im.classList.add('ok') : im.addEventListener('load', () => im.classList.add('ok')); im.addEventListener('error', () => im.classList.add('ok'));
  if (fine && !calm) { t.addEventListener('mousemove', e => { const r = t.getBoundingClientRect(); t.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 7 + 'deg'); t.style.setProperty('--rx', ((e.clientY - r.top) / r.height - .5) * -7 + 'deg'); }); t.addEventListener('mouseleave', () => { t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg'); }); } });
filt.forEach(b => b.addEventListener('click', () => {
  filt.forEach(x => x.setAttribute('aria-pressed', x === b)); let i = 0;
  tiles.forEach(t => { const show = b.dataset.f === 'all' || t.dataset.cat === b.dataset.f; t.classList.toggle('hide', !show); t.classList.remove('pop'); if (show) { void t.offsetWidth; t.style.setProperty('--d', Math.min(i++, 14) * 40 + 'ms'); t.classList.add('pop'); } });
}));

// Lightbox
const lb = $('#lb'), li = $('#lb-img'), frame = $('.lb-frame', lb); let cur = 0, from = null, tok = 0;
const vis = () => tiles.filter(t => !t.classList.contains('hide'));
function show(i) {
  const v = vis(); cur = (i + v.length) % v.length; const t = v[cur], im = $('img', t), my = ++tok;
  li.src = im.src; li.alt = im.alt; frame.classList.remove('z'); frame.style.setProperty('--z', 1);
  const f = new Image(); f.onload = () => { if (my === tok) li.src = f.src; }; f.src = im.dataset.full;
  $('#lb-cat').textContent = t.dataset.label; $('#lb-title').textContent = t.dataset.title; $('#lb-count').textContent = `${cur + 1} / ${v.length}`;
  $('#lb-open').href = im.dataset.full;
  [1, -1].forEach(d => { new Image().src = $('img', v[(cur + d + v.length) % v.length]).dataset.full; });
}
function open(t) { from = t; show(vis().indexOf(t)); lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); body.classList.add('lbopen'); $('#lb-x').focus(); }
function close() { if (document.fullscreenElement) document.exitFullscreen(); lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); body.classList.remove('lbopen'); from && from.focus({ preventScroll: true }); }
tiles.forEach(t => { t.addEventListener('click', () => open(t)); t.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(t); } }); });
$('#lb-x').addEventListener('click', close); $('.lb-bg').addEventListener('click', close);
$('.prev', lb).addEventListener('click', () => show(cur - 1)); $('.next', lb).addEventListener('click', () => show(cur + 1));
frame.addEventListener('click', e => { const z = frame.classList.toggle('z'); frame.style.setProperty('--z', z ? 2.2 : 1); });
frame.addEventListener('mousemove', e => { if (!frame.classList.contains('z')) return; const r = frame.getBoundingClientRect(); frame.style.setProperty('--ox', (e.clientX - r.left) / r.width * 100 + '%'); frame.style.setProperty('--oy', (e.clientY - r.top) / r.height * 100 + '%'); });
const fs = $('#lb-fs'); if (!lb.requestFullscreen) fs.hidden = true; else fs.addEventListener('click', () => document.fullscreenElement ? document.exitFullscreen() : lb.requestFullscreen());
let sx; lb.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
lb.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 50) show(cur + (d < 0 ? 1 : -1)); });

// Keyboard: lightbox controls + 1-9 section jumps
addEventListener('keydown', e => {
  if (lb.classList.contains('open')) {
    if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') show(cur + 1); else if (e.key === 'ArrowLeft') show(cur - 1);
    else if (e.key === 'Tab') { const f = $$('button:not([hidden]),a[href]', lb), a = document.activeElement; if (e.shiftKey && a === f[0]) { e.preventDefault(); f.at(-1).focus(); } else if (!e.shiftKey && a === f.at(-1)) { e.preventDefault(); f[0].focus(); } }
    return;
  }
  if (body.classList.contains('intro-on')) { if (e.key === 'Enter' && document.activeElement.id !== 'skip') enter(); return; }
  if (/INPUT|TEXTAREA/.test(document.activeElement.tagName) || e.ctrlKey || e.metaKey || e.altKey) return;
  const s = $$('section')[+e.key - 1]; if (s) s.scrollIntoView({ behavior: calm ? 'auto' : 'smooth' });
});

// Contact form -> opens the visitor's email app
$('#msg').addEventListener('submit', e => {
  e.preventDefault(); const f = new FormData(e.target);
  location.href = `mailto:Edison17Ph@gmail.com?subject=${encodeURIComponent('Portfolio message from ' + f.get('n'))}&body=${encodeURIComponent(f.get('m') + '\n\nFrom: ' + f.get('n') + ' (' + f.get('e') + ')')}`;
  toast('Opening your email app…');
});

// Friendly tab title
const t0 = document.title; document.addEventListener('visibilitychange', () => document.title = document.hidden ? 'Come back soon! | Edison' : t0);
})();
