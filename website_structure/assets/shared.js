/**
 * Ignis Leadership - shared.js
 * Handles component loading, navigation logic, and testimonial slider.
 */

(function() {
    // --- 1. COMPONENT LOADER ---
    // Uses absolute paths to ensure components load on root and sub-pages (like /outcomes/)
    async function loadComponent(id, path) {
        const el = document.getElementById(id);
        if (!el) return;
        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const html = await response.text();
            el.innerHTML = html;
            return true;
        } catch (e) {
            console.error(`Failed to load component ${path}:`, e);
        }
    }

    // --- 2. NAVIGATION & DROPDOWN LOGIC ---
    function initNavigation() {
        const nav = document.getElementById('nav');
        const burger = document.getElementById('burger');
        const nLinks = document.getElementById('n-links');
        const outcomesDropdown = document.querySelector('.nav-outcomes-dropdown');
        const outcomesTrigger = outcomesDropdown?.querySelector('.dropdown-trigger');
        const dropdownMenu = document.querySelector('.nav-dropdown-menu');

        // Toggle mobile menu (Burger)
        if (burger && nLinks) {
            burger.onclick = () => {
                const isOpen = nLinks.classList.toggle('mobile-open');
                nav.classList.toggle('menu-open-nav', isOpen);
                document.body.style.overflow = isOpen ? 'hidden' : '';
            };
        }

        // Handle Outcomes Dropdown (Mobile Click/Toggle)
        if (outcomesTrigger) {
            outcomesTrigger.onclick = (e) => {
                if (window.innerWidth <= 960) {
                    e.preventDefault();
                    const isOpen = dropdownMenu.classList.toggle('mobile-open');
                    outcomesTrigger.classList.toggle('is-active', isOpen);
                }
            };
        }

        // Scroll Behavior: Background toggle and auto-close dropdown
        window.addEventListener('scroll', () => {
            const y = window.scrollY;
            
            // Navbar background transition
            const isLegal = document.body.classList.contains('legal-page-view');
            if (nav && !isLegal) {
                nav.classList.toggle('scrolled', y > 55);
            }

            // Usual Functionality: Close mobile dropdown on scroll
            if (window.innerWidth <= 960 && dropdownMenu?.classList.contains('mobile-open')) {
                dropdownMenu.classList.remove('mobile-open');
                outcomesTrigger.classList.remove('is-active');
            }
        }, { passive: true });
    }

    // --- 3. TESTIMONIAL SLIDER LOGIC ---
    const testimonials = [
        {name:'James Heath', role:'Deal Development at bp', quote:'Yorik has had a real impact...', photo:'/images/testimonials/james.jpg', initials:'JH'},
        {name:'Michaela Valovicova', role:'Head of Marketing at Equans', quote:'Yorik supported me as I set up...', photo:'/images/testimonials/michaela.jpg?v=2', initials:'MV'},
        {name:'Nadia Aljibouri', role:'Senior Project Manager at bp', quote:'Working with Yorik helped me...', photo:'/images/testimonials/nadia.jpg', initials:'NA'},
        {name:'Raj Srivastava', role:'Senior Economist at Spirit Energy', quote:'During a period marked by setbacks...', photo:'/images/testimonials/raj.jpg', initials:'RS'},
        {name:'Chloe MacLennan', role:'Reservoir Engineer at bp', quote:'Yorik helped me