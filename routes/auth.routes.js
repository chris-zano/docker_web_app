const express = require('express');
const adminsModel = require('../models/admins.model');
const customersModel = require('../models/customers.model');
const codesModel = require('../models/codes.model');
const { logError } = require('../utils/logs.utils');
const { alertUserOfPasswordResetAttempt, informUserOfSuccessfulPasswordReset, emailRegexp } = require('../utils/mailer.utils');
const { hashPassword, comparePassword } = require('../utils/password.utils');
const { isValidObjectId, default: mongoose } = require('mongoose');
const router = express.Router();

/**
 * Verifies an admin
 * @param {mongoose.ObjectId} id 
 * @returns {object|null} match | null
 */
const verifyAdmin = async (id) => {
    if (!isValidObjectId(id)) return null;

    try {
        const adminMatch = await adminsModel.findById(id);
        return adminMatch;
    } catch (error) {
        logError(error, "verify-admin", "verifyAdmin")
        return null;
    }
}

/**
 * Verifies a customer
 * @param {mongoose.ObjectId} id 
 * @returns {object|null} match | null
 */
const verifyCustomer = async (id) => {
    if (!isValidObjectId(id)) return null;

    try {
        const customerMatch = await customersModel.findById(id);
        return customerMatch;
    } catch (error) {
        logError(error, "verify-customer", "verifyCustomer")
        return null;
    }
}
/**
 * Handle verification of user permissions and ID.
 *
 * @function verifyUser
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response indicating the status of user verification.
 */
router.get("/system/verify-user/:permissions/:id", async (req, res) => {
    const { permissions, id } = req.params;
    const permissionsActionMap = { "admins": verifyAdmin, "users": verifyCustomer };


    if (!permissions || !id || !permissionsActionMap[permissions]) {
        return res.set("Cache-Control", "public, max-age=3600").status(400).json({ message: "Invalid request" });
    }

    try {
        const validUserObject = await permissionsActionMap[permissions](id);

        if (!validUserObject) {
            return res.set("Cache-Control", "public, max-age=3600").status(404).json({ message: "user not found" });
        }

        return res.set("Cache-Control", "public, max-age=3600").status(200).json({ message: "valid user" });

    }
    catch (error) {
        logError(error, `/system/verify-user/${req.params.permissions}/${req.params.id}`, `router.get(req, res)`);
        return res.render("error", { code: "500", message: "The system failed to verify your credentials" });
    }
});

/**
 * Verify an admin by ID and email.
 *
 * @async
 * @function verifyAdminByIdAndEmail
 * @param {string} uid - The ID of the admin to verify.
 * @param {string} uemail - The email of the admin to verify.
 * @throws {Error} Throws an error if admin is not found.
 * @returns {Promise<Object>} Returns an object with the verified admin document.
 */
const verifyAdminByIdAndEmail = async (uid, uemail) => {
    try {
        const matchedDocument = await adminsModel.findOne({ _id: uid, email: uemail });
        if (!matchedDocument) return null;
        return { verified_user: matchedDocument };
    } catch (error) {
        logError(error, "verifyAdminByIdAndEmail", "verifyAdminByIdAndEmail");
        return null
    }

}

/**
 * Verify a customer by ID and email.
 *
 * @async
 * @function verifyCustomerByIdAndEmail
 * @param {string} uid - The ID of the customer to verify.
 * @param {string} uemail - The email of the customer to verify.
 * @returns {Promise<Object|boolean>} Returns an object with the verified customer document if found, otherwise returns false.
 */
const verifyCustomerByIdAndEmail = async (uid, uemail) => {
    try {
        const matchedDocument = await customersModel.findOne({ _id: uid, email: uemail });
        if (!matchedDocument) return null;
        return { verified_user: matchedDocument };
    } catch (error) {
        logError(error, "verifyCustomerByIdAndEmail", "verifyCustomerByIdAndEmail");
        return null
    }
}

/**
 * authenticaion routes
 *
 * @function verifyUser
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response indicating the status of user authentication.
 */
router.get('/sessions/:user_permission/password-reset', async (req, res) => {
    const { user_permission } = req.params;
    const { uid, uemail } = req.query;

    if (!uid || !uemail) return res.status(403).redirect(user_permission === "admin" ? '/admin/signin' : '/signin');

    var verifyUserByPermission = { 'admin': verifyAdminByIdAndEmail, 'customer': verifyCustomerByIdAndEmail };
    var userPermissionMatch = verifyUserByPermission[user_permission];

    if (!userPermissionMatch) return res.status(403).render("error", { code: 403, message: `Operation requires authentication` });

    try {
        const doc = await userPermissionMatch(uid, uemail);

        if (!doc) return res.status(403).render("error", { code: 403, message: `Operation requires authentication` });

        res.status(200).json({ message: "A password reset link has been sent to your email." });

        return await alertUserOfPasswordResetAttempt(doc.verified_user.email, doc.verified_user.username, doc.verified_user._id, user_permission === "admin" ? "system-undefined" : "system-not-null");
    } catch (error) {
        logError(error, req.path(), `GET ${req.path()}`);
        return res.render("error", { code: 500, message: `An Unexpected error occured` })
    }
});

/**
 * password reset route and handler.
 *
 * @function verifyUser
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response indicating the status of user password reset.
 */
router.get('/sessions/reset-user-password/:user/:id', async (req, res) => {
    const { user, id } = req.params;
    const GetUserTypes = { "system-undefined": adminsModel, "system-not-null": customersModel };
    const InvokeUserTypeReference = GetUserTypes[user];

    if (!InvokeUserTypeReference) {
        return res.render("error", { code: 403, message: `Forbidden. You are not authorised to access this resource` });
    }

    const userObject = await InvokeUserTypeReference.findOne({ _id: id });

    if (!userObject || Object.keys(userObject).length === 0) {
        return res.render("error", {
            code: 404,
            message: `User Not found`
        });
    }

    return res.render("accounts/password-reset", {
        id: userObject._id,
        email: userObject.email,
        permission: user,
        error: "empty"
    });
});

/**
 * password reset with email verification.
 *
 * @function verifyUser
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response indicating the status of password reset.
 */
router.post("/session/password-reset/", async (req, res) => {
    const { user_type, email, userId, password } = req.body;
    const passwordRegexp = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#!._@-])[A-Za-z0-9#!._@-]{8,}$/;

    const isValidUserType = (user_type === "system-undefined" || user_type === "system-not-null");
    const isValidEmail = emailRegexp().test(email);
    const isValidUserId = typeof userId === 'string' && userId.trim().length > 0; // userId should be a non-empty string
    const isValidPassword = passwordRegexp.test(password);

    if (!(isValidUserType && isValidEmail && isValidUserId)) {

        return res.render("error", {
            code: 400,
            message: `An unexpected error occured.`
        });
    }
    if (!(isValidPassword)) {
        return res.render("accounts/password-reset", {
            id: userId,
            email: email,
            permission: user_type,
            error: "Invalid Password Format"
        });
    }

    const GetUserTypes = {
        "system-undefined": adminsModel,
        "system-not-null": customersModel
    };

    const InvokeUserTypeReference = GetUserTypes[user_type];

    if (!InvokeUserTypeReference) {
        return res.render("error", {
            code: 403,
            message: `Forbidden. You are not authorised to access this resource`
        });
    }

    try {
        const hashedPassword = await hashPassword(password);
        const updatePassword = await InvokeUserTypeReference.updateOne({ _id: userId, email: email }, {
            $set: {
                password: hashedPassword.hashedPassword,
                password_salt: hashedPassword.salt
            }
        });

        if (!(updatePassword.acknowledged) && !(updatePassword.modifiedCount === 1)) {
            return res.render("error", { code: 403, message: `Forbidden. You are not authorised to access this resource` });
        }

        //send confirmation email to user
        res.render("accounts/password-changed", { userType: user_type });
        return await informUserOfSuccessfulPasswordReset(email);

    }
    catch (error) {
        //log errors with the developer logError module
        logError(error, "/session/password-reset/", "callback");

        console.error(error);
        return res.render("error", {
            code: 500,
            message: `An unexpected error occured`
        });
    }
});


module.exports = router;