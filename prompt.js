document.addEventListener("DOMContentLoaded", function() {
    var consent = localStorage.getItem("cookieConsent");
    var cookieBanner = document.getElementById("cookieConsentBanner");

    if (consent === null) {
        cookieBanner.style.display = "block";
    } else {
        cookieBanner.style.display = "none";
        if (consent === "accepted") {
            gtag('config', 'G-0LX7SEF348', { 'anonymize_ip': false });
        }
    }

    // Käsittele hyväksymisnappi
    document.getElementById("acceptCookies").addEventListener("click", function() {
        localStorage.setItem("cookieConsent", "accepted");
        cookieBanner.style.display = "none";
        gtag('config', 'G-0LX7SEF348', { 'anonymize_ip': false });
    });

    // Käsittele kieltäytymisnappi
    document.getElementById("declineCookies").addEventListener("click", function() {
        localStorage.setItem("cookieConsent", "declined");
        cookieBanner.style.display = "none";
    });
});
