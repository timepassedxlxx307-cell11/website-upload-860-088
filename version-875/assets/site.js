(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = !menu.hasAttribute("hidden");
      if (opened) {
        menu.setAttribute("hidden", "");
      } else {
        menu.removeAttribute("hidden");
      }
    });
  }

  function setupHero() {
    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var prev = hero.querySelector(".hero-prev");
      var next = hero.querySelector(".hero-next");
      var current = 0;
      var timer;
      if (!slides.length) {
        return;
      }
      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, pos) {
          slide.classList.toggle("is-active", pos === current);
        });
        dots.forEach(function (dot, pos) {
          dot.classList.toggle("is-active", pos === current);
        });
      }
      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }
      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }
      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }
      dots.forEach(function (dot, pos) {
        dot.addEventListener("click", function () {
          show(pos);
          start();
        });
      });
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    });
  }

  function setupGlobalSearch() {
    var layer = document.getElementById("search-layer");
    var input = document.getElementById("global-search-input");
    var results = document.getElementById("global-search-results");
    if (!layer || !input || !results) {
      return;
    }
    function openSearch() {
      layer.classList.add("is-open");
      layer.setAttribute("aria-hidden", "false");
      window.setTimeout(function () {
        input.focus();
      }, 30);
    }
    function closeSearch() {
      layer.classList.remove("is-open");
      layer.setAttribute("aria-hidden", "true");
      input.value = "";
      results.innerHTML = "";
    }
    document.querySelectorAll(".search-open").forEach(function (button) {
      button.addEventListener("click", openSearch);
    });
    var close = layer.querySelector(".search-close");
    if (close) {
      close.addEventListener("click", closeSearch);
    }
    layer.addEventListener("click", function (event) {
      if (event.target === layer) {
        closeSearch();
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && layer.classList.contains("is-open")) {
        closeSearch();
      }
    });
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      var source = window.SITE_MOVIES || [];
      if (!query) {
        results.innerHTML = "";
        return;
      }
      var matches = source.filter(function (item) {
        return [item.title, item.genre, item.region, item.year, item.category].join(" ").toLowerCase().indexOf(query) !== -1;
      }).slice(0, 24);
      if (!matches.length) {
        results.innerHTML = '<div class="search-empty">没有匹配到相关影片</div>';
        return;
      }
      results.innerHTML = matches.map(function (item) {
        return '<a class="search-result" href="' + item.url + '"><img src="' + item.image + '" alt="' + escapeHtml(item.title) + '"><span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.year + " · " + item.region + " · " + item.genre) + '</span></span></a>';
      }).join("");
    });
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        "\"": "&quot;"
      }[char];
    });
  }

  function setupLocalFilter() {
    var input = document.querySelector(".local-search");
    var select = document.querySelector(".local-genre-filter");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
    if (!cards.length || (!input && !select)) {
      return;
    }
    function apply() {
      var term = input ? input.value.trim().toLowerCase() : "";
      var genre = select ? select.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var haystack = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.year, card.dataset.category].join(" ").toLowerCase();
        var okTerm = !term || haystack.indexOf(term) !== -1;
        var okGenre = !genre || String(card.dataset.genre || "").toLowerCase().indexOf(genre) !== -1;
        card.style.display = okTerm && okGenre ? "" : "none";
      });
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", apply);
    }
  }

  function setupPlayers() {
    document.querySelectorAll(".movie-player").forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".player-overlay");
      var src = player.getAttribute("data-video");
      var attached = false;
      var hls;
      if (!video || !overlay || !src) {
        return;
      }
      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
      }
      function play() {
        attach();
        overlay.classList.add("is-hidden");
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      }
      overlay.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupGlobalSearch();
    setupLocalFilter();
    setupPlayers();
  });
})();
