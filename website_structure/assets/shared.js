(function(){
  function getPageKey(){
    const path = window.location.pathname.toLowerCase();
    if (path.includes('about')) return 'about';
    return 'home';
  }

  function headerMarkup(pageKey){
    const active = (key) => pageKey === key ? 'active' : '';
    return `
    <nav id="nav">
      <a class="n-logo" href="index.html"><img src="images/logo nav bar.png" alt="Ignis Leadership"></a>
      <ul class="n-links" id="n-links">
        <li><a href="index.html" class="${active('home')}">Home</a></li>
        <li><a href="about.html" class="${active('about')}">About</a></li>
        <li class="nav-outcomes-dropdown">
          <a href="#">Outcomes <span class="arrow"></span></a>
          <div class="nav-dropdown-menu">
            <a href="outcome-1.html">Executive Presence</a>
            <a href="outcome-2.html">Strategic Clarity</a>
            <a href="outcome-3.html">Authentic Identity</a>
            <a href="outcome-4.html">Performance Anxiety</a>
            <a href="outcome-5.html">High-Stakes Influence</a>
            <a href="outcome-6.html">Sustainable Energy</a>
          </div>
        </li>
        <li><a class="n-cta" href="#" onclick="openCal(); return false;">Let’s talk</a></li>
      </ul>
      <button class="n-burger" id="burger" onclick="toggleBurger()"><span></span><span></span><span></span></button>
    </nav>`;
  }

  function footerMarkup(){
    return `
    <footer>
      <div class="f-top">
        <div class="f-brand">
          <img src="images/logo nav bar.png" alt="Ignis Leadership" class="f-logo">
          <p class="f-tagline">Where high performance<br>meets inner clarity.</p>
        </div>
        <div>
          <p class="f-col-label">Navigate</p>
          <ul class="f-col-links">
            <li><a href="index.html">Home</a></li>
            <li><a href="about.html">About</a></li>
          </ul>
        </div>
        <div>
          <p class="f-col-label">Connect</p>
          <ul class="f-col-links">
            <li><a href="mailto:yorik@ignisleadership.com">yorik@ignisleadership.com</a></li>
          </ul>
        </div>
      </div>
      <div class="f-bottom">
        <div class="f-bottom-inner">
          <span class="f-copy">&copy; 2026 Ignis Leadership Ltd.</span>
        </div>
      </div>
    </footer>`;
  }

  // --- CORE SYSTEM FUNCTIONS ---
  window.toggleBurger = function() {
    const links = document.getElementById('n-links');
    const nav = document.getElementById('nav');
    links.classList.toggle('mobile-open');
    nav.classList.toggle('menu-open-nav');
    document.body.classList.toggle('menu-locked');
  };

  document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('site-header');
    const footer = document.getElementById('site-footer');
    if (header) header.innerHTML = headerMarkup(getPageKey());
    if (footer) footer.innerHTML = footerMarkup();
    
    // Auto-scroll logic for header
    window.addEventListener('scroll', () => {
      const nav = document.getElementById('nav');
      if(nav) nav.classList.toggle('scrolled', window.scrollY > 50);
    }, {passive: true});
  });
})();