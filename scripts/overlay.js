// -- IMAGE OVERLAY -- //

// Open an image as a pop-up
function openPopup(imgEl) {
    document.getElementById('popupImg').src = imgEl.src;
    document.getElementById('overlay').classList.add('active');
}

// Close the pop-up
function closePopup(e) {
    // If an event is passed, it only closes if the overlay (outside the image) is clicked.
    if (e && e.target !== document.getElementById('overlay')) return;
    document.getElementById('overlay').classList.remove('active');
}

// Close with Escape too
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.getElementById('overlay').classList.remove('active');
});

// -- CONTACT SUCCESS MODAL -- //

// Load the modal HTML snippet into its container
fetch('/contacts_success.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('contact-success-modal-container').innerHTML = data;
    })
    .catch(error => console.error('ERROR loading contact success modal:', error));

// Open the success modal
function openSuccessModal() {
    const modal = document.getElementById('contact-success-modal');
    if (!modal) return;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    document.getElementById('modal-close-btn')
        .addEventListener('click', closeSuccessModal, { once: true });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeSuccessModal();
    }, { once: true });
}

// Close the success modal
function closeSuccessModal() {
    const modal = document.getElementById('contact-success-modal');
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}
