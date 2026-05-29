/* ============================================================
   KNDI Restyle — motion logic
   ============================================================ */
(() => {
  const $  = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const lerp  = (a, b, t) => a + (b - a) * t;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Custom slash cursor ---------- */
  const cursor   = $('#cursor');
  const trail1   = $('#cursor-t1');
  const trail2   = $('#cursor-t2');
  const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const cur   = { x: mouse.x, y: mouse.y };
  const t1    = { x: mouse.x, y: mouse.y };
  const t2    = { x: mouse.x, y: mouse.y };

  if (!matchMedia('(pointer: coarse)').matches) {
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX; mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => { cursor.style.opacity = 0; });
    window.addEventListener('mouseenter', () => { cursor.style.opacity = 1; });

    // Hover state on interactive elements
    $$('a, button, [data-magnetic], .client-cell').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });

    function tickCursor() {
      cur.x = lerp(cur.x, mouse.x, 0.32);
      cur.y = lerp(cur.y, mouse.y, 0.32);
      t1.x  = lerp(t1.x, cur.x, 0.18);
      t1.y  = lerp(t1.y, cur.y, 0.18);
      t2.x  = lerp(t2.x, t1.x, 0.18);
      t2.y  = lerp(t2.y, t1.y, 0.18);
      cursor.style.transform = `translate(${cur.x}px, ${cur.y}px) translate(-50%, -50%) skewX(-18deg)`;
      trail1.style.transform = `translate(${t1.x}px, ${t1.y}px) translate(-50%, -50%) skewX(-18deg)`;
      trail2.style.transform = `translate(${t2.x}px, ${t2.y}px) translate(-50%, -50%) skewX(-18deg)`;
      requestAnimationFrame(tickCursor);
    }
    requestAnimationFrame(tickCursor);
  }

  /* ---------- Magnetic buttons ---------- */
  $$('[data-magnetic]').forEach(el => {
    let raf = 0;
    const strength = 0.35;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
    });
    el.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      el.style.transform = '';
    });
  });

  /* ---------- Header scrolled state ---------- */
  const header = $('#header');

  /* ---------- Top scroll progress ---------- */
  const scrollbar = $('#scrollbar');

  /* ---------- Side index ---------- */
  const sideIndex = $('#sideIndex');
  const sideLinks = $$('#sideIndex a');
  const sections  = $$('section[id]');

  /* ---------- BG-driven side index color ---------- */
  function applyBgIndex() {
    let dark = false, white = false;
    const vy = window.innerHeight / 2;
    for (const sec of $$('[data-bg]')) {
      const r = sec.getBoundingClientRect();
      if (r.top <= vy && r.bottom > vy) {
        const bg = sec.dataset.bg;
        dark  = bg === 'black';
        white = bg === 'white';
        break;
      }
    }
    sideIndex.classList.toggle('on-dark', dark);
    sideIndex.classList.toggle('on-white', white);
    document.body.classList.toggle('on-dark', dark);

    // cursor on dark: invert
    if (cursor) {
      cursor.style.background = dark ? '#FFB600' : '#000';
      cursor.style.mixBlendMode = dark ? 'normal' : 'difference';
    }
  }

  /* ---------- Active side index ---------- */
  function activeSection() {
    const vy = window.innerHeight * 0.4;
    let active = null;
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      if (r.top <= vy && r.bottom > vy) { active = s.id; break; }
    }
    sideLinks.forEach(a => a.classList.toggle('active', a.dataset.target === active));
  }

  /* ---------- Hero display horizontal parallax ---------- */
  const heroLines = $$('.hero-display [data-scroll-x]');
  const hero = $('#hero');
  const heroPhoto = $('.hero-photo');
  const heroPhotoImg = $('.hero-photo img');

  /* ---------- Background slashes (hero) ---------- */
  const bgSlashes = $('#bgSlashes');
  if (bgSlashes && !reduced) {
    const N = 22;
    for (let i = 0; i < N; i++) {
      const s = document.createElement('span');
      const h = 60 + Math.random() * 280;
      const left = Math.random() * 100;
      const top  = Math.random() * 100;
      s.style.left = left + '%';
      s.style.top  = top + '%';
      s.style.height = h + 'px';
      s.dataset.speed = (0.05 + Math.random() * 0.35).toFixed(2);
      bgSlashes.appendChild(s);
    }
  }

  /* ---------- About — word reveal ---------- */
  const aboutEl = $('#aboutReveal');
  const aboutBar = $('#aboutBar');
  function buildAboutText() {
    if (!aboutEl) return;
    const raw = aboutEl.dataset.text;
    // ❘...❘ marks italic accent run
    const parts = raw.split('❘');
    aboutEl.innerHTML = '';
    parts.forEach((chunk, idx) => {
      const isAccent = idx % 2 === 1;
      const words = chunk.trim().split(/\s+/);
      words.forEach(w => {
        if (!w) return;
        const span = document.createElement('span');
        span.className = 'word' + (isAccent ? ' accent' : '');
        span.textContent = w;
        aboutEl.appendChild(span);
        aboutEl.appendChild(document.createTextNode(' '));
      });
    });
  }
  buildAboutText();
  const aboutWords = $$('.about-reveal .word');

  /* ---------- Quote — word reveal ---------- */
  const quoteEl = $('#quote');
  function buildQuoteText() {
    if (!quoteEl) return;
    const raw = '“' + quoteEl.dataset.text + '”';
    const words = raw.split(/\s+/);
    quoteEl.innerHTML = '';
    words.forEach(w => {
      if (!w) return;
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = w;
      quoteEl.appendChild(span);
      quoteEl.appendChild(document.createTextNode(' '));
    });
  }
  buildQuoteText();
  const quoteWords = $$('.quote .word');

  /* ---------- CV horizontal pin ---------- */
  const cvStack = $('#cvStack');
  const cvTrack = $('#cvTrack');
  const cvProgress = $('#cvProgress');
  const cvCount = $('#cvCount');
  const cvItems = $$('.cv-item');

  /* ---------- Reveal-on-scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
  $$('.r-up').forEach(el => io.observe(el));

  /* ---------- Service card stacking depth ---------- */
  $$('.service-card').forEach((card, i, arr) => {
    card.style.top = `calc(16vh + ${i * 14}px)`;
    card.style.zIndex = String(i + 1);
  });

  /* ---------- Main scroll handler ---------- */
  function onScroll() {
    const y  = window.scrollY;
    const vh = window.innerHeight;
    const docH = document.documentElement.scrollHeight - vh;

    // Top progress
    scrollbar.style.transform = `scaleX(${clamp(y / docH, 0, 1)})`;

    // Header
    header.classList.toggle('scrolled', y > 80);

    // Hero parallax — horizontal display
    const heroR = hero.getBoundingClientRect();
    const heroProg = clamp(-heroR.top / vh, 0, 1.5);
    heroLines.forEach(line => {
      const max = parseFloat(line.dataset.scrollX);
      line.style.transform = `translateX(${max * heroProg}px)`;
    });

    // Hero photo subtle parallax
    if (heroPhoto) heroPhoto.style.transform = `translateY(${heroProg * -60}px)`;
    if (heroPhotoImg) heroPhotoImg.style.transform = `translateY(${heroProg * 30}px) scale(1.05)`;

    // Hero bg slashes parallax
    if (bgSlashes) {
      $$('#bgSlashes span').forEach(s => {
        const sp = parseFloat(s.dataset.speed);
        s.style.transform = `translateY(${-y * sp}px) skewX(-18deg)`;
      });
    }

    // About — word reveal driven by stack progress
    const aboutStack = $('.about-stack');
    if (aboutStack && aboutWords.length) {
      const r = aboutStack.getBoundingClientRect();
      // active range: from when stack top hits 0 until stack bottom hits 100vh
      const total = r.height - vh;
      const local = clamp(-r.top / total, 0, 1);
      const n = aboutWords.length;
      const lit = Math.floor(local * (n + 4)); // small lead-out
      aboutWords.forEach((w, i) => w.classList.toggle('lit', i < lit));
      if (aboutBar) aboutBar.style.transform = `scaleX(${local})`;
    }

    // CV horizontal pin scroll
    if (cvStack && cvTrack) {
      const r = cvStack.getBoundingClientRect();
      const total = r.height - vh;
      const local = clamp(-r.top / total, 0, 1);
      const trackW = cvTrack.scrollWidth;
      const maxX = Math.max(0, trackW - window.innerWidth);
      cvTrack.style.transform = `translate3d(${-maxX * local}px, 0, 0)`;
      if (cvProgress) cvProgress.style.transform = `scaleX(${local})`;
      if (cvCount) {
        const idx = clamp(Math.floor(local * cvItems.length) + 1, 1, cvItems.length);
        cvCount.textContent = String(idx).padStart(2, '0') + ' / ' + String(cvItems.length).padStart(2, '0');
      }
    }

    // Quote — reveal as it enters
    if (quoteWords.length) {
      const r = quoteEl.getBoundingClientRect();
      // active: from when top of quote is at 80vh until top is at 10vh
      const start = vh * 0.85;
      const end   = vh * 0.15;
      const t = clamp((start - r.top) / (start - end), 0, 1);
      const n = quoteWords.length;
      const lit = Math.floor(t * (n + 3));
      quoteWords.forEach((w, i) => w.classList.toggle('lit', i < lit));
    }

    applyBgIndex();
    activeSection();
  }

  let ticking = false;
  function requestScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => { onScroll(); ticking = false; });
    }
  }
  window.addEventListener('scroll', requestScroll, { passive: true });
  window.addEventListener('resize', requestScroll);
  onScroll();

  /* ---------- Contact form ---------- */
  const form = $('#contactForm');
  const success = $('#contactSuccess');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.style.transition = 'opacity .35s, transform .35s';
      form.style.opacity = 0;
      form.style.transform = 'translateY(20px)';
      setTimeout(() => {
        form.hidden = true;
        success.hidden = false;
        requestAnimationFrame(() => success.classList.add('in'));
      }, 380);
    });
  }

  /* ---------- Smooth scroll for anchors ---------- */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const rect = target.getBoundingClientRect();
      const top = rect.top + window.scrollY - (id === 'hero' ? 0 : 0);
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    });
  });
})();
