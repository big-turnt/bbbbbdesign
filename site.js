(function () {
  // Smooth, eased scrolling for links to sections on the same page (home page).
  var raf = null;
  function headerHeight() {
    var h = document.querySelector('header');
    return h && h.parentElement ? h.parentElement.getBoundingClientRect().height : 104;
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    window.removeEventListener('wheel', stop);
    window.removeEventListener('touchstart', stop);
  }
  function smoothTo(el, id) {
    var start = window.pageYOffset;
    var target = id === 'top' ? 0 : Math.max(0, start + el.getBoundingClientRect().top - headerHeight() + 4);
    var dist = target - start;
    stop();
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || Math.abs(dist) < 2) { window.scrollTo(0, target); return; }
    var duration = Math.min(1800, Math.max(900, Math.abs(dist) * 0.5));
    var t0 = performance.now();
    var ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });
    function step(now) {
      var t = Math.min(1, (now - t0) / duration);
      window.scrollTo(0, start + dist * ease(t));
      if (t < 1) raf = requestAnimationFrame(step); else stop();
    }
    raf = requestAnimationFrame(step);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var el = id && document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    smoothTo(el, id);
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  });

  // "Work" dropdown on project pages.
  var menu = document.querySelector('[data-work-menu]');
  if (menu) {
    var btn = menu.querySelector('button');
    var panel = menu.querySelector('#work-menu');
    var caret = menu.querySelector('[data-caret]');
    var setOpen = function (open) {
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      caret.textContent = open ? '↑' : '↓';
    };
    btn.addEventListener('click', function () { setOpen(panel.hidden); });
    document.addEventListener('click', function (e) { if (!menu.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { setOpen(false); btn.focus(); } });
    // Close it if the page is restored from the browser's back/forward cache.
    window.addEventListener('pageshow', function () { setOpen(false); });
  }
})();
