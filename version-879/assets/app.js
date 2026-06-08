(function () {
  var ready = function (fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle('is-active', pos === index);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle('is-active', pos === index);
      });
    }

    dots.forEach(function (dot, pos) {
      dot.addEventListener('click', function () {
        show(pos);
        restart();
      });
    });

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    show(0);
    restart();
  }

  function initFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid]'));
    grids.forEach(function (grid) {
      var input = document.querySelector('[data-filter-input="' + grid.id + '"]');
      var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-sort-target="' + grid.id + '"]'));
      var empty = document.querySelector('[data-empty-for="' + grid.id + '"]');
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';
      if (input && query) {
        input.value = query;
      }

      function applyFilter() {
        var value = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-category')
          ].join(' ').toLowerCase();
          var match = !value || haystack.indexOf(value) !== -1;
          card.style.display = match ? '' : 'none';
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      function sortCards(type) {
        var visibleCards = cards.slice();
        visibleCards.sort(function (a, b) {
          if (type === 'year') {
            return (b.getAttribute('data-year') || '').localeCompare(a.getAttribute('data-year') || '');
          }
          if (type === 'title') {
            return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-CN');
          }
          return Number(a.getAttribute('data-index') || 0) - Number(b.getAttribute('data-index') || 0);
        });
        visibleCards.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          buttons.forEach(function (item) {
            item.classList.remove('is-active');
          });
          button.classList.add('is-active');
          sortCards(button.getAttribute('data-sort-type'));
          applyFilter();
        });
      });

      cards.forEach(function (card, idx) {
        card.setAttribute('data-index', idx);
      });
      applyFilter();
    });
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('[data-video]'));
    shells.forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('.player-overlay');
      var playButtons = Array.prototype.slice.call(shell.querySelectorAll('[data-player-play]'));
      var muteButton = shell.querySelector('[data-player-mute]');
      var fullButton = shell.querySelector('[data-player-fullscreen]');
      var message = shell.querySelector('.player-message');
      var source = shell.getAttribute('data-video');
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function showMessage(text) {
        if (message) {
          message.textContent = text;
        }
      }

      function loadVideo() {
        if (shell.getAttribute('data-loaded') === 'true') {
          return;
        }
        shell.setAttribute('data-loaded', 'true');
        video.controls = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showMessage('视频加载失败，请刷新页面');
            }
          });
          return;
        }

        showMessage('视频暂时无法播放，请更换浏览器');
      }

      function start() {
        loadVideo();
        if (overlay) {
          overlay.style.pointerEvents = 'none';
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            showMessage('点击视频区域继续播放');
          });
        }
      }

      function toggle() {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      }

      playButtons.forEach(function (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          start();
        });
      });

      video.addEventListener('click', toggle);
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
      });
      video.addEventListener('ended', function () {
        shell.classList.remove('is-playing');
      });

      if (muteButton) {
        muteButton.addEventListener('click', function () {
          video.muted = !video.muted;
          muteButton.textContent = video.muted ? '取消静音' : '静音';
        });
      }

      if (fullButton) {
        fullButton.addEventListener('click', function () {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (shell.requestFullscreen) {
            shell.requestFullscreen();
          }
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
          hlsInstance.destroy();
        }
      });
    });
  }
})();
