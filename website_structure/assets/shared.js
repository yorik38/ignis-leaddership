
(function () {
  function getNav() { return document.getElementById('nav'); }
  function getBurger() { return document.getElementById('burger'); }
  function getMenu() {
    return document.getElementById('navLinks') || document.querySelector('.n-links');
  }

  function isMobile() { return window.innerWidth <= 960; }

  function openBurger() {
    const nav = getNav();
    const menu = getMenu();
    const burger = getBurger();
    if (!nav || !menu || !burger) return;
    menu.classList.add('mobile-open');
    nav.classList.add('menu-open-nav');
    burger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }

  function closeBurger() {
    const nav = getNav();
    const menu = getMenu();
    const burger = getBurger();
    if (!nav || !menu || !burger) return;
    menu.classList.remove('mobile-open');
    nav.classList.remove('menu-open-nav');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  window.toggleBurger = function () {
    const menu = getMenu();
    if (!menu) return;
    if (menu.classList.contains('mobile-open')) closeBurger();
    else openBurger();
  };
  window.closeBurger = closeBurger;

  function legalMode() {
    const pathname = (location.pathname || '').toLowerCase();
    if (document.querySelector('.legal-page') || /privacy|terms|cookie/.test(pathname)) {
      document.body.classList.add('legal-page-view');
    }
  }

  function closeOnScroll() {
    window.addEventListener('scroll', function () {
      const menu = getMenu();
      if (menu && menu.classList.contains('mobile-open')) closeBurger();
    }, { passive: true });
  }

  function closeOnResize() {
    window.addEventListener('resize', function () {
      if (!isMobile()) closeBurger();
    });
  }

  function bindMenuLinks() {
    const menu = getMenu();
    if (!menu) return;
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        if (isMobile()) closeBurger();
      });
    });
  }

  function extractBgUrl(blockName) {
    const styleTag = document.querySelector('style');
    if (!styleTag) return '';
    const css = styleTag.textContent || '';
    const safe = blockName.replace('.', '\\.');
    const re = new RegExp(safe + "\\s*\\{[\\s\\S]*?url\\((['\"]?)(.*?)\\1\\)", 'i');
    const match = css.match(re);
    return match ? match[2] : '';
  }

  function ensureHeroImage(containerSelector, innerSelector, blockName) {
    const hero = document.querySelector(containerSelector);
    if (!hero) return;
    const inner = hero.querySelector(innerSelector) || hero;
    if (!inner) return;

    const bgUrl = extractBgUrl(blockName);
    if (!bgUrl) return;

    let img = inner.querySelector('.hero-mobile-img');
    if (!img) {
      img = document.createElement('img');
      img.className = 'hero-mobile-img';
      img.alt = 'Ignis Leadership';
      const anchor = inner.querySelector('.hero-sub, .pg-title, .pg-eyebrow, .eyebrow, .hero-h1');
      if (anchor && anchor.parentNode) {
        if (anchor.classList.contains('hero-sub') || anchor.classList.contains('pg-title')) {
          anchor.insertAdjacentElement('afterend', img);
        } else {
          inner.appendChild(img);
        }
      } else {
        inner.appendChild(img);
      }
    }
    img.src = bgUrl;
  }

  function initCalendlyButtons() {
    if (window.__sharedCalendlyBound) return;
    window.__sharedCalendlyBound = true;
    document.querySelectorAll('[onclick*="openCalendly"], .n-cta, .btn').forEach(function(btn){
      // leave existing handlers in place
    });
  }

  function init() {
    legalMode();
    bindMenuLinks();
    closeOnScroll();
    closeOnResize();
    ensureHeroImage('.hero', '.hero-inner', '.hero');
    ensureHeroImage('.pg-hero', '.pg-hero-inner', '.pg-hero');
    initCalendlyButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
