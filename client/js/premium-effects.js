/* ═══════════════════════════════════════════════════════════════════════════════
   FIXKAR PREMIUM 3D EFFECTS & ANIMATIONS
   Advanced 3D interactions, magnetic effects, and premium animations
   ═══════════════════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  //  INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════
  document.addEventListener('DOMContentLoaded', function() {
    initPremiumEffects();
  });

  function initPremiumEffects() {
    // initMagneticButtons();
    // init3DTilt();
    initParallax();
    initRevealAnimations();
    // initFloatingElements();
    initShineEffects();
    initSmoothScroll();
    initCountUp();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  MAGNETIC BUTTON EFFECT
  // ═══════════════════════════════════════════════════════════════════════════
  function initMagneticButtons() {
    const magneticElements = document.querySelectorAll('.magnetic-btn, .premium-btn, .premium-icon');
    
    magneticElements.forEach(el => {
      el.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const magnetStrength = 0.3;
        this.style.transform = `translate(${x * magnetStrength}px, ${y * magnetStrength}px) translateZ(20px)`;
      });
      
      el.addEventListener('mouseleave', function() {
        this.style.transform = '';
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  3D TILT EFFECT FOR CARDS
  // ═══════════════════════════════════════════════════════════════════════════
  function init3DTilt() {
    const tiltElements = document.querySelectorAll('.premium-card, .premium-search-widget');
    
    tiltElements.forEach(el => {
      el.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      });
      
      el.addEventListener('mouseleave', function() {
        this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        this.style.transition = 'transform 0.5s ease';
      });
      
      el.addEventListener('mouseenter', function() {
        this.style.transition = 'transform 0.1s ease';
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  PARALLAX SCROLL EFFECT
  // ═══════════════════════════════════════════════════════════════════════════
  function initParallax() {
    const parallaxElements = document.querySelectorAll('.parallax-slow, .parallax-fast, .premium-orb');
    
    let ticking = false;
    
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          const scrollY = window.scrollY;
          
          parallaxElements.forEach(el => {
            const speed = el.classList.contains('parallax-fast') ? 0.5 : 0.2;
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
  //  REVEAL ON SCROLL ANIMATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.premium-card, .premium-title, .premium-grid > *');
    
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0) rotateX(0)';
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    revealElements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(40px) rotateX(10deg)';
      el.style.transition = `all 0.8s cubic-bezier(0.23, 1, 0.32, 1) ${index * 0.1}s`;
      observer.observe(el);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FLOATING ELEMENTS ANIMATION
  // ═══════════════════════════════════════════════════════════════════════════
  function initFloatingElements() {
    const floatElements = document.querySelectorAll('.float-1, .float-2, .float-3');
    
    floatElements.forEach((el, index) => {
      const duration = 6 + index * 2;
      const delay = index * 0.5;
      el.style.animation = `float${index + 1} ${duration}s ease-in-out ${delay}s infinite`;
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  SHINE EFFECT ON HOVER
  // ═══════════════════════════════════════════════════════════════════════════
  function initShineEffects() {
    const shineElements = document.querySelectorAll('.shine-effect');
    
    shineElements.forEach(el => {
      el.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.style.setProperty('--shine-x', `${x}px`);
        this.style.setProperty('--shine-y', `${y}px`);
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  SMOOTH SCROLL
  // ═══════════════════════════════════════════════════════════════════════════
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
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
  //  COUNT UP ANIMATION FOR NUMBERS
  // ═══════════════════════════════════════════════════════════════════════════
  function initCountUp() {
    const countElements = document.querySelectorAll('[data-count]');
    
    const observerOptions = {
      threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const count = parseInt(target.getAttribute('data-count'));
          const duration = 2000;
          const step = count / (duration / 16);
          let current = 0;
          
          const timer = setInterval(() => {
            current += step;
            if (current >= count) {
              target.textContent = count.toLocaleString();
              clearInterval(timer);
            } else {
              target.textContent = Math.floor(current).toLocaleString();
            }
          }, 16);
          
          observer.unobserve(target);
        }
      });
    }, observerOptions);
    
    countElements.forEach(el => observer.observe(el));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  MOUSE TRAIL EFFECT
  // ═══════════════════════════════════════════════════════════════════════════
  const mouseTrail = {
    dots: [],
    maxDots: 20,
    
    init: function() {
      for (let i = 0; i < this.maxDots; i++) {
        const dot = document.createElement('div');
        dot.style.cssText = `
          position: fixed;
          width: ${8 - i * 0.3}px;
          height: ${8 - i * 0.3}px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(102, 126, 234, ${1 - i * 0.05}), transparent);
          pointer-events: none;
          z-index: 9999;
          opacity: ${1 - i * 0.05};
          transition: transform 0.1s ease;
        `;
        document.body.appendChild(dot);
        this.dots.push({ el: dot, x: 0, y: 0 });
      }
      
      document.addEventListener('mousemove', (e) => this.update(e));
    },
    
    update: function(e) {
      this.dots[0].x = e.clientX;
      this.dots[0].y = e.clientY;
      
      for (let i = 1; i < this.dots.length; i++) {
        const prev = this.dots[i - 1];
        const curr = this.dots[i];
        
        curr.x += (prev.x - curr.x) * 0.3;
        curr.y += (prev.y - curr.y) * 0.3;
      }
      
      this.dots.forEach(dot => {
        dot.el.style.transform = `translate(${dot.x - 4}px, ${dot.y - 4}px)`;
      });
    }
  };

  // Initialize mouse trail on non-touch devices
  if (!window.matchMedia('(pointer: coarse)').matches) {
    mouseTrail.init();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  PREMIUM CURSOR
  // ═══════════════════════════════════════════════════════════════════════════
  const premiumCursor = {
    cursor: null,
    cursorDot: null,
    
    init: function() {
      if (window.matchMedia('(pointer: coarse)').matches) return;
      
      this.cursor = document.createElement('div');
      this.cursorDot = document.createElement('div');
      
      this.cursor.style.cssText = `
        position: fixed;
        width: 40px;
        height: 40px;
        border: 2px solid rgba(102, 126, 234, 0.5);
        border-radius: 50%;
        pointer-events: none;
        z-index: 10000;
        transition: transform 0.15s ease, width 0.3s ease, height 0.3s ease, border-color 0.3s ease;
        transform: translate(-50%, -50%);
      `;
      
      this.cursorDot.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-radius: 50%;
        pointer-events: none;
        z-index: 10001;
        transform: translate(-50%, -50%);
      `;
      
      document.body.appendChild(this.cursor);
      document.body.appendChild(this.cursorDot);
      
      let mouseX = 0, mouseY = 0;
      let cursorX = 0, cursorY = 0;
      
      document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        this.cursorDot.style.left = mouseX + 'px';
        this.cursorDot.style.top = mouseY + 'px';
      });
      
      const animate = () => {
        cursorX += (mouseX - cursorX) * 0.1;
        cursorY += (mouseY - cursorY) * 0.1;
        this.cursor.style.left = cursorX + 'px';
        this.cursor.style.top = cursorY + 'px';
        requestAnimationFrame(animate);
      };
      animate();
      
      // Hover effects
      const hoverElements = document.querySelectorAll('a, button, .premium-card, .premium-btn');
      hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
          this.cursor.style.width = '60px';
          this.cursor.style.height = '60px';
          this.cursor.style.borderColor = 'rgba(255, 215, 0, 0.5)';
        });
        
        el.addEventListener('mouseleave', () => {
          this.cursor.style.width = '40px';
          this.cursor.style.height = '40px';
          this.cursor.style.borderColor = 'rgba(102, 126, 234, 0.5)';
        });
      });
    }
  };
  
  premiumCursor.init();

  // ═══════════════════════════════════════════════════════════════════════════
  //  SCROLL PROGRESS INDICATOR
  // ═══════════════════════════════════════════════════════════════════════════
  const scrollProgress = {
    init: function() {
      const progressBar = document.createElement('div');
      progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
        z-index: 10002;
        transition: width 0.1s ease;
        box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
      `;
      document.body.appendChild(progressBar);
      
      window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
      });
    }
  };
  
  scrollProgress.init();

  // ═══════════════════════════════════════════════════════════════════════════
  //  TEXT SCRAMBLE EFFECT
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
          output += `<span style="color: #667eea">${char}</span>`;
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

  // Initialize text scramble on premium titles
  document.querySelectorAll('.scramble-text').forEach(el => {
    const fx = new TextScramble(el);
    let counter = 0;
    const phrases = el.dataset.phrases ? el.dataset.phrases.split(',') : [el.innerText];
    
    const next = () => {
      fx.setText(phrases[counter]).then(() => {
        setTimeout(next, 3000);
      });
      counter = (counter + 1) % phrases.length;
    };
    
    next();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //  LOADING ANIMATION
  // ═══════════════════════════════════════════════════════════════════════════
  window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Remove loader if exists
    const loader = document.querySelector('.premium-loader-container');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 500);
    }
  });

})();
