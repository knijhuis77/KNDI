/* ============================================================
   KNDI Restyle — refined motion logic
   ============================================================ */
(() => {
  const $  = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header scrolled state + on-dark ---------- */
  const header = $('#header');
  function updateHeader() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 40);

    // Detect section under the top edge (header area)
    let onDark = false;
    const probe = 40;
    for (const sec of $$('[data-bg]')) {
      const r = sec.getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) {
        onDark = sec.dataset.bg === 'dark';
        break;
      }
    }
    header.classList.toggle('on-dark', onDark);
  }

  /* ---------- Reveal-on-scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
  $$('.r-up').forEach(el => io.observe(el));

  /* ---------- Hero photo subtle parallax ---------- */
  const heroPhoto    = $('.hero-photo');
  const heroPhotoImg = $('.hero-photo img');
  const hero         = $('#hero');

  /* ---------- CV horizontal pinned timeline ---------- */
  const cvStack    = $('#cvStack');
  const cvTrack    = $('#cvTrack');
  const cvProgress = $('#cvProgress');
  const cvRailFill = $('#cvRailFill');
  const cvCount    = $('#cvCount');
  const cvItems    = $$('.cv-item');

  // Smooth (eased) progress for the timeline — adds a tiny inertia.
  let cvTargetT = 0;
  let cvT = 0;
  let cvRaf = 0;

  function computeCvTarget() {
    if (!cvStack || !cvTrack) return 0;
    const vh = window.innerHeight;
    const r  = cvStack.getBoundingClientRect();
    const total = r.height - vh;
    return clamp(-r.top / total, 0, 1);
  }

  function applyCvTransform() {
    if (!cvTrack) return;
    // Mobile / reduced: skip transform (CSS rules handle it).
    if (window.innerWidth <= 960 || reduced) {
      cvTrack.style.transform = '';
      if (cvProgress) cvProgress.style.transform = `scaleX(${cvTargetT})`;
      if (cvRailFill) cvRailFill.style.transform = `scaleX(${cvTargetT})`;
      return;
    }
    const vw = window.innerWidth;
    // Center the FIRST item at t=0 and the LAST item at t=1, so the timeline
    // opens with '96 in the middle (white) and ends with the final item centered
    // before the page is allowed to scroll on.
    const first = cvItems[0];
    const last  = cvItems[cvItems.length - 1];
    const c0 = first.offsetLeft + first.offsetWidth / 2;
    const cN = last.offsetLeft + last.offsetWidth / 2;
    const x0 = vw / 2 - c0;
    const x1 = vw / 2 - cN;
    const x  = x0 + (x1 - x0) * cvT;
    cvTrack.style.transform = `translate3d(${x}px, 0, 0)`;
    if (cvProgress) cvProgress.style.transform = `scaleX(${cvT})`;
    if (cvRailFill) {
      // Rail fills as the track moves; cap nicely
      cvRailFill.style.transform = `scaleX(${cvT})`;
    }

    // Active item — find item whose center is closest to viewport center
    const vc = vw / 2;
    let activeIdx = 0;
    let bestDist = Infinity;
    cvItems.forEach((item, i) => {
      const ir = item.getBoundingClientRect();
      const ic = ir.left + ir.width / 2;
      const d = Math.abs(ic - vc);
      if (d < bestDist) { bestDist = d; activeIdx = i; }
    });
    cvItems.forEach((item, i) => {
      item.classList.toggle('active', i === activeIdx);
      item.classList.toggle('passed', i < activeIdx);
    });
    if (cvCount) {
      cvCount.textContent = String(activeIdx + 1).padStart(2, '0') + ' / ' + String(cvItems.length).padStart(2, '0');
    }
  }

  function cvLoop() {
    // Lerp toward target for buttery inertia
    cvT += (cvTargetT - cvT) * 0.12;
    if (Math.abs(cvT - cvTargetT) < 0.0008) {
      cvT = cvTargetT;
      applyCvTransform();
      cvRaf = 0;
      return;
    }
    applyCvTransform();
    cvRaf = requestAnimationFrame(cvLoop);
  }
  function kickCvLoop() {
    if (!cvRaf) cvRaf = requestAnimationFrame(cvLoop);
  }

  /* ---------- Rail fill for active section — global rail color line uses ::before? ---------- */
  // We use #cvRailFill which is a span inside .cv-rail. Set width via scaleX (CSS rule sets transform-origin: left).
  if (cvRailFill) {
    cvRailFill.style.position = 'absolute';
    cvRailFill.style.inset = '0';
    cvRailFill.style.background = 'var(--y)';
    cvRailFill.style.transformOrigin = 'left';
    cvRailFill.style.transform = 'scaleX(0)';
    cvRailFill.style.display = 'block';
  }

  /* ---------- Hero photo parallax ---------- */
  function updateHeroParallax() {
    if (!hero || !heroPhoto) return;
    if (reduced || window.innerWidth <= 960) {
      heroPhoto.style.transform = '';
      if (heroPhotoImg) heroPhotoImg.style.transform = 'scale(1.05)';
      return;
    }
    const r = hero.getBoundingClientRect();
    const vh = window.innerHeight;
    const prog = clamp(-r.top / vh, -0.2, 1.2);
    heroPhoto.style.transform = `translateY(${prog * -40}px)`;
    if (heroPhotoImg) heroPhotoImg.style.transform = `translateY(${prog * 24}px) scale(1.08)`;
  }

  /* ---------- Main scroll handler ---------- */
  let ticking = false;
  function onScroll() {
    updateHeader();
    updateHeroParallax();
    cvTargetT = computeCvTarget();
    kickCvLoop();
  }
  function requestTick() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => { onScroll(); ticking = false; });
    }
  }
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', () => { requestTick(); });
  onScroll();

  /* ---------- Smooth anchor scroll ---------- */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Contact form ---------- */
  const form    = $('#contactForm');
  const success = $('#contactSuccess');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Light validation: an e-mail address is required to be able to reply.
      const emailEl = form.querySelector('#f-email');
      if (emailEl && !emailEl.value.trim()) {
        emailEl.classList.add('invalid');
        emailEl.focus();
        emailEl.addEventListener('input', () => emailEl.classList.remove('invalid'), { once: true });
        return;
      }

      // Compose a mail to KNDI with the form contents and hand off to the
      // visitor's mail client (a static page cannot send server-side mail).
      const get = (sel) => (form.querySelector(sel)?.value || '').trim();
      const name = get('#f-name');
      const company = get('#f-company');
      const email = get('#f-email');
      const message = get('#f-msg');

      const subject = 'Bericht via kndi.nl' + (name ? ' — ' + name : '');
      const bodyLines = [
        'Naam: ' + (name || '-'),
        'Bedrijf: ' + (company || '-'),
        'E-mail: ' + (email || '-'),
        '',
        message || ''
      ];
      const href = 'mailto:mail@koennijhuis.nl'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(bodyLines.join('\n'));
      window.location.href = href;

      form.style.transition = 'opacity .3s ease, transform .3s ease';
      form.style.opacity = '0';
      form.style.transform = 'translateY(16px)';
      setTimeout(() => {
        form.hidden = true;
        success.hidden = false;
        requestAnimationFrame(() => success.classList.add('in'));
      }, 320);
    });
  }

  /* ---------- Testimonial slider ---------- */
  (function initTestimonialSlider() {
    const track = document.getElementById('tTrack');
    const dotsWrap = document.getElementById('tDots');
    if (!track || !dotsWrap) return;
    const slides = Array.from(track.children).slice(0, 5); // max 5 slides
    // Drop any slides beyond 5 from the DOM
    Array.from(track.children).slice(5).forEach(el => el.remove());
    const n = slides.length;
    if (n === 0) return;

    const DURATION = 5000; // 5s per slide
    let index = 0;
    let startTs = 0;
    let raf = 0;
    let paused = false;

    // Build dots
    const dots = slides.map((_, i) => {
      const b = document.createElement('button');
      b.className = 't-dot' + (i === 0 ? ' is-active' : '');
      b.type = 'button';
      b.setAttribute('aria-label', 'Review ' + (i + 1));
      b.addEventListener('click', () => go(i, true));
      dotsWrap.appendChild(b);
      return b;
    });

    function render() {
      track.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
      dots.forEach((d, i) => {
        d.classList.toggle('is-active', i === index);
        if (i !== index) d.style.removeProperty('--p');
      });
    }

    function go(i, userInitiated) {
      index = (i + n) % n;
      render();
      restartTimer();
    }

    function tick(ts) {
      if (!startTs) startTs = ts;
      if (paused) { startTs = ts - elapsed; raf = requestAnimationFrame(tick); return; }
      var elapsedNow = ts - startTs;
      elapsed = elapsedNow;
      const p = Math.min(elapsedNow / DURATION, 1);
      if (dots[index]) dots[index].style.setProperty('--p', p.toFixed(4));
      if (p >= 1) { go(index + 1); return; }
      raf = requestAnimationFrame(tick);
    }
    let elapsed = 0;
    function restartTimer() {
      cancelAnimationFrame(raf);
      startTs = 0; elapsed = 0;
      if (n > 1 && !reduced) raf = requestAnimationFrame(tick);
    }

    // Pause on hover / when off-screen for politeness
    const slider = document.getElementById('tSlider');
    if (slider) {
      slider.addEventListener('mouseenter', () => { paused = true; });
      slider.addEventListener('mouseleave', () => { paused = false; });
    }
    document.addEventListener('visibilitychange', () => { paused = document.hidden; });

    // Hide dots & skip autoplay if only one slide
    if (n <= 1) { dotsWrap.style.display = 'none'; }

    render();
    restartTimer();
  })();
})();
