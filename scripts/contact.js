// -- CONTACT FORM SUBMIT -- //

const contactForm = document.querySelector('.contact-form-element');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impedisce il ricaricamento della pagina

        // FormSubmit API
        const myEmail = "pittacciofabio@proton.me";
        const endpoint = `https://formsubmit.co/ajax/${myEmail}`;
        const formData = new FormData(contactForm);

        // Disable the button to avoid multiple clicks
        const submitBtn = contactForm.querySelector('.contact-submit-btn');
        if (submitBtn) submitBtn.disabled = true;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                body: formData // Submit the form data
            });

            if (response.ok) {
                contactForm.reset();
                openSuccessModal();
            } else {
                alert("Error sending message.");
            }
        } catch (error) {
            console.error("Form submit error:", error);
            alert("Network error occurred.");
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
}