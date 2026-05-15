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
