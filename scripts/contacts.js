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

    // Fallback strings (English) used if the JSON fetch fails
    const FALLBACK_STRINGS = {
        success_title:      "✅ Message sent successfully!",
        success_body:       "Thank you for reaching out. I'll get back to you as soon as possible.",
        error_title:        "❌ Error sending the message.",
        error_detail_prefix:"Detail: ",
        error_body:         "Please try again in a moment or contact me directly via email.",
        network_error:      "Network error. Please check your connection.",
        sending:            "Sending…"
    };

    // Will hold the loaded strings once fetchFeedbackStrings() resolves
    let t = { ...FALLBACK_STRINGS };

    /**
     * Loads `/locales/{lang}/contacts_feedback.json` and stores the
     * feedback strings in `t`. Falls back to FALLBACK_STRINGS on any error.
     */
    async function fetchFeedbackStrings() {
        const lang = localStorage.getItem('preferredLang') || 'en';
        try {
            const res = await fetch(`/locales/${lang}/contacts_feedback.json`);
            if (res.ok) {
                const json = await res.json();
                t = { ...FALLBACK_STRINGS, ...json.feedback };
            } else {
                console.warn(`[contacts.js] Could not load feedback strings (HTTP ${res.status}), using fallback.`);
                t = { ...FALLBACK_STRINGS };
            }
        } catch (e) {
            console.warn("[contacts.js] Could not load feedback strings, using fallback.", e);
            t = { ...FALLBACK_STRINGS };
        }
    }

    /* ── HELPERS ── */

    /**
     * Reset the hCaptcha widget (if present on the page).
     * Web3Forms uses the widget with the "h-captcha" class.
     */
    function resetCaptcha() {
        if (typeof hcaptcha !== "undefined" && hcaptcha !== null) {
            try { hcaptcha.reset(); } catch (_) {}
        }
    }

    /**
     * Shows a native alert with a success or error message.
     * @param {boolean} success
     * @param {string}  [detail]
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
        if (!form) {
            console.warn("[contacts.js] Form not found.");
            return;
        }

        // Load translated feedback strings before the user can submit
        await fetchFeedbackStrings();

        /* ── SUBMIT HANDLER ── */

        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            const submitBtn = form.querySelector(".contact-submit-btn");
            const originalBtnContent = submitBtn ? submitBtn.innerHTML : null;

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML =
                    `<span>${t.sending}</span>` +
                    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" opacity="0.25"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke-dasharray="31.4" stroke-dashoffset="0">
                            <animateTransform attributeName="transform" type="rotate"
                                from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
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
                    console.error("[contacts.js] Web3Forms error:", data);
                    resetCaptcha();
                    showFeedback(false, detail);
                }

            } catch (networkError) {
                console.error("[contacts.js] Network error:", networkError);
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
