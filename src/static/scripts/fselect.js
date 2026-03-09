(() => {
    const SELECT_ATTR = "[data-type-select]";

    function svgChevron() {
        return `
            <svg class="fselect__chevron" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M7 10l5 5 5-5z"></path>
            </svg>
        `;
    }

    function enhanceSelect(native) {
        const wrap = document.createElement("div");
        wrap.className = "fselect";
        native.parentNode.insertBefore(wrap, native);
        wrap.appendChild(native);

        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "fselect__trigger";
        trigger.setAttribute("aria-haspopup", "listbox");
        trigger.setAttribute("aria-expanded", "false");

        const labelSpan = document.createElement("span");
        labelSpan.className = "fselect__label";
        trigger.appendChild(labelSpan);

        trigger.insertAdjacentHTML("beforeend", svgChevron());

        const list = document.createElement("div");
        list.className = "fselect__list";
        list.setAttribute("role", "listbox");

        wrap.appendChild(trigger);
        wrap.appendChild(list);

        const typeSelects = document.querySelectorAll("[data-type-select]");
        typeSelects.forEach(sel => sel.addEventListener("change", (e) => {
            const wrap = e.target.closest(".modal");
            const nameField = wrap?.querySelector("[data-name-field]");
            if (!nameField) return;
            const v = e.target.value;
            nameField.style.display = (v === "command") ? "block" : "none";
        }));

        const buildOptions = () => {
            list.innerHTML = "";
            Array.from(native.options).forEach((opt, idx) => {
                const item = document.createElement("div");
                item.className = "fselect__option";
                item.setAttribute("role", "option");
                item.dataset.index = String(idx);
                item.textContent = opt.textContent;

                if (opt.disabled) {
                    item.classList.add("is-disabled");
                    item.setAttribute("aria-disabled", "true");
                }
                if (opt.selected) {
                    item.setAttribute("aria-selected", "true");
                }

                const check = document.createElement("span");
                check.className = "fselect__check";
                check.textContent = "✓";
                item.appendChild(check);

                item.addEventListener("click", () => {
                    if (opt.disabled) return;
                    selectIndex(idx, true);
                    close();
                    trigger.focus();
                });

                item.addEventListener("mousemove", () => {
                    list.querySelectorAll(".fselect__option[aria-current=\"true\"]").forEach(el => el.removeAttribute("aria-current"));
                    item.setAttribute("aria-current", "true");
                });

                list.appendChild(item);
            });
        };

        function updateLabel() {
            const sel = native.options[native.selectedIndex];
            labelSpan.textContent = sel ? sel.textContent : "—";

            list.querySelectorAll(".fselect__option").forEach((el, i) => {
                if (i === native.selectedIndex) {
                    el.setAttribute("aria-selected", "true");
                } else {
                    el.removeAttribute("aria-selected");
                }
            });
        }

        function selectIndex(idx, dispatch = false) {
            if (idx < 0 || idx >= native.options.length) return;

            Array.from(native.options).forEach(opt => opt.selected = false);

            native.selectedIndex = idx;
            native.options[idx].selected = true;

            updateLabel();

            if (dispatch) {
                native.dispatchEvent(new Event("change", { bubbles: true }));
            }
        }


        function open() {
            wrap.classList.add("is-open");
            trigger.setAttribute("aria-expanded", "true");

            const cur = list.querySelector(`.fselect__option[data-index="${native.selectedIndex}"]`);
            list.querySelectorAll(".fselect__option[aria-current=\"true\"]").forEach(el => el.removeAttribute("aria-current"));
            if (cur) {
                cur.setAttribute("aria-current", "true");

                const rect = cur.getBoundingClientRect();
                const lrect = list.getBoundingClientRect();
                if (rect.top < lrect.top || rect.bottom > lrect.bottom) {
                    list.scrollTop = cur.offsetTop - list.clientHeight / 2 + cur.clientHeight / 2;
                }
            }

            document.addEventListener("click", outsideClick);
            document.addEventListener("keydown", onKey);
        }

        function close() {
            wrap.classList.remove("is-open");
            trigger.setAttribute("aria-expanded", "false");
            document.removeEventListener("click", outsideClick);
            document.removeEventListener("keydown", onKey);
        }

        function toggle() {
            wrap.classList.contains("is-open") ? close() : open();
        }

        function outsideClick(e) {
            if (!wrap.contains(e.target)) close();
        }

        function moveFocus(delta) {
            const items = Array.from(list.querySelectorAll(".fselect__option:not(.is-disabled)"));
            if (!items.length) return;
            let idx = items.findIndex(el => el.getAttribute("aria-current") === "true");
            if (idx === -1) idx = items.findIndex(el => el.getAttribute("aria-selected") === "true");
            idx = Math.max(0, Math.min(items.length - 1, idx + delta));
            items.forEach(el => el.removeAttribute("aria-current"));
            items[idx].setAttribute("aria-current", "true");
            items[idx].scrollIntoView({ block: "nearest" });
        }

        function onKey(e) {
            if (!wrap.classList.contains("is-open")) return;
            switch (e.key) {
                case "ArrowDown": e.preventDefault(); moveFocus(+1); break;
                case "ArrowUp": e.preventDefault(); moveFocus(-1); break;
                case "Home": e.preventDefault(); moveFocus(-9999); break;
                case "End": e.preventDefault(); moveFocus(+9999); break;
                case "Enter": {
                    e.preventDefault();
                    const cur = list.querySelector(".fselect__option[aria-current=\"true\"]");
                    if (cur) {
                        const i = Number(cur.dataset.index);
                        selectIndex(i, true);
                    }
                    close();
                    trigger.focus();
                    break;
                }
                case "Escape": e.preventDefault(); close(); trigger.focus(); break;
            }
        }

        trigger.addEventListener("click", toggle);
        native.addEventListener("change", updateLabel);

        buildOptions();
        updateLabel();

        native._rebuildFancy = () => { buildOptions(); updateLabel(); };

        const observer = new MutationObserver(() => {
            updateLabel();
        });
        observer.observe(native, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["selected"]
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(SELECT_ATTR).forEach(enhanceSelect);
    });

})();