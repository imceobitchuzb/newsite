document.addEventListener('DOMContentLoaded', () => {
  // --- 1. State Management ---
  const state = {
    theme: localStorage.getItem('theme') || 'dark',
    accent: localStorage.getItem('accent') || 'cyan',
    lang: localStorage.getItem('lang') || 'ru',
    wordIndex: 0
  };

  // --- 2. Theme & Accent Setup ---
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.innerHTML = theme === 'dark' 
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    }
  }

  function applyAccent(accent) {
    document.documentElement.setAttribute('data-accent', accent);
    localStorage.setItem('accent', accent);
    document.querySelectorAll('.color-dot').forEach(dot => {
      dot.classList.toggle('active', dot.dataset.color === accent);
    });
  }

  applyTheme(state.theme);
  applyAccent(state.accent);

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(state.theme);
  });

  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const color = dot.dataset.color;
      state.accent = color;
      applyAccent(color);
      showToast(`${translations[state.lang].toastAccentChanged} ${color.toUpperCase()}`);
    });
  });

  // --- 3. Language Switcher ---
  function applyLanguage(lang) {
    state.lang = lang;
    localStorage.setItem('lang', lang);

    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
      langBtn.textContent = lang === 'ru' ? 'EN' : 'RU';
    }

    const dict = translations[lang];
    if (!dict) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) {
        el.placeholder = dict[key];
      }
    });

    // Restart rotating word cycle for the current language
    updateRotatingWord();
  }

  document.getElementById('lang-toggle')?.addEventListener('click', () => {
    const nextLang = state.lang === 'ru' ? 'en' : 'ru';
    applyLanguage(nextLang);
  });

  // --- 4. Rotating Hero Text ---
  const rotatingWordEl = document.getElementById('rotating-word');
  function updateRotatingWord() {
    if (!rotatingWordEl) return;
    const words = translations[state.lang].heroRotatingWords;
    state.wordIndex = (state.wordIndex + 1) % words.length;
    rotatingWordEl.style.opacity = '0';
    rotatingWordEl.style.transform = 'translateY(10px)';
    setTimeout(() => {
      rotatingWordEl.textContent = words[state.wordIndex];
      rotatingWordEl.style.opacity = '1';
      rotatingWordEl.style.transform = 'translateY(0)';
    }, 250);
  }

  if (rotatingWordEl) {
    rotatingWordEl.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    setInterval(updateRotatingWord, 3200);
  }

  // Initial language application
  applyLanguage(state.lang);

  // --- 5. Sticky Header on Scroll ---
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, { passive: true });

  // --- 6. Mobile Menu Drawer ---
  const menuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      menuBtn.classList.toggle('open');
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        menuBtn.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  // --- 7. Live Animated Number Counters ---
  const counters = document.querySelectorAll('.counter-val');
  let countersAnimated = false;

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersAnimated) {
        countersAnimated = true;
        counters.forEach(counter => {
          const target = +counter.getAttribute('data-target');
          const duration = 1500;
          const stepTime = 20;
          const steps = duration / stepTime;
          const increment = target / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              counter.textContent = target + (counter.getAttribute('data-suffix') || '');
              clearInterval(timer);
            } else {
              counter.textContent = Math.floor(current) + (counter.getAttribute('data-suffix') || '');
            }
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) counterObserver.observe(statsSection);

  // --- 8. Showcase Filter Tabs ---
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => { card.style.display = 'none'; }, 200);
        }
      });
    });
  });

  // --- 9. Project Detail Modal ---
  const modal = document.getElementById('project-modal');
  const modalClose = document.getElementById('modal-close');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalTags = document.getElementById('modal-tags');
  const modalActionBtn = document.getElementById('modal-action-btn');

  const projectDetails = {
    "1": {
      title: "NovaCloud Analytics Suite",
      desc: "Comprehensive real-time telemetry dashboard featuring sub-second data streaming, high-density SVG graphs, automated incident alerting, and multi-tenant security architecture.",
      tags: ["TypeScript", "WebSockets", "Canvas UI", "FastAPI"],
      link: "https://github.com/imceobitchuzb/newsite"
    },
    "2": {
      title: "Apex Design System & Tokens",
      desc: "Universal, battle-tested UI token library supporting dynamic theme switching, WCAG 2.1 AA accessibility standards, fluid typography scales, and modular micro-components.",
      tags: ["CSS Architecture", "Design Tokens", "Glassmorphism", "Figma"],
      link: "https://github.com/imceobitchuzb/newsite"
    },
    "3": {
      title: "HyperFlow AI Orchestrator",
      desc: "Minimalist client-side interface for connecting intelligent agent pipelines, tracking task dependencies, and streaming real-time token outputs with low latency.",
      tags: ["ES6+", "Edge Computing", "AI Integrations", "Reactive UI"],
      link: "https://github.com/imceobitchuzb/newsite"
    },
    "4": {
      title: "Quantum Pay Mobile Gateway",
      desc: "Cross-platform payment checkout experience optimized for high conversion rates, biometric authentication, and instant receipt dispatching.",
      tags: ["Mobile UX", "Stripe API", "Security", "PWA"],
      link: "https://github.com/imceobitchuzb/newsite"
    },
    "5": {
      title: "Krypton WebGL Interactive Hub",
      desc: "A mesmerizing 3D product showcase utilizing WebGL shaders, realistic ambient lighting, and physics-driven particle simulations for immersive brand stories.",
      tags: ["Three.js", "GLSL Shaders", "Audio Reactive", "Web Workers"],
      link: "https://github.com/imceobitchuzb/newsite"
    },
    "6": {
      title: "OmniSync Edge Storage",
      desc: "Distributed client-side caching engine that guarantees zero offline disruption with encrypted IndexedDB sync and conflict resolution protocols.",
      tags: ["Service Workers", "Offline First", "IndexedDB", "Wasm"],
      link: "https://github.com/imceobitchuzb/newsite"
    }
  };

  document.querySelectorAll('.open-modal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.getAttribute('data-project-id');
      const data = projectDetails[id];
      if (data && modal) {
        if (modalTitle) modalTitle.textContent = data.title;
        if (modalDesc) modalDesc.textContent = data.desc;
        if (modalTags) {
          modalTags.innerHTML = data.tags.map(t => `<span class="tag-badge">${t}</span>`).join('');
        }
        if (modalActionBtn) modalActionBtn.href = data.link;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeModal() {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('active')) closeModal();
  });

  // --- 10. FAQ Accordion ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question?.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });

  // --- 11. Toast Notifications ---
  function showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  // --- 12. Contact Form Submission Simulation ---
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = '...';
      submitBtn.disabled = true;

      setTimeout(() => {
        showToast(translations[state.lang].toastSuccess);
        contactForm.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }, 700);
    });
  }

  // --- 13. Interactive Ambient Particle Canvas ---
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let particles = [];
    const particleCount = Math.min(Math.floor((width * height) / 22000), 55);

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 1.6 + 0.8;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--canvas-particle') || 'rgba(255,255,255,0.2)';
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let mouse = { x: -1000, y: -1000 };
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    function animate() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.update();
        p1.draw();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(var(--primary-rgb), ${0.15 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }

        // Gentle reaction to cursor
        const mdx = p1.x - mouse.x;
        const mdy = p1.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 100) {
          p1.x += (mdx / mdist) * 0.8;
          p1.y += (mdy / mdist) * 0.8;
        }
      }

      requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });
  }
});
