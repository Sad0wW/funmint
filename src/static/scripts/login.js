let isRegistering = false;

function toggleForm() {
    isRegistering = !isRegistering;

    document.getElementById("formTitle").textContent = isRegistering ? "Регистрация" : "Авторизация";
    document.getElementById("submitBtn").textContent = isRegistering ? "Зарегистрироваться" : "Войти";
    document.getElementById("toggleBtn").textContent = isRegistering ? "Авторизация" : "Регистрация";
    document.getElementById("policyContainer").style.display = isRegistering ? "block" : "none";

    const inputs = document.querySelectorAll("input");
    for (const input of inputs)
        if (input.name != "csrf_token")
            input.value = "";

    document.getElementById("policy").checked = false;
    document.querySelector("input[name=\"code\"]").disabled = true;
}

function validateForm() {
    const email = document.querySelector("input[name=\"email\"]").value.trim();
    const password = document.querySelector("input[name=\"password\"]").value;
    const code = document.querySelector("input[name=\"code\"]").value.trim();
    const policyChecked = document.getElementById("policy").checked;

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !email.includes(" ");
    const passwordValid = password.length >= 8 && password.length <= 32 && !password.includes(" ");
    const codeRequired = !document.querySelector("input[name=\"code\"]").disabled;

    const allValid = emailValid && passwordValid && (!codeRequired || code.length > 0) && (!isRegistering || policyChecked);

    document.getElementById("submitBtn").disabled = !allValid;
}

document.querySelectorAll("#authForm input").forEach(input => input.addEventListener("input", validateForm)); 
document.getElementById("policy").addEventListener("change", validateForm);

document.getElementById("toggleBtn").addEventListener("click", toggleForm);

document.getElementById("submitBtn").addEventListener("click", async (e) => {
    e.preventDefault();
    
    if (document.getElementById("toggleBtn"))
        document.getElementById("toggleBtn").disabled = true;

    const form = document.getElementById("authForm");
    const data = new FormData(form);

    data.append("terms", document.getElementById("policy").checked);

    try {
        const response = await fetch(isRegistering ? "/register" : "/login", {
            method: "POST",
            body: data
        });

        showNotification(await response.text(), response.ok ? "success" : "danger");

        if (response.ok) {
            if (document.getElementById("toggleBtn"))
                document.getElementById("toggleBtn").remove();

            document.querySelector("input[name=\"email\"]").disabled = true;
            document.querySelector("input[name=\"password\"]").disabled = true;

            document.querySelector("input[name=\"email\"]").style = "display:none";
            document.querySelector("input[name=\"password\"]").style = "display:none";
            document.getElementById("policyContainer").style = "display:none";

            if (response.status == 201) {
                location.reload();
            } else {
                document.querySelector("input[name=\"code\"]").disabled = false;
                document.querySelector("input[name=\"code\"]").style = "";
            }
        }
        else {
            document.getElementById("toggleBtn").disabled = false;
        }
    } catch (ex) {
        if (document.getElementById("toggleBtn"))
            document.getElementById("toggleBtn").disabled = false;

        showNotification("Ошибка запроса", "danger");

        console.error(ex);
    }
});
