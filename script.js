/* =========================================================
   PORTFOLIO — Keshav Kathiravan | script.js
   ========================================================= */

// Add fade-up class BEFORE DOM paint to avoid flash-of-invisible
document.addEventListener('DOMContentLoaded', () => {
  const targets = '.about-p, .service-row, .skill-col, .project-card, .edu-card, .stat, .contact-card, .lms-card, .skill-icons, .skill-icon-box';
  document.querySelectorAll(targets).forEach((el, i) => {
    el.classList.add('fade-up');
    el.style.transitionDelay = `${Math.min(i * 0.04, 0.3)}s`;
  });

  // Only observe fade-up elements during loading — typewriter handled after loader
  setupFadeObserver();
});

/* ── CURSOR — SVG Triangle (photo-negative) ─────────────── */
const cursorSVG = document.getElementById('cursor-svg');

document.addEventListener('mousemove', e => {
  // Offset so tip of triangle is at cursor point
  cursorSVG.style.left = (e.clientX - 2) + 'px';
  cursorSVG.style.top  = (e.clientY - 18) + 'px';
});
document.addEventListener('mouseleave', () => cursorSVG.style.opacity = '0');
document.addEventListener('mouseenter', () => cursorSVG.style.opacity = '1');

// Scale up on interactive elements
const scaleUp = () => { cursorSVG.style.transform = 'scale(1.4)'; cursorSVG.style.transition = 'transform .15s'; };
const scaleDown = () => { cursorSVG.style.transform = 'scale(1)'; cursorSVG.style.transition = 'transform .15s'; };
document.querySelectorAll('a,button,.glow-card,.copy-item,.nav-btn,.skill-icon-box,.visit-btn').forEach(el => {
  el.addEventListener('mouseenter', scaleUp);
  el.addEventListener('mouseleave', scaleDown);
});

/* ── NAV: CONTACT SCROLL ─────────────────────────────────── */
document.getElementById('btn-contact')?.addEventListener('click', e => {
  e.preventDefault();
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

/* ── INTERACTIVE BACKGROUND PIXELS ────────────────────────── */
const bgCanvas = document.getElementById('pixel-noise');
const bgCtx = bgCanvas ? bgCanvas.getContext('2d') : null;
const BG_PIXELS = [];

// Global mouse tracking for background
let globalMouseX = -999;
let globalMouseY = -999;
let bgMouseVx = 0;
let bgMouseVy = 0;
let lastGlobalX = -999;
let lastGlobalY = -999;
let isBgMouseActive = false;
let bgMouseTimeout;

const BG_COLOURS = ['#8AFF41', '#6aff20', '#aaff70', '#8DAF78', '#4a6a4a'];

if (bgCanvas && bgCtx) {
  function initBgPixels() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    BG_PIXELS.length = 0;
    
    // Density: roughly 150-200 particles for a standard 1080p screen
    const count = Math.floor((bgCanvas.width * bgCanvas.height) / 8000);

    for (let i = 0; i < count; i++) {
      BG_PIXELS.push({
        x: Math.random() * bgCanvas.width,
        y: Math.random() * bgCanvas.height,
        size: Math.random() < 0.7 ? 1 : 2,
        baseSpeedX: (Math.random() - 0.5) * 0.4,
        baseSpeedY: (Math.random() - 0.5) * 0.4,
        vx: 0,
        vy: 0,
        color: BG_COLOURS[Math.floor(Math.random() * BG_COLOURS.length)],
        baseAlpha: Math.random() * 0.5 + 0.1,
        alphaPulsePhase: Math.random() * Math.PI * 2,
        alphaPulseSpeed: 0.02 + Math.random() * 0.05
      });
    }
  }

  function drawBgPixels() {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

    for (const p of BG_PIXELS) {
      // Base movement
      p.x += p.baseSpeedX + p.vx;
      p.y += p.baseSpeedY + p.vy;
      
      // Smooth deceleration (less friction)
      p.vx *= 0.95;
      p.vy *= 0.95;
      
      // Flickering logic
      p.alphaPulsePhase += p.alphaPulseSpeed;
      const flicker = Math.sin(p.alphaPulsePhase) * 0.3;
      let displayAlpha = p.baseAlpha + flicker;
      
      // Mouse repel logic
      if (isBgMouseActive) {
        const dx = p.x - globalMouseX;
        const dy = p.y - globalMouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Repel radius: 150px
        if (dist < 150) {
          const force = (150 - dist) / 150;
          // Cap the cursor speed so crazy fast flicks don't send particles to infinity
          const rawSpeed = Math.sqrt(bgMouseVx * bgMouseVx + bgMouseVy * bgMouseVy);
          const speed = Math.min(rawSpeed, 40); 
          
          if (speed > 2) {
             // Much gentler push based on mouse velocity
             p.vx += (bgMouseVx * force * 0.03);
             p.vy += (bgMouseVy * force * 0.03);
             p.vx += (dx / dist) * force * speed * 0.05;
             p.vy += (dy / dist) * force * speed * 0.05;
          } else {
             // Very soft nudge
             p.vx += (dx / dist) * force * 0.15;
             p.vy += (dy / dist) * force * 0.15;
          }
          
          // Light up when interacted with
          displayAlpha = Math.min(displayAlpha + 0.5, 1);
        }
      }

      // Keep alpha in bounds
      displayAlpha = Math.max(0, Math.min(1, displayAlpha));

      // Screen wrap
      if (p.x < -10) p.x = bgCanvas.width + 10;
      if (p.x > bgCanvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = bgCanvas.height + 10;
      if (p.y > bgCanvas.height + 10) p.y = -10;

      // Draw pixel
      bgCtx.globalAlpha = displayAlpha;
      bgCtx.fillStyle = p.color;
      
      // If moving very fast, draw it slightly stretched like a motion blur streak
      const currentSpeed = Math.sqrt((p.baseSpeedX + p.vx)**2 + (p.baseSpeedY + p.vy)**2);
      if (currentSpeed > 2) {
        bgCtx.save();
        bgCtx.translate(p.x, p.y);
        bgCtx.rotate(Math.atan2(p.baseSpeedY + p.vy, p.baseSpeedX + p.vx));
        bgCtx.fillRect(0, -p.size/2, p.size + currentSpeed * 2, p.size);
        bgCtx.restore();
      } else {
        bgCtx.fillRect(p.x, p.y, p.size, p.size);
      }
    }
    
    // Decay mouse velocity
    bgMouseVx *= 0.85;
    bgMouseVy *= 0.85;
    
    bgCtx.globalAlpha = 1;
    requestAnimationFrame(drawBgPixels);
  }

  window.addEventListener('mousemove', (e) => {
    if (lastGlobalX !== -999) {
      bgMouseVx = e.clientX - lastGlobalX;
      bgMouseVy = e.clientY - lastGlobalY;
    }
    
    globalMouseX = e.clientX;
    globalMouseY = e.clientY;
    lastGlobalX = e.clientX;
    lastGlobalY = e.clientY;
    
    isBgMouseActive = true;
    clearTimeout(bgMouseTimeout);
    bgMouseTimeout = setTimeout(() => {
      isBgMouseActive = false;
      lastGlobalX = -999;
      lastGlobalY = -999;
    }, 150);
  });

  window.addEventListener('resize', initBgPixels);
  initBgPixels();
  requestAnimationFrame(drawBgPixels);
}

/* ── PAGE LOADER ─────────────────────────────────────────── */
const loaderEl  = document.getElementById('loader');
const loaderTxt = document.getElementById('loader-text');
const loaderBar = document.getElementById('loader-bar');
const loaderSts = document.getElementById('loader-status');
const mainEl    = document.getElementById('main-content');

const loaderLines = [
  '> BOOTING PORTFOLIO.EXE...',
  '> LOADING MODULES: [REACT][DJANGO][TYPESCRIPT]',
  '> INITIALIZING UI SYSTEMS...',
  '> COMPILING ASSETS...',
  '> ALL SYSTEMS NOMINAL.',
  '> WELCOME, KESHAV KATHIRAVAN.'
];

let lineIdx = 0, charIdx = 0, progress = 0;
let loaderInterval, barInterval;

function typeLoaderLine() {
  if (lineIdx >= loaderLines.length) {
    loaderSts.textContent = '[ READY ]';
    setTimeout(hideLoader, 400);
    return;
  }
  const line = loaderLines[lineIdx];
  if (charIdx < line.length) {
    loaderTxt.innerHTML += line[charIdx];
    charIdx++;
    setTimeout(typeLoaderLine, 28);
  } else {
    loaderTxt.innerHTML += '\n';
    lineIdx++;
    charIdx = 0;
    setTimeout(typeLoaderLine, 120);
  }
}

barInterval = setInterval(() => {
  if (progress < 100) {
    progress += 1.2;
    loaderBar.style.width = Math.min(progress, 100) + '%';
  } else clearInterval(barInterval);
}, 30);

setTimeout(typeLoaderLine, 300);

function hideLoader() {
  loaderEl.classList.add('fade-out');
  setTimeout(() => {
    loaderEl.style.display = 'none';
    mainEl.classList.remove('hidden');
    mainEl.classList.add('visible');
    startRoleWord();
    typeAllTitles();   // clear all typewriter text first
    setupFullObserver(); // then observe everything (typewriters + fade-ups)
  }, 800);
}

/* ── ROLE WORD ANIMATION ─────────────────────────────────── */
const roleWords  = ['FRONTEND', 'UX', 'FULLSTACK'];
const roleColors = ['#8AFF41',  '#00ccff', '#FFAA00'];
const roleEl     = document.getElementById('role-word');
let roleIdx = 0;

function startRoleWord() {
  roleEl.textContent = roleWords[0];
  roleEl.style.color = roleColors[0];
  roleEl.style.textShadow = `0 0 20px ${roleColors[0]}`;

  setInterval(() => {
    // fade out
    roleEl.style.opacity = '0';
    roleEl.style.transform = 'translateY(-8px)';
    setTimeout(() => {
      roleIdx = (roleIdx + 1) % roleWords.length;
      roleEl.textContent = roleWords[roleIdx];
      roleEl.style.color = roleColors[roleIdx];
      roleEl.style.textShadow = `0 0 24px ${roleColors[roleIdx]}`;
      roleEl.style.opacity = '1';
      roleEl.style.transform = 'translateY(0)';
    }, 300);
  }, 1800);

  roleEl.style.transition = 'opacity .3s, transform .3s, color .3s, text-shadow .3s';
}

/* ── TYPEWRITER FOR SECTION TITLES ───────────────────────── */
function typeText(el, text, speed = 38) {
  el.textContent = '';
  el.classList.remove('typed-done');
  let i = 0;
  function tick() {
    if (i < text.length) { el.textContent += text[i++]; setTimeout(tick, speed); }
    else el.classList.add('typed-done');
  }
  tick();
}

function typeAllTitles() {
  // Store original text and clear content — typewriter observer will fill them in
  document.querySelectorAll('.typewriter-el').forEach(el => {
    const text = el.dataset.text || el.textContent;
    el.dataset.text = text;
    el.textContent = '';
    delete el.dataset.typed; // reset typed flag so observer can re-trigger
  });
}

/* ── INTERSECTION OBSERVERS ──────────────────────────── */

// Fade-up only observer — used before loader finishes
function setupFadeObserver() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      if (en.target.classList.contains('fade-up')) en.target.classList.add('in-view');
      io.unobserve(en.target);
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => io.observe(el));
}

// Full observer — handles both typewriter and fade-up after loader
function setupFullObserver() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      if (el.classList.contains('typewriter-el') && !el.dataset.typed) {
        el.dataset.typed = '1';
        typeText(el, el.dataset.text, 36);
      }
      if (el.classList.contains('fade-up')) el.classList.add('in-view');
      io.unobserve(el);
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.typewriter-el, .fade-up').forEach(el => io.observe(el));
}

// (fade-up init moved to top of file)

/* ── GLOW CARD → MODAL OPEN ──────────────────────────────── */
document.querySelectorAll('.glow-card[data-modal]').forEach(card => {
  card.addEventListener('click', () => {
    const id = card.dataset.modal;
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('closing');
      modal.classList.add('open');
    }
  });
});

function closeModal(el) {
  if (!el || el.classList.contains('closing')) return;
  el.classList.add('closing');
  setTimeout(() => {
    el.classList.remove('open', 'closing');
  }, 260);
}

document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = btn.dataset.close;
    const modal = document.getElementById(id);
    closeModal(modal);
  });
});

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay);
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m));
  }
});

/* ── COPY TO CLIPBOARD ───────────────────────────────────── */
const toastEl = document.getElementById('toast');
let toastTimer;

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2000);
}

document.querySelectorAll('.copy-item').forEach(el => {
  el.addEventListener('click', () => {
    const text = el.dataset.copy;
    navigator.clipboard.writeText(text).then(() => showToast('✓  Copied: ' + text));
  });
});

/* ── ESC KEY CLOSES MODALS ───────────────────────────────── */
// (already handled above)

/* ── GSAP MAGNETIC BUTTONS & SCRAMBLE TEXT ───────────────── */
class TextScrambler {
  constructor(el) {
    this.el = el;
    this.originalText = el.innerText;
    this.chars = '!<>-_\\\\/[]{}—=+*^?#_';
    this.frame = 0;
    this.queue = [];
    this.frameRequest = null;
    this.isScrambling = false;
  }
  
  scramble() {
    if (this.isScrambling) return;
    this.isScrambling = true;
    this.queue = [];
    for (let i = 0; i < this.originalText.length; i++) {
      const char = this.originalText[i];
      if (char === ' ' || char === '\\n') {
        this.queue.push({ char, isSpace: true });
      } else {
        const start = Math.floor(Math.random() * 5);
        const end = start + Math.floor(Math.random() * 10) + 5;
        this.queue.push({ char, start, end });
      }
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
  }
  
  update() {
    let output = '';
    let complete = 0;
    for (let i = 0; i < this.queue.length; i++) {
      let { char, start, end, isSpace } = this.queue[i];
      if (isSpace) {
        output += char;
        complete++;
      } else if (this.frame >= end) {
        output += char;
        complete++;
      } else if (this.frame >= start) {
        output += this.chars[Math.floor(Math.random() * this.chars.length)];
      } else {
        output += char;
      }
    }
    this.el.innerText = output;
    if (complete === this.queue.length) {
      this.isScrambling = false;
      this.el.innerText = this.originalText;
    } else {
      this.frameRequest = requestAnimationFrame(() => this.update());
      this.frame++;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-btn, .visit-btn').forEach(btn => {
    if(btn.innerText.trim().length > 0) {
      const scrambler = new TextScrambler(btn);
      btn.addEventListener('mouseenter', () => {
        scrambler.scramble();
      });
    }
    
    // Magnetic effect
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.4; 
      const dy = (e.clientY - cy) * 0.4;
      
      if (window.gsap) {
        gsap.to(btn, {
          x: dx,
          y: dy,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    });
    
    btn.addEventListener('mouseleave', () => {
      if (window.gsap) {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.8,
          ease: 'elastic.out(1, 0.3)'
        });
      }
    });
  });
});
