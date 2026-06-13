

(function () {
  'use strict';


  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');

  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function animateCursor() {
    if (dot)  { dot.style.left  = mx + 'px'; dot.style.top  = my + 'px'; }


    rx += (mx - rx) * .14;
    ry += (my - ry) * .14;
    if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

 
  const TRAIL = 14;
  const trailDots = [];
  const trailPos  = Array.from({length: TRAIL}, () => ({ x: -100, y: -100 }));
  const COLORS    = ['#00d4ff','#00aaff','#ff0066','#ffea00'];

  for (let i = 0; i < TRAIL; i++) {
    const d = document.createElement('div');
    d.className = 'trail-dot';
    const size = Math.max(2, 6 - i * .35) + 'px';
    d.style.cssText = `width:${size};height:${size};background:${COLORS[i % COLORS.length]};opacity:${(1 - i / TRAIL).toFixed(2)};`;
    document.body.appendChild(d);
    trailDots.push(d);
  }

  (function animateTrail() {
    trailPos[0].x = mx; trailPos[0].y = my;
    for (let i = 1; i < TRAIL; i++) {
      trailPos[i].x += (trailPos[i-1].x - trailPos[i].x) * .35;
      trailPos[i].y += (trailPos[i-1].y - trailPos[i].y) * .35;
    }
    trailDots.forEach((d, i) => {
      d.style.left = trailPos[i].x + 'px';
      d.style.top  = trailPos[i].y + 'px';
    });
    requestAnimationFrame(animateTrail);
  })();

  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const PARTICLE_COUNT = 90;

    class Particle {
      constructor() { this.reset(true); }
      reset(initial = false) {
        this.x  = Math.random() * W;
        this.y  = initial ? Math.random() * H : H + 10;
        this.vx = (Math.random() - .5) * .3;
        this.vy = -(Math.random() * .6 + .2);
        this.size = Math.random() * 1.5 + .3;
        this.alpha = Math.random() * .5 + .1;
        this.color = ['#00d4ff','#00aaff','#ff0066'][Math.floor(Math.random()*3)];
        this.life = 1;
      }
      update() {
        this.x += this.vx + (mx - W/2) * .00012;
        this.y += this.vy;
        this.life -= .003;
        if (this.y < -10 || this.life <= 0) this.reset();
      }
      draw() {
        const isLight = document.body.classList.contains('light-mode');
        ctx.save();
        
    
        ctx.globalAlpha = isLight ? Math.min(1, this.alpha * this.life * 3) : (this.alpha * this.life);
        

        ctx.fillStyle = isLight ? this.getDarkerColor(this.color) : this.color;
        
        if (!isLight) {
          ctx.shadowColor = this.color;
          ctx.shadowBlur  = 6;
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      
    
      getDarkerColor(color) {
        const colors = {
          '#00d4ff': '#0088cc', 
          '#ff0066': '#cc0055'  
        };
        return colors[color] || color;
      }
    }

    particles = Array.from({length: PARTICLE_COUNT}, () => new Particle());


    function drawLines() {
      const isLight = document.body.classList.contains('light-mode');
      for (let i = 0; i < particles.length; i++) {
        for (let j = i+1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 120) {
            ctx.save();
            ctx.globalAlpha = (1 - dist/120) * (isLight ? .18 : .07);
            
            ctx.strokeStyle = isLight ? 'rgba(0, 212, 255, 0.4)' : '#00d4ff';
            ctx.lineWidth   = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }

    (function animateParticles() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      drawLines();
      requestAnimationFrame(animateParticles);
    })();
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('show'); }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.hidden').forEach(el => observer.observe(el));

  const roleEl = document.querySelector('.hero-text h2');
  if (roleEl) {
    const text = roleEl.dataset.text || roleEl.textContent.trim();
    roleEl.textContent = '';
    roleEl.style.cssText = 'border-right:2px solid var(--neon-pink); padding-right:4px; display:inline-block;';

    let idx = 0;
    function type() {
      if (idx < text.length) {
        roleEl.textContent += text[idx++];
        setTimeout(type, idx === 1 ? 800 : 75 + Math.random() * 40);
      } else {
        let v = true;
        setInterval(() => {
          roleEl.style.borderRightColor = (v = !v) ? 'var(--neon-pink)' : 'transparent';
        }, 530);
      }
    }
    setTimeout(type, 1200);
  }

  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('nav ul li a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 220) current = s.getAttribute('id');
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }, { passive: true });

  document.querySelectorAll('.btn, .contact-item').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top  + r.height / 2;
      const dx = (e.clientX - cx) * .22;
      const dy = (e.clientY - cy) * .22;
      btn.style.transform = `translate(${dx}px,${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = (e.clientX - r.left) / r.width  - .5;
      const y  = (e.clientY - r.top)  / r.height - .5;
      card.style.transform = `translateY(-8px) rotateX(${(-y*8).toFixed(1)}deg) rotateY(${(x*8).toFixed(1)}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  const grid = document.querySelector('.projects-grid');
  const prevBtn = document.querySelector('.prev-arrow');
  const nextBtn = document.querySelector('.next-arrow');

  if (grid && prevBtn && nextBtn) {
    let autoPlayInterval;

    const updateArrows = () => {
      const isAtStart = grid.scrollLeft <= 10;
      const isAtEnd = Math.ceil(grid.scrollLeft + grid.clientWidth) >= grid.scrollWidth - 10;
      
      prevBtn.style.opacity = isAtStart ? '0' : '1';
      prevBtn.style.pointerEvents = isAtStart ? 'none' : 'auto';
      
      nextBtn.style.opacity = isAtEnd ? '0' : '1';
      nextBtn.style.pointerEvents = isAtEnd ? 'none' : 'auto';
    };

    const getScrollStep = () => {
      const card = grid.querySelector('.project-card');
      const style = window.getComputedStyle(grid);
      const gap = parseInt(style.gap) || 0;
      return card ? (card.getBoundingClientRect().width + gap) : 300;
    };

    const startAutoPlay = () => {
      if (window.innerWidth > 968) return;
      stopAutoPlay();
      autoPlayInterval = setInterval(() => {
        const isAtEnd = Math.ceil(grid.scrollLeft + grid.clientWidth) >= grid.scrollWidth - 10;
        if (isAtEnd) {
          grid.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          grid.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
        }
      }, 4000); 
    };

    const stopAutoPlay = () => clearInterval(autoPlayInterval);

    nextBtn.addEventListener('click', () => {
      grid.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
      startAutoPlay(); 
    });

    prevBtn.addEventListener('click', () => {
      grid.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
      startAutoPlay(); 
    });

    grid.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);

    grid.addEventListener('touchstart', stopAutoPlay, { passive: true });
    grid.addEventListener('touchend', startAutoPlay, { passive: true });
    
    updateArrows();
    startAutoPlay();

    window.addEventListener('keydown', (e) => {
      const rect = grid.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        if (e.key === 'ArrowRight') grid.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
        if (e.key === 'ArrowLeft') grid.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
      }
    });
  }

})();


const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

const savedTheme = localStorage.getItem('portfolio-theme');

if (savedTheme === 'light') {
  document.body.classList.add('light-mode');
  if (themeIcon) {
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
  }
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');

    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark');

    if (themeIcon) {
      themeIcon.classList.toggle('fa-moon', !isLight);
      themeIcon.classList.toggle('fa-sun', isLight);
    }
  });
}

const mobileToggle = document.getElementById('mobile-menu-toggle');
const navLinksContainer = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links a');

if (mobileToggle && navLinksContainer) {
  mobileToggle.addEventListener('click', () => {
    navLinksContainer.classList.toggle('nav-active');
    
    const icon = mobileToggle.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
  });

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navLinksContainer.classList.remove('nav-active');
      mobileToggle.querySelector('i').className = 'fas fa-bars';
    });
  });

  document.addEventListener('click', (e) => {
    const isMenuOpen = navLinksContainer.classList.contains('nav-active');
    const clickedInsideMenu = navLinksContainer.contains(e.target);
    const clickedOnToggle = mobileToggle.contains(e.target);

    if (isMenuOpen && !clickedInsideMenu && !clickedOnToggle) {
      navLinksContainer.classList.remove('nav-active');
      const icon = mobileToggle.querySelector('i');
      icon.classList.replace('fa-times', 'fa-bars');
    }
  });
}