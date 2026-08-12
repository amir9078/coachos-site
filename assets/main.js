/* CoachOS — shared site behavior. Loaded on every page. */
(function () {
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  // ---------- Lead capture (Supabase) ----------
  // TODO: replace these two placeholders with your real Supabase project's
  // values once created (Project Settings -> API -> "Project URL" and the
  // "anon / public" key). The anon key is meant to be public in client-side
  // code -- see supabase/schema.sql for the Row Level Security policy that
  // restricts it to insert-only, nothing readable/editable through it.
  var SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
  var SUPABASE_ANON_KEY = 'YOUR-ANON-PUBLIC-KEY';

  function supabaseConfigured() {
    return SUPABASE_URL.indexOf('YOUR-PROJECT') === -1 && SUPABASE_ANON_KEY.indexOf('YOUR-ANON') === -1;
  }

  // Returns a Promise resolving to { ok: true } on success, or
  // { ok: false, reason: 'not-configured' | 'network' | 'rejected' } —
  // callers should fall back to the existing mailto: behavior on !ok.
  window.coachosSubmitLead = function (payload) {
    return new Promise(function (resolve) {
      if (!supabaseConfigured()) {
        resolve({ ok: false, reason: 'not-configured' });
        return;
      }
      fetch(SUPABASE_URL + '/rest/v1/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          resolve(res.ok ? { ok: true } : { ok: false, reason: 'rejected' });
        })
        .catch(function () {
          resolve({ ok: false, reason: 'network' });
        });
    });
  };

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

    var hoverables = 'a, button, .card, .hub-card, .gate-card, .acc-btn, input, .qcard, .filter-btn';
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
    document.querySelectorAll('.card, .hub-card, .gate-card').forEach(function (card) {
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

  // ---------- Reasoning thread: run the signal-pulse animation only while visible ----------
  var threads = document.querySelectorAll('.thread');
  if (threads.length && 'IntersectionObserver' in window) {
    var tio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle('in-view', entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );
    threads.forEach(function (el) { tio.observe(el); });
  } else {
    threads.forEach(function (el) { el.classList.add('in-view'); });
  }

  // Hero split-text headings are above the fold on load — reveal immediately
  // rather than waiting on a scroll-triggered observer that may never fire.
  window.addEventListener('load', function () {
    document.querySelectorAll('.hero .split-text, .pagehead .split-text, .gate .split-text').forEach(reveal);
  });

  // ---------- Animated number counters ----------
  // Readable target values live in the HTML itself (e.g. "122,974", "$5.34B",
  // "19%"), so the page is correct even with no JS. When JS runs we reset to a
  // zero placeholder and animate up to the data-count-to target on reveal. If
  // animation can't run (no observer, reduced motion), we just put the real
  // value back — the page never sits on a misleading "0".
  var counters = document.querySelectorAll('[data-count-to]');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function fmt(target, prefix, suffix, decimals) {
    var body = decimals > 0
      ? target.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      : target.toLocaleString('en-US');
    return prefix + body + suffix;
  }
  function setFinal(el) {
    var suffix = el.getAttribute('data-count-suffix') || '';
    var prefix = el.getAttribute('data-count-prefix') || '';
    var decimals = parseInt(el.getAttribute('data-count-decimals') || '0', 10);
    el.textContent = fmt(parseFloat(el.getAttribute('data-count-to')), prefix, suffix, decimals);
  }
  // Actual count-up logic, shared by the plain and scramble entry points.
  // Unguarded on purpose — animateCounter/animateScrambleCounter own the
  // re-entrancy check via dataset.counted, so this always runs to completion
  // and always lands on the real value via setFinal.
  function runCountUp(el) {
    var target = parseFloat(el.getAttribute('data-count-to'));
    var suffix = el.getAttribute('data-count-suffix') || '';
    var prefix = el.getAttribute('data-count-prefix') || '';
    var decimals = parseInt(el.getAttribute('data-count-decimals') || '0', 10);
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var raw = target * eased;
      var val = decimals > 0 ? raw.toFixed(decimals) : Math.floor(raw).toLocaleString('en-US');
      el.textContent = prefix + val + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else setFinal(el);
    }
    requestAnimationFrame(step);
  }
  function animateCounter(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    if (reduceMotion) { setFinal(el); return; }
    runCountUp(el);
  }
  // Scramble variant: a brief cipher-like flicker of random digits before the
  // real count-up starts — reads as the number being computed, not just counted.
  function animateScrambleCounter(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    if (reduceMotion) { setFinal(el); return; }
    var target = parseFloat(el.getAttribute('data-count-to'));
    var digits = target.toLocaleString('en-US').length;
    var prefix = el.getAttribute('data-count-prefix') || '';
    var suffix = el.getAttribute('data-count-suffix') || '';
    var scrambleDuration = 420;
    var tickEvery = 45;
    var elapsed = 0;
    var timer = setInterval(function () {
      elapsed += tickEvery;
      var fake = '';
      for (var i = 0; i < digits; i++) {
        fake += Math.random() < 0.15 ? ',' : String(Math.floor(Math.random() * 10));
      }
      el.textContent = prefix + fake + suffix;
      if (elapsed >= scrambleDuration) {
        clearInterval(timer);
        runCountUp(el);
      }
    }, tickEvery);
  }
  function runCounter(el) {
    (el.classList.contains('scramble') ? animateScrambleCounter : animateCounter)(el);
  }
  if (counters.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      counters.forEach(setFinal);
    } else {
      var cio = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              runCounter(entry.target);
              cio.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.35 }
      );
      counters.forEach(function (el) { cio.observe(el); });
      // Any counter already in view on load: animate it once fonts are ready,
      // so the reveal/stagger and the count-up read together instead of the
      // number finishing while the strip is still faded in. The HTML already
      // shows the correct value regardless — this is purely the flourish.
      var revealInView = function () {
        counters.forEach(function (el) {
          if (el.dataset.counted) return;
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) {
            runCounter(el);
            cio.unobserve(el);
          }
        });
      };
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { setTimeout(revealInView, 60); });
      } else {
        window.addEventListener('load', function () { setTimeout(revealInView, 60); });
      }
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

  // ---------- Mobile nav toggle ----------
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.textContent = open ? '✕' : '☰';
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.textContent = '☰';
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---------- Nav dropdown accordion (collapsed by default on mobile) ----------
  document.querySelectorAll('.nav-item').forEach(function (item) {
    var dd = item.querySelector('.nav-dropdown');
    var trigger = item.querySelector('a');
    if (!dd || !trigger) return;
    var ddToggle = document.createElement('button');
    ddToggle.type = 'button';
    ddToggle.className = 'nav-dd-toggle';
    ddToggle.setAttribute('aria-label', 'Show ' + trigger.textContent + ' pages');
    ddToggle.setAttribute('aria-expanded', 'false');
    ddToggle.textContent = '⌄';
    item.insertBefore(ddToggle, dd);
    ddToggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var open = item.classList.toggle('dd-open');
      ddToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
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
    var colors = ['#0E7A4C', '#96702A', '#3E7191', '#EEF1EC'];
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
