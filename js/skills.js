/* skills.js - Skills section animations. Independent from script.js and extras.js.
   One IntersectionObserver, each target animates once, no scroll listeners. */
(() => {
  const sec = document.getElementById('skills');
  if (!sec) return;
  const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (calm || !('IntersectionObserver' in window)) return; // content stays visible, no motion

  const targets = [...sec.querySelectorAll('.box > h2, .box > .rule, .box > h3, .chips, .hexes')];
  targets.forEach(t => { if (!t.matches('.chips,.hexes')) t.dataset.sk = ''; });
  sec.querySelectorAll('.chips').forEach(ul => [...ul.children].forEach((li, i) => li.style.setProperty('--i', i)));
  sec.querySelectorAll('.hex-w').forEach((h, i) => h.style.setProperty('--i', i));
  sec.classList.add('sk-js');

  const io = new IntersectionObserver((entries, obs) => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('sk-in'); obs.unobserve(e.target); // once only
  }), { threshold: .2, rootMargin: '0px 0px -6% 0px' });
  targets.forEach(t => io.observe(t));

  // subtle pointer tilt on hexagons (mouse/pen only)
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    sec.querySelectorAll('.hex-w').forEach(h => {
      h.addEventListener('pointermove', e => {
        const r = h.getBoundingClientRect();
        h.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 14 + 'deg');
        h.style.setProperty('--rx', ((e.clientY - r.top) / r.height - .5) * -14 + 'deg');
      });
      h.addEventListener('pointerleave', () => { h.style.setProperty('--rx', '0deg'); h.style.setProperty('--ry', '0deg'); });
    });
  }
})();
