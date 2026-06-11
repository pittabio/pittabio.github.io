/**
 * contacts.js
 * Contact form management via Web3Forms + hCaptcha
 */

(function () {
    "use strict";

    /* ── CONFIGURATION ── */
    const WEB3FORMS_ACCESS_KEY = "a307525d-a65d-45ee-9b44-ce6fa6279698";
    const WEB3FORMS_ENDPOINT   = "https://api.web3forms.com/submit";

    /* ── I18N ── */
    // Will hold the loaded strings from contacts.json
    let t = {};

    /**
     * Loads `/locales/{lang}/contacts.json` and extracts the 'feedback' object.
     */
    async function fetchFeedbackStrings() {
        const lang = localStorage.getItem('preferredLang') || 'en';

        // Costruzione del path corretta per GitHub Pages (come in main.js)
        const isGitHubPages = window.location.hostname.includes('github.io');
        const repoName = isGitHubPages ? '/' + window.location.pathname.split('/')[1] : '';

        try {
            const res = await fetch(`${repoName}/locales/${lang}/contacts.json`);
            if (res.ok) {
                const json = await res.json();
                t = json.feedback || {};
            } else {
                console.error(`[contacts.js] Could not load translations (HTTP ${res.status})`);
            }
        } catch (e) {
            console.error("[contacts.js] Error fetching contacts.json", e);
        }
    }

    /* ── HELPERS ── */

    function resetCaptcha() {
        if (typeof hcaptcha !== "undefined" && hcaptcha !== null) {
            try { hcaptcha.reset(); } catch (_) {}
        }
    }

    /**
     * Shows a native alert with a success or error message.
     */
    function showFeedback(success, detail) {
        if (success) {
            window.alert(`${t.success_title}\n\n${t.success_body}`);
        } else {
            const detailLine = detail ? `${t.error_detail_prefix}${detail}\n\n` : "";
            window.alert(`${t.error_title}\n\n${detailLine}${t.error_body}`);
        }
    }

    /* ── INITIALIZATION ── */

    document.addEventListener("DOMContentLoaded", async function () {
        const form = document.querySelector(".contact-form-element");
        if (!form) return;

        // Load translations from contacts.json before interaction
        await fetchFeedbackStrings();

        /* ── SUBMIT HANDLER ── */
        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            const submitBtn = form.querySelector(".contact-submit-btn");
            const originalBtnContent = submitBtn ? submitBtn.innerHTML : null;

            if (submitBtn) {
                submitBtn.disabled = true;
                // 't.sending' comes from contacts.json
                submitBtn.innerHTML =
                    `<span>${t.sending || 'Sending...'}</span>` +
                    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" opacity="0.25"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke-dasharray="31.4" stroke-dashoffset="0">
                            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
                        </path>
                    </svg>`;
            }

            try {
                const formData = new FormData(form);
                formData.set("access_key", WEB3FORMS_ACCESS_KEY);

                const response = await fetch(WEB3FORMS_ENDPOINT, {
                    method:  "POST",
                    headers: { "Accept": "application/json" },
                    body:    formData
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    form.reset();
                    resetCaptcha();
                    showFeedback(true);
                } else {
                    const detail = data.message || ("HTTP " + response.status);
                    resetCaptcha();
                    showFeedback(false, detail);
                }

            } catch (networkError) {
                resetCaptcha();
                showFeedback(false, t.network_error);
            } finally {
                if (submitBtn && originalBtnContent) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnContent;
                }
            }
        });
    });
})();