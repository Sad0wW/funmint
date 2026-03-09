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
            if (btn.hasAttribute("edit")) {
                const parent = btn.parentElement.parentElement;
                const modal = document.getElementById(btn.dataset.open);
                
                for (const id of parent.querySelectorAll("[id]")) {
                    if (id.getAttribute("id") == "submitBtn") continue;

                    const name = modal.querySelector(`[name=\"${id.getAttribute("id")}\"]`);

                    if (name.name != "type") {
                        name.value = id.textContent;
                        continue;
                    }

                    const select = modal.querySelector("select");

                    select.value = id.textContent;
                    select.dispatchEvent(new Event("change", { bubbles: true }));
                }
            }

            openModal(btn.dataset.open);
        });
    });

    document.querySelectorAll("#submitBtn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            e.preventDefault();

            let form = btn.parentElement;
            if (form.tagName != "FORM")
                form = form.parentElement;

            const data = new FormData(form);

            if (form.action.includes("toggle"))
                ["answer", "review", "raise", "reduction"].forEach(name => {
                    if (!data.has(name)) {
                        data.append(name, "off");
                    }
                });

            const res = await fetch(form.action, {
                method: "POST",
                body: data
            });

            showNotification(await res.text(), res.ok ? "success" : "danger");

            closeModals();

            if (res.ok) setTimeout(() => location.reload(), 1000);
        });
    });

    document.querySelectorAll("[data-close]")?.forEach(btn => btn.addEventListener("click", closeModals));
    window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModals(); });
});