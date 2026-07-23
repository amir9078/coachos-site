/* CoachOS — shared site behavior. Loaded on every page. */
(function () {
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  // ---------- Scroll progress bar ----------
  var bar = document.getElementById('scroll-progress');
  function updateBar() {
    var h = document.documentElement;
    var scrolled = h.scrollTop || document.body.scrollTop;
    var height = h.scrollHeight - h.clientHeight;
    if (bar) bar.style.width = height > 0 ? (scrolled / height) * 100 + '%' : '0%';
  }

  // ---------- Nav shrink-on-scroll ----------
  var header = document.querySelector('header.site');
  function updateHeader() {
    if (!header) return;
    if ((document.documentElement.scrollTop || document.body.scrollTop) > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  document.addEventListener(
    'scroll',
    function () {
      updateBar();
      updateHeader();
    },
    { passive: true }
  );
  updateBar();
  updateHeader();

  // ---------- Custom cursor ----------
  if (!isTouch) {
    var dot = document.createElement('div');
    dot.id = 'cursor-dot';
    var ring = document.createElement('div');
    ring.id = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    var mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = 'translate(' + mouseX + 'px,' + mouseY + 'px) translate(-50%,-50%)';
      document.body.classList.add('cursor-ready');
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = 'translate(' + ringX + 'px,' + ringY + 'px) translate(-50%,-50%)';
      requestAnimationFrame(animateRing);
    }
    requestAnimationFrame(animateRing);

    var hoverables = 'a, button, .card, .hub-card, .acc-btn, input, .qcard, .filter-btn';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(hoverables)) ring.classList.add('hover');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(hoverables)) ring.classList.remove('hover');
    });
  }

  // ---------- Magnetic buttons + click ripple ----------
  document.querySelectorAll('.btn').forEach(function (btn) {
    if (!isTouch) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var mx = e.clientX - (r.left + r.width / 2);
        var my = e.clientY - (r.top + r.height / 2);
        btn.style.transform = 'translate(' + mx * 0.18 + 'px,' + my * 0.28 + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    }
    btn.addEventListener('click', function (e) {
      var r = btn.getBoundingClientRect();
      var ripple = document.createElement('span');
      ripple.className = 'ripple';
      var size = Math.max(r.width, r.height) * 1.4;
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = e.clientX - r.left - size / 2 + 'px';
      ripple.style.top = e.clientY - r.top - size / 2 + 'px';
      btn.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 650);
    });
  });

  // ---------- Tilt-on-hover cards ----------
  if (!isTouch) {
    document.querySelectorAll('.card, .hub-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          'perspective(800px) rotateX(' + (-py * 6) + 'deg) rotateY(' + (px * 6) + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  // ---------- Split-word heading reveal ----------
  // Preserves nested elements (e.g. a shimmering <span class="accent">) as a
  // single atomic "word" rather than flattening them to plain text.
  document.querySelectorAll('.split-text').forEach(function (el) {
    var frag = document.createDocumentFragment();
    var wordIndex = 0;
    function addWord(node) {
      var outer = document.createElement('span');
      outer.className = 'split-word';
      outer.style.transitionDelay = wordIndex * 45 + 'ms';
      var inner = document.createElement('span');
      inner.appendChild(node);
      outer.appendChild(inner);
      frag.appendChild(outer);
      frag.appendChild(document.createTextNode(' '));
      wordIndex++;
    }
    Array.prototype.forEach.call(el.childNodes, function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent
          .split(/\s+/)
          .filter(Boolean)
          .forEach(function (word) { addWord(document.createTextNode(word)); });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        addWord(node.cloneNode(true));
      }
    });
    el.innerHTML = '';
    el.appendChild(frag);
  });

  // ---------- Staggered reveal-on-scroll ----------
  var els = document.querySelectorAll('.reveal, .split-text');
  var seen = new Map();
  els.forEach(function (el) {
    if (el.classList.contains('reveal')) {
      var parent = el.parentElement;
      var idx = seen.get(parent) || 0;
      el.style.transitionDelay = Math.min(idx * 70, 350) + 'ms';
      seen.set(parent, idx + 1);
    }
  });

  function reveal(el) {
    el.classList.add('in');
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(reveal);
  }

  // Hero split-text headings are above the fold on load — reveal immediately
  // rather than waiting on a scroll-triggered observer that may never fire.
  window.addEventListener('load', function () {
    document.querySelectorAll('.hero .split-text, .pagehead .split-text').forEach(reveal);
  });

  // ---------- Animated number counters ----------
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
      window.addEventListener('load', function () {
        // Safety net: counters in the hero are visible immediately on load.
        counters.forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0 && el.textContent.match(/^0/)) {
            animateCounter(el);
            cio.unobserve(el);
          }
        });
      });
    } else {
      counters.forEach(animateCounter);
    }
  }

  // ---------- Accordion ----------
  document.querySelectorAll('.acc-item').forEach(function (item) {
    var btn = item.querySelector('.acc-btn');
    var panel = item.querySelector('.acc-panel');
    if (!btn || !panel) return;
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
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

  // ---------- Active nav link ----------
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === here || (here === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // ---------- Confetti burst (called from quizzes.html on completion) ----------
  window.coachosConfetti = function () {
    var colors = ['#2E6B4F', '#8A6A1F', '#3E6B8A', '#F0EBDD'];
    for (var i = 0; i < 60; i++) {
      (function () {
        var piece = document.createElement('div');
        piece.className = 'confetti-piece';
        var size = 6 + Math.random() * 6;
        piece.style.width = size + 'px';
        piece.style.height = size * (Math.random() > 0.5 ? 1 : 2.2) + 'px';
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDuration = 2.2 + Math.random() * 1.6 + 's';
        piece.style.opacity = String(0.7 + Math.random() * 0.3);
        document.body.appendChild(piece);
        setTimeout(function () { piece.remove(); }, 4200);
      })();
    }
  };
})();
