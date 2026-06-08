(function() {
  var toggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function() {
      var isOpen = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.textContent = isOpen ? '×' : '☰';
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var activeSlide = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function(slide, current) {
      slide.classList.toggle('active', current === activeSlide);
    });
    dots.forEach(function(dot, current) {
      dot.classList.toggle('active', current === activeSlide);
    });
  }
  dots.forEach(function(dot, index) {
    dot.addEventListener('click', function() {
      showSlide(index);
    });
  });
  if (slides.length > 1) {
    setInterval(function() {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('.movie-search');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var activeFilter = 'all';

  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  function cardText(card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags'),
      card.textContent
    ].join(' '));
  }

  function applyFilters() {
    var query = normalize(searchInput ? searchInput.value : '');
    cards.forEach(function(card) {
      var text = cardText(card);
      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchFilter = activeFilter === 'all' || text.indexOf(normalize(activeFilter)) !== -1;
      card.style.display = matchQuery && matchFilter ? '' : 'none';
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  buttons.forEach(function(button) {
    button.addEventListener('click', function() {
      activeFilter = button.getAttribute('data-filter') || 'all';
      buttons.forEach(function(item) {
        item.classList.toggle('active', item === button);
      });
      applyFilters();
    });
  });

  if (buttons.length) {
    buttons[0].classList.add('active');
  }
}());
