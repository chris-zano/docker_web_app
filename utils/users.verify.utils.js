/**
 * @file users.verify.utils.js
 * @description Utility functions for verifying users and admins by ID or session.
 */
const { Admins, Customers } = require('./db.exports.utils');

const Admin = Admins();
const Customer = Customers();

/**
 * Middleware to verify a user by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void}
 * @throws {Error} 409 - If user is not found, redirects to "/signin".
 * @throws {Error} 500 - Internal server error.
 */
module.exports.verifyUserbyId = async (req, res, next) => {
    try {
        const user = await Customer.findOne({ _id: req.params.id });

        if (!user) {
            res.status(409).redirect("/signin");
            return;
        }

        // Create the resulting object with id instead of _id
        req.verifiedUser = {
            id: user._id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicURL: user.profilePicURL,
            favourites: user.favourites,
            downloads: user.downloads,
            mailed: user.mailed,
            v: user.__v,
        }

        next();
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
};

/**
 * Middleware to verify an admin by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void}
 * @throws {Error} 409 - If admin is not found, redirects to "/signin".
 * @throws {Error} 500 - Internal server error.
 */
module.exports.verifyAdminbyId = async (req, res, next) => {
    try {
        const user = await Admin.findOne({ _id: req.params.id });
        if (!user) {
            res.status(403);
            res.redirect("/signin");
            return;
        }

        req.verifiedUser = {
            id: user._id,
            username: user.username,
            profilePicURL: user.profilePicURL,
            email: user.email,
            v: user.__v
        };

        next();
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
}

/**
 * Middleware to verify user or admin by session.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void}
 * @throws {Error} 500 - Internal server error if session type is neither "admin" nor "user".
 */
module.exports.verifyUserBySession = (req, res, next) => {
    const { session } = req.params;

    if (session === "admin") {
        return module.exports.verifyAdminbyId(req, res, next);
    } else if (session === "user") {
        return module.exports.verifyUserbyId(req, res, next);
    } else {
        return res.status(500).send('Internal Server Error');
    }
}