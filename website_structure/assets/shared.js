
(function () {
  function getNav() { return document.getElementById('nav'); }
  function getBurger() { return document.getElementById('burger'); }
  function getMenu() { return document.getElementById('n-links') || document.getElementById('navLinks') || document.querySelector('.n-links'); }
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
    if (!document.getElementById('cal-modal')?.classList.contains('open')) {
      document.body.style.overflow = '';
    }
  }

  function toggleBurger() {
    const menu = getMenu();
    if (!menu) return;
    if (menu.classList.contains('mobile-open')) {
      closeBurger();
    } else {
      openBurger();
      document.body.style.overflow = 'hidden';
    }
  }

  window.toggleBurger = toggleBurger;
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

  function bindBurger() {
    const burger = getBurger();
    if (!burger || burger.dataset.sharedBound === '1') return;
    burger.dataset.sharedBound = '1';
    burger.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleBurger();
    });
  }

  function extractBgUrl(blockName) {
    const styleTag = document.querySelector('style');
    if (!styleTag) return '';
    const css = styleTag.textContent || '';
    const safe = blockName.replace('.', '\.')
    const re = new RegExp(safe + "\s*\{[\s\S]*?url\((['"]?)(.*?)\1\)", 'i');
    const match = css.match(re);
    return match ? match[2] : '';
  }

  function ensureHeroImage(containerSelector, innerSelector, blockName) {
    const hero = document.querySelector(containerSelector);
    if (!hero) return;
    const inner = hero.querySelector(innerSelector) || hero;
    if (!inner) return;
    if (inner.querySelector('.hero-mobile-img')) return;

    const pathname = (location.pathname || '').toLowerCase();
    if (pathname.endsWith('/about.html') || pathname === '/about.html' || pathname.endsWith('about.html')) {
      return;
    }

    const bgUrl = extractBgUrl(blockName);
    if (!bgUrl) return;

    const img = document.createElement('img');
    img.className = 'hero-mobile-img';
    img.alt = 'Ignis Leadership';
    const anchor = inner.querySelector('.hero-sub, .pg-title, .pg-eyebrow, .eyebrow, .hero-h1');
    if (anchor) anchor.insertAdjacentElement('afterend', img);
    else inner.appendChild(img);
    img.src = bgUrl;
  }

  function fixAboutHero() {
    const pathname = (location.pathname || '').toLowerCase();
    if (!(pathname.endsWith('/about.html') || pathname === '/about.html' || pathname.endsWith('about.html'))) return;
    const inner = document.querySelector('.pg-hero-inner');
    const photo = document.querySelector('.ab-photo');
    if (!inner || !photo || inner.querySelector('.hero-mobile-img')) return;
    const clone = photo.cloneNode(true);
    clone.className = 'hero-mobile-img';
    clone.removeAttribute('style');
    clone.onerror = null;
    inner.appendChild(clone);
  }

  function init() {
    legalMode();
    bindBurger();
    bindMenuLinks();
    closeOnScroll();
    closeOnResize();
    ensureHeroImage('.hero', '.hero-inner', '.hero');
    ensureHeroImage('.pg-hero', '.pg-hero-inner', '.pg-hero');
    fixAboutHero();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
