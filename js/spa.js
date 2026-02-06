// spa.js — pages object, loadPage, updateSwipeArrowVisibility
export const pages = {
  // home is generated dynamically based on current theme/background classes
  home: null,
  about: `
        <h1>About Me</h1>
        <section>
            <p>I'm a freshman CS student at UF interested in making projects!</p>
        </section>
    `,
  projects: `
        <h1>Projects</h1>
        <section>
            <div class="project-cards">
          <div class="projectcard sudoku-card" data-sudoku-open tabindex="0" role="button" aria-label="Open the Sudoku project window">
            <h3>Sudoku</h3>
                    <p>A calm, first-project take on classic Sudoku.</p>
          </div>
          <div class="projectcard lyra-card" data-lyra-open tabindex="0" role="button" aria-label="Open the Lyra project window">
            <h3>Lyra</h3>
            <p>AI-driven close reading for mood, themes, and meaning.</p>
          </div>
            </div>
        </section>
    `,
  experiences: `
        <h1>Experiences</h1>
        <section>
            <p>I am looking for experience in software development and machine learning.</p>
        </section>
    `,
  contact: `
        <section>
            <p>Get in touch with me below!</p>
        </section>
        <footer>
            <div style="display: flex; justify-content: center; gap: 1.5rem;">
                <a href="https://www.linkedin.com/in/caden-castleberry-3ba696363/" target="_blank">LinkedIn</a>
                <a href="https://www.github.com/Caadden" target="_blank">GitHub</a>
            </div>
            <div style="display: flex; justify-content: center; margin-top: 1.2rem;">
                <a href="mailto:cadencastleberry1114@gmail.com" class="email-btn">Email</a>
            </div>
        </footer>
    `
};

let isTransitioning = false;
let lastTransitionStart = 0;
let currentPage = null;

const PREFETCH_LIST = ['about', 'projects', 'experiences'];

export function prefetchPagesIdle(list = PREFETCH_LIST) {
  if (!('requestIdleCallback' in window)) {
    setTimeout(() => prefetchPagesIdle(list), 1500);
    return;
  }

  requestIdleCallback(async () => {
    for (const p of list) {
      try {
        if ((window.location.hash.replace('#', '') || 'home') === p) continue;
        const tplId = 'tpl-' + p;
        if (document.getElementById(tplId)) continue;

        const res = await fetch(`pages/${p}.html`, { cache: 'force-cache' });
        if (!res.ok) continue;
        const text = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        // Prefer extracting the page's content to avoid inserting site chrome/nav
        const headerEl = doc.querySelector('header');
        const mainEl = doc.querySelector('main');
        const footerEl = doc.querySelector('footer');
        let fragmentHtml = '';
        if (headerEl) {
          const h1 = headerEl.querySelector('h1');
          if (h1) fragmentHtml += h1.outerHTML;
        }
        if (mainEl) fragmentHtml += mainEl.outerHTML;
        if (footerEl) fragmentHtml += footerEl.outerHTML;
        if (!fragmentHtml) fragmentHtml = doc.body.innerHTML; // fallback to full body

        // create a template containing only the page fragment
        const tpl = document.createElement('template');
        tpl.id = tplId;
        tpl.innerHTML = fragmentHtml;
        tpl.style.display = 'none';
        document.body.appendChild(tpl);
      } catch (err) {
        console.warn('prefetchPagesIdle: failed to prefetch', p, err);
      }
    }
  }, { timeout: 2000 });
}

function insertNewFromTemplate(main, page) {
  const tpl = document.getElementById('tpl-' + page);
  const newChild = document.createElement('div');
  newChild.className = 'fade-scale';
  if (tpl) {
    const frag = tpl.content.cloneNode(true);
    newChild.appendChild(frag);
  } else {
    newChild.innerHTML = pages[page] || generateHomeHtml();
  }
  main.appendChild(newChild);
  // Initialize any home-specific dynamic effects
  if (page === 'home') {
    const sub = newChild.querySelector('.sub-intro');
    if (sub) startTypewriter(sub);
    // Subtle tilt on hero text based on cursor
    const intro = newChild.querySelector('.intro-text');
    const heroArea = newChild; // use whole fade-scale as hero region
    let rafId = null;
    let lastX = 0, lastY = 0;
    const MAX_TILT_DEG = 1; // degrees
    const MAX_SHIFT_PX = 2; // pixels
    function applyTilt() {
      rafId = null;
      const rect = heroArea.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (lastX - cx) / (rect.width / 2);
      const dy = (lastY - cy) / (rect.height / 2);
      const rot = Math.max(-1, Math.min(1, dx)) * MAX_TILT_DEG; // horizontal influences rotation
      const tx = Math.max(-1, Math.min(1, dx)) * MAX_SHIFT_PX;
      const ty = Math.max(-1, Math.min(1, dy)) * MAX_SHIFT_PX;
      if (intro) intro.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg)`;
    }
    function onMove(e) {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!rafId) rafId = requestAnimationFrame(applyTilt);
    }
    function onLeave() {
      if (intro) intro.style.transform = '';
    }
    heroArea.addEventListener('mousemove', onMove);
    heroArea.addEventListener('mouseleave', onLeave);
  }
  return newChild;
}

function generateHomeHtml() {
  // Unified home content across all themes/backgrounds
  const title = "Hey &mdash; it's Caden";
  const sub = "I'm a [ ]";
  return `
    <h1 class="intro-text">${title}</h1>
    <p class="sub-intro typewriter">${sub}</p>
  `;
}

// Simple typewriter that cycles phrases, then settles on a final sentence
function startTypewriter(el) {
  // Prevent re-init if already running
  if (el.dataset.typing === 'true') return;
  el.dataset.typing = 'true';

  const phrases = [
    "writing code…",
    "crying over code…"
  ];
  const finalPhrase = "Designing what comes next";

  let phase = 0; // index in phrases, then final
  let i = 0;
  let deleting = false;
  let current = phrases[phase];

  const TYPE_SPEED = 42; // ms per char
  const DELETE_SPEED = 28; // ms per char
  const HOLD_MS = 700; // pause at end of each phrase

  function tick() {
    if (!deleting) {
      // typing forward
      i++;
      el.innerHTML = current.slice(0, i);
      if (i < current.length) {
        setTimeout(tick, TYPE_SPEED);
      } else {
        // pause then start deleting
        setTimeout(() => { deleting = true; tick(); }, HOLD_MS);
      }
    } else {
      // deleting backward
      i--;
      el.innerHTML = current.slice(0, Math.max(0, i));
      if (i > 0) {
        setTimeout(tick, DELETE_SPEED);
      } else {
        // move to next phrase or final
        deleting = false;
        phase++;
        if (phase < phrases.length) {
          current = phrases[phase];
          setTimeout(tick, TYPE_SPEED);
        } else {
          // type the final phrase and stop
          current = finalPhrase;
          function typeFinal() {
            i++;
            el.innerHTML = current.slice(0, i);
            if (i < current.length) setTimeout(typeFinal, TYPE_SPEED);
            else {
              el.dataset.typing = 'false';
              // remove caret box once final phrase is complete
              el.classList.remove('typewriter');
              // trigger underline reveal: dot appears then line grows from center
              el.classList.add('underline-in');
            }
          }
          setTimeout(typeFinal, TYPE_SPEED);
        }
      }
    }
  }
  // start typing from empty
  i = 0;
  el.innerHTML = '';
  setTimeout(tick, TYPE_SPEED);
}

export function loadPage(page) {
  if (!page) page = 'home';
  // If a transition is marked in-progress but it's stale (older than 900ms), clear it
  if (isTransitioning) {
    const age = Date.now() - lastTransitionStart;
    if (age > 900) {
      console.warn('spa.loadPage: clearing stale isTransitioning lock (age=' + age + 'ms)');
      isTransitioning = false;
    } else {
      return;
    }
  }
  if (page === currentPage) return;
  const main = document.getElementById('spa-content');
  if (!main) return;
  isTransitioning = true;
  lastTransitionStart = Date.now();
  const oldChild = main.querySelector('.fade-scale');

  const newChild = insertNewFromTemplate(main, page);
  // Mark current page on body for CSS hooks and remove any footer on home
  document.body.dataset.page = page;
  if (page === 'home') {
    const strayFooter = newChild.querySelector('footer');
    if (strayFooter) strayFooter.remove();
  }

  const onNewTransitionEnd = (ev) => {
    if (ev.target !== newChild || ev.propertyName !== 'opacity') return;
    newChild.removeEventListener('transitionend', onNewTransitionEnd);
    if (oldChild && oldChild.parentNode === main) main.removeChild(oldChild);
    currentPage = page;
    isTransitioning = false;
    // clear fallback timer if it exists
    if (newChild._transitionFallback) {
      clearTimeout(newChild._transitionFallback);
      newChild._transitionFallback = null;
    }
  };

  if (oldChild) {
    oldChild.classList.remove('in');
    setTimeout(() => {
      requestAnimationFrame(() => {
        newChild.addEventListener('transitionend', onNewTransitionEnd);
        newChild.classList.add('in');
      });
    }, 120);
  } else {
    requestAnimationFrame(() => {
      newChild.addEventListener('transitionend', onNewTransitionEnd);
      newChild.classList.add('in');
    });
  }

  // Fallback: if transitionend doesn't fire (browsers, visibility, or CSS issues), ensure we don't stay locked
  // Shorter fallback: if transitionend doesn't fire, clear the lock sooner
  newChild._transitionFallback = setTimeout(() => {
    if (isTransitioning) {
      console.warn('spa.loadPage: transition fallback fired for', page);
      if (oldChild && oldChild.parentNode === main) main.removeChild(oldChild);
      currentPage = page;
      isTransitioning = false;
    }
    newChild._transitionFallback = null;
  }, 900);
}

export function updateSwipeArrowVisibility(page) {
  const arrow = document.querySelector('.swipe-arrow');
  if (!arrow) return;
  if (page === 'contact') arrow.classList.add('hide-arrow');
  else arrow.classList.remove('hide-arrow');
}