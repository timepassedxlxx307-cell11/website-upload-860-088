(function () {
    var activeFilter = 'all';

    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector('.nav-toggle');
        var nav = document.querySelector('.main-nav');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        var prev = document.querySelector('.hero-prev');
        var next = document.querySelector('.hero-next');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide')) || 0);
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

        restart();
    }

    function textOfCard(card) {
        return [
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region'),
            card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
    }

    function applyFilters(scope) {
        var root = scope || document;
        var input = root.querySelector('.movie-search') || document.querySelector('.movie-search');
        var query = input ? input.value.trim().toLowerCase() : '';
        var items = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-item'));
        items.forEach(function (item) {
            var category = item.getAttribute('data-category') || '';
            var matchesCategory = activeFilter === 'all' || category === activeFilter;
            var matchesText = !query || textOfCard(item).indexOf(query) !== -1;
            item.classList.toggle('is-hidden', !(matchesCategory && matchesText));
        });
    }

    function setupFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll('.movie-search'));
        inputs.forEach(function (input) {
            input.addEventListener('input', function () {
                applyFilters(document);
            });
        });

        var buttons = Array.prototype.slice.call(document.querySelectorAll('.filter-button'));
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeFilter = button.getAttribute('data-filter') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item.getAttribute('data-filter') === activeFilter);
                });
                applyFilters(document);
            });
        });
    }

    function loadHlsLibrary(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var existing = document.querySelector('script[data-hls-loader="true"]');
        if (existing) {
            existing.addEventListener('load', callback, { once: true });
            return;
        }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
        script.async = true;
        script.setAttribute('data-hls-loader', 'true');
        script.addEventListener('load', callback, { once: true });
        document.head.appendChild(script);
    }

    function startVideo(shell) {
        var video = shell.querySelector('video');
        var stream = shell.getAttribute('data-stream');
        if (!video || !stream) {
            return;
        }

        function playNow() {
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
            shell.classList.add('is-playing');
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.getAttribute('src') !== stream) {
                video.setAttribute('src', stream);
            }
            playNow();
            return;
        }

        loadHlsLibrary(function () {
            if (window.Hls && window.Hls.isSupported()) {
                if (!video._hlsInstance) {
                    var hls = new window.Hls();
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    video._hlsInstance = hls;
                    hls.on(window.Hls.Events.MANIFEST_PARSED, playNow);
                } else {
                    playNow();
                }
            } else {
                video.setAttribute('src', stream);
                playNow();
            }
        });
    }

    function setupPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
        shells.forEach(function (shell) {
            var button = shell.querySelector('.play-button');
            if (button) {
                button.addEventListener('click', function () {
                    startVideo(shell);
                });
            }
            shell.addEventListener('click', function (event) {
                if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
                    return;
                }
                if (!shell.classList.contains('is-playing')) {
                    startVideo(shell);
                }
            });
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
