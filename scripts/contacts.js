// Web3Forms Key
const WEB3FORMS_ACCESS_KEY = "a307525d-a65d-45ee-9b44-ce6fa6279698";

// Dev/local detection — hCaptcha is skipped on these environments.
// Add any test domain you use to this list.
const LOCAL_HOSTS = ['localhost', '127.0.0.1', 'ngrok-free.dev', 'ngrok.io'];
const IS_LOCAL = LOCAL_HOSTS.some(h =>
    location.hostname === h || location.hostname.endsWith('.' + h)
);

// -- INIT -- //

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('.contact-form-element');
    if (!contactForm) return;

    // Hide hCaptcha widget in local/dev environments
    if (IS_LOCAL) {
        const captchaWidget = contactForm.querySelector('.h-captcha');
        if (captchaWidget) captchaWidget.style.display = 'none';
    }

    contactForm.addEventListener('submit', handleFormSubmit);
});

// -- SUBMIT HANDLER -- //

async function handleFormSubmit(e) {
    e.preventDefault();

    const form       = e.currentTarget;
    const submitBtn  = form.querySelector('.contact-submit-btn');
    const submitSpan = submitBtn?.querySelector('span');

    // Manual validation of required fields
    const requiredFields = form.querySelectorAll('[required]');
    for (const field of requiredFields) {
        if (!field.value.trim()) {
            field.focus();
            return; // esce senza bloccare nulla
        }
    }

    // Check hCaptcha securely
    let hcaptchaResponse = 'local-bypass';
    if (!IS_LOCAL) {
        if (typeof hcaptcha === 'undefined') {
            showModal('error'); // hCaptcha non ancora caricato
            return;
        }
        hcaptchaResponse = hcaptcha.getResponse();
        if (!hcaptchaResponse) {
            showModal('captcha');
            return;
        }
    }

    // Lock button
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
        if (submitSpan) submitSpan.textContent = 'Sending…';
    }

    // ... resto invariato

    // Collect form data
    const name    = form.querySelector('#form-name')?.value.trim()    ?? '';
    const email   = form.querySelector('#form-email')?.value.trim()   ?? '';
    const subject = form.querySelector('#form-subject')?.value.trim() ?? '';
    const message = form.querySelector('#form-message')?.value.trim() ?? '';

    const payload = {
        access_key:       WEB3FORMS_ACCESS_KEY,
        name,
        email,
        subject:          subject ? `[Site] ${subject}` : 'New message from portfolio',
        message,
        replyto:          email,   // Web3Forms reply-to: direct reply to the sender
        "h-captcha-response": hcaptchaResponse,
        botcheck:         '',      // honeypot Web3Forms standard
    };

    try {
        const res  = await fetch('https://api.web3forms.com/submit', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body:    JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok && data.success) {
            form.reset();
            hcaptcha.reset();
            showModal('success');
        } else {
            // Re-enable button only on failure so the user can retry
            enableButton(submitBtn, submitSpan);
            hcaptcha.reset();
            showModal('error');
        }

    } catch (err) {
        console.error('[contacts.js] Fetch error:', err);
        enableButton(submitBtn, submitSpan);
        hcaptcha.reset();
        showModal('error');
    }
}

function enableButton(btn, span) {
    if (!btn) return;
    btn.disabled = false;
    btn.removeAttribute('aria-busy');
    if (span) span.textContent = 'Send Message';
}

// -- MODAL -- //

// Config variables
const MODAL_CONFIG = {
    success: {
        icon:     '<polyline points="20 6 9 17 4 12"/>',
        title:    'Message sent!',
        subtitle: "Thank you for reaching out. I'll get back to you as soon as possible.",
        accent:   true,
    },
    error: {
        icon:     '<line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
        title:    'Something went wrong',
        subtitle: 'There was an error sending your message. Please try again.',
        accent:   false,
    },
    captcha: {
        icon:     '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
        title:    'Verify you\'re human',
        subtitle: 'Please complete the CAPTCHA check before sending your message.',
        accent:   false,
    },
};

// Function to show modal
function showModal(type) {
    // Remove any existing modal
    document.getElementById('contact-success-modal')?.remove();

    const cfg   = MODAL_CONFIG[type] ?? MODAL_CONFIG.error;
    const modal = document.createElement('div');

    modal.id        = 'contact-success-modal';
    modal.className = 'overlay';
    modal.setAttribute('role',           'dialog');
    modal.setAttribute('aria-modal',     'true');
    modal.setAttribute('aria-labelledby','modal-title');

    // Modal HTML script
    modal.innerHTML = `
        <div class="project-card" style="max-width:460px;width:100%;margin:1.5rem;text-align:center;padding:3rem 2.5rem;">
            <div class="contact-icon" style="${cfg.accent ? '' : 'background:var(--border);'}">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2.5"
                    stroke-linecap="round" stroke-linejoin="round">
                    ${cfg.icon}
                </svg>
            </div>
            <h2 id="modal-title" class="project-name">${cfg.title}</h2>
            <p class="contact-text">${cfg.subtitle}</p>
            <button class="contact-submit-btn" id="modal-close-btn" type="button">
                <span>Close</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h13M12 5l7 7-7 7"/>
                </svg>
            </button>
        </div>
    `;

    document.body.appendChild(modal);
    window.addEventListener('pagehide', () => {
        document.body.style.overflow = '';
    });
    document.body.style.overflow = 'hidden';

    // Entrance animation
    requestAnimationFrame(() => modal.classList.add('active'));

    const close = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => modal.remove(), 350);
    };

    document.getElementById('modal-close-btn')
        .addEventListener('click', close, { once: true });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) close();
    }, { once: true });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
    }, { once: true });
}