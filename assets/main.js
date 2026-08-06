/* ============================================================
   SONES · PSD 2026-2030 — Interactions
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Scroll progress + navbar ---------- */
  const nav = document.getElementById('nav');
  const progress = document.getElementById('scrollProgress');

  function onScroll() {
    const st = window.scrollY || document.documentElement.scrollTop;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (st / h) * 100 : 0) + '%';
    nav.classList.toggle('scrolled', st > 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  toggle.addEventListener('click', function () {
    links.classList.toggle('open');
    toggle.classList.toggle('open');
  });
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('open');
      toggle.classList.remove('open');
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(function (el) { revObs.observe(el); });

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dur = 1600;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.floor(eased * target);
      el.textContent = val.toLocaleString('fr-FR') + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString('fr-FR') + suffix;
    }
    requestAnimationFrame(tick);
  }
  const countObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        animateCount(e.target);
        countObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(function (el) { countObs.observe(el); });

  /* ---------- Timeline accordion ---------- */
  document.querySelectorAll('.tl-head').forEach(function (head) {
    head.addEventListener('click', function () {
      const step = head.closest('.tl-step');
      const wasOpen = step.classList.contains('is-open');
      document.querySelectorAll('.tl-step').forEach(function (s) { s.classList.remove('is-open'); });
      if (!wasOpen) step.classList.add('is-open');
    });
  });

  /* ---------- Cadre à enrichir : accordéon (dépliage indépendant) ---------- */
  document.querySelectorAll('.acc-head').forEach(function (head) {
    head.addEventListener('click', function () {
      head.closest('.acc-item').classList.toggle('is-open');
    });
  });

  /* ---------- Active nav link ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__links a');
  const spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        const id = e.target.getAttribute('id');
        navLinks.forEach(function (l) {
          l.classList.toggle('active', l.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(function (s) { spy.observe(s); });

  /* ---------- Hero bubbles (canvas) ---------- */
  const canvas = document.getElementById('bubbles');
  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = canvas.getContext('2d');
    let w, h, bubbles, cx, surfaceY, srcHalf;

    function metrics() {
      cx = w / 2;
      const glassW = Math.min(780, Math.max(300, w * 0.58));
      const glassH = glassW * 444 / 1116;
      surfaceY = h - glassH * 0.72;   // water surface line inside the glass
      srcHalf = glassW * 0.30;        // emission spread across the surface
    }
    function newBubble() {
      const x = cx + (Math.random() * 2 - 1) * srcHalf;
      return {
        x: x, x0: x,
        y: surfaceY + Math.random() * 18,
        r: Math.random() * 3.2 + 1,
        sp: Math.random() * 0.75 + 0.35,
        drift: (Math.random() * 2 - 1) * 0.9,
        phase: Math.random() * Math.PI * 2,
        freq: 0.6 + Math.random() * 0.9
      };
    }
    function resize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      metrics();
      const count = Math.min(80, Math.floor(w / 15));
      bubbles = Array.from({ length: count }, function () {
        const b = newBubble();
        b.y = surfaceY - Math.random() * surfaceY;  // pre-fill the rising column
        return b;
      });
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      bubbles.forEach(function (b) {
        const travel = Math.max(0, (surfaceY - b.y) / (surfaceY + 1)); // 0 at glass -> 1 near top
        const alpha = 0.5 * (1 - travel * 0.92);
        if (alpha > 0.02) {
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r * (1 - travel * 0.35), 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(150, 225, 248, ' + alpha + ')';
          ctx.fill();
        }
        b.y -= b.sp;
        b.x = b.x0
            + Math.sin((surfaceY - b.y) * 0.01 * b.freq + b.phase) * (8 + travel * 55)
            + b.drift * travel * 45;
        if (b.y < h * 0.06 || alpha <= 0.02) {
          const nb = newBubble();
          b.x = nb.x; b.x0 = nb.x0; b.y = nb.y; b.r = nb.r;
          b.sp = nb.sp; b.drift = nb.drift; b.phase = nb.phase; b.freq = nb.freq;
        }
      });
      requestAnimationFrame(draw);
    }
    resize();
    draw();
    window.addEventListener('resize', resize);
  }

  /* ---------- Subtle parallax on hero orbs ---------- */
  const orbs = document.querySelectorAll('.orb');
  window.addEventListener('mousemove', function (e) {
    const cx = (e.clientX / window.innerWidth - 0.5);
    const cy = (e.clientY / window.innerHeight - 0.5);
    orbs.forEach(function (orb, i) {
      const depth = (i + 1) * 14;
      orb.style.transform = 'translate(' + cx * depth + 'px,' + cy * depth + 'px)';
    });
  });
})();
