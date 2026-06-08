// PAGES
const pageName = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
const pageNavMap = {
    'index':    'nav-home',
    'contacts': 'nav-contacts',
    'projects': 'nav-projects',
    'about':    'nav-about',
    'support':  'nav-support'
};

// -- HEADER -- //
fetch('/common/header.html')
    .then(response => response.text())
    .then(data => {
        // Load header
        document.getElementById('header').innerHTML = data;

        // href link correction
        // Calculate the base path of the site (e.g. "/pittabio.github.io/" on localhost, "/" on GitHub Pages root)
        const isGitHubPages = window.location.hostname.includes('github.io');

        // Filter out file segments (e.g. "about.html") — keep only directory segments
        const pathSegments = window.location.pathname.split('/').filter(seg => seg && !seg.includes('.'));

        // If it is GitHub Pages, the base is the first segment (repo name)
        // Otherwise on domain the base is empty
        const repoName = isGitHubPages ? '/' + pathSegments[1] : '';

        // Replace "../" with the correct basePath in all nav-links
        document.querySelectorAll('.site-nav .nav-link').forEach(link => {
            let href = link.getAttribute('href');

            // If the link is an anchor # or an external link, do nothing
            if (!href || href.startsWith('#') || href.startsWith('http')) return;

            // Remove any leading "/" to avoid duplicates and add the correct base
            const cleanHref = href.startsWith('/') ? href.slice(1) : href;
            link.setAttribute('href', `${repoName}/${cleanHref}`);
        });

        // Active the specific links for the page
        const activeNavId = pageNavMap[pageName];
        const activeNavEl = document.getElementById(activeNavId);
        if (activeNavEl) { activeNavEl.classList.add('active'); }

        // When the user clicks on the language button EN
        document.getElementById('lang-en').addEventListener('click', (e) => {
            e.preventDefault();
            changeLanguage('en')
                .then(() => {});
        });

        // When the user clicks on the language button IT
        document.getElementById('lang-it') .addEventListener('click', (e) => {
            e.preventDefault();
            changeLanguage('it')
                .then(() => {})
        });

        // Reactive mobile menu script
        const toggle = document.getElementById('mobile-toggle');
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('open');
            // Other logic for the mobile drawer here
        });

        // Scroll management for the .scrolled class
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.site-header');
            if (window.scrollY > 20) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });

        const savedLang = localStorage.getItem('preferredLang') || 'en';
        changeLanguage(savedLang).then(() => {});

    })
    .catch(error => console.error('ERROR loading header:', error));

// -- FOOTER -- //
fetch('/common/footer.html')
    .then(response => response.text())
    .then(data => {
        // Inject the footer html code into the container
        document.getElementById('footer').innerHTML = data;
    })
    .catch(error => {
        console.error("ERROR loading footer:", error);
    });

// -- LANGUAGE -- //
async function changeLanguage(lang) {
    try {
        // 1. Automatically detect the current page name from the URL
        let pageName = window.location.pathname.split("/").pop().replace(".html", "");

        // Managing the site root or index
        if (pageName === "" || pageName === "index") {
            pageName = "index";
        }

        const repoName = window.location.hostname.includes('github.io')
            ? '/' + window.location.pathname.split('/')[1]
            : '';

        // 2. Download both the page file and the common file in parallel
        const [pageRes, commonRes] = await Promise.all([
            fetch(`${repoName}/locales/${lang}/${pageName}.json`).catch(() => null),
            fetch(`${repoName}/locales/${lang}/common.json`).catch(() => null)
        ]);

        // Extract JSON data (if files exist, otherwise use empty object)
        const pageTranslations = pageRes && pageRes.ok ? await pageRes.json() : {};
        const commonTranslations = commonRes && commonRes.ok ? await commonRes.json() : {};

        // Merge translations: Page-specific ones override common
        const translations = { ...commonTranslations, ...pageTranslations };

        // 3a. Find all elements with the data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = key.split('.').reduce((obj, i) => (obj ? obj[i] : null), translations);
            if (text) element.innerText = text;
        });

        // 3b. Find all elements with data-i18n-html attribute (supports HTML tags)
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const html = key.split('.').reduce((obj, i) => (obj ? obj[i] : null), translations);
            if (html) element.innerHTML = Array.isArray(html) ? html.join(' ') : html;
        });

        // 3c. Find all elements with the data-i18n-placeholder attribute
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const placeholderText = key.split('.').reduce((obj, i) => (obj ? obj[i] : null), translations);
            if (placeholderText) element.placeholder = placeholderText;
        });

        // 4. Save the preference in your browser
        localStorage.setItem('preferredLang', lang);
        document.documentElement.lang = lang; // Change the html document language

        // 5. Updates the visual state of the language buttons in the header
        document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`lang-${lang}`);
        if (activeBtn) activeBtn.classList.add('active');
    }
    catch (error) {
        console.error("Error loading language:", error);
    }

    // Fetch for contact feedback
    let fetchContactFeedbackStrings;
    if (typeof fetchContactFeedbackStrings === "function") {
        fetchContactFeedbackStrings();
    }
}

// -- INDICATOR -- //
const scrollIndicator = document.querySelector('.scroll-indicator');
window.addEventListener('scroll', () => {
    const scrollValue = window.scrollY;
    const fadeRange = 300; // The distance in pixels within which the element disappears completely

    if (scrollIndicator) {
        let opacity = 1 - (scrollValue / fadeRange); // Calculate the opacity: 1 at the beginning, 0 after 'fadeRange' pixels
        if (opacity < 0) opacity = 0; // Prevent negative values

        scrollIndicator.style.opacity = opacity;

        // Disable clicks when it is no longer visible
        if (opacity <= 0) {
            scrollIndicator.style.pointerEvents = 'none';
        } else {
            scrollIndicator.style.pointerEvents = 'auto';
        }
    }
});