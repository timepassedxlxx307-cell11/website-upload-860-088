import { H as Hls } from './hls.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function initMenu() {
    const toggle = $('.mobile-toggle');
    const nav = $('.mobile-nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => {
        nav.classList.toggle('is-open');
    });
}

function initHero() {
    const hero = $('[data-hero]');
    if (!hero) return;
    const slides = $$('.hero-slide', hero);
    const dots = $$('.hero-dots button', hero);
    const prev = $('.hero-prev', hero);
    const next = $('.hero-next', hero);
    if (!slides.length) return;
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
        dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };

    const start = () => {
        stop();
        timer = window.setInterval(() => show(index + 1), 5200);
    };

    const stop = () => {
        if (timer) window.clearInterval(timer);
    };

    prev?.addEventListener('click', () => {
        show(index - 1);
        start();
    });

    next?.addEventListener('click', () => {
        show(index + 1);
        start();
    });

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            show(i);
            start();
        });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
}

function normalize(value) {
    return String(value || '').toLowerCase().trim();
}

function initFilters() {
    const grids = $$('.filter-scope');
    grids.forEach((grid) => {
        const section = grid.closest('section') || document;
        const input = $('.filter-input', section);
        const year = $('.filter-year', section);
        const reset = $('.filter-reset', section);
        const empty = $('.empty-tip', section);
        const cards = $$('.movie-card', grid);
        const quickButtons = $$('.quick-filters button', section);

        const apply = () => {
            const q = normalize(input?.value);
            const y = normalize(year?.value);
            let visible = 0;
            cards.forEach((card) => {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.category,
                    card.textContent,
                ].join(' '));
                const yearOk = !y || normalize(card.dataset.year).includes(y);
                const queryOk = !q || haystack.includes(q);
                const show = yearOk && queryOk;
                card.hidden = !show;
                if (show) visible += 1;
            });
            empty?.classList.toggle('is-show', visible === 0);
        };

        input?.addEventListener('input', apply);
        year?.addEventListener('change', apply);
        reset?.addEventListener('click', () => {
            if (input) input.value = '';
            if (year) year.value = '';
            apply();
        });
        quickButtons.forEach((button) => {
            button.addEventListener('click', () => {
                if (input) input.value = button.dataset.query || button.textContent || '';
                apply();
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });

        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');
        if (query && input) {
            input.value = query;
            apply();
        }
    });
}

function initImages() {
    $$('img').forEach((img) => {
        img.addEventListener('error', () => {
            img.classList.add('is-empty');
        }, { once: true });
    });
}

function initPlayers() {
    const videos = $$('.movie-player[data-stream]');
    videos.forEach((video) => {
        const stream = video.dataset.stream;
        const shell = video.closest('.player-shell');
        const cover = $('.player-cover', shell || document);
        if (!stream) return;

        if (Hls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, (_, data) => {
                if (!data || !data.fatal) return;
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
        } else {
            cover?.insertAdjacentHTML('beforeend', '<span class="player-message">暂不支持该播放格式</span>');
        }

        const play = async () => {
            cover?.classList.add('is-hidden');
            try {
                await video.play();
            } catch (error) {
                cover?.classList.remove('is-hidden');
            }
        };

        cover?.addEventListener('click', play);
        video.addEventListener('play', () => cover?.classList.add('is-hidden'));
        video.addEventListener('pause', () => {
            if (video.currentTime === 0 || video.ended) {
                cover?.classList.remove('is-hidden');
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    initHero();
    initFilters();
    initImages();
    initPlayers();
});
