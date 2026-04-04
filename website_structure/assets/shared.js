
(function(){
  function getEls(){
    return {
      links: document.getElementById('n-links'),
      navBar: document.getElementById('nav')
    };
  }

  function setMenu(open){
    const {links, navBar} = getEls();
    if(!links) return;
    links.classList.toggle('mobile-open', open);
    if(navBar) navBar.classList.toggle('menu-open-nav', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  window.toggleBurger = function(){
    const {links} = getEls();
    if(!links) return;
    setMenu(!links.classList.contains('mobile-open'));
  };

  function closeMenu(){
    const {links} = getEls();
    if(links && links.classList.contains('mobile-open')) setMenu(false);
  }

  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('#n-links a').forEach(function(link){
      link.addEventListener('click', function(){ closeMenu(); });
    });
    window.addEventListener('scroll', function(){ closeMenu(); }, {passive:true});
    window.addEventListener('resize', function(){
      if(window.innerWidth > 960) closeMenu();
    });
  });
})();
