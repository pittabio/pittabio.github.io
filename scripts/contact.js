// -- CONTACT FORM SUBMIT -- //
const contactForm = document.querySelector('.contact-form-element');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const myEmail = "pittacciofabio@proton.me";
        const endpoint = `https://formsubmit.co/ajax/${myEmail}`;
        const formData = new FormData(contactForm);

        // Fields required by FormSubmit for AJAX
        formData.append('_captcha', 'false');
        formData.append('_subject', 'Nuovo messaggio dal sito');

        const submitBtn = contactForm.querySelector('.contact-submit-btn');
        if (submitBtn) submitBtn.disabled = true;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { 'Accept': 'application/json' }, // ← necessario per AJAX
                body: formData
            });

            const result = await response.json();

            if (response.ok && (result.success === "true" || result.success === true)) {
                contactForm.reset();
                // Wait until the modal is in the DOM before opening it
                waitForModal(openSuccessModal);
            } else {
                alert("Error sending message.");
            }
        } catch (error) {
            console.error("Form submit error:", error);
            alert("Network error.");
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
}

// Wait for Modal function
function waitForModal(callback, attempts = 0) {
    const modal = document.getElementById('contact-success-modal');
    if (modal) {
        callback();
    } else if (attempts < 20) {
        setTimeout(() => waitForModal(callback, attempts + 1), 100);
    }
}