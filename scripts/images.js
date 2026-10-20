// -- IMAGE OVERLAY SYSTEM -- //
/*
USAGE (HTML)

1. A single image (uses its own `src`):
   <img src="/media/a.jpg" data-desc="gallery.a" onclick="openGallery(this)">
   Optional: data-full="/media/a-big.jpg" opens a higher resolution version.

2. A grid of N images (numbering must be consecutive: 1, 2, 3...):
   <img src="/media/cover.jpg"
        data-img1="/media/a.jpg" data-desc1="gallery.a"
        data-img2="/media/b.jpg" data-desc2="gallery.b"
        data-img3="/media/c.jpg" data-desc3="gallery.c"
        onclick="openGallery(this)">
   Optional: data-cols="2" forces the number of columns.

`data-desc*` is a translation key and the description can contain HTML: it is
rendered like `data-i18n-html` in main.js (<strong>, <br>, <a>...). If the key is
not found, the text itself is shown (and parsed as HTML), so plain text also works.
*/

(function () {
    const CLOSE_KEY = '$common.ARIA.overlay_close'; // aria-label of the close icon
    const MAX_COLS = 3;

    let overlay, grid, closeLink, lastFocus;

    // 1. TRANSLATION HELPER
    // `currentTranslations` is the `let` declared in main.js: it is not a property
    // of `window`, but it is visible from any other classic script of the page.
    function t(key, fallback = key) {
        const dict = typeof currentTranslations !== 'undefined' ? currentTranslations : {};
        const val = key.split('.').reduce((obj, i) => (obj ? obj[i] : null), dict);

        if (!val) return fallback;
        return Array.isArray(val) ? val.join(' ') : val;
    }

    // 2. OVERLAY CREATION (once, on the first opening)
    function buildOverlay() {
        if (overlay) return;

        overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');

        // Close icon: just the `.close-svg` icon from _icons.scss, inside a link
        closeLink = document.createElement('a');
        closeLink.href = '#';
        closeLink.className = 'overlay-close';
        closeLink.setAttribute('data-i18n-aria', CLOSE_KEY); // main.js keeps it translated
        closeLink.setAttribute('aria-label', t(CLOSE_KEY, 'Close'));
        closeLink.innerHTML = '<span class="close-svg" aria-hidden="true"></span>';

        // Scrollable area + grid that will contain the images
        const body = document.createElement('div');
        body.className = 'overlay-body';
        grid = document.createElement('div');
        grid.className = 'overlay-grid';
        body.append(grid);

        overlay.append(closeLink, body);
        document.body.append(overlay);
        void overlay.offsetWidth; // reflow: the fade-in also works on the first opening

        // Click anywhere that is not an image: background, gaps, close icon
        overlay.addEventListener('click', (e) => {
            if (e.target.closest('.overlay-close')) e.preventDefault(); // it is a link: no jump to '#'
            if (!e.target.closest('.overlay-item')) closeGallery();
        });
    }

    // 3. READ THE IMAGES FROM THE CLICKED ELEMENT
    function readItems(el) {
        const items = [];

        // data-img1/data-desc1, data-img2/data-desc2, ... until the numbering stops
        for (let i = 1; el.dataset['img' + i]; i++) {
            items.push({ src: el.dataset['img' + i], desc: el.dataset['desc' + i] || '' });
        }

        // No numbered attributes: the clicked image itself
        if (!items.length) {
            const src = el.dataset.full || el.currentSrc || el.src;
            if (src) items.push({ src, desc: el.dataset.desc || '' });
        }

        return items;
    }

    // 4. A SINGLE ITEM (image + description)
    function createItem({ src, desc }) {
        const fig = document.createElement('figure');
        fig.className = 'overlay-item';

        const img = document.createElement('img');
        img.src = src;
        img.alt = ''; // the description below already says what it is
        fig.append(img);

        if (desc) {
            const cap = document.createElement('figcaption');
            cap.setAttribute('data-i18n-html', desc); // if the language changes while it is open, main.js updates it
            cap.innerHTML = t(desc);
            fig.append(cap);
        }

        return fig;
    }

    // 5. OPENING
    function openGallery(el) {
        const items = readItems(el);
        if (!items.length) return;

        buildOverlay();

        // 4 images look better as 2x2 than as 3+1
        const cols = parseInt(el.dataset.cols, 10)
            || (items.length === 4 ? 2 : Math.min(items.length, MAX_COLS));

        grid.style.setProperty('--cols', cols);
        grid.dataset.count = items.length;
        grid.replaceChildren(...items.map(createItem));
        overlay.querySelector('.overlay-body').scrollTop = 0;

        lastFocus = document.activeElement;
        document.body.classList.add('no-scroll');
        overlay.classList.add('active');
        closeLink.focus({ preventScroll: true });
    }

    // 6. CLOSING
    function closeGallery() {
        if (!overlay || !overlay.classList.contains('active')) return;

        overlay.classList.remove('active');
        document.body.classList.remove('no-scroll');

        if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
        lastFocus = null;
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeGallery();
    });

    // 7. PUBLIC API
    window.openGallery = openGallery;
    window.closeGallery = closeGallery;

    // Old names, so the existing HTML keeps working (remove them once the pages are updated)
    window.openOneImage = openGallery;
    window.openTwoImages = openGallery;
    window.openThreeImages = openGallery;
    window.closePopup = closeGallery;
    window.t = t;
})();

// -- SELECT A RANDOM IMAGE -- //

// Wait for the page to load
window.addEventListener('DOMContentLoaded', () => {

    // 1. Find all images that have the class "random-img"
    document.querySelectorAll('.random-img').forEach(img => {

        // 2. data-srcs="a.jpg, b.jpg, c.jpg" -> ['a.jpg', 'b.jpg', 'c.jpg']
        const images = (img.dataset.srcs || '')
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);

        // 3. Pick a random one and set it as the final src
        if (images.length) {
            img.src = images[Math.floor(Math.random() * images.length)];
        }
    });
});
