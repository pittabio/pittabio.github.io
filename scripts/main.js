// -- HEADER -- //
fetch('/common/header.html')
    .then(response => response.text())
    .then(data => {
        // Load header
        document.getElementById('header').innerHTML = data;

        // href link correction
        // Calculate the base path of the site (e.g. "/pittabio.github.io/" on localhost, "/" on GitHub Pages root)
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        const isGitHubPages = window.location.hostname.includes('github.io');

        // On GitHub Pages the root is "/", on localhost/WebStorm it is "/project-folder-name/"
        const basePath = isGitHubPages
            ? '/'
            : (pathSegments.length > 0 ? '/' + pathSegments[0] + '/' : '/');

        // Replace "../" with the correct basePath in all nav-links
        document.querySelectorAll('.site-nav .nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('../')) {
                link.setAttribute('href', href.replace('../', basePath));
            }
        });

        // Active the specific links for this page
        document.getElementById('nav-home').classList.add('active');

        // When the user click on the language button EN
        document.getElementById('lang-en').addEventListener('click', (e) => {
            e.preventDefault();
            changeLanguage('en').then(() => {});
        });

        // When the user click on the language button IT
        document.getElementById('lang-it') .addEventListener('click', (e) => {
            e.preventDefault();
            changeLanguage('it').then(() => {})
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
        // Inietta il codice html del footer nel contenitore
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

        // Gestione della root del sito o della index
        if (pageName === "" || pageName === "index") {
            pageName = "index";
        }

        // 2. Download both the page file and the common file in parallel
        const [pageRes, commonRes] = await Promise.all([
            fetch(`/locales/${lang}/${pageName}.json`).catch(() => null),
            fetch(`/locales/${lang}/common.json`).catch(() => null)
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

        // 5. Updates the visual state of the language buttons in the header
        document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`lang-${lang}`);
        if (activeBtn) activeBtn.classList.add('active');
    }
    catch (error) {
        console.error("Error loading language:", error);
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