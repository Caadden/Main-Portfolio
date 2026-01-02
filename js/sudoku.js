// sudoku.js — lightweight "app window" overlay for the Sudoku project
let overlayEl;
let windowEl;
let lastTrigger;

function buildOverlay() {
  if (overlayEl) return;
  overlayEl = document.createElement('div');
  overlayEl.id = 'sudoku-overlay';
  overlayEl.className = 'sudoku-overlay';
  overlayEl.setAttribute('aria-hidden', 'true');

  overlayEl.innerHTML = `
    <div class="sudoku-window" role="dialog" aria-modal="true" aria-labelledby="sudoku-title">
      <div class="sudoku-window-bar">
        <span class="dot red" aria-hidden="true"></span>
        <span class="dot yellow" aria-hidden="true"></span>
        <span class="dot green" aria-hidden="true"></span>
      </div>
      <div class="sudoku-window-body">
        <header class="sudoku-header">
          <div>
            <p class="sudoku-kicker">Project 01 · Tiny launch</p>
            <h2 id="sudoku-title">Sudoku</h2>
            <p class="sudoku-sub">A calm, first-project take on classic Sudoku.</p>
          </div>
          <div class="sudoku-pill">Early build</div>
        </header>
        <div class="sudoku-grid">
          <div class="sudoku-card">
            <p class="sudoku-label">Mode</p>
            <h3>Classic 9x9</h3>
            <p class="sudoku-note">Classic 9×9 Sudoku with multiple difficulty levels.</p>
          </div>
          <div class="sudoku-card">
            <p class="sudoku-label">Tech</p>
            <h3>PYTHON · PYGAME</h3>
            <p class="sudoku-note">Desktop GUI application using an event-driven game loop and object-oriented design.</p>
          </div>
          <div class="sudoku-card">
            <p class="sudoku-label">Status</p>
            <h3>Playable; Demo WIP</h3>
            <p class="sudoku-note">Complete core gameplay.<br> <br>
            Actively polishing UX features and visual feedback.</p>
          </div>
        </div>
        <div class="sudoku-actions">
          <button class="pill ghost" type="button" disabled>Play demo (coming soon)</button>
          <a class="pill ghost" href="https://github.com/Caadden" target="_blank" rel="noopener">Repo currently unavailable</a>
        </div>
      </div>
    </div>
  `;

  windowEl = overlayEl.querySelector('.sudoku-window');

  overlayEl.addEventListener('click', (e) => {
    if (e.target === overlayEl) {
      closeSudokuWindow();
    }
  });

  const closeBtn = overlayEl.querySelector('[data-sudoku-close]');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeSudokuWindow);
  }

  // Make red and yellow dots close the window
  const redDot = overlayEl.querySelector('.dot.red');
  const yellowDot = overlayEl.querySelector('.dot.yellow');
  if (redDot) redDot.addEventListener('click', closeSudokuWindow);
  if (yellowDot) yellowDot.addEventListener('click', closeSudokuWindow);

  // Make window draggable
  const windowBar = overlayEl.querySelector('.sudoku-window-bar');
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
  overlayEl.style.setProperty('--sudoku-origin-x', `${cx}px`);
  overlayEl.style.setProperty('--sudoku-origin-y', `${cy}px`);
  lastTrigger = trigger || null;
}

function trapFocus() {
  if (!overlayEl) return;
  const focusable = overlayEl.querySelectorAll('a, button:not([disabled])');
  if (focusable.length) focusable[0].focus();
}

export function closeSudokuWindow() {
  if (!overlayEl) return;
  overlayEl.classList.remove('visible');
  overlayEl.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  if (lastTrigger) {
    lastTrigger.focus({ preventScroll: true });
  }
}

export function openSudokuWindow(trigger) {
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
  if (e.key === 'Escape') closeSudokuWindow();
}

export function initSudokuWindow() {
  buildOverlay();
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-sudoku-open]');
    if (!trigger) return;
    e.preventDefault();
    openSudokuWindow(trigger);
  });
  document.addEventListener('keydown', (e) => {
    const trigger = e.target.closest('[data-sudoku-open]');
    if (!trigger) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openSudokuWindow(trigger);
    }
  });
  window.addEventListener('keydown', onKeydown);
}