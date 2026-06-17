// --- PATH CONFIGURATION ---
const isGitHubPages = window.location.hostname.includes('github.io');

/**
 * If the site were pittabio.github.io/my-repo/, repoName would be /my-repo.
 * But since this site is in the root (pittabio.github.io), repoName must be empty.
 * This logic now specifically checks if there is a known subfolder that is NOT a repo.
 */
let repoName = '';

// If I plan to move this site to a repo subdirectory in the future,
// manually set the name here, otherwise leave it blank for pittabio.github.io
if (isGitHubPages) {
    window.location.pathname.split('/').filter(s => s);
    // If the first segment is NOT one of the known folders or files, then it is the repo name.
    // For now, for this current site, let's keep repoName empty.
    repoName = '';
}

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
fetch(`${repoName}/common/header.html`.replace(/\/+/g, '/'))
    .then(response => response.text())
    .then(data => {
        document.getElementById('header').innerHTML = data;

        document.querySelectorAll('.site-nav .nav-link').forEach(link => {
            let href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('http')) return;

            const cleanHref = href.startsWith('/') ? href.slice(1) : href;
            link.setAttribute('href', `${repoName}/${cleanHref}`.replace(/\/+/g, '/'));
        });

        const activeNavId = pageNavMap[pageName];
        const activeNavEl = document.getElementById(activeNavId);
        if (activeNavEl) { activeNavEl.classList.add('active'); }

        // # Language buttons # //
        // English
        document.getElementById('lang-en')?.addEventListener('click', (e) => {
            e.preventDefault(); changeLanguage('en')
                .then(() => {});
            });
        // Italian
        document.getElementById('lang-it')?.addEventListener('click', (e) => {
            e.preventDefault(); changeLanguage('it')
                .then(() => {});
            });

        // # Mobile menu toggle # //
        const toggle = document.getElementById('mobile-toggle');
        if (toggle) { toggle.addEventListener('click', () => { toggle.classList.toggle('open'); }); }

        // Change language on page load
        const savedLang = localStorage.getItem('preferredLang') || 'en';
        changeLanguage(savedLang)
            .then(() => {});
    })
    .catch(error => console.error('ERROR loading header:', error));

// -- FOOTER -- //
fetch(`${repoName}/common/footer.html`.replace(/\/+/g, '/'))
    .then(response => response.text())
    .then(data => {
        document.getElementById('footer').innerHTML = data;

        // --- Back to top button  ---
        const backToTopBtn = document.querySelector('.back-to-top');
        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevents immediate jumping
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth' // Smooth sliding effect
                });
            });
        }
    })
    .catch(error => console.error("ERROR loading footer:", error));

// -- LANGUAGE ENGINE -- //
async function changeLanguage(lang) {
    try {
        let path = window.location.pathname;

        // Clean up the path to find the JSON file
        let cleanPath = path.replace('.html', '');

        // If we are in the root of the domain or a subfolder
        if (cleanPath === "" || cleanPath === "/" || cleanPath.endsWith('/')) {
            cleanPath += "index";
        }

        // Remove the leading slash if present to avoid double slashes after
        if (cleanPath.startsWith('/')) cleanPath = cleanPath.slice(1);

        // JSON File URL Construction
        const pageUrl = `${repoName}/locales/${lang}/${cleanPath}.json`.replace(/\/+/g, '/');
        const commonUrl = `${repoName}/locales/${lang}/common.json`.replace(/\/+/g, '/');

        console.log("Fetching translations from:", pageUrl); // Useful debugging in the console

        const [pageRes, commonRes] = await Promise.all([
            fetch(pageUrl).catch(() => null),
            fetch(commonUrl).catch(() => null)
        ]);

        const pageTranslations = pageRes && pageRes.ok ? await pageRes.json() : {};
        const commonTranslations = commonRes && commonRes.ok ? await commonRes.json() : {};

        const translations = { ...commonTranslations, ...pageTranslations };

        const getNestedTranslation = (key) => {
            return key.split('.').reduce((obj, i) => (obj ? obj[i] : null), translations);
        };

        // Updating DOM elements
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const val = getNestedTranslation(key);
            if (val) element.innerText = Array.isArray(val) ? val.join(' ') : val;
        });

        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const val = getNestedTranslation(key);
            if (val) element.innerHTML = Array.isArray(val) ? val.join(' ') : val;
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const val = getNestedTranslation(key);
            if (val) element.placeholder = val;
        });

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
        const opacity = Math.max(0, 1 - (window.scrollY / 300));
        scrollIndicator.style.opacity = opacity;
        scrollIndicator.style.pointerEvents = opacity <= 0 ? 'none' : 'auto';
    }
});