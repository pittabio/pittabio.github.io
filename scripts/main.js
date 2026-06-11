// --- PATH CONFIGURATION ---
const isGitHubPages = window.location.hostname.includes('github.io');
// If it is GitHub Pages, the first segment of the path is the name of the repo
const repoName = isGitHubPages ? '/' + window.location.pathname.split('/')[1] : '';

// CURRENT PAGE
const pageName = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
const pageNavMap = {
    'index':    'nav-home',
    'contacts': 'nav-contacts',
    'projects': 'nav-projects',
    'about':    'nav-about',
    'support':  'nav-support'
};

// -- HEADER -- //
fetch(`${repoName}/common/header.html`)
    .then(response => response.text())
    .then(data => {
        document.getElementById('header').innerHTML = data;

        // Navigation link fix
        document.querySelectorAll('.site-nav .nav-link').forEach(link => {
            let href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('http')) return;

            const cleanHref = href.startsWith('/') ? href.slice(1) : href;
            link.setAttribute('href', `${repoName}/${cleanHref}`);
        });

        // Activate current link
        const activeNavId = pageNavMap[pageName];
        const activeNavEl = document.getElementById(activeNavId);
        if (activeNavEl) { activeNavEl.classList.add('active'); }

        // Event Listeners Languages
        document.getElementById('lang-en')?.addEventListener('click', (e) => {
            e.preventDefault();
            changeLanguage('en');
        });

        document.getElementById('lang-it')?.addEventListener('click', (e) => {
            e.preventDefault();
            changeLanguage('it');
        });

        // Mobile menu toggle
        const toggle = document.getElementById('mobile-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('open');
            });
        }

        // Initial language loading after header is ready
        const savedLang = localStorage.getItem('preferredLang') || 'en';
        changeLanguage(savedLang);
    })
    .catch(error => console.error('ERROR loading header:', error));

// -- FOOTER -- //
fetch(`${repoName}/common/footer.html`)
    .then(response => response.text())
    .then(data => {
        document.getElementById('footer').innerHTML = data;
    })
    .catch(error => console.error("ERROR loading footer:", error));

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

        // 4a. Simple Texts Update (data-i18n)
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const val = getNestedTranslation(key);
            if (val) {
                // Se è un array (come nel tuo index.json), lo unisce con spazi
                element.innerText = Array.isArray(val) ? val.join(' ') : val;
            }
        });

        // 4b. HTML Update (data-i18n-html)
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const val = getNestedTranslation(key);
            if (val) {
                element.innerHTML = Array.isArray(val) ? val.join(' ') : val;
            }
        });

        // 4c. Placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const val = getNestedTranslation(key);
            if (val) element.placeholder = val;
        });

        // Save preference and update UI
        localStorage.setItem('preferredLang', lang);
        document.documentElement.lang = lang;

        document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`lang-${lang}`);
        if (activeBtn) activeBtn.classList.add('active');

    } catch (error) {
        console.error("Error loading language:", error);
    }
}

// -- SCROLL INDICATOR -- //
window.addEventListener('scroll', () => {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        const scrollValue = window.scrollY;
        const fadeRange = 300;
        let opacity = 1 - (scrollValue / fadeRange);
        if (opacity < 0) opacity = 0;
        scrollIndicator.style.opacity = opacity;
        scrollIndicator.style.pointerEvents = opacity <= 0 ? 'none' : 'auto';
    }
});