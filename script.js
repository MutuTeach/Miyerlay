/* ============================================
   FX-BSC PREMIUM — INTERACTION LAYER
   Vanilla JS, no dependencies
   ============================================ */
(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------
     1. SCROLL REVEAL (IntersectionObserver)
     -------------------------------------- */
  const revealEls = $$('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ----------------------------------------
     2. COUNTER ANIMATION
     -------------------------------------- */
  const counters = $$('[data-counter], [data-target]');
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.counter || el.dataset.target || el.textContent, 10);
    if (Number.isNaN(target)) return;
    if (prefersReducedMotion) { el.textContent = target.toLocaleString('es'); return; }
    const duration = 1800;
    const start = performance.now();
    const from = 0;
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const value = Math.floor(from + (target - from) * eased);
      el.textContent = value.toLocaleString('es');
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString('es');
    };
    requestAnimationFrame(step);
  };

  if (counters.length && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach((el) => cio.observe(el));
  }

  /* ----------------------------------------
     3. MOBILE NAV TOGGLE
     -------------------------------------- */
  const navToggle = $('#heroBurger, [data-nav-toggle]');
  const mobileMenu = $('#heroMobileMenu, .hero-nav__mobile, .site-nav');
  const navRoot    = $('.hero-nav, .site-nav, [data-header]');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(open));
      mobileMenu.classList.toggle('is-open', open);
      mobileMenu.setAttribute('aria-hidden', String(!open));
      if (navRoot) navRoot.classList.toggle('is-open', open);
    });
    // Close on link click
    $$('a', mobileMenu).forEach((link) => {
      link.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
        mobileMenu.classList.remove('is-open');
        mobileMenu.setAttribute('aria-hidden', 'true');
        if (navRoot) navRoot.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ----------------------------------------
     4. SMOOTH SCROLL FOR ANCHORS
     -------------------------------------- */
  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  });

  /* ----------------------------------------
     5. VIDEO POPUP MODAL
     -------------------------------------- */
  const videoModal   = $('.video-modal');
  const videoTarget  = $('[data-video-target]', videoModal || document);
  const videoTriggers = $$('[data-video-trigger]');

  const openVideo = (url) => {
    if (!videoModal || !videoTarget) return;
    const src = url + (url.includes('?') ? '&' : '?') + 'autoplay=1&rel=0';
    videoTarget.innerHTML = `<iframe src="${src}" title="FX-BSC video" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    videoModal.hidden = false;
    requestAnimationFrame(() => videoModal.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
  };
  const closeVideo = () => {
    if (!videoModal || !videoTarget) return;
    videoModal.classList.remove('is-open');
    setTimeout(() => {
      videoModal.hidden = true;
      videoTarget.innerHTML = '';
      document.body.style.overflow = '';
    }, 300);
  };

  videoTriggers.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const url = btn.dataset.videoSrc || btn.dataset.videoTrigger ||
                  btn.getAttribute('href') ||
                  'https://www.youtube.com/embed/VhBl3dHT5SY';
      openVideo(url);
    });
  });

  if (videoModal) {
    $$('[data-video-close]', videoModal).forEach((b) =>
      b.addEventListener('click', closeVideo));
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal || e.target.classList.contains('video-modal__backdrop')) {
        closeVideo();
      }
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal && !videoModal.hidden) closeVideo();
  });

  /* ----------------------------------------
     6. SCROLL PROGRESS BAR
     -------------------------------------- */
  const progressBar = $('[data-scroll-progress], .scroll-progress__bar');
  if (progressBar) {
    const updateProgress = () => {
      const scrolled = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (scrolled / max) * 100 : 0;
      progressBar.style.width = pct + '%';
      progressBar.style.setProperty('--progress', pct + '%');
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* ----------------------------------------
     7. NAV SCROLL STATE
     -------------------------------------- */
  const header = $('.hero-nav, .site-header, header.site-header, [data-header]');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ----------------------------------------
     8. SCROLL TO TOP BUTTON
     -------------------------------------- */
  const toTop = $('[data-scroll-top], .scroll-to-top');
  if (toTop) {
    const toggleToTop = () => {
      toTop.classList.toggle('is-visible', window.scrollY > 600);
    };
    window.addEventListener('scroll', toggleToTop, { passive: true });
    toTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
    toggleToTop();
  }

  /* ----------------------------------------
     9. LIVE TICKER — subtle price drift (decorative)
     -------------------------------------- */
  const tickerPrices = $$('[data-price]');
  if (tickerPrices.length && !prefersReducedMotion) {
    setInterval(() => {
      tickerPrices.forEach((el) => {
        const base = parseFloat(el.dataset.priceBase || el.dataset.price);
        if (Number.isNaN(base)) return;
        const drift = (Math.random() - 0.5) * base * 0.0015;
        const next = base + drift;
        const decimals = (el.dataset.decimals !== undefined)
          ? parseInt(el.dataset.decimals, 10)
          : (base < 10 ? 4 : base < 1000 ? 2 : 0);
        el.textContent = next.toLocaleString('en', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        });
        el.classList.remove('is-up', 'is-down');
        el.classList.add(drift >= 0 ? 'is-up' : 'is-down');
      });
    }, 2400);
  }

  /* ----------------------------------------
     10. FAQ accordion fallback (if <details> not styled)
     -------------------------------------- */
  $$('details.faq-item').forEach((det) => {
    const summary = det.querySelector('summary');
    if (!summary) return;
    summary.addEventListener('click', () => {
      // native handles open/close, just sync aria
      requestAnimationFrame(() => {
        summary.setAttribute('aria-expanded', String(det.open));
      });
    });
    summary.setAttribute('aria-expanded', String(det.open));
  });

  /* ----------------------------------------
     11. SERVICE MODALS (in-page)
     -------------------------------------- */
  let activeServiceModal = null;

  const openServiceModal = (modal) => {
    if (activeServiceModal) closeServiceModal(activeServiceModal);
    activeServiceModal = modal;
    modal.hidden = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => modal.classList.add('is-open'));
    });
    document.body.style.overflow = 'hidden';
    const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) firstFocusable.focus();
  };

  const closeServiceModal = (modal) => {
    modal.classList.remove('is-open');
    setTimeout(() => {
      modal.hidden = true;
      document.body.style.overflow = '';
    }, 320);
    activeServiceModal = null;
  };

  $$('[data-service-modal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.serviceModal;
      const modal = $('#modal-' + key);
      if (modal) openServiceModal(modal);
    });
  });

  $$('.service-modal').forEach((modal) => {
    $$('[data-service-modal-close]', modal).forEach((el) => {
      el.addEventListener('click', () => closeServiceModal(modal));
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeServiceModal) closeServiceModal(activeServiceModal);
  });

})();
