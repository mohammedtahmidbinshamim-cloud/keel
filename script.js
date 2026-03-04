/* ========================================================
   MAISON NOIR — LUXURY INTERACTIONS & ANIMATIONS
   ======================================================== */
document.addEventListener('DOMContentLoaded', () => {

    // ---- Page Load State ----
    const body = document.body;

    body.classList.add('loaded');

    // ---- Custom Cursor ----
    const cursorDot = document.querySelector('.cursor-dot');
    let cursorX = 0, cursorY = 0;
    let dotX = 0, dotY = 0;

    if (cursorDot && window.matchMedia('(pointer: fine)').matches) {
        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;
            cursorDot.classList.add('visible');
        });

        // Smooth follow
        function animateCursor() {
            dotX += (cursorX - dotX) * 0.12;
            dotY += (cursorY - dotY) * 0.12;
            cursorDot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Hover grow on interactive elements
        const hoverTargets = document.querySelectorAll('a, button, .product-group__header, .variant-card');
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => cursorDot.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursorDot.classList.remove('hover'));
        });
    }


    // ---- Navigation Scroll Effect ----
    const nav = document.getElementById('main-nav');
    const heroSection = document.getElementById('hero');

    // Start with hero style (transparent nav)
    if (heroSection) {
        nav.classList.add('nav--hero');
    }

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // Switch nav style based on hero position
        const heroEnd = heroSection ? heroSection.offsetTop + heroSection.offsetHeight : 60;
        if (scrollY > heroEnd - 100) {
            nav.classList.add('scrolled');
            nav.classList.remove('nav--hero');
        } else {
            nav.classList.remove('scrolled');
            if (heroSection) {
                nav.classList.add('nav--hero');
            }
        }
    }, { passive: true });


    // ---- Mobile Menu Toggle ----
    const menuBtn = document.getElementById('nav-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-menu__link');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            mobileMenu.classList.toggle('open');
            body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuBtn.classList.remove('active');
                mobileMenu.classList.remove('open');
                body.style.overflow = '';
            });
        });
    }




    // ---- Smooth Scroll for Anchor Links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });


    // ---- Intersection Observer: Reveal Animations ----
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.05
    };

    // Reveal individual items
    const revealItems = document.querySelectorAll('.reveal-item');
    const revealImages = document.querySelectorAll('.reveal-image');
    const revealProducts = document.querySelectorAll('.reveal-product');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealItems.forEach(item => revealObserver.observe(item));
    revealImages.forEach(img => revealObserver.observe(img));

    // Products: staggered reveal
    const productObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // Add stagger delay based on data attribute or fallback
                const cards = document.querySelectorAll('.reveal-product');
                const index = Array.from(cards).indexOf(entry.target);
                entry.target.style.transitionDelay = `${index * 0.2}s`;
                entry.target.classList.add('revealed');
                productObserver.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
    });

    revealProducts.forEach(product => productObserver.observe(product));

    // Philosophy divider special animation
    const dividers = document.querySelectorAll('.philosophy__divider');
    dividers.forEach(div => {
        const divObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    divObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        divObserver.observe(div);
    });


    // ---- Parallax Effect (very subtle) ----
    const parallaxImages = document.querySelectorAll('.parallax-img');

    function updateParallax() {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;

        parallaxImages.forEach(img => {
            const rect = img.getBoundingClientRect();
            const centerOffset = rect.top + rect.height / 2 - viewportHeight / 2;
            const parallaxAmount = centerOffset * 0.04; // Very low intensity
            img.style.transform = `translateY(${parallaxAmount}px)`;
        });
    }

    window.addEventListener('scroll', updateParallax, { passive: true });


    // ---- Ambient Grain Animation (Removed) ----
    const grainOverlay = document.querySelector('.grain-overlay');
    // Animation removed to stop flickering on the hero background


    // ---- Hover Effect: Variant Cards Light Sweep ----
    document.querySelectorAll('.variant-card').forEach(card => {
        const shine = card.querySelector('.variant-card__shine');
        if (!shine) return;

        card.addEventListener('mouseenter', () => {
            shine.style.transition = 'left 0.9s cubic-bezier(0.25, 0.1, 0.25, 1)';
            shine.style.left = '100%';
        });

        card.addEventListener('mouseleave', () => {
            // Reset without transition
            shine.style.transition = 'none';
            shine.style.left = '-100%';
        });
    });





    // ---- Prevent FOUC: Ensure styles loaded ----
    body.style.visibility = 'visible';

});
