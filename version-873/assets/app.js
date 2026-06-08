(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
      document.body.classList.toggle('menu-open', panel.classList.contains('open'));
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    show(0);
    restart();
  }

  function setupSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        if (!input || !normalize(input.value)) {
          return;
        }
        if (location.pathname.endsWith('/movies.html') || location.pathname.endsWith('movies.html')) {
          event.preventDefault();
          var localBox = qs('[data-search-box]');
          if (localBox) {
            localBox.value = input.value;
            localBox.dispatchEvent(new Event('input'));
            history.replaceState(null, '', 'movies.html?q=' + encodeURIComponent(input.value));
          }
        }
      });
    });
  }

  function setupFilters() {
    var container = qs('[data-card-container]');
    if (!container) {
      return;
    }
    var cards = qsa('[data-card]', container);
    var searchBox = qs('[data-search-box]');
    var empty = qs('[data-empty-state]');
    var chips = qsa('[data-filter]');
    var activeFilter = '全部';
    var params = new URLSearchParams(location.search);
    var initialQuery = params.get('q') || '';

    function apply() {
      var query = normalize(searchBox ? searchBox.value : '');
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesFilter = activeFilter === '全部' || haystack.indexOf(normalize(activeFilter)) !== -1;
        var show = matchesQuery && matchesFilter;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    if (searchBox) {
      searchBox.value = initialQuery;
      searchBox.addEventListener('input', apply);
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('active');
        });
        chip.classList.add('active');
        activeFilter = chip.getAttribute('data-filter') || '全部';
        apply();
      });
    });
    apply();
  }

  function setupPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var button = qs('[data-play]', player);
      var stream = player.getAttribute('data-stream');
      if (!video || !button || !stream) {
        return;
      }

      function markStarted() {
        button.classList.add('is-hidden');
      }

      function playNow() {
        markStarted();
        if (video.getAttribute('data-ready') === '1') {
          video.play().catch(function () {});
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.setAttribute('data-ready', '1');
          video.play().catch(function () {});
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ autoStartLoad: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          video.hlsController = hls;
          video.setAttribute('data-ready', '1');
          video.play().catch(function () {});
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          return;
        }
        video.src = stream;
        video.setAttribute('data-ready', '1');
        video.play().catch(function () {});
      }

      button.addEventListener('click', playNow);
      video.addEventListener('play', markStarted);
      video.addEventListener('click', function () {
        if (video.paused) {
          playNow();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearchForms();
    setupFilters();
    setupPlayers();
  });
})();
