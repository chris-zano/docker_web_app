const { Files } = require("../utils/db.exports.utils");
const { logError } = require("../utils/logs.utils");

const file = Files();

/**
 * Renders the search page based on user session.
 *
 * @function renderSearchPage
 * @param {Object} req - The request object.
 * @param {Object} req.verifiedUser - The verified user object from the request.
 * @param {string} req.params.session - The session type ("user" or "admin").
 * @param {Object} res - The response object.
 * @returns {void}
 */
module.exports.renderSearchPage = (req, res) => {
    const user = req.verifiedUser;
    let session = req.params.session === "user" ? "users": req.params.session;

    res.render(`${session}/${session}.main.ejs`, {
        ...user,
        pageUrl: "search",
        scripts_urls: [],
        stylesheets_urls: [],
    });
}

/**
 * Renders the search result page based on user session and file ID.
 *
 * @async
 * @function renderResultPage
 * @param {Object} req - The request object.
 * @param {Object} req.verifiedUser - The verified user object from the request.
 * @param {string} req.params.session - The session type ("user" or "admin").
 * @param {string} req.params.file_id - The ID of the file to render results for.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
module.exports.renderResultPage = async (req, res) => {
    const user = req.verifiedUser;
    let session = req.params.session === "user" ? "users": req.params.session;
    try {
        const files = await file.find({ _id: req.params.file_id, visibility: "public"}) || [];

        res.type("text/html");
        res.set("Cache-Control", "public, max-age=10");
        res.status(200);

        res.render(`${session}/${session}.main.ejs`, {
            ...user,
            pageUrl: "search-result",
            scripts_urls: [],
            stylesheets_urls: [],
            scripts_urls: session === "users" 
            ? ['/files/scripts/client/client.store.js', ]
            : [`/files/scripts/admin/admin.dashboard.js`],
            stylesheets_urls: session === "users"
            ? ["/files/css/users/users.css", "/files/css/users/store.css"]
            : ["/files/css/admin/admin.css", `/files/css/admin/dashboard.css`],
            files: files
        });
    } catch (error) {
        logError(error, req.url, "renderUserViews");
        return res.redirect(`/error/${500}/${url}/Internal_server_error`)
    }
}