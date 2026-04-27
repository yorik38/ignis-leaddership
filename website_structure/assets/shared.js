(function(){
  // 1. Identify which page we are on for active styling
  function getPageKey(){
    const explicit = document.body.getAttribute('data-page');
    if (explicit) return explicit;
    const path = (window.location.pathname || '').toLowerCase();
    if (path.includes('about')) return 'about';
    if (path.includes('outcomes')) return 'outcomes';
    return 'home';
  }

  function isLegalPage(){
    return document.body.classList.contains('legal-page') || /terms-and-conditions|privacy-policy|cookie-policy/i.test(window.location.pathname);
  }

  // 2. Centralized Header Markup
  function headerMarkup(pageKey){
    const active = (key) => pageKey === key ? 'active' : '';
    return `
    <nav id="nav">
      <a class="n-logo" href="/index.html" aria-label="Ignis Leadership home">
        <img src="/images/logo nav bar.png" alt="Ignis Leadership">
      </a>
      <ul class="n-links" id="n-links">
        <li><a href="/index.html" class="${active('home')}">Home</a></li>
        <li><a href="/about.html" class="${active('about')}">About</a></li>
        <li class="nav-outcomes-dropdown">
          <a href="#" class="${active('outcomes')}" onclick="return false;">Outcomes</a>
          <div class="nav-dropdown-menu">
            <a href="/outcomes/perfectionism.html">Perfectionism</a>
            <a href="/outcomes/burnout.html">Burnout</a>
            <a href="/outcomes/decision-making.html">Decision-Making Clarity</a>
            <a href="/outcomes/self-sabotage.html">Self-Sabotage</a>
            <a href="/outcomes/overthinking.html">Overthinking & Quiet Mind</a>
            <a href="/outcomes/performance-confidence.html">Performance Confidence</a>
          </div>
        </li>
        <li><a class="n-cta" href="#" onclick="openCal(); return false;">Let’s talk</a></li>
      </ul>
      <button class="n-burger" id="burger" type="button" aria-label="Toggle menu" onclick="toggleBurger()">
        <span></span><span></span><span></span>
      </button>
    </nav>`;
  }

  // 3. Centralized Footer Markup
  function footerMarkup(){
    return `
    <footer>
      <div class="f-top">
        <div class="f-brand">
          <a class="f-logo" href="/index.html"><img src="/images/logo nav bar.png" alt="Ignis Leadership"></a>
          <p class="f-tagline">Where high performance<br>meets inner clarity.</p>
        </div>
        <div>
          <p class="f-col-label">Navigate</p>
          <ul class="f-col-links">
            <li><a href="/index.html">Home</a></li>
            <li><a href="/about.html">About</a></li>
            <li><a href="/outcomes/perfectionism.html">Outcomes</a></li>
          </ul>
        </div>
        <div>
          <p class="f-col-label">Connect</p>
          <ul class="f-col-links">
            <li><a href="mailto:yorik@ignisleadership.com">yorik@ignisleadership.com</a></li>
            <li><a href="tel:+447305642808">+44 730 564 2808</a></li>
          </ul>
        </div>
      </div>
      <div class="f-bottom">
        <div class="f-bottom-inner">
          <ul class="f-legal-links">
            <li><a href="/terms-and-conditions.html">Terms & Conditions</a></li>
            <li><a href="/privacy-policy.html">Privacy Policy</a></li>
            <li><a href="/cookie-policy.html">Cookie Policy</a></li>
          </ul>
          <span class="f-copy">&copy; 2026 ignis leadership ltd. All rights reserved.</span>
        </div>
      </div>
    </footer>`;
  }

  // --- INTERACTIVE FUNCTIONS ---
  window.toggleBurger = function() {
    const links = document.getElementById('n-links');
    const nav = document.getElementById('nav');
    if (!links) return;
    const isOpening = !links.classList.contains('mobile-open');
    links.classList.toggle('mobile-open', isOpening);
    if (nav) nav.classList.toggle('menu-open-nav', isOpening);
    document.body.style.overflow = isOpening ? 'hidden' : '';
  };

  window.openCal = function() {
    if (window.Calendly) {
      window.Calendly.initPopupWidget({ url: 'https://calendly.com/yorik-tisseau-tmff/30min' });
    }
    return false;
  };

  // --- INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('site-header');
    const footer = document.getElementById('site-footer');
    const pageKey = getPageKey();

    if (header) header.innerHTML = headerMarkup(pageKey);
    if (footer) footer.innerHTML = footerMarkup();

    // Legal page scroll state
    if (isLegalPage()) {
      document.body.classList.add('legal-page-view');
      const nav = document.getElementById('nav');
      if (nav) nav.classList.add('scrolled');
    }

    // Scroll listener for sticky nav
    window.addEventListener('scroll', () => {
      const nav = document.getElementById('nav');
      if (nav && !isLegalPage()) {
        nav.classList.toggle('scrolled', window.scrollY > 55);
      }
    }, { passive: true });
  });
})();