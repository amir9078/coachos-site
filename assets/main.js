/* CoachOS — shared site behavior: scroll progress, staggered reveal, animated
   counters, and a lightweight accordion. Loaded on every page. */
(function () {
  // Scroll progress bar
  var bar = document.getElementById('scroll-progress');
  if (bar) {
    var updateBar = function () {
      var h = document.documentElement;
      var scrolled = h.scrollTop || document.body.scrollTop;
      var height = h.scrollHeight - h.clientHeight;
      bar.style.width = height > 0 ? (scrolled / height) * 100 + '%' : '0%';
    };
    document.addEventListener('scroll', updateBar, { passive: true });
    updateBar();
  }

  // Staggered reveal-on-scroll
  var groups = {};
  var els = document.querySelectorAll('.reveal');
  els.forEach(function (el) {
    var parent = el.parentElement;
    if (!groups[parent] ) groups[parent] = [];
  });
  // assign a per-sibling stagger index within each parent
  var seen = new Map();
  els.forEach(function (el) {
    var parent = el.parentElement;
    var idx = seen.get(parent) || 0;
    el.style.transitionDelay = Math.min(idx * 70, 350) + 'ms';
    seen.set(parent, idx + 1);
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  // Animated number counters: <span data-count-to="122974" data-count-suffix="">0</span>
  var counters = document.querySelectorAll('[data-count-to]');
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-count-to'));
    var suffix = el.getAttribute('data-count-suffix') || '';
    var prefix = el.getAttribute('data-count-prefix') || '';
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var val = Math.floor(target * eased);
      el.textContent = prefix + val.toLocaleString('en-US') + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target.toLocaleString('en-US') + suffix;
    }
    requestAnimationFrame(step);
  }
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              cio.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      counters.forEach(function (el) { cio.observe(el); });
    } else {
      counters.forEach(animateCounter);
    }
  }

  // Accordion: .acc-item > button.acc-btn + div.acc-panel
  document.querySelectorAll('.acc-item').forEach(function (item) {
    var btn = item.querySelector('.acc-btn');
    var panel = item.querySelector('.acc-panel');
    if (!btn || !panel) return;
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      // close siblings within the same accordion group
      var group = item.parentElement;
      group.querySelectorAll('.acc-item.open').forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.acc-panel').style.maxHeight = null;
        }
      });
      if (isOpen) {
        item.classList.remove('open');
        panel.style.maxHeight = null;
      } else {
        item.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  // Set active nav link based on current page
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === here || (here === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();
