
(function(){
  function getPageKey(){
    const explicit = document.body.getAttribute('data-page');
    if (explicit) return explicit;
    const path = (window.location.pathname || '').toLowerCase();
    if (path.includes('about')) return 'about';
    if (path.includes('coaching')) return 'coaching';
    if (path.includes('hypnotherapy')) return 'hypnosis';
    return 'home';
  }

  function isLegalPage(){
    return document.body.classList.contains('legal-page') || /terms-and-conditions|privacy-policy|cookie-policy/i.test(window.location.pathname);
  }

  function headerMarkup(pageKey){
    const active = (key) => pageKey === key ? 'active' : '';
    return `
<nav id="nav">
  <a class="n-logo" href="index.html" aria-label="Ignis Leadership home"><img src="images/logo nav bar.png" alt="Ignis Leadership"></a>
  <ul class="n-links" id="n-links">
    <li><a href="index.html" class="${active('home')}">Home</a></li>
    <li><a href="about.html" class="${active('about')}">About</a></li>
    <li><a href="coaching.html" class="${active('coaching')}">Coaching</a></li>
    <li><a href="hypnotherapy.html" class="${active('hypnosis')}">Hypnosis</a></li>
    <li><a class="n-cta" href="#" onclick="openCal(); return false;">Let’s talk</a></li>
  </ul>
  <button class="n-burger" id="burger" type="button" aria-label="Toggle menu" aria-expanded="false" onclick="toggleBurger()"><span></span><span></span><span></span></button>
</nav>`;
  }

  function footerMarkup(){
    return `
<footer>
  <div class="f-top">
    <div class="f-brand">
      <a class="f-logo" href="index.html"><img src="images/logo nav bar.png" alt="Ignis Leadership"></a>
      <p class="f-tagline">Where high performance<br>meets inner clarity.</p>
    </div>
    <div>
      <p class="f-col-label">Navigate</p>
      <ul class="f-col-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="coaching.html">Coaching</a></li>
        <li><a href="hypnotherapy.html">Hypnosis</a></li>
      </ul>
    </div>
    <div>
      <p class="f-col-label">Connect</p>
      <ul class="f-col-links">
        <li><a href="tel:+447305642808">+44 730 564 2808</a></li>
        <li><a href="mailto:yorik@ignisleadership.com">yorik@ignisleadership.com</a></li>
      </ul>
    </div>
  </div>
  <div class="f-bottom">
    <div class="f-bottom-inner">
      <ul class="f-legal-links">
        <li><a href="terms-and-conditions.html">Terms &amp; Conditions</a></li>
        <li><a href="privacy-policy.html">Privacy Policy</a></li>
        <li><a href="cookie-policy.html">Cookie Policy</a></li>
      </ul>
      <span class="f-copy">&copy; 2026 ignis leadership ltd. All rights reserved.</span>
    </div>
  </div>
</footer>`;
  }

  function modalMarkup(){
    return `
<div id="cal-modal">
  <div class="cal-inner">
    <button class="cal-close" type="button" onclick="closeCal()">&#x2715;</button>
    <div class="cal-body cal-body-embed">
      <div id="calendly-mobile-inline" class="calendly-inline-widget" data-url="https://calendly.com/yorik-tisseau-tmff/30min" style="min-width:100%;height:min(78vh,820px);"></div>
    </div>
  </div>
</div>`;
  }

  function ensureCalendlyScript(callback){
    if (window.Calendly) {
      if (typeof callback === 'function') callback();
      return;
    }
    let script = document.querySelector('script[data-ignis-calendly="true"]');
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.dataset.ignisCalendly = 'true';
      document.body.appendChild(script);
    }
    if (typeof callback === 'function') {
      script.addEventListener('load', function onLoad(){
        script.removeEventListener('load', onLoad);
        callback();
      });
    }
  }

  function initMobileCalendlyEmbed(){
    const host = document.getElementById('calendly-mobile-inline');
    if (!host || host.dataset.ignisLoaded === 'true') return;
    ensureCalendlyScript(function(){
      if (!window.Calendly || !Calendly.initInlineWidget) return;
      host.innerHTML = '';
      Calendly.initInlineWidget({
        url: 'https://calendly.com/yorik-tisseau-tmff/30min',
        parentElement: host,
        resize: true
      });
      host.dataset.ignisLoaded = 'true';
    });
  }

  function renderShell(){
    const header = document.getElementById('site-header');
    const footer = document.getElementById('site-footer');
    if (header) header.innerHTML = headerMarkup(getPageKey());
    if (footer) footer.innerHTML = footerMarkup();
    if (!document.getElementById('cal-modal')) {
      document.body.insertAdjacentHTML('beforeend', modalMarkup());
    }
  }

  function getEls(){
    return {
      links: document.getElementById('n-links'),
      navBar: document.getElementById('nav'),
      modal: document.getElementById('cal-modal')
    };
  }

  function syncBodyLock(){
    const {links, modal} = getEls();
    const locked = !!(links && links.classList.contains('mobile-open')) || !!(modal && modal.classList.contains('open'));
    document.body.classList.toggle('menu-locked', locked);
    document.body.style.overflow = locked ? 'hidden' : '';
  }

  let menuCloseTimer = null;

  function setMenu(open){
    const {links, navBar} = getEls();
    const burger = document.getElementById('burger');
    if(!links) return;
    if (menuCloseTimer) {
      clearTimeout(menuCloseTimer);
      menuCloseTimer = null;
    }

    if(open){
      links.classList.remove('mobile-closing');
      links.classList.add('mobile-open');
      if(navBar) navBar.classList.add('menu-open-nav');
      if (burger) burger.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(function(){
        links.classList.add('is-visible');
      });
      syncBodyLock();
      return;
    }

    links.classList.remove('is-visible');
    links.classList.remove('mobile-open');
    links.classList.add('mobile-closing');
    if(navBar) navBar.classList.remove('menu-open-nav');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    syncBodyLock();
    menuCloseTimer = setTimeout(function(){
      links.classList.remove('mobile-closing');
      syncBodyLock();
    }, 320);
  }

  window.closeBurger = function(){
    const {links} = getEls();
    if(links && (links.classList.contains('mobile-open') || links.classList.contains('mobile-closing'))) setMenu(false);
  };

  window.toggleBurger = function(){
    const {links} = getEls();
    if(!links) return;
    const isOpen = links.classList.contains('mobile-open') || links.classList.contains('mobile-closing');
    setMenu(!isOpen);
  };

  window.openCal = function(){
    const modal = document.getElementById('cal-modal');
    const isMobile = window.innerWidth <= 960;
    if (!isMobile && window.Calendly && Calendly.initPopupWidget) {
      Calendly.initPopupWidget({ url: 'https://calendly.com/yorik-tisseau-tmff/30min' });
      return false;
    }
    if (modal) {
      modal.classList.add('open');
      if (isMobile) initMobileCalendlyEmbed();
      syncBodyLock();
    }
    return false;
  };

  window.closeCal = function(){
    const modal = document.getElementById('cal-modal');
    if (modal) modal.classList.remove('open');
    syncBodyLock();
  };

  function initSharedInteractions(){
    const {navBar} = getEls();
    const fabEl = document.getElementById('mobile-fab');
    const legal = isLegalPage();
    if (legal) {
      document.body.classList.add('legal-page-view');
      if (navBar) navBar.classList.add('scrolled');
    }

    document.querySelectorAll('#n-links a').forEach(function(link){
      link.addEventListener('click', function(){
        if(window.innerWidth <= 960) window.closeBurger();
      });
    });

    window.addEventListener('scroll', function(){
      const y = window.scrollY;
      const freshNav = document.getElementById('nav');
      if (freshNav && !legal) freshNav.classList.toggle('scrolled', y > 55);
      if (fabEl) fabEl.classList.toggle('vis', y > 350);
      if(window.innerWidth <= 960) window.closeBurger();
    }, {passive:true});

    document.addEventListener('click', function(e){
      const modal = document.getElementById('cal-modal');
      if (modal && e.target === modal) window.closeCal();
    });

    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') {
        window.closeCal();
        window.closeBurger();
      }
    });

    window.addEventListener('resize', function(){
      if(window.innerWidth > 960) window.closeBurger();
      syncBodyLock();
    });
  }

  function initCalendlyBadge(){
    if (window.innerWidth <= 960) return;
    if (document.querySelector('.calendly-badge-widget')) return;
    ensureCalendlyScript(function(){
      if (!window.Calendly || !Calendly.initBadgeWidget) return;
      Calendly.initBadgeWidget({
        url: 'https://calendly.com/yorik-tisseau-tmff/30min',
        text: 'Let’s talk',
        color: '#C4476C',
        textColor: '#ffffff',
        branding: false
      });
    });
    return;
  }

  document.addEventListener('DOMContentLoaded', function(){
    renderShell();
    initSharedInteractions();
    initCalendlyBadge();
  });
  window.addEventListener('load', initCalendlyBadge);
})();
