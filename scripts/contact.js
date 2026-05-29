// -- CONTACT FORM SUBMIT -- //

const contactForm = document.querySelector('.contact-form-element');
const COOLDOWN_MS = 60_000; // 1 minuto anti-spam

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impedisce il ricaricamento della pagina

        const submitBtn = contactForm.querySelector('.contact-submit-btn');

        // Anti-spam: blocca se ha già inviato di recente
        const lastSent = localStorage.getItem('contact_last_sent');
        if (lastSent && Date.now() - parseInt(lastSent) < COOLDOWN_MS) {
            showModal(false, true); // mostra messaggio "attendi"
            return;
        }

        if (submitBtn) submitBtn.disabled = true;

        const myEmail = "pittacciofabio@proton.me";
        const endpoint = `https://formsubmit.co/ajax/${myEmail}`;
        const formData = new FormData(contactForm);
        formData.append('_captcha', 'false');
        formData.append('_subject', 'Nuovo messaggio dal sito');

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { 'Accept': 'application/json' },
                body: formData
            });

            let success = false;
            try {
                const result = await response.json();
                success = response.ok && (result.success === "true" || result.success === true);
            } catch {
                // FormSubmit a volte non risponde con JSON valido ma l'invio è ok
                success = response.ok;
            }

            if (success) {
                contactForm.reset();
                localStorage.setItem('contact_last_sent', Date.now().toString());
                showModal(true, false);
                // Blocca il bottone per il cooldown
                setTimeout(() => {
                    if (submitBtn) submitBtn.disabled = false;
                }, COOLDOWN_MS);
            } else {
                if (submitBtn) submitBtn.disabled = false;
                showModal(false, false);
            }

        } catch (error) {
            console.error("Form submit error:", error);
            if (submitBtn) submitBtn.disabled = false;
            showModal(false, false);
        }
    });
}

// -- MODAL -- //
function showModal(success, cooldown) {
    // Rimuovi modal precedente se esiste
    document.getElementById('contact-success-modal')?.remove();

    const title = success
        ? 'Message sent!'
        : cooldown
            ? 'Please wait'
            : 'Something went wrong';

    const subtitle = success
        ? "Thank you for reaching out. I'll get back to you as soon as possible."
        : cooldown
            ? 'You already sent a message recently. Please wait a minute before trying again.'
            : 'There was an error sending your message. Please try again later.';

    const iconPath = success
        ? '<polyline points="20 6 9 17 4 12"/>'
        : '<line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>';

    const modal = document.createElement('div');
    modal.id = 'contact-success-modal';
    modal.className = 'overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');
    modal.innerHTML = `
        <div class="project-card" style="max-width:460px;width:100%;margin:1.5rem;text-align:center;padding:3rem 2.5rem;">
            <div class="contact-icon" style="${success ? '' : 'background: var(--border);'}">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2.5"
                    stroke-linecap="round" stroke-linejoin="round">
                    ${iconPath}
                </svg>
            </div>
            <h2 id="modal-title" class="project-name">${title}</h2>
            <p class="contact-text">${subtitle}</p>
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
    document.body.style.overflow = 'hidden';

    // Animazione entrata
    requestAnimationFrame(() => modal.classList.add('active'));

    const close = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => modal.remove(), 350);
    };

    document.getElementById('modal-close-btn').addEventListener('click', close, { once: true });
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); }, { once: true });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); }, { once: true });
}