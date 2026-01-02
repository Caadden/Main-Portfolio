// nav.js — menu and nav helpers
export function setupMenuButton() {
  const menuBtn = document.getElementById('menu-button');
  const overlay = document.getElementById('menu-overlay');
  if (!menuBtn || !overlay) {
    console.warn('setupMenuButton: missing #menu-button or #menu-overlay — skipping menu wiring');
    return; // avoid throwing if DOM structure changed
  }
  const navLinks = overlay.querySelectorAll('a[data-page]');

  // Accessibility defaults
  if (menuBtn && !menuBtn.hasAttribute('aria-expanded')) menuBtn.setAttribute('aria-expanded', 'false');
  if (overlay) {
    overlay.setAttribute('tabindex', '-1');
    overlay.setAttribute('aria-hidden', 'true');
  }

  function updateActiveMenuLink() {
    const currentPage = (window.location.hash || '#home').replace('#', '');
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-page') === currentPage);
    });
  }

  menuBtn.addEventListener('click', () => {
    const opening = overlay.classList.contains('hidden');
    overlay.classList.toggle('hidden');
    // update aria states
    menuBtn.setAttribute('aria-expanded', String(opening));
    overlay.setAttribute('aria-hidden', String(!opening));
    if (!overlay.classList.contains('hidden')) {
    updateActiveMenuLink();
    // don't auto-focus a link to prevent unwanted highlight
    }
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.add('hidden');
      overlay.setAttribute('aria-hidden', 'true');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.focus();
    }
  });

  // Close menu on nav click
  navLinks.forEach(link => link.addEventListener('click', () => {
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
    menuBtn.setAttribute('aria-expanded', 'false');
    // return focus to toggle for accessibility
    menuBtn.focus();
  }));

  // Update active link on hash change
  window.addEventListener('hashchange', updateActiveMenuLink);

  // Close menu on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
      overlay.classList.add('hidden');
      overlay.setAttribute('aria-hidden', 'true');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.focus();
    }
  });

  // Initial highlight
  updateActiveMenuLink();
}

// Generic click handler so main can attach single event listener for SPA nav links
export function handleNav(e) {
  if (e.target.matches('a[data-page]')) {
    e.preventDefault();
    const page = e.target.getAttribute('data-page');
    window.location.hash = page;
  }
}
