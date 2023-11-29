document.addEventListener("DOMContentLoaded", function() {
    var consent = localStorage.getItem("cookieConsent");
    var cookieBanner = document.getElementById("cookieConsentBanner");

    // Jos käyttäjä ei ole vielä tehnyt valintaa, näytä evästebanneri
    if (consent === null) {
        cookieBanner.style.display = "block";
    } else {
        cookieBanner.style.display = "none";
        // Asetetaan GA4:n tila käyttäjän valinnan mukaan
        window['ga-disable-G-0LX7SEF348'] = consent !== "accepted";
    }

    // Käsittele hyväksymisnappi
    document.getElementById("acceptCookies").addEventListener("click", function() {
        localStorage.setItem("cookieConsent", "accepted");
        cookieBanner.style.display = "none";
        window['ga-disable-G-0LX7SEF348'] = false;
    });

    // Käsittele kieltäytymisnappi
    document.getElementById("declineCookies").addEventListener("click", function() {
        localStorage.setItem("cookieConsent", "declined");
        cookieBanner.style.display = "none";
        window['ga-disable-G-0LX7SEF348'] = true;
    });
	
	document.getElementById("changeCookieSettings").addEventListener("click", function() {
		// Poista aiempi suostumus localStoragesta
		localStorage.removeItem("cookieConsent");

		// Näytä evästebanneri uudelleen
		document.getElementById("cookieConsentBanner").style.display = "block";
	});
});
