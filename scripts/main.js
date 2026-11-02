// -- CONFIG -- //
// Jekyll base URL, injected by the layout:
// <script>window.SITE_BASEURL = {{ site.baseurl | jsonify }};</script>
const repoName = (window.SITE_BASEURL || '').replace(/\/+$/, '');

const DEFAULT_LANG = 'en';
// Files loaded on EVERY page (shared translations)
const baseFiles = ['shared/common'];
// Pages to NOT translate
const excludedPages = ['debug-room'];

// -- STATE -- //
let currentTranslations = {};
let fallbackTranslations = {};
let langRequestId = 0;              // Guards against out-of-order responses
const translationCache = new Map(); // "lang:pageId" -> Promise<translations>

// -- PATH UTILITIES -- //

// Single normalizer used everywhere (active link, translation file lookup)
// /projects/ruins.html -> /projects/ruins
// /projects/index.html, /projects/ -> /projects
// /index.html, / -> /
function normalizePath(path) {
    let p = path;
    if (repoName && p.startsWith(repoName)) p = p.slice(repoName.length);
    p = p.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/+$/, '');
    return p || '/';
}

// Page id used to find the translation file: "projects/ruins", "index", ...
function getPageId() {
    return window.forcedPageName || normalizePath(window.location.pathname).replace(/^\//, '') || 'index';
}

// -- STORAGE (safe: can throw in private mode / blocked cookies) -- //
function readStorage(key) {
    try { return localStorage.getItem(key); } catch { return null; }
}

function writeStorage(key, value) {
    try { localStorage.setItem(key, value); } catch { /* ignore */ }
}

// -- TRANSLATION LOOKUP -- //

// "hero.presentation" -> obj.hero.presentation
function resolveKey(obj, key) {
    return key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

// Returns a string (arrays are joined) or null. Falls back to the default language.
function t(key) {
    const val = resolveKey(currentTranslations, key) ?? resolveKey(fallbackTranslations, key);
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) return val.join(' ');
    return null;
}

// -- HEADER -- //
function initHeader() {
    // 1. Active link in the navbar
    const currentPath = normalizePath(window.location.pathname);
    document.querySelectorAll('nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#')) return;

        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return; // external, mailto:, tel:, ...

        const isActive = normalizePath(url.pathname) === currentPath;
        link.classList.toggle('active', isActive);
        if (isActive) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });

    // 2. Language buttons
    document.querySelectorAll('.lang').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const selectedLang = button.getAttribute('data-lang');
            if (selectedLang) changeLanguage(selectedLang);
        });
    });

    // 3. Mobile menu
    const toggle = document.getElementById('mobile-toggle');
    const mainMenu = document.getElementById('main-menu');
    if (!toggle || !mainMenu) return;

    const setMenuOpen = (isOpen) => {
        toggle.classList.toggle('open', isOpen);
        mainMenu.classList.toggle('open', isOpen);

        // ARIA: key is re-applied on every language change by updateAllTexts()
        const key = isOpen ? '$common.head.ARIA.menu_close' : '$common.head.ARIA.menu_open';
        toggle.setAttribute('data-i18n-aria', key);
        toggle.setAttribute('aria-expanded', String(isOpen));

        const label = t(key);
        if (label) toggle.setAttribute('aria-label', label);
    };

    toggle.addEventListener('click', () => {
        setMenuOpen(!toggle.classList.contains('open'));
    });

    // Click outside the menu closes it (clicks inside the menu do not)
    document.addEventListener('click', (e) => {
        if (!toggle.classList.contains('open')) return;
        if (mainMenu.contains(e.target) || toggle.contains(e.target)) return;
        setMenuOpen(false);
    });

    // Escape closes the menu and gives focus back to the toggle
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && toggle.classList.contains('open')) {
            setMenuOpen(false);
            toggle.focus();
        }
    });

    // Following a link closes the menu
    mainMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setMenuOpen(false));
    });
}

// -- LANGUAGE ENGINE -- //

function getSupportedLangs() {
    const langs = [...document.querySelectorAll('.lang')]
        .map(btn => btn.dataset.lang)
        .filter(Boolean);
    return langs.length ? [...new Set(langs)] : [DEFAULT_LANG];
}

// Saved preference -> browser language (if supported) -> default
function getInitialLang() {
    const supported = getSupportedLangs();
    const saved = readStorage('preferredLang');
    if (saved && supported.includes(saved)) return saved;

    const browser = (navigator.language || '').slice(0, 2).toLowerCase();
    return supported.includes(browser) ? browser : DEFAULT_LANG;
}

// Loads and merges shared + page translations for one language (cached)
function loadTranslations(lang, pageId) {
    const cacheKey = `${lang}:${pageId}`;

    if (!translationCache.has(cacheKey)) {
        const files = [
            ...baseFiles,
            ...(window.extraLocales || []),
            ...(excludedPages.includes(pageId) ? [] : [pageId])
        ];

        const promise = Promise
            .all(files.map(f => safeFetchJson(`${repoName}/locales/${lang}/${f}.json`)))
            .then(list => {
                const merged = Object.assign({}, ...list); // later files (page) override shared
                // Do not keep failed loads in cache, so a retry is possible
                if (Object.keys(merged).length === 0) translationCache.delete(cacheKey);
                return merged;
            });

        translationCache.set(cacheKey, promise);
    }

    return translationCache.get(cacheKey);
}

async function changeLanguage(lang) {
    const requestId = ++langRequestId;

    try {
        const pageId = getPageId();

        // Requested language + default language as fallback for missing keys
        const [translations, fallback] = await Promise.all([
            loadTranslations(lang, pageId),
            lang === DEFAULT_LANG ? Promise.resolve({}) : loadTranslations(DEFAULT_LANG, pageId)
        ]);

        // A newer request started while we were waiting: drop this result
        if (requestId !== langRequestId) return;

        currentTranslations = translations;
        fallbackTranslations = fallback;

        updateAllTexts();

        // Sync language buttons (Desktop and Mobile)
        document.querySelectorAll('.lang').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        });

        writeStorage('preferredLang', lang);
        document.documentElement.lang = lang;
    }
    catch (error) {
        console.error('Error loading language:', error);
    }
}

function updateAllTexts() {
    // 1. Document title (page title + site suffix)
    const titleEl = document.querySelector('title[data-i18n]');
    if (titleEl) {
        const val = t(titleEl.getAttribute('data-i18n'));
        if (val) document.title = val + (titleEl.dataset.suffix || '');
    }

    // 2. Meta description (needs data-i18n-description on <html>)
    const descKey = document.documentElement.dataset.i18nDescription;
    if (descKey) {
        const val = t(descKey);
        if (val) {
            document.querySelectorAll(
                'meta[name="description"], ' +
                'meta[property="og:description"], ' +
                'meta[name="twitter:description"]'
            ).forEach(m => m.setAttribute('content', val));
        }
    }

    // 3. Plain texts (data-i18n)
    document.querySelectorAll('[data-i18n]:not(title)').forEach(el => {
        const val = t(el.getAttribute('data-i18n'));
        if (val) el.textContent = val;
    });

    // 4. HTML texts (data-i18n-html)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const val = t(el.getAttribute('data-i18n-html'));
        if (val) el.innerHTML = val;
    });

    // 5. Attributes (data-i18n-alt, data-i18n-placeholder)
    ['alt', 'placeholder'].forEach(attr => {
        document.querySelectorAll(`[data-i18n-${attr}]`).forEach(el => {
            const val = t(el.getAttribute(`data-i18n-${attr}`));
            if (val) el.setAttribute(attr, val);
        });
    });

    // 6. ARIA labels (accessibility)
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
        const val = t(el.getAttribute('data-i18n-aria'));
        if (val) el.setAttribute('aria-label', val);
    });
}

// Safe JSON fetch: never throws, returns {} on any failure
async function safeFetchJson(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) return {};
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) return {}; // Unexpected HTML/text
        return await res.json();
    } catch {
        return {};
    }
}

// -- SCROLL INDICATOR -- //
function initScrollIndicator() {
    const indicator = document.querySelector('.scroll-indicator');
    if (!indicator) return;

    let ticking = false;

    const update = () => {
        const opacity = Math.max(0, 1 - (window.scrollY / 300));
        indicator.style.opacity = opacity;
        indicator.style.pointerEvents = opacity <= 0 ? 'none' : 'auto';
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
    }, { passive: true });

    update();
}

// -- LOADING INIT -- //
document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initScrollIndicator();

    // Safety net: never leave the page hidden if translations are slow
    const reveal = () => document.documentElement.classList.remove('i18n-loading');
    setTimeout(reveal, 1500);

    changeLanguage(getInitialLang()).finally(reveal);
});
