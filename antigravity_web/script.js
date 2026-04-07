document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------------------------------
    // 1. MOBILE MENU TOGGLE
    // ------------------------------------------------------------
    const burgerBtn = document.getElementById('burger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobLinks = document.querySelectorAll('.mob-link');

    burgerBtn.addEventListener('click', () => {
        burgerBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        
        // Prevent scroll when menu is open
        if(mobileMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    });

    // Close menu when link is clicked
    mobLinks.forEach(link => {
        link.addEventListener('click', () => {
            burgerBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });


    // ------------------------------------------------------------
    // 2. STICKY NAVBAR SCROLL EFFECT
    // ------------------------------------------------------------
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Add shadow/background blur on scroll
        if (currentScroll > 50) {
            navbar.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
            navbar.style.padding = '1rem 5%';
        } else {
            navbar.style.boxShadow = 'none';
            navbar.style.padding = '1.25rem 5%';
        }

        // Auto-hide navbar on scroll down, show on up
        if (currentScroll > lastScroll && currentScroll > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        lastScroll = currentScroll;
    });


    // ------------------------------------------------------------
    // 3. SCROLL REVEAL ANIMATION (INTERSECTION OBSERVER)
    // ------------------------------------------------------------
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target); // Reveal only once
            }
        });
    }, revealOptions);

    // Elements to reveal
    const revealTargets = [
        '.hero-content',
        '.section-tag',
        '.about h2',
        '.about p',
        '.feat-card',
        '.serv-card',
        '.contact-form-container'
    ];

    revealTargets.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.classList.add('reveal-init'); // Initial state (hidden)
            revealObserver.observe(el);
        });
    });

    // CSS for Reveal Init (Added via JS to ensure logic works)
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .reveal-init {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1), 
                        transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .revealed {
            opacity: 1;
            transform: translateY(0);
        }
        /* Stagger Feature Cards */
        .features-grid .feat-card:nth-child(2) { transition-delay: 0.2s; }
        .features-grid .feat-card:nth-child(3) { transition-delay: 0.4s; }
        
        /* Stagger Services Cards */
        .services-grid .serv-card:nth-child(2) { transition-delay: 0.2s; }
        .services-grid .serv-card:nth-child(3) { transition-delay: 0.4s; }
    `;
    document.head.appendChild(styleSheet);


    // ------------------------------------------------------------
    // 4. CONTACT FORM HANDLER
    // ------------------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('.submit-btn');
        submitBtn.textContent = 'Transmitting Data...';
        submitBtn.style.background = 'var(--text-dim)';
        submitBtn.disabled = true;

        // Simulated transmittion delay
        setTimeout(() => {
            submitBtn.textContent = 'Mission Accomplished';
            submitBtn.style.background = 'var(--clr-primary)';
            contactForm.reset();
            
            setTimeout(() => {
                submitBtn.textContent = 'Initiate Connection';
                submitBtn.disabled = false;
            }, 3000);
        }, 1500);
    });
});
