document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll("[data-tab]");
    const sections = document.querySelectorAll("[data-section]");
    const state = { active: "main" };
    const setActive = (id) => {
        state.active = id;
        tabButtons.forEach(b => b.classList.toggle("active", b.dataset.tab === id));
        sections.forEach(s => s.style.display = (s.dataset.section === id ? "block" : "none"));
    };
    tabButtons.forEach(b => b.addEventListener("click", () => setActive(b.dataset.tab)));

    setActive("main");

    const openModal = (id) => document.getElementById(id).style.display = "flex";
    const closeModals = () => document.querySelectorAll(".modal-backdrop").forEach(x => x.style.display = "none");

    document.querySelectorAll("[data-open]")?.forEach(btn => {
        btn.addEventListener("click", () => {
            document.getElementById("period").value = btn.dataset.period;
            openModal(btn.dataset.open);
        });
    });

    document.querySelectorAll("#submitBtn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            e.preventDefault();

            const form = btn.parentElement.parentElement;
            const data = new FormData(form);

            const res = await fetch(form.action, {
                method: "POST",
                body: data
            });

            const text = await res.text();

            if (!res.ok)
                showNotification(text, "danger");
            else
                location.href = text;

            closeModals();
        });
    });

    document.querySelectorAll("[data-close]")?.forEach(btn => btn.addEventListener("click", closeModals));
    window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModals(); });
});