// Show the banner only if a choice has not yet been made
window.addEventListener('load', function() {
    if (localStorage.getItem('consentMode') === null) {
        document.getElementById('cookie-banner').style.display = 'block';
    }
});

/* global gtag */
function updateConsent(status) {
    const consentData = {
        'ad_storage': status,
        'analytics_storage': status,
        'ad_user_data': status,
        'ad_signals': status,
        'personalization_storage': status
    };

    // Update Google Analytics in real time
    gtag('consent', 'update', consentData);

    // Save choice in browser to never show it again
    localStorage.setItem('consentMode', JSON.stringify(consentData));

    // Hide the banner
    document.getElementById('cookie-banner').style.display = 'none';
}
