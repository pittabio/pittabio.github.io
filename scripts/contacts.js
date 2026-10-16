/**
 * contacts.js
 * Contact form management via Web3Forms + hCaptcha
 */

(function () {
    "use strict";

    /* CONFIGURATION */
    const WEB3FORMS_ACCESS_KEY = "a307525d-a65d-45ee-9b44-ce6fa6279698";
    const WEB3FORMS_ENDPOINT   = "https://api.web3forms.com/submit";

    /* I18N */
    // Fallback used only if contacts.json is missing or incomplete
    const DEFAULT_STRINGS = {
        sending:             "Sending...",
        success_title:       "Message sent successfully!",
        success_body:        "Thank you for reaching out. I'll get back to you as soon as possible.",

        error_title:         "Error sending the message.",
        error_detail_prefix: "Detail: ",
        error_body:          "Please try again in a moment or contact me directly via email.",
        error_network:       "Network error. Please check your connection."
    };

    // Feedback strings are the ones currently loaded by main.js (always in the active language)
    const getT = () => {
        const loaded = (typeof currentTranslations !== "undefined" && currentTranslations.feedback) || {};
        return { ...DEFAULT_STRINGS, ...loaded };
    };

    /* HELPERS */

    /** Reset the captcha **/
    function resetCaptcha() {
        if (typeof hcaptcha !== "undefined" && hcaptcha !== null) {
            try { hcaptcha.reset(); } catch (_) {}
        }
    }

    /** Shows a native alert with a success or error message. **/
    function showFeedback(success, detail) {
        const t = getT();
        if (success) {
            window.alert(`${t.success_title}\n\n${t.success_body}`);
        } else {
            const detailLine = detail ? `${t.error_detail_prefix}${detail}\n\n` : "";
            window.alert(`${t.error_title}\n\n${detailLine}${t.error_body}`);
        }
    }

    /* INITIALIZATION */

    document.addEventListener("DOMContentLoaded", function () {
        const form = document.querySelector("#contact-form form");
        if (!form) return;

        /** SUBMIT HANDLER **/
        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            const t = getT();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnContent = submitBtn ? submitBtn.innerHTML : null;

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML =
                    `<span>${t.sending}</span>` +
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
                showFeedback(false, t.error_network);
            } finally {
                if (submitBtn && originalBtnContent) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnContent;
                }
            }
        });
    });
})();
