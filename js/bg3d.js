/* bg3d.js - interactive 3D point-sphere backgrounds (plain canvas, no libraries).
   Reacts to the pointer, pulses on click, pauses when off-screen, static if reduced motion. */
(() => {
  const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  function init(sel, o) {
    const sec = document.querySelector(sel); if (!sec) return;
    const cv = document.createElement('canvas'); cv.className = 'bg3d'; cv.setAttribute('aria-hidden', 'true');
    const ctx = cv.getContext('2d'); if (!ctx) return; sec.prepend(cv);
    const N = innerWidth < 700 ? 44 : 84, P = [];
    for (let i = 0; i < N; i++) { const y = 1 - 2 * (i + .5) / N, r = Math.sqrt(1 - y * y), a = i * 2.399963; P.push([Math.cos(a) * r, y, Math.sin(a) * r]); }
    let W, H, ang = 0, ax = 0, ay = 0, tx = 0, ty = 0, px = -999, py = -999, pulse = 0, vis = false, raf = 0;
    const size = () => { const d = Math.min(devicePixelRatio || 1, 2); W = sec.clientWidth; H = sec.clientHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); if (!vis || calm) draw(); };
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const R = Math.min(W, H) * (W < 700 ? .42 : .3) * (1 + pulse * .18), cx = W * (W < 700 ? .5 : o.x), cy = H * .5;
      const ya = ang + ax, xa = .35 + ay, cY = Math.cos(ya), sY = Math.sin(ya), cX = Math.cos(xa), sX = Math.sin(xa), Q = [];
      for (const [x, y, z] of P) {
        const x1 = x * cY + z * sY, z1 = -x * sY + z * cY, y1 = y * cX - z1 * sX, z2 = y * sX + z1 * cX, s = 2.4 / (2.4 - z2);
        Q.push([x1, y1, z2, cx + x1 * R * s, cy + y1 * R * s, s]);
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
        const a = Q[i], b = Q[j], d = (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
        if (d < .42) { ctx.strokeStyle = `rgba(${o.rgb},${(1 - d / .42) * o.line * (a[5] + b[5]) / 2.4})`; ctx.beginPath(); ctx.moveTo(a[3], a[4]); ctx.lineTo(b[3], b[4]); ctx.stroke(); }
      }
      for (const q of Q) {
        const near = Math.hypot(q[3] - px, q[4] - py) < 110, k = near ? 1.9 : 1;
        ctx.fillStyle = `rgba(${o.rgb},${Math.min(1, o.dot * (q[2] + 1.6) / 2.2 * k)})`;
        ctx.beginPath(); ctx.arc(q[3], q[4], 2.2 * q[5] * k, 0, 6.2832); ctx.fill();
      }
    }
    function loop() { if (!vis) return; ang += .0028; ax += (tx - ax) * .05; ay += (ty - ay) * .05; pulse *= .93; draw(); raf = requestAnimationFrame(loop); }
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis && !calm) { cancelAnimationFrame(raf); loop(); } }, { threshold: 0 }).observe(sec);
    new ResizeObserver(size).observe(sec); size();
    if (calm) return;
    sec.addEventListener('pointermove', e => { const r = sec.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; tx = (px / r.width - .5) * 1.2; ty = (py / r.height - .5) * .6; });
    sec.addEventListener('pointerleave', () => { px = py = -999; tx = ty = 0; });
    sec.addEventListener('pointerdown', () => pulse = 1);
  }
  init('#skills', { x: .5, rgb: '43,44,48', dot: .5, line: .2 });
  init('#contact', { x: .5, rgb: '255,255,255', dot: .5, line: .18 });
})();
