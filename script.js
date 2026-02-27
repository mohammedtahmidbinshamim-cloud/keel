/* ========================================================
   MAISON NOIR — LUXURY INTERACTIONS & ANIMATIONS
   ======================================================== */
document.addEventListener('DOMContentLoaded', () => {

    // ---- Page Load State ----
    const body = document.body;

    // Immediately apply loaded class so hero animations trigger
    body.classList.add('loaded');
    // ---- Hero Scrollytelling Animation ----
    initHeroSequence();

    function initHeroSequence() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas) return;

        const context = canvas.getContext('2d');
        const heroSection = document.getElementById('hero');
        if (!context || !heroSection) return;

        // Configuration
        const frameCount = 192; // 192 frames in the sequence
        const currentFrame = index => (
            `public/sequence/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`
        );

        const images = [];
        let currentDrawIndex = -1;

        // 1. Preload Images
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.src = currentFrame(i);

            img.onload = () => {
                images[i - 1] = img;

                // If the first frame loads, ensure it draws instantly
                if (i === 1) {
                    resizeCanvas();
                } else if (currentDrawIndex === i - 1) {
                    // If the current scroll needed this frame and it just loaded, draw it!
                    drawFrame(currentDrawIndex);
                }
            };
            img.onerror = () => {
                // If it fails, mark as empty object
                images[i - 1] = null;
            };
        }

        // 2. Sizing and Drawing Setup
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            updateFrame();
        }

        function drawFrame(index) {
            currentDrawIndex = index;
            // Fallback to the closest previously loaded frame if this one isn't ready
            let img = images[index];

            if (!img) {
                // find closest loaded frame going backwards
                for (let j = index; j >= 0; j--) {
                    if (images[j]) {
                        img = images[j];
                        break;
                    }
                }
            }
            // if still no image, exit
            if (!img) return;

            context.clearRect(0, 0, canvas.width, canvas.height);

            // Always use cover — fill the entire viewport, no black bars
            const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
            const drawWidth = img.width * scale;
            const drawHeight = img.height * scale;

            // Center the image
            const x = (canvas.width - drawWidth) / 2;
            const y = (canvas.height - drawHeight) / 2;

            context.drawImage(img, x, y, drawWidth, drawHeight);
        }

        // 3. Scroll Logic Mapping
        let ticking = false;

        const heroTagline = document.getElementById('hero-tagline');

        function updateFrame() {
            const rect = heroSection.getBoundingClientRect();

            // The container height is 300vh, the sticky part is 100vh.
            // So total scrollable distance within container is 200vh
            const maxScroll = heroSection.offsetHeight - window.innerHeight;

            // rect.top is 0 when the container starts. It goes negative as we scroll.
            let progress = -rect.top / maxScroll;

            // Clamp between 0 and 1
            progress = Math.max(0, Math.min(1, progress));

            // Map progress to frame index (0 to frameCount - 1)
            let frameIndex = Math.floor(progress * (frameCount - 1));

            drawFrame(frameIndex);

            // Fade out hero tagline during the first 30% of scroll progress
            if (heroTagline) {
                const fadeEnd = 0.3; // fully gone by 30% scroll progress
                const taglineOpacity = Math.max(0, 1 - (progress / fadeEnd));
                const taglineShift = progress / fadeEnd * 30; // drift upward
                heroTagline.style.opacity = taglineOpacity;
                heroTagline.style.transform = `translateY(-${Math.min(taglineShift, 30)}px)`;
            }

            ticking = false;
        }

        window.addEventListener('resize', resizeCanvas);

        window.addEventListener('scroll', () => {
            const rect = heroSection.getBoundingClientRect();

            if (rect.top <= window.innerHeight && rect.bottom >= 0) {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        updateFrame();
                    });
                    ticking = true;
                }
            }
        }, { passive: true });

        // Initial setup
        resizeCanvas();
    }

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
        const hoverTargets = document.querySelectorAll('a, button, .product-card');
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => cursorDot.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursorDot.classList.remove('hover'));
        });
    }


    // ---- Navigation Scroll Effect ----
    const nav = document.getElementById('main-nav');
    const heroContainer = document.getElementById('hero');
    let lastScroll = 0;

    // Start with hero style since page loads at top
    if (heroContainer) {
        nav.classList.add('nav--hero');
    }

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // Only make nav opaque after scrolling past the entire hero sequence
        const heroEnd = heroContainer ? heroContainer.offsetTop + heroContainer.offsetHeight : 60;
        if (scrollY > heroEnd) {
            nav.classList.add('scrolled');
            nav.classList.remove('nav--hero');
        } else {
            nav.classList.remove('scrolled');
            if (heroContainer) {
                nav.classList.add('nav--hero');
            }
        }

        lastScroll = scrollY;
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


    // ---- Product Variants Modal ----
    const variantsModal = document.getElementById('variants-modal');
    const variantsBackdrop = document.getElementById('variants-modal-backdrop');
    const variantsClose = document.getElementById('variants-modal-close');
    const variantsTitle = document.getElementById('variants-modal-title');
    const variantsGrid = document.getElementById('variants-modal-grid');

    const productData = {
        signature: {
            title: 'Signature Collection',
            variants: [
                { image: 'assets/signature1.jpeg', name: 'Signature Classic' },
                { image: 'assets/signature2.jpeg', name: 'Signature Hazelnut' }
            ]
        },
        kunafa: {
            title: 'Kunafa Chocolates',
            variants: [
                { image: 'assets/kunafa.jpeg', name: 'Original' },
                { image: 'assets/cottoncandykunafa.jpeg', name: 'Cotton Candy' },
                { image: 'assets/lotuskunafa.png', name: 'Lotus' },
                { image: 'assets/mangokunafa.png', name: 'Mango' },
                { image: 'assets/nutellakunafa.png', name: 'Nutella' },
                { image: 'assets/oreokunafa.png', name: 'Oreo' }
            ]
        }
    };

    function openVariantsModal(productKey) {
        const data = productData[productKey];
        if (!data || !variantsModal) return;

        variantsTitle.textContent = data.title;
        variantsGrid.innerHTML = '';

        data.variants.forEach((variant, i) => {
            const card = document.createElement('div');
            card.className = 'variant-card';
            card.style.transitionDelay = `${i * 0.1}s`;
            card.innerHTML = `
                <div class="variant-card__image-wrap">
                    <img src="${variant.image}" alt="${variant.name}" class="variant-card__image">
                    <div class="variant-card__shine"></div>
                </div>
                <p class="variant-card__name">${variant.name}</p>
            `;
            variantsGrid.appendChild(card);
        });

        variantsModal.classList.add('open');
        variantsModal.setAttribute('aria-hidden', 'false');
        body.style.overflow = 'hidden';
    }

    function closeVariantsModal() {
        if (!variantsModal) return;
        variantsModal.classList.remove('open');
        variantsModal.setAttribute('aria-hidden', 'true');
        body.style.overflow = '';
    }

    // Attach click to product cards
    document.querySelectorAll('.product-card[data-product]').forEach(card => {
        card.addEventListener('click', () => {
            const productKey = card.getAttribute('data-product');
            openVariantsModal(productKey);
        });
    });

    // Close handlers
    if (variantsClose) variantsClose.addEventListener('click', closeVariantsModal);
    if (variantsBackdrop) variantsBackdrop.addEventListener('click', closeVariantsModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && variantsModal && variantsModal.classList.contains('open')) {
            closeVariantsModal();
        }
    });
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


    // ---- Hover Effect: Product Cards Light Sweep ----
    document.querySelectorAll('.product-card').forEach(card => {
        const shine = card.querySelector('.product-card__shine');
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


    // ---- Scroll Progress on Hero ----
    const hero = document.querySelector('.hero');
    const heroScrollLine = document.querySelector('.hero__scroll-line');

    if (hero && heroScrollLine) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const heroHeight = hero.offsetHeight;
            const progress = Math.min(scrollY / (heroHeight * 0.5), 1);
            heroScrollLine.style.opacity = 1 - progress;
        }, { passive: true });
    }


    // ---- Prevent FOUC: Ensure styles loaded ----
    body.style.visibility = 'visible';

});
