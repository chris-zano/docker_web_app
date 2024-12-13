const EMAIL_REGEXP = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const validCodeRegexp = /^[A-Za-z0-9]{6}$/;
const recovery_mode = JSON.parse(window.sessionStorage.getItem("recovery-mode")) || undefined;
const container_main = getId("form-container");
const email_form = getId("email-form");
const verification_code_form = getId("verification-code-form");
const set_new_password_form = getId("set-new-password-form");

const constructEmailVerificationUrl = (email) => (EMAIL_REGEXP.test(email) || !recovery_mode) ? `/recovery/${recovery_mode}/verify-email/${encodeURIComponent(email)}` : undefined;

const constructCodeVerificationUrl = (code_id, code, email) => ((validCodeRegexp.test(code) && EMAIL_REGEXP.test(email)) || !recovery_mode) ? `/recovery/verify-code?cid=${encodeURIComponent(code_id)}&code=${encodeURIComponent(code)}&email=${encodeURIComponent(email)}` : undefined;


const recoveryMain = async () => {
    //handle email form submission
    email_form.addEventListener("submit", async (e) => {
        e.preventDefault();
        alert("We will send a verification code to your inbox");
        const email_input = email_form.querySelector("#email").value;
        const url = constructEmailVerificationUrl(email_input);

        if (!url) return Toast_Notification.showError("Invalid Email format");

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (response.status !== 202) {
                getId("create-account").classList.remove("hidden");
                getId("create-account").setAttribute("href", recovery_mode === "admin"
                    ? "/admin/signin"
                    : "/signin");
                return Toast_Notification.showError(data.error);
            }

            Toast_Notification.showSuccess("A verification code has been send to your inbox!.");
            container_main.innerHTML = "";
            container_main.append(verification_code_form);
            verification_code_form.classList.remove("hidden");
            window.sessionStorage.setItem("recovery-email", JSON.stringify(email_input));
            window.sessionStorage.setItem("recovery-code_id", JSON.stringify(data.id));
        } catch (error) {
            console.log(error);
        }
    });

    if (!verification_code_form.classList.contains("hidden")) {
        verification_code_form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email_input = JSON.parse(window.sessionStorage.getItem("recovery-email")) || undefined;
            const code_id = JSON.parse(window.sessionStorage.getItem("recovery-code_id")) || undefined;
            const code_input = verification_code_form.querySelector("#code").value;
            const url = constructCodeVerificationUrl(code_id, code_input, email_input);

            if (!url) return Toast_Notification.showError("An unexpected error occured"), window.location.reload();

            try {
                const response = await fetch(url);
                const data = await response.json()

                if (response.status !== 200) {
                    return Toast_Notification.showError(data.error);
                }

                container_main.innerHTML = "";
                container_main.append(set_new_password_form);
                verification_code_form.classList.add("hidden");
                set_new_password_form.classList.remove("hidden");

                window.sessionStorage.setItem("recovery-email", JSON.stringify(email_input));
            } catch (error) {
                console.error(error);
            }
        })
    }

    if (!(set_new_password_form.classList.contains("hidden"))) {
        set_new_password_form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const password_input = set_new_password_form.querySelector("#password_input").value;
            const email = JSON.parse(window.sessionStorage.getItem("recovery-email")) || undefined;
            const url = `/recovery/${recovery_mode ? recovery_mode : undefined}/set-password`;

            if (!email) return Toast_Notification.showError("An unexpected error occured");

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: email, password: password_input })
            });

            const data = await response.json();

            if (response.status !== 200) {
                return Toast_Notification.showError(data.error);
            }
            alert("redirecting you to the sign in page ");
            recovery_mode === "admin" ? window.location.replace("/admin/signin") : window.location.replace("/signin")
            //clear session storage  and local storage
            window.sessionStorage.clear();
            window.localStorage.clear();
        })
    }

}

document.addEventListener("DOMContentLoaded", recoveryMain);