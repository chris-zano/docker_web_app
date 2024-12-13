const initiatePostRequest = async (url = "", options = {}) => {
    if ((Object.keys(options).length === 0) || !url) {
        return { status: 400, doc: {} };
    }

    try {
        const response = await fetch(
            `${url.trim()}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(options)
            }
        );

        const data = await response.json();

        return { status: response.status, doc: data };
    }
    catch (error) {
        console.log(error)
        return { status: 400, doc: {} };
    }
}

const initiateGetRequest = async (url = "") => {
    if (!url) {
        return { status: 400, doc: {} };
    }

    try {
        const response = await fetch(`${url.trim()}`);

        const data = await response.json();

        return { status: response.status, doc: data };
    }
    catch (error) {
        console.log(error)
        return { status: 400, doc: {} }
    }
}

const getId = (id) => {
    return document.getElementById(id);
}

console.log("util loaded")