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
    var mobileNav = document.querySelector(".mobile-nav");
    if (!button || !mobileNav) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = mobileNav.classList.toggle("open");
      button.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function setupSearch() {
    var panel = document.querySelector(".search-panel");
    var scope = document.querySelector("[data-card-scope]");
    if (!panel || !scope) {
      return;
    }
    var input = panel.querySelector("[data-search-input]");
    var chips = Array.prototype.slice.call(panel.querySelectorAll(".filter-chip"));
    var status = panel.querySelector(".search-status");
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-row"));
    var activeType = "all";
    var activeValue = "all";

    function cardText(card) {
      return normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags"),
        card.textContent
      ].join(" "));
    }

    function apply() {
      var query = normalize(input ? input.value : "");
      var visible = 0;
      cards.forEach(function (card) {
        var text = cardText(card);
        var matchedText = !query || text.indexOf(query) !== -1;
        var matchedFilter = true;
        if (activeType !== "all") {
          matchedFilter = normalize(card.getAttribute("data-" + activeType)).indexOf(normalize(activeValue)) !== -1 || text.indexOf(normalize(activeValue)) !== -1;
        }
        var shown = matchedText && matchedFilter;
        card.classList.toggle("is-filtered-out", !shown);
        if (shown) {
          visible += 1;
        }
      });
      if (status) {
        status.textContent = visible ? "已匹配 " + visible + " 部作品" : "暂无匹配作品";
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("active");
        });
        chip.classList.add("active");
        activeType = chip.getAttribute("data-filter-type") || "all";
        activeValue = chip.getAttribute("data-filter-value") || "all";
        apply();
      });
    });
  }

  function bindPlayer(source) {
    var video = document.getElementById("movieVideo");
    var overlay = document.querySelector(".player-overlay");
    if (!video || !source) {
      return;
    }
    var hlsInstance = null;
    var hasLoaded = false;

    function safePlay() {
      var playCall = video.play();
      if (playCall && typeof playCall.catch === "function") {
        playCall.catch(function () {});
      }
    }

    function load() {
      if (hasLoaded) {
        safePlay();
        return;
      }
      hasLoaded = true;
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        safePlay();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          safePlay();
        });
        return;
      }
      video.src = source;
      safePlay();
    }

    if (overlay) {
      overlay.addEventListener("click", load);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        load();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.preparePlayer = bindPlayer;

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
  });
})();
