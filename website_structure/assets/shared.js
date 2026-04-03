const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    menuToggle.classList.toggle('open');
  });
}

window.addEventListener('scroll', () => {
  if (mobileMenu && mobileMenu.classList.contains('open')) {
    mobileMenu.classList.remove('open');
    menuToggle.classList.remove('open');
  }
});

document.querySelectorAll('.mobile-menu a').forEach(link => {
  link.addEventListener('click', () => {
    if (mobileMenu) {
      mobileMenu.classList.remove('open');
      menuToggle.classList.remove('open');
    }
  });
});
