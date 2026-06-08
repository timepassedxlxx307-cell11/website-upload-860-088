import { H as Hls } from "./hls-dru42stk.js";

const onReady = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

const normalize = (value) => (value || "").toString().trim().toLowerCase();

const setupMobileNav = () => {
  const toggle = document.querySelector(".js-mobile-toggle");
  const nav = document.querySelector(".js-mobile-nav");
  if (!toggle || !nav) {
    return;
  }
  toggle.addEventListener("click", () => {
    nav.classList.toggle("is-open");
  });
};

const setupHero = () => {
  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  if (slides.length === 0) {
    return;
  }
  let index = 0;
  const activate = (next) => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, current) => {
      slide.classList.toggle("is-active", current === index);
    });
    dots.forEach((dot, current) => {
      dot.classList.toggle("is-active", current === index);
    });
  };
  dots.forEach((dot) => {
    dot.addEventListener("click", () => activate(Number(dot.dataset.heroDot || 0)));
  });
  window.setInterval(() => activate(index + 1), 5000);
};

const setupSearchForms = () => {
  const forms = document.querySelectorAll(".js-top-search, .js-inline-search");
  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      const input = form.querySelector("input[name='q']");
      const query = input ? input.value.trim() : "";
      if (!query) {
        event.preventDefault();
      }
    });
  });
};

const setupCardTools = () => {
  const lists = document.querySelectorAll(".js-card-list");
  if (lists.length === 0) {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";
  const queryInputs = document.querySelectorAll(".js-filter-input, .js-query-input");
  queryInputs.forEach((input) => {
    if (initialQuery && !input.value) {
      input.value = initialQuery;
    }
  });
  const filterList = (list, query) => {
    const term = normalize(query);
    const cards = Array.from(list.querySelectorAll(".movie-card"));
    cards.forEach((card) => {
      const content = normalize(`${card.dataset.title || ""} ${card.dataset.meta || ""}`);
      card.classList.toggle("is-hidden", term && !content.includes(term));
    });
  };
  const applyFilter = () => {
    const activeInput = Array.from(queryInputs).find((input) => input === document.activeElement) || queryInputs[0];
    const query = activeInput ? activeInput.value : "";
    lists.forEach((list) => filterList(list, query));
    queryInputs.forEach((input) => {
      if (input !== activeInput) {
        input.value = query;
      }
    });
  };
  queryInputs.forEach((input) => input.addEventListener("input", applyFilter));
  if (initialQuery) {
    applyFilter();
  }
  const sortSelects = document.querySelectorAll(".js-sort-select");
  sortSelects.forEach((select) => {
    select.addEventListener("change", () => {
      const mode = select.value;
      lists.forEach((list) => {
        const cards = Array.from(list.querySelectorAll(".movie-card"));
        cards.sort((a, b) => {
          if (mode === "views") {
            return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
          }
          if (mode === "year") {
            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
          }
          if (mode === "title") {
            return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
          }
          return 0;
        });
        cards.forEach((card) => list.appendChild(card));
      });
    });
  });
};

const attachPlayer = (video) => {
  const stream = video.dataset.stream || video.querySelector("source")?.src;
  if (!stream) {
    return;
  }
  if (Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(stream);
    hls.attachMedia(video);
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = stream;
  } else {
    video.src = stream;
  }
};

const setupPlayers = () => {
  const videos = Array.from(document.querySelectorAll(".movie-player"));
  videos.forEach((video) => {
    attachPlayer(video);
    const shell = video.closest(".player-shell");
    video.addEventListener("play", () => shell?.classList.add("is-playing"));
    video.addEventListener("pause", () => shell?.classList.remove("is-playing"));
  });
  const buttons = document.querySelectorAll(".js-play-now");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-player");
      const video = id ? document.getElementById(id) : button.closest(".player-shell")?.querySelector("video");
      if (video) {
        video.play().catch(() => {});
      }
    });
  });
};

onReady(() => {
  setupMobileNav();
  setupHero();
  setupSearchForms();
  setupCardTools();
  setupPlayers();
});
