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
