/**
 * @module recoveryController
 */

const { Admins, Codes, Customers } = require("../utils/db.exports.utils");
const { logSession, logError } = require("../utils/logs.utils");
const { sendVerificationCode, emailRegexp } = require("../utils/mailer.utils");
const { hashPassword, comparePassword } = require("../utils/password.utils");
const { generateVerificationCode, generateTempId, matchBaseStringToSubstring } = require("./controller.utils");
const email_Regex = emailRegexp();
const Code = Codes();
const modeToCollection = { "admin": Admins, "customer": Customers };


/**
 * Verifies the email during the recovery process for admin or customer.
 *
 * @async
 * @function recovery_VerifyEmail
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.email - The email to verify.
 * @param {string} req.params.mode - The mode indicating whether the user is an admin or a customer.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
module.exports.recovery_VerifyEmail = async (req, res) => {
    const { email, mode } = req.params;

    if (!email || !mode) {
        return res.status(400).json({ error: "bad request" });
    }


    const matchModeToCollection = modeToCollection[mode];

    if (!matchModeToCollection) {
        return res.status(400).json({ error: "bad request" });
    }


    try {
        const email_exists = await matchModeToCollection().findOne({ email: email });

        if (!email_exists) {
            return res.status(404).json({ error: "email does not exist" });
        }

        const verificationCode = generateVerificationCode(), tempId = generateTempId();

        res.status(202).json({ id: tempId });

        await sendVerificationCode(email, verificationCode, tempId);

    } catch (error) {
        logError(error, "/admin/signup/initiate", "verifyEmail");
        return res.status(500).json({ error: "Failed to send verification code" });
    }
}

/**
 * Verifies the code during the recovery process.
 *
 * @async
 * @function recovery_VerifyCode
 * @param {Object} req - The request object.
 * @param {Object} req.query - The request query parameters.
 * @param {string} req.query.cid - The code ID.
 * @param {string} req.query.code - The verification code.
 * @param {string} req.query.email - The email associated with the code.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
module.exports.recovery_VerifyCode = async (req, res) => {
    const { cid, code, email } = req.query;

    try {
        const codeMatch = await Code.findOne({ tempId: cid, code: code, recipient_email: email });
        if (!codeMatch) {
            return res.status(409).json({ message: "Invalid Code" });
        }

       return res.status(200).json({ message: "success" });
    } catch (error) {
        logError(error, req.url, "recovery_VerifyCode");
        return res.status(500).json({message: "Internal server error"})
    }
}

/**
 * Sets a new password during the recovery process for admin or customer.
 *
 * @async
 * @function recovery_SetNewPassword
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.email - The email for which the password is being reset.
 * @param {string} req.body.password - The new password.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.mode - The mode indicating whether the user is an admin or a customer.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
module.exports.recovery_SetNewPassword = async (req, res) => {
    const { email, password } = req.body;
    const { mode } = req.params

    try {
        const hashedPassword = await hashPassword(password);
        const matchModeToCollection = modeToCollection[mode];

        await matchModeToCollection().updateOne({ email: email }, {
            $set: {
                password: hashedPassword.hashedPassword,
                password_salt: hashedPassword.salt
            }
        })

        res.status(200).json({ message: "success" });

    } catch (error) {
        logError(error, "/admin/signup/set-password", "setNewAdminPassword");
        return res.status(500).json({ error: "Internal Sserver Error" });
    }
}