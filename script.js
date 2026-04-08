// ─── Animated Canvas Demo ─────────────────────────────────────────────────
function initCarDemo() {
  const canvas = document.getElementById('carDemoCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Resize canvas to container
  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // ── Particles (molecules) ──
  const particles = [];
  class Particle {
    constructor(x, y, type) {
      this.x = x; this.y = y; this.type = type; // 'water','h2','o2'
      this.vx = (Math.random() - 0.5) * 1.2;
      this.vy = -Math.random() * 1.5 - 0.5;
      this.alpha = 1;
      this.r = type === 'water' ? 7 : 5;
      this.life = 1;
    }
    update() {
      this.x  += this.vx;
      this.y  += this.vy;
      this.vy += 0.03;
      this.life -= 0.012;
      this.alpha = this.life;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      if (this.type === 'water') {
        ctx.fillStyle = '#06b6d4';
        ctx.shadowColor = '#06b6d4'; ctx.shadowBlur = 8;
      } else if (this.type === 'h2') {
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981'; ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 6;
      }
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha * 0.9);
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${this.r * 1.3}px Lexend,sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(this.type === 'water' ? 'H₂O' : this.type === 'h2' ? 'H₂' : 'O₂', this.x, this.y);
      ctx.restore();
    }
  }

  // ── Car state ──
  let carX = 0;
  let carSpeed = 0;
  let exhaust = [];
  let frame = 0;
  let running = false;

  const startBtn = document.getElementById('demoStartBtn');
  const statusEl = document.getElementById('demoStatus');
  const speedEl  = document.getElementById('demoSpeed');
  const rangeEl  = document.getElementById('demoRange');
  let range = 520;

  startBtn?.addEventListener('click', () => {
    running = !running;
    if (running) {
      startBtn.textContent = '⏸  Pause';
      startBtn.classList.add('active');
      carX = carX || 80;
    } else {
      startBtn.textContent = '▶  Start Engine';
      startBtn.classList.remove('active');
    }
  });

  // ── Draw helpers ──
  function drawRoad(W, H) {
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
    sky.addColorStop(0, '#040d18');
    sky.addColorStop(1, '#071826');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H * 0.55);
    // Ground
    ctx.fillStyle = '#0d1520';
    ctx.fillRect(0, H * 0.55, W, H * 0.45);
    // Road surface
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, H * 0.6, W, H * 0.32);
    // Road lines
    ctx.strokeStyle = 'rgba(248,250,252,0.15)';
    ctx.lineWidth = 3;
    ctx.setLineDash([40, 30]);
    ctx.lineDashOffset = -(frame % 70);
    ctx.beginPath();
    ctx.moveTo(0, H * 0.76); ctx.lineTo(W, H * 0.76);
    ctx.stroke();
    ctx.setLineDash([]);
    // Horizon line
    ctx.strokeStyle = 'rgba(6,182,212,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.6); ctx.lineTo(W, H * 0.6);
    ctx.stroke();
  }

  function drawWaterTank(W, H) {
    const tx = 28, ty = H * 0.08, tw = 60, th = 80;
    // Tank body
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1.5;
    roundRect(ctx, tx, ty, tw, th, 8);
    ctx.fill(); ctx.stroke();
    // Water fill (animated level)
    const level = 0.55 + Math.sin(frame * 0.04) * 0.05;
    ctx.fillStyle = 'rgba(6,182,212,0.18)';
    roundRect(ctx, tx + 2, ty + th * (1 - level), tw - 4, th * level - 2, 0, 0, 6, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(6,182,212,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tx + 2, ty + th * (1 - level));
    ctx.lineTo(tx + tw - 2, ty + th * (1 - level));
    ctx.stroke();
    // Label
    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 9px Lexend,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('H₂O', tx + tw / 2, ty + th / 2 + 4);
    ctx.fillStyle = '#64748b';
    ctx.font = '8px DM Sans,sans-serif';
    ctx.fillText('TANK', tx + tw / 2, ty + th / 2 + 16);
    // Pipe to chamber
    if (running) {
      ctx.strokeStyle = 'rgba(6,182,212,0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(tx + tw, ty + th * 0.6);
      ctx.lineTo(tx + tw + 30, ty + th * 0.6);
      ctx.stroke();
    }
  }

  function drawChamber(W, H) {
    const cx = 118, cy = H * 0.08, cw = 72, ch = 80;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = running ? '#f59e0b' : '#334155';
    ctx.lineWidth = 1.5;
    roundRect(ctx, cx, cy, cw, ch, 8); ctx.fill(); ctx.stroke();
    if (running) {
      ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 12;
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.5;
      roundRect(ctx, cx, cy, cw, ch, 8); ctx.stroke();
      ctx.shadowBlur = 0;
    }
    // Electrode rods
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(cx + 22, cy + 12, 6, 40);
    ctx.fillRect(cx + 44, cy + 12, 6, 40);
    ctx.fillStyle = '#f59e0b'; ctx.fillRect(cx + 18, cy + 8, 14, 7);
    ctx.fillStyle = '#ef4444'; ctx.fillRect(cx + 40, cy + 8, 14, 7);
    // Bubbles
    if (running) {
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = `rgba(6,182,212,${0.2 + Math.sin(frame * 0.1 + i) * 0.1})`;
        ctx.beginPath();
        ctx.arc(cx + 28 + i * 8, cy + 50 + Math.sin(frame * 0.15 + i * 2) * 6, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Label
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 8px Lexend,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ SPLIT', cx + cw / 2, cy + ch - 12);
    ctx.fillStyle = '#64748b';
    ctx.font = '7px DM Sans,sans-serif';
    ctx.fillText('nano-catalyst', cx + cw / 2, cy + ch - 2);
  }

  function drawCar(W, H) {
    const cw = W * 0.28, ch = cw * 0.4;
    const cx = carX;
    const cy = H * 0.6 - ch - 2;
    ctx.save();
    // Body
    const grad = ctx.createLinearGradient(cx, cy, cx, cy + ch);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    roundRect(ctx, cx, cy + ch * 0.35, cw, ch * 0.65, 8); ctx.fill(); ctx.stroke();
    // Cabin
    ctx.fillStyle = '#1e3a5f';
    ctx.strokeStyle = '#334155';
    roundRect(ctx, cx + cw * 0.18, cy, cw * 0.6, ch * 0.5, 6, 6, 0, 0); ctx.fill(); ctx.stroke();
    // Windshield
    ctx.fillStyle = 'rgba(6,182,212,0.12)';
    roundRect(ctx, cx + cw * 0.21, cy + 2, cw * 0.54, ch * 0.42, 4, 4, 0, 0); ctx.fill();
    // Wheels
    [cx + cw * 0.18, cx + cw * 0.78].forEach(wx => {
      const wy = cy + ch;
      const spin = running ? frame * 0.15 : 0;
      ctx.fillStyle = '#0a0e1a'; ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(wx, wy, ch * 0.28, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
      for (let s = 0; s < 4; s++) {
        const a = spin + (s / 4) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wx + Math.cos(a) * ch * 0.18, wy + Math.sin(a) * ch * 0.18);
        ctx.stroke();
      }
      ctx.fillStyle = '#06b6d4'; ctx.beginPath(); ctx.arc(wx, wy, ch * 0.07, 0, Math.PI * 2); ctx.fill();
    });
    // WATERFLASH label on car
    ctx.fillStyle = 'rgba(6,182,212,0.15)';
    roundRect(ctx, cx + cw * 0.32, cy + ch * 0.46, cw * 0.36, ch * 0.22, 4); ctx.fill();
    ctx.fillStyle = '#06b6d4';
    ctx.font = `bold ${cw * 0.045}px Lexend,sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('WATERFLASH™', cx + cw * 0.5, cy + ch * 0.6);
    // Headlights
    ctx.fillStyle = 'rgba(255,255,200,0.7)';
    ctx.beginPath(); ctx.ellipse(cx + cw * 0.96, cy + ch * 0.52, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
    if (running) {
      ctx.fillStyle = 'rgba(255,255,200,0.08)';
      ctx.beginPath(); ctx.moveTo(cx + cw, cy + ch * 0.52);
      ctx.lineTo(cx + cw + 60, cy + ch * 0.3);
      ctx.lineTo(cx + cw + 60, cy + ch * 0.75);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    return { cx, cy, cw, ch };
  }

  function drawExhaust(car) {
    if (!running) return;
    // Add steam puff
    if (frame % 8 === 0) {
      exhaust.push({ x: car.cx + 4, y: car.cy + car.ch * 0.85, r: 4, alpha: 0.5, vx: -1.2, vy: -0.4 });
    }
    exhaust = exhaust.filter(p => p.alpha > 0);
    exhaust.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.r += 0.3; p.alpha -= 0.012;
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = 'rgba(200,230,255,0.6)';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
    // Exhaust label
    if (exhaust.length > 2) {
      ctx.fillStyle = 'rgba(148,163,184,0.7)';
      ctx.font = '8px DM Sans,sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('H₂O vapor only', car.cx - 70, car.cy + car.ch * 0.78);
    }
  }

  function drawHUD(W, H) {
    const spd = running ? Math.min(140, Math.round(carSpeed * 18)) : 0;
    if (speedEl) speedEl.textContent = spd;
    if (rangeEl && running) { range = Math.max(0, range - 0.02); rangeEl.textContent = Math.round(range); }
    if (statusEl) statusEl.textContent = running ? (spd > 50 ? 'Running on water — 0g CO₂' : 'Warming up...') : 'Engine off';
    // Particles from chamber
    if (running && frame % 5 === 0) {
      const bx = 154, by = (canvas.height * 0.08) + 50;
      particles.push(new Particle(bx, by, 'water'));
      if (frame % 10 === 0) {
        particles.push(new Particle(bx + 20, by - 10, 'h2'));
        particles.push(new Particle(bx - 10, by - 5, 'o2'));
      }
    }
    particles.forEach(p => { p.update(); p.draw(); });
    const dead = particles.filter(p => p.life <= 0);
    dead.forEach(p => particles.splice(particles.indexOf(p), 1));
  }

  function drawArrows(W, H) {
    if (!running) return;
    // Water tank → chamber
    const pulse = (frame % 30) / 30;
    ctx.strokeStyle = `rgba(6,182,212,${0.3 + pulse * 0.4})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.lineDashOffset = -(frame % 12);
    ctx.beginPath();
    ctx.moveTo(88, H * 0.08 + 48);
    ctx.lineTo(118, H * 0.08 + 48);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function roundRect(ctx, x, y, w, h, tl = 8, tr = 8, br = 8, bl = 8) {
    ctx.beginPath();
    ctx.moveTo(x + tl, y);
    ctx.lineTo(x + w - tr, y); ctx.arcTo(x + w, y, x + w, y + tr, tr);
    ctx.lineTo(x + w, y + h - br); ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
    ctx.lineTo(x + bl, y + h); ctx.arcTo(x, y + h, x, y + h - bl, bl);
    ctx.lineTo(x, y + tl); ctx.arcTo(x, y, x + tl, y, tl);
    ctx.closePath();
  }

  // ── Main loop ──
  function loop() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    drawRoad(W, H);
    drawWaterTank(W, H);
    drawChamber(W, H);
    drawArrows(W, H);
    const car = drawCar(W, H);
    drawExhaust(car);
    drawHUD(W, H);
    if (running) {
      carSpeed = Math.min(7.8, carSpeed + 0.04);
      carX += carSpeed;
      // Loop: when car exits right side, reset to left and re-enter
      if (carX > W + W * 0.3) {
        carX = -W * 0.3;
        exhaust = [];
      }
    } else {
      carSpeed = Math.max(0, carSpeed - 0.08);
    }
    frame++;
    requestAnimationFrame(loop);
  }
  loop();
}

// ─── Navbar scroll effect ───────────────────────────────────────────────────
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ─── Mobile hamburger menu ───────────────────────────────────────────────────
const hamburger = document.querySelector('.hamburger');
const navLinks  = document.querySelector('.nav-links');
hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('mobile-open');
});

// ─── Animated stat counters ──────────────────────────────────────────────────
function animateCounter(el, target, suffix = '', duration = 1800) {
  const start     = performance.now();
  const isDecimal = String(target).includes('.');
  el.textContent  = '0' + suffix;

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const value    = eased * target;
    el.textContent = (isDecimal ? value.toFixed(1) : Math.floor(value)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ─── Intersection Observer — scroll-reveal + counter trigger ────────────────
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// Counter observer (fires once when the stats block enters view)
const statsBlock = document.querySelector('.hero-stats');
if (statsBlock) {
  const counterObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      counterObserver.disconnect();
      document.querySelectorAll('[data-count]').forEach((el) => {
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, suffix);
      });
    },
    { threshold: 0.5 }
  );
  counterObserver.observe(statsBlock);
}

// Roadmap step counter observer
const roadmapSection = document.querySelector('.roadmap-section');
if (roadmapSection) {
  const roadmapObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      roadmapObserver.disconnect();
      document.querySelectorAll('[data-rcount]').forEach((el) => {
        const target = parseFloat(el.dataset.rcount);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, suffix, 1200);
      });
    },
    { threshold: 0.2 }
  );
  roadmapObserver.observe(roadmapSection);
}

// ─── Active nav link highlight on scroll ────────────────────────────────────
const sections = document.querySelectorAll('section[id], header[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navAnchors.forEach((a) => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        active?.classList.add('active');
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach((s) => sectionObserver.observe(s));

// ─── Smooth scroll for all anchor links ─────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // close mobile menu if open
    hamburger?.classList.remove('open');
    navLinks?.classList.remove('mobile-open');
  });
});

// ─── Init canvas demo ────────────────────────────────────────────────────────
initCarDemo();
