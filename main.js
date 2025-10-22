/* ===== helpers (nepovinné) ===== */
(() => {
  // Rezerva pro případné další utility
})();

/* ===== GALLERY: multi-item slider (4 desktop / 2 tablet / 1 mobile) ===== */
(() => {
  const slider = document.querySelector('#gallery .slider');
  if (!slider) return;

  const track = slider.querySelector('[data-track]');
  const prev  = slider.querySelector('.prev');
  const next  = slider.querySelector('.next');

  // Posun o "stránku" = viditelná šířka tracku
  const page = () => track.clientWidth;

  function scrollByPage(dir) {
    track.scrollBy({ left: dir * page(), behavior: 'smooth' });
  }

  if (prev) prev.addEventListener('click', (e) => { e.preventDefault(); scrollByPage(-1); });
  if (next) next.addEventListener('click', (e) => { e.preventDefault(); scrollByPage(1);  });

  // Klávesy ← →
  slider.setAttribute('tabindex', '0');
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  scrollByPage(-1);
    if (e.key === 'ArrowRight') scrollByPage(1);
  });

  // Swipe (dotyk)
  let swipeStartX = 0;
  let swipeDelta  = 0;
  const SWIPE_THRESHOLD = 50;

  track.addEventListener('touchstart', (e) => {
    swipeStartX = e.touches[0].clientX;
    swipeDelta  = 0;
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    swipeDelta = e.touches[0].clientX - swipeStartX;
  }, { passive: true });

  track.addEventListener('touchend', () => {
    if (swipeDelta >  SWIPE_THRESHOLD) scrollByPage(-1);
    if (swipeDelta < -SWIPE_THRESHOLD) scrollByPage(1);
  });
})();

/* ===== GALLERY: autoplay (pauzuje se při interakci) – volitelné ===== */
(() => {
  const track = document.querySelector('#gallery [data-track]');
  if (!track) return;

  const INTERVAL_MS = 5000;
  let timerId = null;
  let paused  = false;

  function step() {
    if (paused) return;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    if (atEnd) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
    }
  }

  function start() {
    stop();
    timerId = setInterval(step, INTERVAL_MS);
  }

  function stop() {
    if (timerId) clearInterval(timerId);
    timerId = null;
  }

  track.addEventListener('mouseenter', () => { paused = true;  stop(); });
  track.addEventListener('mouseleave', () => { paused = false; start(); });
  track.addEventListener('touchstart',  () => { paused = true;  stop(); }, { passive: true });
  track.addEventListener('touchend',    () => { paused = false; start(); });

  start();
})();
/* === NAV shrink on scroll === */
(() => {
  const nav = document.querySelector('.top-nav');
  if (!nav) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    const isScrolled = currentScroll > 40; // aktivace po 40px
    nav.classList.toggle('scrolled', isScrolled);
    lastScroll = currentScroll;
  });
})();
/* === COOKIES CONSENT (robust) === */
(() => {
  const banner = document.getElementById('cookie-banner');
  const btn    = document.getElementById('accept-cookies');
  if (!banner || !btn) return;

  const KEY = 'cookiesAcceptedAt';
  const DAYS_VALID = 180;
  const now = Date.now();

  // už je odsouhlaseno a neexpirovalo?
  const ts = Number(localStorage.getItem(KEY) || 0);
  const expired = !ts || (now - ts) > DAYS_VALID * 24 * 60 * 60 * 1000;

  if (expired) {
    // ukaž banner
    banner.hidden = false;
    banner.style.display = 'flex';
  } else {
    // už byl odsouhlasen – uklidíme DOM
    banner.remove();
    return;
  }

  function accept() {
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch (e) {
      // nic – v nejhorším prostě jen zavřeme
    }
    // zavřít banner
    banner.remove();
  }

  btn.addEventListener('click', accept);

  // Enter/Space/ESC z klávesnice
  banner.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') accept();
    if (e.key === 'Escape') accept();
  });
})();
// ===== Cookie banner logic =====
(function () {
  const banner = document.querySelector('.cookie-banner');
  if (!banner) return;

  const acceptBtns = document.querySelectorAll('[data-accept]');
  const declineBtns = document.querySelectorAll('[data-decline]');
  const learnLink   = banner.querySelector('.cookie-link');
  const modal       = document.querySelector('#cookies-policy');
  const closeBtns   = document.querySelectorAll('[data-close-modal], #cookies-policy .cookie-modal__close');

  const showBanner = () => { banner.style.display = 'flex'; };
  const hideBanner = () => { banner.style.display = 'none'; };

  // zobraz pouze pokud ještě není volba uložená
  const saved = localStorage.getItem('cookieConsent');
  if (!saved) showBanner();

  acceptBtns.forEach(btn => btn.addEventListener('click', () => {
    localStorage.setItem('cookieConsent', 'granted');
    hideBanner();
    if (modal) modal.classList.remove('is-open');
  }));

  declineBtns.forEach(btn => btn.addEventListener('click', () => {
    localStorage.setItem('cookieConsent', 'denied');
    hideBanner();
  }));

  if (learnLink && modal) {
    learnLink.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
    });
  }

  closeBtns.forEach(btn => btn.addEventListener('click', () => {
    if (modal) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }
  }));

  // zavření ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('is-open')) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }
  });
}); // <— místo původního });})();

// ===== Mobile menu toggle =====
(function () {
  const toggle = document.getElementById('menuToggle');
  const drawer = document.getElementById('mobileMenu');
  const overlay = document.getElementById('menuOverlay');

  if (!toggle || !drawer || !overlay) return;

  const open = () => {
    drawer.hidden = false;
    overlay.hidden = false;
    // malé timeouty pro CSS animaci
    requestAnimationFrame(() => {
      drawer.classList.add('open');
      overlay.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    });
  };

  const close = () => {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    // po animaci skryjeme z DOM flow
    setTimeout(() => { drawer.hidden = true; overlay.hidden = true; }, 200);
  };

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    expanded ? close() : open();
  });

  overlay.addEventListener('click', close);
  drawer.addEventListener('click', (e) => {
    if (e.target.matches('a')) close(); // zavři po kliknutí na odkaz
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !drawer.hidden) close();
  });
})();

