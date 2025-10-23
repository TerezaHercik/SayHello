/* main.js
   Upravený, robustní skript pro navigaci, slider, cookie banner, flip karty a drobné UI helpers.
   Uložit přes ./main.js (bez diff headeru).
*/

/* ===== helpers (nepovinné) ===== */
(() => {
  // Rezerva pro další utilitky, pokud bude třeba.
})();

/* ===== FOOTER YEAR ===== */
(() => {
  const y = document.getElementById('y');
  if (y) y.textContent = String(new Date().getFullYear());
})();

/* ===== MOBILE MENU (drawer) ===== */
(() => {
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuOverlay = document.getElementById('menuOverlay');

  if (!menuToggle || !mobileMenu || !menuOverlay) return;

  function openMenu() {
    mobileMenu.hidden = false;
    menuOverlay.hidden = false;
    mobileMenu.classList.add('open');
    menuOverlay.classList.add('open');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    mobileMenu.classList.remove('open');
    menuOverlay.classList.remove('open');
    mobileMenu.hidden = true;
    menuOverlay.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) closeMenu(); else openMenu();
  });

  menuOverlay.addEventListener('click', closeMenu);
  // zavřít po kliknutí na odkaz uvnitř menu
  mobileMenu.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.tagName === 'A') closeMenu();
  });

  // klávesou ESC zavřít
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!mobileMenu.hidden) closeMenu();
    }
  });
})();

/* ===== NAV shrink on scroll ===== */
(() => {
  const nav = document.querySelector('.top-nav');
  if (!nav) return;

  const onScroll = () => {
    const sc = window.scrollY || window.pageYOffset;
    nav.classList.toggle('scrolled', sc > 40);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ===== GALLERY: multi-item slider (buttons, keyboard, swipe) ===== */
(() => {
  const slider = document.querySelector('#gallery .slider');
  if (!slider) return;

  const track = slider.querySelector('[data-track]');
  const prev  = slider.querySelector('.slider-btn.prev') || slider.querySelector('.prev');
  const next  = slider.querySelector('.slider-btn.next') || slider.querySelector('.next');

  if (!track) return;

  // vypočítat posun (šířka viditelné oblasti nebo první slide)
  function getPageWidth() {
    const slide = track.querySelector('.slide');
    if (slide) {
      const rect = slide.getBoundingClientRect();
      return Math.round(rect.width + (parseFloat(getComputedStyle(track).gap || '16') || 16));
    }
    return track.clientWidth || Math.round(window.innerWidth * 0.8);
  }

  function scrollByPage(dir) {
    try {
      track.scrollBy({ left: dir * getPageWidth(), behavior: 'smooth' });
    } catch (e) {
      track.scrollLeft += dir * getPageWidth();
    }
  }

  if (prev) prev.addEventListener('click', (e) => { e.preventDefault(); scrollByPage(-1); });
  if (next) next.addEventListener('click', (e) => { e.preventDefault(); scrollByPage(1); });

  // keyboard support when slider focused
  slider.setAttribute('tabindex', '0');
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  scrollByPage(-1);
    if (e.key === 'ArrowRight') scrollByPage(1);
  });

  // swipe gestures
  let startX = 0;
  let deltaX = 0;
  const THRESHOLD = 50;

  track.addEventListener('touchstart', (e) => {
    if (!e.touches || e.touches.length === 0) return;
    startX = e.touches[0].clientX;
    deltaX = 0;
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    if (!e.touches || e.touches.length === 0) return;
    deltaX = e.touches[0].clientX - startX;
  }, { passive: true });

  track.addEventListener('touchend', () => {
    if (deltaX > THRESHOLD) scrollByPage(-1);
    if (deltaX < -THRESHOLD) scrollByPage(1);
  });

  // optional: make focusable slides for accessibility (tab order)
  Array.from(track.querySelectorAll('.slide')).forEach(sl => {
    if (!sl.hasAttribute('tabindex')) sl.setAttribute('tabindex', '0');
  });
})();

/* ===== GALLERY: autoplay (pauzuje se při interakci) ===== */
(() => {
  const track = document.querySelector('#gallery [data-track]');
  if (!track) return;

  const INTERVAL_MS = 5000;
  let timerId = null;
  let paused = false;

  function canScroll() {
    return track.scrollWidth > track.clientWidth + 10;
  }

  function step() {
    if (paused || !canScroll()) return;
    const atEnd = Math.abs(track.scrollLeft + track.clientWidth - track.scrollWidth) < 8
                  || track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    if (atEnd) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
    }
  }

  function start() {
    stop();
    if (!canScroll()) return;
    timerId = setInterval(step, INTERVAL_MS);
  }

  function stop() {
    if (timerId) clearInterval(timerId);
    timerId = null;
  }

  track.addEventListener('mouseenter', () => { paused = true; stop(); });
  track.addEventListener('mouseleave', () => { paused = false; start(); });
  track.addEventListener('touchstart', () => { paused = true; stop(); }, { passive: true });
  track.addEventListener('touchend', () => { paused = false; start(); });

  // start if necessary
  start();
})();

/* ===== FLIP CARDS: hover on desktop, tap/click on touch devices, keyboard toggle ===== */
(() => {
  const cards = Array.from(document.querySelectorAll('.flip-card'));
  if (!cards.length) return;

  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

  cards.forEach(card => {
    // make card keyboard-focusable
    if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');

    // keyboard control: Enter / Space
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('flipped');
      }
      if (e.key === 'Escape') {
        card.classList.remove('flipped');
      }
    });

    // touch / click: toggle flipped state (avoid toggling when clicking links/buttons inside)
    card.addEventListener('click', (e) => {
      const target = e.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName.toLowerCase();
        if (['a','button','input','textarea','select','label'].includes(tag)) return;
      }
      if (isTouch) {
        card.classList.toggle('flipped');
      }
    });

    // remove flipped if clicking outside (mobile friendly)
    document.addEventListener('click', (e) => {
      if (!card.classList.contains('flipped')) return;
      const t = e.target;
      if (!(t instanceof Node)) return;
      if (!card.contains(t)) card.classList.remove('flipped');
    });
  });
})();

/* ===== COOKIE BANNER (works with .cookie-banner and data-accept/data-decline buttons) ===== */
(() => {
  const banner = document.querySelector('.cookie-banner');
  if (!banner) return;

  const acceptBtns = Array.from(document.querySelectorAll('[data-accept]'));
  const declineBtns = Array.from(document.querySelectorAll('[data-decline]'));
  const KEY = 'site_cookie_consent';
  const VALID_DAYS = 365; // můžete upravit

  function getStored() {
    try {
      return localStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
  }
  function setStored(val) {
    try {
      localStorage.setItem(KEY, String(val));
    } catch (e) {
      // ignore storage errors (private mode)
    }
  }

  const stored = getStored();
  if (!stored) {
    banner.style.display = banner.style.display || 'flex';
    banner.hidden = false;
  } else {
    // pokud je již volba uložena, schovej banner
    try { banner.remove(); } catch (e) { banner.hidden = true; }
    return;
  }

  function accept() {
    setStored({ acceptedAt: Date.now() });
    try { banner.remove(); } catch (e) { banner.hidden = true; }
  }
  function decline() {
    setStored({ declinedAt: Date.now() });
    try { banner.remove(); } catch (e) { banner.hidden = true; }
  }

  acceptBtns.forEach(b => b.addEventListener('click', accept));
  declineBtns.forEach(b => b.addEventListener('click', decline));

  // keyboard accessibility
  banner.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); accept(); }
    if (e.key === 'Escape') { e.preventDefault(); decline(); }
  });
})();
