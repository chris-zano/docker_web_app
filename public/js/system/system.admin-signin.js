const adminsignIn = async (username = "", password = "") => {
    const request_options = { username, password };
    const postSigninURL = '/admin/login';
    const response = await initiatePostRequest(postSigninURL, request_options);
    try {
        if (response.status !== 200) {
            Toast_Notification.showError("Invalid username or password");
            return null;
        }

        return response.doc;
    }
    catch (error) {
        return {}
    }

}

const adminsignUp = async (email = "") => {
    const request_options = { email };
    const postSigninURL = '/admin/signup/initiate';
    try {
        const response = await initiatePostRequest(postSigninURL, request_options);
        if (response.status !== 202) {
            Toast_Notification.showInfo("An error occured");
            return null;
        }

        Toast_Notification.showSuccess("A verification code has been sent to your email.");
        return response.doc;
    }
    catch (error) {
        return {}
    }


}

const sendVerificationRequest = async (options = {}) => {
    const request_options = options;
    const postSigninURL = '/admin/signup/verify-code';
    try {
        const response = await initiatePostRequest(postSigninURL, request_options);
        if (response.status === 409) {
            Toast_Notification.showError("Invalid code");
        }
        else if (response.status === 500) {
            Toast_Notification.showError("An unexpected error occured");
        } else {
            Toast_Notification.showSuccess("Email has been verified. Go ahead to secure your account with a password");
        }
        return response.doc;
    }
    catch (error) {
        return {}
    }

}

const signupWithEmailAndPassword = async (email, password) => {
    const request_options = { email, user_password: password };
    const postSigninURL = '/admin/signup/set-password';
    try {
        const response = await initiatePostRequest(postSigninURL, request_options);
        if (response.status === 400) {
            Toast_Notification.showError("Your password doesn't meet password requirements.");
        }
        else if (response.status === 500) {
            Toast_Notification.showError(response.doc.message);
        }
        else {
            Toast_Notification.showSuccess("Account creation complete");
        }
        return response.doc;
    }
    catch (error) {
        return {}
    }
}

const renderVerificationForm = (codeId) => {
    let container_main = getId("container-main");
    container_main.innerHTML = "";
    container_main.innerHTML = verificationCodeForm;

    const validCodeRegexp = /^[A-Za-z0-9]{6}$/;

    container_main.querySelector("#code").addEventListener("input", (e) => {
        if ((validCodeRegexp.test(e.target.value))) {
            container_main.querySelector("#code-btn").removeAttribute("disabled");
            container_main.querySelector("#code-btn").classList.add("enabled");

            container_main.querySelector("#code-form-signup").addEventListener("submit", async (e) => {
                e.preventDefault();

                const input_code = container_main.querySelector("#code").value;

                try {
                    const res = await sendVerificationRequest({ codeId, user_input: input_code });
                    if (res.message === "Invalid Code" || res.message === "Internal Server error") {
                        //show resend code button
                        container_main.querySelector("#resend-code").classList.remove("hidden");

                        container_main.querySelector("#resend-code").addEventListener("click", async () => {
                            const user_email = JSON.parse(localStorage.getItem("session_email")) || null;

                            if (!user_email) { //get users email from session storage
                                Toast_Notification.showWarning("No valid Email was entered");
                                container_main.querySelector("#resend-code").innerHTML = '<a href="/admin/signin">Back to sign in</a>';
                            }
                            else {
                                signUp(user_email).then((res) => { // use email to resend a verification code
                                    renderVerificationForm(res.id);
                                }).catch(error => {
                                    Toast_Notification.showError("An error occured: " + error.message);
                                    location.reload();
                                })
                            }
                        })
                    }
                    else { // valid code (all clear to create password)
                        container_main.innerHTML = "";
                        container_main.innerHTML = addPasswordForm;

                        const passwordRegexp = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#!._@-])[A-Za-z0-9#!._@-]{8,}$/;

                        container_main.querySelector("#password-btn").removeAttribute("disabled");
                        container_main.querySelector("#password-btn").classList.add("enabled");

                        container_main.querySelector("#password_input").addEventListener("input", (e) => {
                            if (passwordRegexp.test(e.target.value)) { // password passes regex test
                                container_main.querySelector("#password-btn").removeAttribute("disabled");
                                container_main.querySelector("#password-btn").classList.add("enabled");

                                container_main.querySelector("#password-form-signup").addEventListener("submit", async (e) => {
                                    e.preventDefault()
                                    const user_input = container_main.querySelector("#password_input").value;
                                    //get user email from session storage and use in account creation
                                    const email = JSON.parse(window.sessionStorage.getItem("session_email")) || null;

                                    if (!email) {
                                        return Toast_Notification.showError("An error occured. Please Try again");
                                    }
                                    else {
                                        try {
                                            const res = await signupWithEmailAndPassword(email, user_input);
                                            if (res.message === "Success") {
                                                window.sessionStorage.setItem("admin_data", JSON.stringify(res.user));
                                                window.sessionStorage.setItem("session-admin", JSON.stringify(res.user.id));
                                                return window.location.replace(`/admin/views/dashboard/${res.user.id}`);
                                            }
                                            else {
                                                return alert(res.message);
                                            }

                                        } catch (error) {
                                            console.error("Error on setting password: ", error);
                                            alert("Error setting password");
                                            return window.location.reload();
                                        }
                                    }
                                });
                            }
                            else { // password fails regex test
                                container_main.querySelector("#password-btn").setAttribute("disabled", "true");
                                container_main.querySelector("#password-btn").classList.remove("enabled");
                                container_main.querySelector("#password-form-container").addEventListener("submit", (e) => e.preventDefault());
                            }
                        });
                    }
                    return;
                } catch (error) {
                    console.log(error);
                    return
                }



            });
        }
        else {
            container_main.querySelector("#code-btn").setAttribute("disabled", "true");
            container_main.querySelector("#code-btn").classList.remove("enabled");
            container_main.querySelector("#code-form-signup").addEventListener("submit", (e) => e.preventDefault())
        }
    })


}

const signinMain = () => {
    const signinForm = getId("signin-form-signin-with-username");

    signinForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = getId("username").value;
        const password = getId("password").value;

        const res = await adminsignIn(username, password);
        if (res.message === "success") {
            sessionStorage.setItem("admin_data", JSON.stringify(res.user));
            sessionStorage.setItem("session-admin", JSON.stringify(res.user.id));
            window.location.replace(`/admin/views/dashboard/${res.user.id}`);
        }
        else {
            return
        }
    });

    const signupForm = getId("signin-form-signup");
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        getId("signup-btn").style.backgroundColor = "#0000009f";
        getId("signup-btn").style.color = "#fff";
        getId("signup-btn").style.border = "1px solid #0000009f";
        getId("signup-btn").setAttribute("disabled", "true");


        const email = getId("email").value;

        window.sessionStorage.setItem("session_email", JSON.stringify(email));
        const res = await adminsignUp(email);

        renderVerificationForm(res.id);
    });

}

document.addEventListener("DOMContentLoaded", signinMain);