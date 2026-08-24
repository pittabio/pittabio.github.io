// --- PATH CONFIGURATION ---
const isGitHubPages = window.location.hostname.includes('github.io');
let repoName = isGitHubPages ? '' : '';

// Current page
const pageName = window.location.pathname.split('/').pop().replace('.html', '') || 'index';

// -- HEADER -- //
function initHeader() {
    // 1. Active link in the navbar
    document.querySelectorAll('nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('http')) return;

        const linkPage = href.split('/').pop().replace('.html', '') || 'index';
        if (linkPage === pageName) {
            link.classList.add('active');
        }
    });

    // 2. Listener Language Buttons
    document.querySelectorAll('.lang').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const selectedLang = btn.getAttribute('data-lang');
            if (selectedLang) changeLanguage(selectedLang).then(() => {});
        });
    });

    // 3. Toggle Menu Mobile
    const toggle = document.getElementById('mobile-toggle');
    const mainMenu = document.getElementById('main-menu');

    if (toggle && mainMenu) {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggle.classList.toggle('open');
            mainMenu.classList.toggle('open');
        });

        document.addEventListener('click', () => {
            toggle.classList.remove('open');
            mainMenu.classList.remove('open');
        });

        mainMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                toggle.classList.remove('open');
                mainMenu.classList.remove('open');
            });
        });
    }
}

// -- LANGUAGE ENGINE -- //
async function changeLanguage(lang) {
    try {
        // 1. Identifies the relative path to the JSON file
        // E.g.: /projects/ruins.html -> projects/ruins
        let path = window.location.pathname;

        if (isGitHubPages) {
            const segments = path.split('/').filter(s => s);
            segments.shift(); // Rimuove il nome della repo
            path = '/' + segments.join('/');
        }

        let cleanPath = path.replace('.html', '').replace(/\/$/, '');
        if (cleanPath === "" || cleanPath === "/") {
            cleanPath = "index";
        }
        if (cleanPath.startsWith('/')) cleanPath = cleanPath.slice(1);

        // 2. Fetch JSON files (Page-specific + Common)
        const [pageRes, commonRes] = await Promise.all([
            fetch(`${repoName}/locales/${lang}/${cleanPath}.json`).catch(() => null),
            fetch(`${repoName}/locales/${lang}/common.json`).catch(() => null)
        ]);

        const pageTranslations = pageRes && pageRes.ok ? await pageRes.json() : {};
        const commonTranslations = commonRes && commonRes.ok ? await commonRes.json() : {};

        // Union of translations
        const translations = { ...commonTranslations, ...pageTranslations };

        // 3. Helper function to navigate the JSON object (e.g. "hero.presentation")
        const getNestedTranslation = (key) => {
            return key.split('.').reduce((obj, i) => (obj ? obj[i] : null), translations);
        };

        // 4. Update texts

        // 4a. Update normal texts (data-i18n)
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const val = getNestedTranslation(el.getAttribute('data-i18n'));
            if (val) el.innerText = Array.isArray(val) ? val.join(' ') : val;
        });

        // 4b. Update HTML texts (data-i18n-html)
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const val = getNestedTranslation(el.getAttribute('data-i18n-html'));
            if (val) el.innerHTML = Array.isArray(val) ? val.join(' ') : val;
        });

        // 5. Update the state of the language buttons (syncs Desktop and Mobile)
        document.querySelectorAll('.lang').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        });

        // 6. Save preference and update UI
        localStorage.setItem('preferredLang', lang);
        document.documentElement.lang = lang;

    }
    catch (error) {
        console.error("Error loading language:", error);
    }
}

// -- LOADING INIT -- //
document.addEventListener('DOMContentLoaded', () => {
    initHeader();

    // Carica lingua salvata o default
    const savedLang = localStorage.getItem('preferredLang') || 'en';
    changeLanguage(savedLang).then(() => {});
});

// -- SCROLL INDICATOR -- //
window.addEventListener('scroll', () => {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        const opacity = Math.max(0, 1 - (window.scrollY / 300));
        scrollIndicator.style.opacity = opacity;
        scrollIndicator.style.pointerEvents = opacity <= 0 ? 'none' : 'auto';
    }
});
