let overlayEl;
let windowEl;
let lastTrigger;

function buildOverlay() {
  if (overlayEl) return;
  overlayEl = document.createElement('div');
  overlayEl.id = 'lyra-overlay';
  overlayEl.className = 'lyra-overlay';
  overlayEl.setAttribute('aria-hidden', 'true');

  overlayEl.innerHTML = `
    <div class="lyra-window" role="dialog" aria-modal="true" aria-labelledby="lyra-title">
      <div class="lyra-window-bar">
        <span class="dot red" aria-hidden="true"></span>
        <span class="dot yellow" aria-hidden="true"></span>
        <span class="dot green" aria-hidden="true"></span>
      </div>
      <div class="lyra-window-body">
        <header class="lyra-header">
          <div>
            <p class="lyra-kicker">Project 02 · v0.5</p>
            <h2 id="lyra-title">Lyra</h2>
            <p class="lyra-sub">AI-powered lyric analysis for deeper meaning and emotion.</p>
          </div>
          <div class="lyra-pill">In progress</div>
        </header>
        <div class="lyra-grid">
          <div class="lyra-card">
            <p class="lyra-label">Focus</p>
            <h3>Literary Analysis</h3>
            <p class="lyra-note">Transforms lyrics into structured interpretations, highlighting central themes, emotional arcs, and key motifs.</p>
          </div>
          <div class="lyra-card">
            <p class="lyra-label">Tech</p>
            <h3>Next.js · React · LLM API</h3>
            <p class="lyra-note">Full-stack web app with serverless APIs, structured AI outputs, and responsive UI built with modern frameworks.</p>
          </div>
          <div class="lyra-card">
            <p class="lyra-label">Status</p>
            <h3>Active Development</h3>
            <p class="lyra-note">Core analysis engine complete with ongoing UX improvements, feature expansion, and performance refinement.</p>
          </div>
        </div>
        <div class="lyra-actions">
          <a class="pill ghost" href="https://trylyra.vercel.app/" target="_blank" rel="noopener">Try Lyra</a>
          <a class="pill ghost" href="https://github.com/Caadden/Lyra" target="_blank" rel="noopener">View repo</a>
        </div>
      </div>
    </div>
  `;

  windowEl = overlayEl.querySelector('.lyra-window');

  overlayEl.addEventListener('click', (e) => {
    if (e.target === overlayEl) {
      closeLyraWindow();
    }
  });

  const closeBtn = overlayEl.querySelector('[data-lyra-close]');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeLyraWindow);
  }

  // Make red and yellow dots close the window
  const redDot = overlayEl.querySelector('.dot.red');
  const yellowDot = overlayEl.querySelector('.dot.yellow');
  if (redDot) redDot.addEventListener('click', closeLyraWindow);
  if (yellowDot) yellowDot.addEventListener('click', closeLyraWindow);

  // Make window draggable
  const windowBar = overlayEl.querySelector('.lyra-window-bar');
  let isDragging = false;
  let currentX = 0;
  let currentY = 0;
  let initialX = 0;
  let initialY = 0;

  function onDragStart(e) {
    // Don't drag if clicking on dots
    if (e.target.classList.contains('dot')) return;

    isDragging = true;
    windowEl.style.transition = 'none';

    if (e.type === 'touchstart') {
      initialX = e.touches[0].clientX - currentX;
      initialY = e.touches[0].clientY - currentY;
    } else {
      initialX = e.clientX - currentX;
      initialY = e.clientY - currentY;
    }
  }

  function onDragMove(e) {
    if (!isDragging) return;
    e.preventDefault();

    let clientX, clientY;
    if (e.type === 'touchmove') {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    currentX = clientX - initialX;
    currentY = clientY - initialY;

    // Constrain to viewport bounds
    const rect = windowEl.getBoundingClientRect();
    const maxX = (window.innerWidth - rect.width) / 2;
    const maxY = (window.innerHeight - rect.height) / 2;
    const minX = -maxX;
    const minY = -maxY;

    currentX = Math.max(minX, Math.min(maxX, currentX));
    currentY = Math.max(minY, Math.min(maxY, currentY));

    windowEl.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px)) scale(1) translateY(0) rotateX(0deg)`;
  }

  function onDragEnd() {
    isDragging = false;
    windowEl.style.transition = '';
  }

  windowBar.addEventListener('mousedown', onDragStart);
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragEnd);
  windowBar.addEventListener('touchstart', onDragStart);
  document.addEventListener('touchmove', onDragMove);
  document.addEventListener('touchend', onDragEnd);

  document.body.appendChild(overlayEl);
}

function setOriginFromTrigger(trigger) {
  if (!overlayEl) return;
  const rect = trigger ? trigger.getBoundingClientRect() : null;
  const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
  overlayEl.style.setProperty('--lyra-origin-x', `${cx}px`);
  overlayEl.style.setProperty('--lyra-origin-y', `${cy}px`);
  lastTrigger = trigger || null;
}

function trapFocus() {
  if (!overlayEl) return;
  const focusable = overlayEl.querySelectorAll('a, button:not([disabled])');
  if (focusable.length) focusable[0].focus();
}

export function closeLyraWindow() {
  if (!overlayEl) return;
  overlayEl.classList.remove('visible');
  overlayEl.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  if (lastTrigger) {
    lastTrigger.focus({ preventScroll: true });
  }
}

export function openLyraWindow(trigger) {
  buildOverlay();
  setOriginFromTrigger(trigger);
  // restart animation by forcing clean state
  windowEl.classList.remove('pop');
  void windowEl.offsetWidth; // force reflow
  overlayEl.classList.add('visible');
  overlayEl.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  window.requestAnimationFrame(() => {
    windowEl.classList.add('pop');
    trapFocus();
  });
}

function onKeydown(e) {
  if (e.key === 'Escape') closeLyraWindow();
}

export function initLyraWindow() {
  buildOverlay();
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-lyra-open]');
    if (!trigger) return;
    e.preventDefault();
    openLyraWindow(trigger);
  });
  document.addEventListener('keydown', (e) => {
    const trigger = e.target.closest('[data-lyra-open]');
    if (!trigger) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLyraWindow(trigger);
    }
  });
  window.addEventListener('keydown', onKeydown);
}
