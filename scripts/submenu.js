// -- SUBMENU -- //
// Header submenus (Projects -> Archive) and "section" highlight.
// It uses `normalizePath()` from `main.js` and runs after its `initHeader()`.

// -- SECTION HIGHLIGHT -- //
// main.js marks the link of the exact page with `.active`.
// Here a link gets `.active-section` when the current page is INSIDE it
// (`/projects/ruins` -> "Projects"). Home ("/") is excluded.
function initSectionHighlight() {
    const currentPath = normalizePath(window.location.pathname);

    document.querySelectorAll('nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#')) return;

        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;

        const linkPath = normalizePath(url.pathname);
        const isExact = linkPath === currentPath;
        const isSection = !isExact && linkPath !== '/' && currentPath.startsWith(linkPath + '/');

        link.classList.toggle('active-section', isSection);
        if (isSection) link.setAttribute('aria-current', 'true');
    });
}

// -- OPEN and CLOSE -- //
// Mouse hover and keyboard focus are handled by CSS (_submenu.scss).
// Here: click or tap (touch, mobile accordion), click outside, Escape.
function initSubmenus() {
    const setSub = (item, isOpen) => {
        item.classList.toggle('open', isOpen);
        item.querySelector(':scope > .sub-toggle')?.setAttribute('aria-expanded', String(isOpen));
    };
    const closeSubs = () => document.querySelectorAll('.has-sub.open').forEach(i => setSub(i, false));

    document.querySelectorAll('.sub-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // do not trigger the "click outside" below
            const item = btn.closest('.has-sub');
            const willOpen = !item.classList.contains('open');

            // Close the siblings (e.g. "Archive" while opening "Experiments")
            item.parentElement.querySelectorAll(':scope > .has-sub.open')
                .forEach(s => { if (s !== item) setSub(s, false); });

            setSub(item, willOpen);
        });
    });

    document.addEventListener('click', closeSubs);
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        const open = document.querySelector('.has-sub.open'); // il più esterno
        closeSubs();
        open?.querySelector(':scope > .sub-toggle')?.focus();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof normalizePath === 'function') initSectionHighlight();
    initSubmenus();
});