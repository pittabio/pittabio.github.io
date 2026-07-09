// -- IMAGE OVERLAY SYSTEM -- //

(function() {
    // 1. DYNAMIC OVERLAY CREATION
    const overlayHtml = `
        <div class="overlay" id="overlay">
            <div class="popup-img-wrap" id="popupWrap"></div>
        </div>
    `;

    document.addEventListener('DOMContentLoaded', () => {
        document.body.insertAdjacentHTML('beforeend', overlayHtml);
        const overlay = document.getElementById('overlay');
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closePopup();
        });
    });

    // 2. TRANSLATION HELPER
    window.t = function(key) {
        if (!window.currentTranslations) return key;

        // Retrieve the value from JSON
        const val = key.split('.').reduce((obj, i) => (obj ? obj[i] : null), window.currentTranslations);

        if (!val) return key;

        // IF it's an array, join the elements with a space. ELSE, return the value as is.
        return Array.isArray(val) ? val.join(' ') : val;
    };

    // 3a. SINGLE IMAGE OPENING
    window.openOneImage = function(imgEl) {
        document.body.classList.add('no-scroll');
        const wrap = document.getElementById('popupWrap');
        const data = { img1: imgEl.getAttribute('data-img1'), desc1: imgEl.getAttribute('data-desc1') };

        wrap.innerHTML = `
            <button class="btn-close" onclick="closePopup()">✕</button>
            <div class="popup-grid grid-1"> <!-- Added grid-1 class -->
                <div class="popup-item">
                    <img src="${data.img1}" alt="">
                    <p>${t(data.desc1)}</p>
                </div>
            </div>
        `;
        document.getElementById('overlay').classList.add('active');
    };

    // 3b. DOUBLE OPENING
    window.openTwoImages = function(imgEl) {
        document.body.classList.add('no-scroll');
        const wrap = document.getElementById('popupWrap');
        const data = {
            img1: imgEl.getAttribute('data-img1'), desc1: imgEl.getAttribute('data-desc1'),
            img2: imgEl.getAttribute('data-img2'), desc2: imgEl.getAttribute('data-desc2')
        };

        wrap.innerHTML = `
            <button class="btn-close" onclick="closePopup()">✕</button>
            <div class="popup-grid grid-2"> <!-- Added grid-2 class -->
                <div class="popup-item">
                    <img src="${data.img1}" alt="">
                    <p>${t(data.desc1)}</p>
                </div>
                <div class="popup-item">
                    <img src="${data.img2}" alt="">
                    <p>${t(data.desc2)}</p>
                </div>
            </div>
        `;
        document.getElementById('overlay').classList.add('active');
    };

    // 3c. TRIPLE OPENING
    window.openThreeImages = function(imgEl) {
        document.body.classList.add('no-scroll');
        const wrap = document.getElementById('popupWrap');
        const data = {
            img1: imgEl.getAttribute('data-img1'), desc1: imgEl.getAttribute('data-desc1'),
            img2: imgEl.getAttribute('data-img2'), desc2: imgEl.getAttribute('data-desc2'),
            img3: imgEl.getAttribute('data-img3'), desc3: imgEl.getAttribute('data-desc3')
        };

        wrap.innerHTML = `
            <button class="btn-close" onclick="closePopup()">✕</button>
            <div class="popup-grid grid-3"> <!-- Added grid-3 class -->
                <div class="popup-item">
                    <img src="${data.img1}" alt="">
                    <p>${t(data.desc1)}</p>
                </div>
                <div class="popup-item">
                    <img src="${data.img2}" alt="">
                    <p>${t(data.desc2)}</p>
                </div>
                <div class="popup-item">
                    <img src="${data.img3}" alt="">
                    <p>${t(data.desc3)}</p>
                </div>
            </div>
        `;
        document.getElementById('overlay').classList.add('active');
    };

    // 4. CLOSING
    window.closePopup = function() {
        document.body.classList.remove('no-scroll');
        document.getElementById('overlay').classList.remove('active');
    };

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closePopup();
    });
})();