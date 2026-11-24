// Menu
const burger = document.getElementById('burger'), overlay = document.getElementById('overlay');
const setMenu = open => { overlay.classList.toggle('open', open); burger.classList.toggle('x', open); burger.setAttribute('aria-expanded', open); document.body.classList.toggle('lock', open); };
burger.addEventListener('click', () => setMenu(!overlay.classList.contains('open')));
overlay.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

// Active section dots + reveal
const secs = [...document.querySelectorAll('section')];
const dots = [...document.querySelectorAll('#dots a')];
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) {
    dots.forEach(d => d.classList.toggle('on', d.getAttribute('href') === '#' + e.target.id));
    document.body.dataset.tone = e.target.classList.contains('dark') ? 'dark' : 'light';
  }
}), { rootMargin: '-45% 0px -50% 0px' });
secs.forEach(s => spy.observe(s));
const rev = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('seen'); rev.unobserve(e.target); } }), { threshold: .15 });
secs.forEach(s => rev.observe(s));

// Interests tabs
const tabs = document.querySelectorAll('#tabs li');
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => x.classList.remove('on')); t.classList.add('on');
  document.getElementById('i-title').textContent = t.dataset.a;
  document.getElementById('i-sub').textContent = t.dataset.b;
}));

// Photo fallback (shows silhouette until assets/images/photo.jpg exists)
const photo = document.getElementById('photo');
const showPh = () => { photo.style.display = 'none'; document.getElementById('ph').style.display = 'grid'; };
photo.addEventListener('error', showPh); if (photo.complete && !photo.naturalWidth) showPh();

document.getElementById('yr').textContent = new Date().getFullYear();
