document.addEventListener("DOMContentLoaded", function() {
    var consent = localStorage.getItem("cookieConsent");
    var cookieBanner = document.getElementById("cookieConsentBanner");

    // Tarkista ja käsittele aiempi suostumus
    if (consent === null) {
        cookieBanner.style.display = "block";
    } else {
        cookieBanner.style.display = "none";
        if (consent === "accepted") {
            // Poista IP-anonymisointi ja käynnistä normaali GA-seuranta
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
        // IP-anonymisointi pysyy aktiivisena
    });

    // Käsittele asetusten muuttamisnappi
    document.getElementById("changeCookieSettings").addEventListener("click", function() {
        // Poista aiempi suostumus localStoragesta
        localStorage.removeItem("cookieConsent");

        // Näytä evästebanneri uudelleen
        cookieBanner.style.display = "block";
        // Vaihda GA-seuranta takaisin anonyymimuotoon
        gtag('config', 'G-0LX7SEF348', { 'anonymize_ip': true });
    });
});
