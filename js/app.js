/* ============================================================
   KNDI — motion logic
   ============================================================ */
(() => {
  const $  = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: scrolled state + on-dark detection ---------- */
  const header = $('#header');
  function updateHeader() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 40);

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
    if (window.innerWidth <= 960 || reduced) {
      cvTrack.style.transform = '';
      if (cvProgress) cvProgress.style.transform = `scaleX(${cvTargetT})`;
      if (cvRailFill) cvRailFill.style.transform = `scaleX(${cvTargetT})`;
      return;
    }
    const vw = window.innerWidth;
    const first = cvItems[0];
    const last  = cvItems[cvItems.length - 1];
    const c0 = first.offsetLeft + first.offsetWidth / 2;
    const cN = last.offsetLeft + last.offsetWidth / 2;
    const x0 = vw / 2 - c0;
    const x1 = vw / 2 - cN;
    const x  = x0 + (x1 - x0) * cvT;
    cvTrack.style.transform = `translate3d(${x}px, 0, 0)`;
    if (cvProgress) cvProgress.style.transform = `scaleX(${cvT})`;
    if (cvRailFill) cvRailFill.style.transform = `scaleX(${cvT})`;

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

      const emailEl = form.querySelector('#f-email');
      if (emailEl && !emailEl.value.trim()) {
        emailEl.classList.add('invalid');
        emailEl.focus();
        emailEl.addEventListener('input', () => emailEl.classList.remove('invalid'), { once: true });
        return;
      }

      // Loading state
      const btn = form.querySelector('#submitBtn');
      const errorEl = form.querySelector('#formError');
      btn.disabled = true;
      btn.textContent = 'Versturen…';
      if (errorEl) errorEl.hidden = true;

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(form),
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            form.style.transition = 'opacity .3s ease, transform .3s ease';
            form.style.opacity = '0';
            form.style.transform = 'translateY(16px)';
            setTimeout(() => {
              form.hidden = true;
              success.hidden = false;
              requestAnimationFrame(() => success.classList.add('in'));
            }, 320);
          } else {
            throw new Error('Web3Forms error');
          }
        })
        .catch(() => {
          btn.disabled = false;
          btn.textContent = 'Verstuur';
          if (errorEl) errorEl.hidden = false;
        });
    });
  }

  /* ---------- Testimonial auto-slider ---------- */
  (function initTestimonialSlider() {
    const track    = document.getElementById('tTrack');
    const dotsWrap = document.getElementById('tDots');
    if (!track || !dotsWrap) return;
    const slides = Array.from(track.children).slice(0, 5);
    Array.from(track.children).slice(5).forEach(el => el.remove());
    const n = slides.length;
    if (n === 0) return;

    const DURATION = 5000;
    let index = 0;
    let startTs = 0;
    let raf = 0;
    let paused = false;
    let elapsed = 0;

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

    function go(i) {
      index = (i + n) % n;
      render();
      restartTimer();
    }

    function tick(ts) {
      if (!startTs) startTs = ts;
      if (paused) { startTs = ts - elapsed; raf = requestAnimationFrame(tick); return; }
      const elapsedNow = ts - startTs;
      elapsed = elapsedNow;
      const p = Math.min(elapsedNow / DURATION, 1);
      if (dots[index]) dots[index].style.setProperty('--p', p.toFixed(4));
      if (p >= 1) { go(index + 1); return; }
      raf = requestAnimationFrame(tick);
    }

    function restartTimer() {
      cancelAnimationFrame(raf);
      startTs = 0; elapsed = 0;
      if (n > 1 && !reduced) raf = requestAnimationFrame(tick);
    }

    const slider = document.getElementById('tSlider');
    if (slider) {
      slider.addEventListener('mouseenter', () => { paused = true; });
      slider.addEventListener('mouseleave', () => { paused = false; });
    }
    document.addEventListener('visibilitychange', () => { paused = document.hidden; });

    if (n <= 1) { dotsWrap.style.display = 'none'; }

    render();
    restartTimer();
  })();
})();
