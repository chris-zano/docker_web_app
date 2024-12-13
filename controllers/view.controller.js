const { Customers, Files } = require("../utils/db.exports.utils");
const Customer = Customers();
const File_ = Files();

/**
 * Renders the "getting started" page.
 *
 * @function renderGettinStartedPage
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The rendered HTML page with appropriate headers.
 */
module.exports.renderGettinStartedPage = (req, res) => {
    res.type("text/html");
    res.set("Cache-Control", "public, max-age=10");
    res.status(200);
    return res.render('getting-started');
}

/**
 * Renders the sign-in page.
 *
 * @function renderSigninPage
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The rendered HTML page with appropriate headers.
 */
module.exports.renderSigninPage = (req, res) => {
    res.type("text/html");
    res.set("Cache-Control", "public, max-age=10");
    res.status(200);
    return res.render('accounts/signin');

}

/**
 * Renders the admin sign-in page.
 *
 * @function renderAminSigninPage
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The rendered HTML page with appropriate headers.
 */
module.exports.renderAminSigninPage = (req, res) => {
    res.type("text/html");
    res.set("Cache-Control", "public, max-age=10");
    res.status(200);
    return res.render('accounts/admin-signin.ejs',
        {
            pageUrl: "uploads",
            scripts_urls: [],
            stylesheets_urls: ["/files/css/admin/admin.css"]
        }
    );

}

/**
 * Renders admin views based on the requested page.
 *
 * @async
 * @function renderAdminViews
 * @param {Object} req - The request object.
 * @param {Object} req.verifiedUser - The verified user object.
 * @param {string} req.verifiedUser.id - The ID of the verified user.
 * @param {string} req.verifiedUser.username - The username of the verified user.
 * @param {string} req.verifiedUser.profilePicURL - The profile picture URL of the verified user.
 * @param {string} req.verifiedUser.email - The email address of the verified user.
 * @param {number} req.verifiedUser.v - The version number of the verified user.
 * @param {Object} req.params - The URL parameters object.
 * @param {string} req.params.pageUrl - The requested admin page URL.
 * @param {Object} res - The response object.
 * @returns {Object} The rendered admin view with appropriate headers.
 */
module.exports.renderAdminViews = async (req, res) => {
    try {
        const adminDashboardFilesCollection = await File_.find({admin_id: req.verifiedUser.id}) || [];

        res.type("text/html");
        res.set("Cache-Control", "public, max-age=10");
        res.status(200);

        return res.render('admin/admin.main.ejs',
            {
                id: req.verifiedUser.id,
                username: req.verifiedUser.username,
                profilePicURL: req.verifiedUser.profilePicURL,
                email: req.verifiedUser.email,
                v: req.verifiedUser.v,
                pageUrl: req.params.pageUrl,
                scripts_urls: [`/files/scripts/admin/admin.${req.params.pageUrl}.js`],
                stylesheets_urls: ["/files/css/admin/admin.css", `/files/css/admin/${req.params.pageUrl}.css`],
                files: adminDashboardFilesCollection
            }
        );
    } catch (error) {
        console.log(error);
        return res.redirect(`/error/${500}/${req.url}/Internal_server_error`)
    }
}

/**
 * Renders user views based on the requested page URL.
 *
 * @async
 * @function renderUserViews
 * @param {Object} req - The request object.
 * @param {Object} req.verifiedUser - The verified user object.
 * @param {Object} req.verifiedUser - The verified user object.
 * @param {string} req.verifiedUser.id - The ID of the verified user.
 * @param {string} req.verifiedUser.username - The username of the verified user.
 * @param {string} req.verifiedUser.profilePicURL - The profile picture URL of the verified user.
 * @param {string} req.verifiedUser.email - The email address of the verified user.
 * @param {Object} req.params - The URL parameters object.
 * @param {string} req.params.pageUrl - The requested user page URL.
 * @param {Object} res - The response object.
 * @returns {Object} The rendered user view with appropriate headers.
 */
module.exports.renderUserViews = async (req, res) => {
    const user = req.verifiedUser;
    const { pageUrl } = req.params;

    if (pageUrl === "store") {
        try {
            const adminDashboardFilesCollection = await File_.find({ visibility: "public" }) || [];

            res.type("text/html");
            res.set("Cache-Control", "public, max-age=10");
            res.status(200);

            res.render('users/users.main.ejs',
                {
                    ...user,
                    pageUrl: "home",
                    scripts_urls: ['/files/scripts/client/client.store.js'],
                    stylesheets_urls: ["/files/css/users/users.css", "/files/css/users/store.css"],
                    files: adminDashboardFilesCollection
                }
            );
        } catch (error) {
            logError(error, req.url, "renderUserViews");
            return res.redirect(`/error/${500}/${req.url}/Internal_server_error`)
        }
    }
    else {
        return res.render('users/users.main.ejs',
            {
                ...user,
                pageUrl: pageUrl,
                scripts_urls: [`/files/scripts/client/client.${pageUrl}.js`],
                stylesheets_urls: ["/files/css/users/users.css", `/files/css/users/${pageUrl}.css`],

            }
        );
    }
}