/**
 * Ignis Leadership - shared.js
 * Handles component loading, navigation logic, and testimonial slider.
 */

(function() {
    // --- 1. COMPONENT LOADER ---
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
        const outcomesTrigger = outcomesDropdown?.querySelector('a');
        const dropdownMenu = document.querySelector('.nav-dropdown-menu');

        // Toggle mobile menu
        if (burger && nLinks) {
            burger.onclick = () => {
                const isOpen = nLinks.classList.toggle('mobile-open');
                nav.classList.toggle('menu-open-nav', isOpen);
                document.body.style.overflow = isOpen ? 'hidden' : '';
            };
        }

        // Handle Outcomes Dropdown (Mobile Click)
        if (outcomesTrigger) {
            outcomesTrigger.onclick = (e) => {
                if (window.innerWidth <= 960) {
                    e.preventDefault();
                    const isOpen = dropdownMenu.classList.toggle('mobile-open');
                    outcomesTrigger.classList.toggle('is-active', isOpen);
                }
            };
        }

        // Scroll Behavior
        window.addEventListener('scroll', () => {
            const y = window.scrollY;
            
            // Navbar background toggle
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
    // (Preserving your existing testimonial data and functions)
    const testimonials = [
        {name:'James Heath', role:'Deal Development at bp', quote:'Yorik has had a real impact...', photo:'images/testimonials/james.jpg', initials:'JH'},
        {name:'Michaela Valovicova', role:'Head of Marketing at Equans', quote:'Yorik supported me as I set up...', photo:'images/testimonials/michaela.jpg?v=2', initials:'MV'},
        {name:'Nadia Aljibouri', role:'Senior Project Manager at bp', quote:'Working with Yorik helped me...', photo:'images/testimonials/nadia.jpg', initials:'NA'},
        {name:'Raj Srivastava', role:'Senior Economist at Spirit Energy', quote:'During a period marked by setbacks...', photo:'images/testimonials/raj.jpg', initials:'RS'},
        {name:'Chloe MacLennan', role:'Reservoir Engineer at bp', quote:'Yorik helped me shift my mindset...', photo:'images/testimonials/chloe.jpg', initials:'CM'},
        {name:'Filipe Gongalves', role:'Sourcing Lead at bp', quote:'Your coaching helped me adapt...', photo:'images/testimonials/Filipe.jpeg?v=1', initials:'FG'},
        {name:'Barnabas Stolpe', role:'Recruiting Manager at bp', quote:'The work we did helped me shift...', photo:'images/testimonials/Barnabas.jpeg?v=1', initials:'BS'},
        {name:'Shovana Talukdar', role:'Senior Consultant at BVG Associates', quote:'I met Yorik during a significant transition...', photo:'images/testimonials/Shovana.jpeg?v=1', initials:'ST'}
    ];

    let testimonialIndex = 0;
    
    window.setTs = function(i) {
        testimonialIndex = i;
        const t = testimonials[i];
        const qName = document.getElementById('tcard-name');
        const qRole = document.getElementById('tcard-role');
        const qText = document.