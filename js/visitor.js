/* visitor.js - visitor counter in the footer.
   Default = "local mode": counts visits from THIS browser only (honest, no third party).
   For a real shared total, paste a counter URL below (see README / chat notes). */
(() => {
  const COUNTER_UP_URL = ''; // e.g. 'https://api.counterapi.dev/v2/YOUR-WORKSPACE/portfolio-visits/up'
  const API_KEY = '';        // only if your counter requires one. Anything here is PUBLIC in the browser.

  const box = document.getElementById('vc-digits'); if (!box) return;
  const label = document.getElementById('vc-label'), note = document.getElementById('vc-note');
  const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const counted = sessionStorage.getItem('vc-counted') === '1';

  const render = n => { const s = String(Math.max(0, Math.round(n))).padStart(4, '0'); box.replaceChildren(...[...s].map(c => Object.assign(document.createElement('i'), { textContent: c }))); box.setAttribute('aria-label', 'Count: ' + Math.round(n)); };
  const animate = to => { if (calm) return render(to); const t0 = performance.now(); (function f(t) { const k = Math.min(1, (t - t0) / 1200); render(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0); };
  const show = (to, global) => {
    label.textContent = global ? 'Visitors' : 'Your visits'; note.textContent = global ? 'Total portfolio views' : 'Counted on this device';
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); animate(to); } }).observe(box);
  };
  function local() {
    let n = +localStorage.getItem('vc-local') || 0;
    if (!counted) { n++; try { localStorage.setItem('vc-local', n); } catch {} }
    sessionStorage.setItem('vc-counted', '1'); show(n, false);
  }
  render(0);
  if (!COUNTER_UP_URL) return local();
  const url = counted ? COUNTER_UP_URL.replace(/\/up\/?$/, '') : COUNTER_UP_URL, ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 6000);
  fetch(url, { signal: ctl.signal, headers: API_KEY ? { Authorization: 'Bearer ' + API_KEY } : {} })
    .then(r => { if (!r.ok) throw 0; return r.json(); })
    .then(j => { const n = j.value ?? j.data?.up_count ?? j.count ?? j.Count; if (typeof n !== 'number') throw 0; sessionStorage.setItem('vc-counted', '1'); show(n, true); })
    .catch(local).finally(() => clearTimeout(to));
})();
