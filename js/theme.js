// theme.js — time-based background selection and per-video theme classes
export function initTheme() {
  const video = document.querySelector('.bg-video');
  const source = video ? video.querySelector('source') : null;

  function clearThemeClasses() {
    document.body.classList.remove('theme-morning', 'theme-afternoon', 'theme-evening', 'theme-night', 'bg-afternoon2', 'bg-afternoon1');
  }

  function setBackgroundForHour(hour) {
    if (!video || !source) return;
    hour = Number(hour);
    clearThemeClasses();
    let videoFile = 'assets/backgrounds/bg-morning.mp4';
    let themeClass = 'theme-morning';

    if (hour >= 5 && hour < 12) {
      videoFile = 'assets/backgrounds/bg-morning.mp4';
      themeClass = 'theme-morning';
    } else if (hour >= 12 && hour < 17) {
      const afternoonVideos = [
        'assets/backgrounds/bg-afternoon1.mp4',
        'assets/backgrounds/bg-afternoon2.mp4'
      ];
      const idx = Math.floor(Math.random() * afternoonVideos.length);
      videoFile = afternoonVideos[idx];
      themeClass = 'theme-afternoon';
      if (idx === 0) document.body.classList.add('bg-afternoon1');
      if (idx === 1) document.body.classList.add('bg-afternoon2');
    } else if (hour >= 17 && hour < 20) {
      videoFile = 'assets/backgrounds/bg-evening.mp4';
      themeClass = 'theme-evening';
    } else {
      videoFile = 'assets/backgrounds/bg-night.mp4';
      themeClass = 'theme-night';
    }

    if (source.getAttribute('src') !== videoFile) {
      source.setAttribute('src', videoFile);
      // Defer heavy video load/play to an idle period to avoid blocking
      const doLoad = () => {
        try {
          // ensure metadata preload so browser can show frame quickly
          try { video.setAttribute('preload', 'metadata'); } catch (e) {}
          video.load();
          const playPromise = video.play();
          if (playPromise && typeof playPromise.then === 'function') {
            playPromise.catch(() => {/* ignore autoplay failures */});
          }
        } catch (e) {
          console.warn('Video load/play failed:', e);
        }
      };
      if ('requestIdleCallback' in window) {
        requestIdleCallback(doLoad, { timeout: 1500 });
      } else {
        // Slight delay fallback
        setTimeout(doLoad, 300);
      }
    }

    document.body.classList.add(themeClass);
  }

  if (video && source) {
    const nowHour = new Date().getHours();
    setBackgroundForHour(nowHour);
    setInterval(() => setBackgroundForHour(new Date().getHours()), 5 * 60 * 1000);
  }

  return { setBackgroundForHour };
}