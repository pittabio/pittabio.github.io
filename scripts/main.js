// -- HEADER -- //
fetch('header.html')
    .then(response => response.text())
    .then(data => {
        // Load header
        document.getElementById('header').innerHTML = data;

        // Active the specific links for this page
        document.getElementById('nav-home').classList.add('active');

        // When the user click on the language button EN
        document.getElementById('lang-en').addEventListener('click', (e) => {
            e.preventDefault();
            changeLanguage('en').then(r => {});
        });

        // When the user click on the language button IT
        document.getElementById('lang-it') .addEventListener('click', (e) => {
            e.preventDefault();
            changeLanguage('it').then(r => {})
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
        changeLanguage(savedLang).then(r => {});

    })
    .catch(error => console.error('ERROR loading header:', error));

// -- LANGUAGE -- //
async function changeLanguage(lang) {
    try {
        // 1. Upload the language JSON file
        const response = await fetch(`../locales/${lang}.json`);
        const translations = await response.json();

        // 2a. Find all elements with the data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n'); // Get the attribute key
            const text = key.split('.').reduce((obj, i) => obj[i], translations); // Accesses nested keys (e.g. "head.projects")
            if (text) element.innerText = text; // Translate the text
        });

        // 2b. Find all elements with the data-i18n-html attribute (supports HTML tags)
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html'); // Get the attribute key
            const html = key.split('.').reduce((obj, i) => obj[i], translations);  // Accesses nested keys (e.g. "head.projects")
            if (html) element.innerHTML = Array.isArray(html) ? html.join(' ') : html;  // Translate the html text
        });

        // 3. Save preference in browser
        localStorage.setItem('preferredLang', lang);

        // 4. Update the active button
        document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`lang-${lang}`).classList.add('active');
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
