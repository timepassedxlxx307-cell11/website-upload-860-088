(function () {
  var body = document.body;
  var menuButton = document.querySelector("[data-menu-toggle]");

  if (menuButton) {
    menuButton.addEventListener("click", function () {
      var isOpen = !body.classList.contains("menu-open");
      body.classList.toggle("menu-open", isOpen);
      menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  var forms = document.querySelectorAll("[data-search-form]");

  forms.forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[name='q']");
      var query = input ? input.value.trim() : "";

      if (!query) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      window.location.href = "./search.html?q=" + encodeURIComponent(query);
    });
  });

  var pageSearch = document.querySelector("[data-page-search]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

  function filterCards(value) {
    var keyword = value.trim().toLowerCase();

    cards.forEach(function (card) {
      var haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
      var matched = !keyword || haystack.indexOf(keyword) !== -1;
      card.style.display = matched ? "" : "none";
    });
  }

  if (pageSearch) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (query) {
      pageSearch.value = query;
      filterCards(query);
    }

    pageSearch.addEventListener("input", function () {
      filterCards(pageSearch.value);
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var active = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    active = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === active);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === active);
      dot.setAttribute("aria-current", dotIndex === active ? "true" : "false");
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }
})();
