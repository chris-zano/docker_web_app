/**
 * @module signinController
 */

const { Admins, Codes, Customers } = require("../utils/db.exports.utils");
const { logSession, logError } = require("../utils/logs.utils");
const { sendVerificationCode, emailRegexp } = require("../utils/mailer.utils");
const { hashPassword, comparePassword } = require("../utils/password.utils");
const { generateVerificationCode, generateTempId, matchBaseStringToSubstring } = require("./controller.utils");
const Admin = Admins();
const Code = Codes();
const Customer = Customers();
const email_Regex = emailRegexp();

/**
 * Logs in an admin user.
 * 
 * @async
 * @function adminLogin
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.username - The username of the admin.
 * @param {string} req.body.password - The password of the admin.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
const adminLogin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        logSession("no_user_name", req.ip, "Failed");
        return res.status(400).json({ message: "Username and password are required", user: {} });
    }

    try {
        const userMatch = email_Regex.test(username)
            ? await Admin.findOne({ email: username })
            : await Admin.findOne({ username: username });

        if (!userMatch) {
            logSession(`Incorrect username:://${username}`, req.ip, "Failed");
            return res.status(404).json({ message: "Invalid username", user: {} });
        }

        const passwordIsMatch = await comparePassword(password, userMatch.password);
        if (!passwordIsMatch) {
            logSession(`Incorrect Password:://${username}//`, req.ip, "Failed");
            return res.status(404).json({ message: "Incorrect Password.", user: {} });
        }


        logSession(username, req.ip, "Success");
        const user = { id: userMatch._id, username: userMatch.username, email: userMatch.email, __v: userMatch.__v }
        return res.status(200).json({ message: "success", user });

    } catch (error) {
        logError(error, req.url, "authenticateAdminLogin");
        return res.status(500).json({ message: "An unexpected error occured", user: {} });
    }
}

/**
 * Logs in a customer user.
 * 
 * @async
 * @function customerLogin
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.username - The username of the customer.
 * @param {string} req.body.password - The password of the customer.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
const customerLogin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        logSession("no_user_name", req.ip, "Failed");
        return res.status(400).json({ message: "Invalid username or password", user: {} });
    }
    try {

        let userMatch;
        if (email_Regex.test(username)) {
            userMatch = await Customer.findOne({ email: username });
        }
        else {
            userMatch = await Customer.findOne({ username: username });
        }

        if (!userMatch) {
            logSession(username, req.ip, "Failed");
            return res.status(404).json({ message: "Invalid username", user: {} });
        }

        const passwordIsMatch = await comparePassword(password, userMatch.password);

        if (!passwordIsMatch) {
            logSession(username, req.ip, "Failed");
            return res.status(404).json({ message: "Incorrect password", user: {} })
        }

        logSession(username, req.ip, "Success");

        res.status(200).json({ message: "success", user: { id: userMatch._id, email: userMatch.email, username: userMatch.username, firstName: userMatch.firstName, lastName: userMatch.lastName, profilePicURL: userMatch.profilePicURL, downloads: userMatch.downloads, mailed: userMatch.mailed, favourites: userMatch.favourites, v: userMatch.__v } });
    } catch (error) {
        logError(error, req.url, "authenticateWithUsernameAndPassword");
        return res.status(500).json({ message: "Internal Server Error. try again later", user: {} });
    }
}

/**
 * Determines if the user is an admin or a customer based on the request path.
 * 
 * @function isUserAdminOrCustomer
 * @param {string} baseString - The request path to check.
 * @returns {string} - "admin" if the path includes "/admin/", "users" if the path includes "/users/", otherwise "none".
 */
const isUserAdminOrCustomer = (baseString = "") => {
    return matchBaseStringToSubstring(baseString, "/admin/")
        ? "admin"
        : matchBaseStringToSubstring(baseString, "/users/")
            ? "users"
            : "none"
}

/**
 * Authenticates admin or customer login based on the request path.
 * 
 * @async
 * @function loginHandler
 * @param {Object} req - The request object.
 * @param {Object} req.route - The matched route.
 * @param {string} req.route.path - The matched route path.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
module.exports.loginHandler = async (req, res) => {
    const userType = isUserAdminOrCustomer(req.originalUrl);

    try {
        return userType === "admin"
            ? await adminLogin(req, res)
            : userType === "users"
                ? await customerLogin(req, res)
                : res.status(400).json({ message: "Bad Request", user: {} });
    } catch (error) {
        logError(error, req.url, "authenticateUserLogin");
        return res.status(500).json({ message: "Failed to Login (Internal Server Error)", user: {} });
    }
}

/**
 * Verifies admin email during signup.
 * 
 * @async
 * @function verifyEmail
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.email - The email to verify.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
module.exports.verifyEmail = async (req, res) => {
    const { email } = req.body;
    const matchUserTypeToDb = { "admin": Admin, "users": Customer };

    if (!email) return res.status(400).json({ id: null, message: "Invalid email" });

    try {
        const userDb = matchUserTypeToDb[isUserAdminOrCustomer(req.originalUrl)]
        if (!userDb) return res.status(400).json({ id: null, message: "Invalid user type" });

        const email_exists = await userDb.findOne({ email: email });
        if (email_exists !== null) return res.status(409).json({ message: "email already in use" });

        const verificationCode = generateVerificationCode(), tempId = generateTempId();
        res.status(202).json({ id: tempId, message: "Success" });

        try {
            return await sendVerificationCode(email, verificationCode, tempId);
        } catch (error) {
            logError(new Error(error), req.url, "verifyEmail[async mailer::try-catch]");
            return res.status(500).json({ id: null, message: "An unexpected error occured" });
        }

    } catch (error) {
        logError(error, req.route.path, "verifyEmail");
        return res.status(500).json({ id: null, message: "Failed to send verification code" });
    }
}

/**
 * Verifies the provided verification code.
 * 
 * @async
 * @function verifyCode
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.codeId - The ID of the verification code.
 * @param {string} req.body.user_input - The user input for the verification code.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
module.exports.verifyCode = async (req, res) => {
    const { codeId, user_input } = req.body;

    try {
        const codeMatch = await Code.findOne({ tempId: codeId, code: user_input });
        if (!codeMatch) {
            return res.status(404).json({ message: "Invalid Code" });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server error" });
    }

    return res.status(200).json({ message: "success" });
}

/**
 * Creates a new Administrator
 * @async
 * @function createNewAdmin
 * @param {string} email 
 * @param {string} password 
 * @param {string} salt 
 * @returns {Object | null}
 */
const createNewAdmin = async (email, password, salt) => {
    try {
        const new_admin = new Admin({ email: email, password: password, password_salt: salt });
        const admin = await new_admin.save();
        if (!admin) return null;
        return { id: admin._id, email: admin.email, username: admin.username, profilePicURL: admin.profilePicURL }
    } catch (error) {
        logError(error, "createNewAdmin", "createNewAdmin");
        return null;
    }
}

/**
 * Creates a new customer
 * @async
 * @function createNewCustomer
 * @param {string} email 
 * @param {string} password 
 * @param {string} salt 
 * @returns {Object | null}
 */
const createNewCustomer = async (email, password, salt) => {
    try {
        const new_customer = new Customer({ email: email, password: password, password_salt: salt });
        const customer = await new_customer.save();
        if (!customer) return null;
        return { id: customer._id, email: customer.email, username: customer.username, firstName: customer.firstName, lastName: customer.lastName, profilePicURL: customer.profilePicURL, downloads: customer.downloads, mailed: customer.mailed, favourites: customer.favourites }

    } catch (error) {
        logError(error, "createNewCustomer", "createNewCustomer");
        return null;
    }
}

/**
 * Sets a new password for a new user.
 * 
 * @async
 * @function setNewPasswordAndCreateUser
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.email - The email of the new user.
 * @param {string} req.body.user_password - The new password for the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
module.exports.setNewPasswordAndCreateUser = async (req, res) => {
    const { email, user_password } = req.body;
    const matchUserTypeToFunction = { "admin": createNewAdmin, "users": createNewCustomer };

    const userTypeFunction = matchUserTypeToFunction[isUserAdminOrCustomer(req.originalUrl)]
    if (!userTypeFunction) return res.status(400).json({ user: {}, message: "Invalid user" });

    try {
        const hashedPassword = await hashPassword(user_password);

        if (hashedPassword.error === null) {
            const userData = await userTypeFunction(email, hashedPassword.hashedPassword, hashedPassword.salt);

            if (!userData) return res.status(500).json({ message: "An unexpected error occured" });

            return res.status(200).json({ user: userData, message: "Success" });
        }
        else {
            logError(new Error("HashPassword Error::// , hashedPassword.error"), req.url, "setNewPasswordAndCreateUser")
            return res.status(400).json({ user: {}, message: "Invalid Password" });
        }

    } catch (error) {
        logError(error, req.route.path, "setNewPasswordAndCreateUser");
        return res.status(500).json({ message: "An unexpected error occured" });
    }
}