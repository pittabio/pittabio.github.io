// --- PATH CONFIGURATION ---
const isGitHubPages = window.location.hostname.includes('github.io');
let repoName = '';

if (isGitHubPages) {
    repoName = ''; // Lascia vuoto se il sito è nel root (pittabio.github.io)
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

        // Gestione Link Attivi e Percorsi
        document.querySelectorAll('.site-nav .nav-link, .mobile-nav .nav-link').forEach(link => {
            let href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('http')) return;

            const cleanHref = href.startsWith('/') ? href.slice(1) : href;
            link.setAttribute('href', `${repoName}/${cleanHref}`.replace(/\/+/g, '/'));

            // Se il link corrisponde alla pagina corrente, aggiungi classe active
            const linkPage = cleanHref.replace('.html', '');
            if (linkPage === pageName || (linkPage === 'index' && pageName === 'index')) {
                link.classList.add('active');
            }
        });

        // # Gestione pulsanti lingua (Desktop + Mobile) # //
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                // Prende la lingua dall'attributo data-lang o dall'ID
                const selectedLang = btn.getAttribute('data-lang') || (btn.id.includes('en') ? 'en' : 'it');
                changeLanguage(selectedLang);
            });
        });

        // # Mobile menu toggle # //
        const toggle = document.getElementById('mobile-toggle');
        const mobileMenu = document.getElementById('mobile-menu');

        if (toggle && mobileMenu) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                toggle.classList.toggle('open');
                mobileMenu.classList.toggle('open');
            });

            // Chiudi il menu se si clicca fuori
            document.addEventListener('click', () => {
                toggle.classList.remove('open');
                mobileMenu.classList.remove('open');
            });

            // Chiudi il menu se si clicca su un link
            mobileMenu.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    toggle.classList.remove('open');
                    mobileMenu.classList.remove('open');
                });
            });
        }

        // Carica la lingua salvata o default 'en'
        const savedLang = localStorage.getItem('preferredLang') || 'en';
        changeLanguage(savedLang);
    })
    .catch(error => console.error('ERROR loading header:', error));

// -- FOOTER -- //
fetch(`${repoName}/common/footer.html`.replace(/\/+/g, '/'))
    .then(response => response.text())
    .then(data => {
        document.getElementById('footer').innerHTML = data;

        const backToTopBtn = document.querySelector('.back-to-top');
        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    })
    .catch(error => console.error("ERROR loading footer:", error));

// -- LANGUAGE ENGINE -- //
async function changeLanguage(lang) {
    try {
        let path = window.location.pathname;
        let cleanPath = path.replace('.html', '');
        if (cleanPath === "" || cleanPath === "/" || cleanPath.endsWith('/')) {
            cleanPath += "index";
        }
        if (cleanPath.startsWith('/')) cleanPath = cleanPath.slice(1);

        const pageUrl = `${repoName}/locales/${lang}/${cleanPath}.json`.replace(/\/+/g, '/');
        const commonUrl = `${repoName}/locales/${lang}/common.json`.replace(/\/+/g, '/');

        const [pageRes, commonRes] = await Promise.all([
            fetch(pageUrl).catch(() => null),
            fetch(commonUrl).catch(() => null)
        ]);

        const pageTranslations = pageRes && pageRes.ok ? await pageRes.json() : {};
        const commonTranslations = commonRes && commonRes.ok ? await commonRes.json() : {};
        const translations = { ...commonTranslations, ...pageTranslations };
        window.currentTranslations = translations;

        const getNestedTranslation = (key) => {
            return key.split('.').reduce((obj, i) => (obj ? obj[i] : null), translations);
        };

        // Aggiorna testi nel DOM
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const val = getNestedTranslation(el.getAttribute('data-i18n'));
            if (val) el.innerText = Array.isArray(val) ? val.join(' ') : val;
        });

        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const val = getNestedTranslation(el.getAttribute('data-i18n-html'));
            if (val) el.innerHTML = Array.isArray(val) ? val.join(' ') : val;
        });

        // Aggiorna lo stato dei pulsanti lingua (sincronizza Desktop e Mobile)
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            const btnLang = btn.getAttribute('data-lang') || (btn.id.includes('en') ? 'en' : 'it');
            if (btnLang === lang) {
                btn.classList.add('active');
            }
        });

        localStorage.setItem('preferredLang', lang);
        document.documentElement.lang = lang;

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