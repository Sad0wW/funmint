function toggleMenu() {
    document.getElementById("navLinks").classList.toggle("open");
}

function showNotification(message, type = "success", duration = 4000) {
    const container = document.getElementById("notifications");

    const el = document.createElement("div");
    el.className = `notification ${type}`;
    el.textContent = message;

    container.appendChild(el);

    requestAnimationFrame(() => el.classList.add("show"));

    setTimeout(() => {
        el.classList.remove("show");
        setTimeout(() => el.remove(), 400);
    }, duration);
}

(() => {
    var banner = document.getElementById("cookie-banner");

    function getCookie(name) {
        return document.cookie.split('; ').find(row => row.startsWith(name + '='))?.split('=')[1];
    }

    function setCookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + days*24*60*60*1000);
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + value + "; path=/; domain=.funmint.ru" + expires;
    }

    if (!getCookie("cookieAccepted")) {
        banner.style.display = "block";

        requestAnimationFrame(() => {
            banner.style.transform = "translateY(0)";
        });
    }

    document.getElementById("cookie-accept").addEventListener("click", () => {
        setCookie("cookieAccepted", "true", 365);

        banner.style.transform = "translateY(100%)";

        setTimeout(() => {
            banner.style.display = "none";
        }, 400);
    });

    const btn = document.querySelector(".menu-toggle");
    btn.addEventListener("click", toggleMenu);
})();

document.getElementById("year").textContent = new Date().getFullYear();