/* ═══════════════════════════════════════════════════════════════════════════════
   FIXKAR AMAZING EFFECTS & INTERACTIONS
   Scroll Reveal • Mouse Tracking • Magnetic Effects • Parallax
   ═══════════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════════
    //  INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════
    document.addEventListener('DOMContentLoaded', function () {
        initScrollReveal();
        initMouseTracking();
        initMagneticElements();
        initParallax();
        initCardTilt();
        initNeonButtons();
        initSmoothScroll();
        initParticleInteraction();
    });

    // ═══════════════════════════════════════════════════════════════════════════
    //  SCROLL REVEAL ANIMATION
    // ═══════════════════════════════════════════════════════════════════════════
    function initScrollReveal() {
        const revealElements = document.querySelectorAll(
            '.glass-card, .trust-card, .how-card, .admin-card, ' +
            '.search-widget, .services-strip, #footer, .section-h2, .section-sub'
        );

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Add stagger delay based on element index
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0) rotateX(0) scale(1)';
                        entry.target.classList.add('revealed');
                    }, index * 100);

                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach((el) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(50px) rotateX(15deg) scale(0.95)';
            el.style.transition = 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
            observer.observe(el);
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  MOUSE TRACKING FOR CARDS
    // ═══════════════════════════════════════════════════════════════════════════
    function initMouseTracking() {
        const cards = document.querySelectorAll('.glass-card, .trust-card, .how-card');

        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Update CSS variables for gradient position
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  MAGNETIC ELEMENTS
    // ═══════════════════════════════════════════════════════════════════════════
    function initMagneticElements() {
        const magneticElements = document.querySelectorAll('.nav-cta, .search-btn, .service-chip, .cbtn');

        magneticElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                const strength = 0.3;
                el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  PARALLAX EFFECTS
    // ═══════════════════════════════════════════════════════════════════════════
    function initParallax() {
        const parallaxElements = document.querySelectorAll('.hero-visuals img, .card-stat-mini');
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollY = window.scrollY;

                    parallaxElements.forEach((el, index) => {
                        const speed = (index % 2 === 0) ? 0.5 : -0.3;
                        const yPos = scrollY * speed;
                        el.style.transform = `translateY(${yPos}px)`;
                    });

                    ticking = false;
                });

                ticking = true;
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  3D CARD TILT
    // ═══════════════════════════════════════════════════════════════════════════
    function initCardTilt() {
        const tiltCards = document.querySelectorAll('.glass-card, .trust-card, .how-card');

        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  NEON BUTTON EFFECT
    // ═══════════════════════════════════════════════════════════════════════════
    function initNeonButtons() {
        const neonButtons = document.querySelectorAll('.nav-cta, .search-btn, .submit-btn');

        neonButtons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.boxShadow = `
          0 0 20px rgba(99, 102, 241, 0.6),
          0 0 40px rgba(99, 102, 241, 0.4),
          0 0 60px rgba(99, 102, 241, 0.2)
        `;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.boxShadow = '';
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  SMOOTH SCROLL
    // ═══════════════════════════════════════════════════════════════════════════
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  PARTICLE INTERACTION
    // ═══════════════════════════════════════════════════════════════════════════
    function initParticleInteraction() {
        const particles = document.querySelectorAll('.particle');
        let mouseX = 0;
        let mouseY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            particles.forEach((particle, index) => {
                if (index % 5 === 0) { // Only affect some particles for performance
                    const rect = particle.getBoundingClientRect();
                    const particleX = rect.left + rect.width / 2;
                    const particleY = rect.top + rect.height / 2;

                    const distX = mouseX - particleX;
                    const distY = mouseY - particleY;
                    const distance = Math.sqrt(distX * distX + distY * distY);

                    if (distance < 150) {
                        const force = (150 - distance) / 150;
                        particle.style.transform = `translate(${-distX * force * 0.3}px, ${-distY * force * 0.3}px)`;
                    }
                }
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  TEXT SCRAMBLE EFFECT FOR HERO
    // ═══════════════════════════════════════════════════════════════════════════
    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}—=+*^?#________';
            this.update = this.update.bind(this);
        }

        setText(newText) {
            const oldText = this.el.innerText;
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise((resolve) => this.resolve = resolve);
            this.queue = [];

            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 40);
                const end = start + Math.floor(Math.random() * 40);
                this.queue.push({ from, to, start, end });
            }

            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return promise;
        }

        update() {
            let output = '';
            let complete = 0;

            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];

                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = this.randomChar();
                        this.queue[i].char = char;
                    }
                    output += `<span class="scramble-char">${char}</span>`;
                } else {
                    output += from;
                }
            }

            this.el.innerHTML = output;

            if (complete === this.queue.length) {
                this.resolve();
            } else {
                this.frameRequest = requestAnimationFrame(this.update);
                this.frame++;
            }
        }

        randomChar() {
            return this.chars[Math.floor(Math.random() * this.chars.length)];
        }
    }

    // Initialize text scramble for hero title
    const heroTitle = document.querySelector('.hero-h1');
    if (heroTitle) {
        const fx = new TextScramble(heroTitle);
        const originalText = heroTitle.innerText;

        // Start scramble after a short delay
        setTimeout(() => {
            fx.setText(originalText);
        }, 500);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  CURSOR TRAIL EFFECT
    // ═══════════════════════════════════════════════════════════════════════════
    if (!window.matchMedia('(pointer: coarse)').matches) {
        const cursorDots = [];
        const maxDots = 12;

        for (let i = 0; i < maxDots; i++) {
            const dot = document.createElement('div');
            dot.style.cssText = `
        position: fixed;
        width: ${8 - i * 0.5}px;
        height: ${8 - i * 0.5}px;
        background: radial-gradient(circle, rgba(99, 102, 241, ${1 - i * 0.08}), transparent);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        opacity: ${1 - i * 0.08};
        transition: transform 0.1s ease;
      `;
            document.body.appendChild(dot);
            cursorDots.push({ el: dot, x: 0, y: 0 });
        }

        document.addEventListener('mousemove', (e) => {
            cursorDots[0].x = e.clientX;
            cursorDots[0].y = e.clientY;
        });

        function updateCursorDots() {
            for (let i = 1; i < cursorDots.length; i++) {
                const prev = cursorDots[i - 1];
                const curr = cursorDots[i];

                curr.x += (prev.x - curr.x) * 0.3;
                curr.y += (prev.y - curr.y) * 0.3;
            }

            cursorDots.forEach(dot => {
                dot.el.style.transform = `translate(${dot.x - 4}px, ${dot.y - 4}px)`;
            });

            requestAnimationFrame(updateCursorDots);
        }

        updateCursorDots();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  HERO VISUALS FLOATING ANIMATION
    // ═══════════════════════════════════════════════════════════════════════════
    const heroVisuals = document.querySelectorAll('.hero-visuals img, .card-stat-mini');
    heroVisuals.forEach((el, index) => {
        el.style.animation = `float${(index % 3) + 1} ${6 + index}s ease-in-out infinite`;
    });

})();
