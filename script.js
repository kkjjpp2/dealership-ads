/* Jae's Auto Media - small, dependency-free animation helpers.
   Everything degrades gracefully: if this file fails to load, the page is fully visible. */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- 1. Reveal elements as they scroll into view ---------- */
    var revealSelector = [
        '.section-title', '.intro', '.side-text', '.photo-block', '.detail-text',
        '.step', '.card', '.cta-box', '.link-row', '.contact-note',
        '.footer-grid > div', '.ticker'
    ].join(',');

    var items = document.querySelectorAll(revealSelector);
    var perParent = new Map();

    items.forEach(function (el) {
        el.classList.add('reveal');
        // stagger siblings (cards, steps, footer columns) a little
        var parent = el.parentElement;
        var index = perParent.get(parent) || 0;
        el.style.setProperty('--d', (Math.min(index, 4) * 0.12) + 's');
        perParent.set(parent, index + 1);
    });

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -3% 0px' });

        items.forEach(function (el) { observer.observe(el); });
    } else {
        items.forEach(function (el) { el.classList.add('in'); });
    }

    /* ---------- 2. Scroll progress bar + header shadow ---------- */
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    var header = document.querySelector('.site-header');
    var ticking = false;

    function update() {
        var root = document.documentElement;
        var max = root.scrollHeight - root.clientHeight;
        var progress = max > 0 ? root.scrollTop / max : 0;
        bar.style.transform = 'scaleX(' + Math.min(Math.max(progress, 0), 1) + ')';
        if (header) { header.classList.toggle('scrolled', root.scrollTop > 10); }
        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(update);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    /* ---------- 3. Soft glow that follows the pointer on cards ---------- */
    if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
        document.querySelectorAll('.card').forEach(function (card) {
            card.addEventListener('mousemove', function (event) {
                var rect = card.getBoundingClientRect();
                card.style.setProperty('--mx', (event.clientX - rect.left) + 'px');
                card.style.setProperty('--my', (event.clientY - rect.top) + 'px');
            });
            card.addEventListener('mouseleave', function () {
                card.style.removeProperty('--mx');
                card.style.removeProperty('--my');
            });
        });
    }
})();
