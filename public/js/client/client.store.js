const user_id = JSON.parse(window.sessionStorage.getItem("session-user")) || undefined;

const addToFavorites = async (button) => {
    const file_id = button.getAttribute("data-file_id");

    setTimeout(async () => {
        try {
            const url = `/users/add-to-favorites`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ file_id, user_id })
            });

            if (response.status === 200) {
                return Toast_Notification.showInfo("Added to favorites");
            }
            else {
                return Toast_Notification.showError("Failed to add to favorites");
            }
        } catch (error) {
            console.error(error);
            return Toast_Notification.showError("Failed to add to favorites");
        }
    }, 0)
}
const downloadFile = (button) => {
    const file_id = button.getAttribute("data-file_id");
    const file_path = button.getAttribute("data-file_path");
    const originalname = button.getAttribute("data-originalname");
    const filename = button.getAttribute("data-title");

    const downloadLink = document.createElement("a");
    downloadLink.href = file_path;
    downloadLink.download = `${filename.replaceAll(" ", "_")}${originalname.substring(originalname.lastIndexOf("."))}`;
    downloadLink.click();

    setTimeout(async () => {
        try {
            const url = `/users/add-to-downloads`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ file_id, user_id })
            });

            if (response.status === 200) {
                return Toast_Notification.showInfo("Added to favorites");
            }
            else {
                return Toast_Notification.showError("Failed to add to favorites");
            }
        } catch (error) {
            console.error(error);
            Toast_Notification.showError("Failed to add to favorites");
        }
    }, 0)
}
const shareFile = (button) => {
    const file_id = button.getAttribute("data-file_id");
    renderFileShareForm(file_id);
}

function renderFileShareForm(id) {
    const shareFormContainer = `
        <div class="form-container">
            <h2>Share File via Email</h2>
            <form id="emailForm">
                
                <label for="message">Message:</label>
                <textarea id="share-message" name="message" rows="4" required></textarea>

                <label for="email">Email:</label>
                <div class="email-input">
                    <input type="text" id="share-email_list" name="email" required>
                    <button type="button" id="addEmailBtn">Add Email</button>
                </div>

                <button type="submit">Share</button>
            </form>
        </div>
    `;

    document.getElementById("share-file_form_container").innerHTML = shareFormContainer;
    document.getElementById("share-file_form_container").style.visibility = "visible";
    document.getElementById('addEmailBtn').addEventListener('click', function () {
        const emailInput = document.getElementById('share-email_list');
        if (emailInput.value && !emailInput.value.endsWith(';')) {
            emailInput.value += '; ';
            emailInput.focus()
        }
    });

    document.getElementById("emailForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const message = e.target.querySelector("#share-message").value;
        const recipients = String(e.target.querySelector("#share-email_list").value).split("; ");

        const options = { id, message, recipients, user_id };

        try {
            fetch('/users/share-file', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(options)
            })
                .then((response) => {
                    document.getElementById("share-file_form_container").innerHTML = ""
                    document.getElementById("share-file_form_container").style.visibility = "hidden";

                    if (response.status === 202) {
                        Toast_Notification.showInfo("Email is being queued to be sent");
                    }
                    else {
                        if (response.status === 400) {
                            const data = response.json();
                            Toast_Notification.showError(data.message);
                            throw new Error(data.message);
                        }
                        else {
                            return
                        }
                    }
                })
                .catch((error) => {
                    console.error("Error occurred:", error);
                });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    });

}
