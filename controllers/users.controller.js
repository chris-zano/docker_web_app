/**
 * @module userController
 */
const fs = require("fs");
const path = require('path');

const { Customers, Files } = require('../utils/db.exports.utils');
const { logError } = require('../utils/logs.utils');
const { isValidObjectId } = require('./controller.utils');

const mailer = require('../utils/mailer.utils');
const emailregexp = mailer.emailRegexp();

const file = Files();
const customer = Customers();

/**
 * Retrieves customer details based on the provided ID.
 *
 * @async
 * @function getCustomerDetails
 * @param {string} id - The customer ID.
 * @returns {Promise<{ status: string, message: string, doc: Object }>} Status, message, and customer details object.
 */
const getCustomerDetails = async (id) => {
    if (typeof id !== "string" || !isValidObjectId(id)) return { status: "Fail", message: `Invalid Object Id ${id}`, doc: {} };
    try {
        const matchedDocument = await customer.findOne({ _id: id });
        if (!matchedDocument) return { status: "Fail", message: `No match for customer_id ${id}`, doc: {} }

        const customerDetails = { firstname: matchedDocument.firstName, lastname: matchedDocument.lastName, email: matchedDocument.email };

        return { status: "Success", message: `Document match for customer_id ${id}`, doc: customerDetails };
    }
    catch (error) {
        logError(error, "/users/share-file", "getCustomerDetails");
        return { status: "Fail", message: "Server Error", doc: {} }
    }
}

/**
 * Valid types for files.
 *
 * @constant {Array.<string>} validTypes
 */
const validTypes = ["images", "docs", "pdfs"];

/**
 * Constructs the file path based on filename and type.
 *
 * @function getFilepath
 * @param {string} filename - The name of the file.
 * @param {string} type - The type of the file ("images", "docs", "pdfs").
 * @returns {string} The constructed file path.
 */
const getFilepath = (filename = '', type = '') => {

    if (typeof filename !== "string" || filename.length === 0) return "Invalid Filename";
    if (typeof type !== "string" || type.length === 0 || !validTypes.includes(`${type}`)) return "Invalid type";

    return path.join(__dirname, "..", "AT-FS", `${type.toLowerCase()}`, `store_${type}`, filename);
}

/**
 * Retrieves file details based on the provided ID.
 *
 * @async
 * @function getFileObject
 * @param {string} id - The file ID.
 * @returns {Promise<{ status: string, message: string, doc: Object }>} Status, message, and file details object.
 */
const getFileObject = async (id) => {
    if (typeof id !== "string" || !isValidObjectId(id)) return { status: "Fail", message: `Invalid Object Id ${id}`, doc: {} };
    const matchTypes = { "Image File": 'images', "PDF document": 'pdfs', "Word Document": 'docs' };

    try {
        const matchedDocument = await file.findOne({ _id: id });
        if (!matchedDocument) return { status: "Fail", message: `No match for file_id ${id}`, doc: {} }

        const fileDetails = { filename: matchedDocument.originalname, size: matchedDocument.file_size, path: getFilepath(matchedDocument.filename, matchTypes[matchedDocument.type] || undefined) };

        return { status: "Success", message: `Document match for file_id ${id}`, doc: fileDetails };
    }
    catch (error) {
        logError(error, "/users/share-file", "getFileDetails");
        return { status: "Fail", message: "Server Error", doc: {} }
    }
}

/**
 * Updates file and customer records after sharing a file via email.
 *
 * @async
 * @function runUpdates
 * @param {string} id - The file ID.
 * @param {string} sharedId - The ID of the sharing entry.
 * @param {string} user_id - The ID of the user sharing the file.
 * @param {Object} responseFromMailer - The response object from the mailer utility.
 * @returns {Promise<void>}
 */
const runUpdates = async (id, sharedId, user_id, responseFromMailer) => {
    try {
        await file.updateOne(
            { _id: id, "shared._id": sharedId },
            { $set: { "shared.$.status": "success" } }
        );

        await file.updateOne(
            { _id: id, "shared._id": sharedId },
            { $push: { "shared.$.recipients": { $each: responseFromMailer.recipients } } }
        );

        await customer.findOneAndUpdate({ _id: user_id }, {
            $push: { mailed: id }
        });
    } catch (error) {
        logError(error, "run updates", "runUpdates");
    }
}

/**
 * Queues the file sharing request for processing.
 *
 * @function queueRequestForProcessisng
 * @param {string} id - The file ID.
 * @param {string} user_id - The ID of the user sharing the file.
 * @param {string} sharedId - The ID of the sharing entry.
 * @param {Array.<string>} validRecipientEmails - Array of valid recipient emails.
 * @param {string} message - The message to send with the email.
 * @returns {void}
 */
const queueRequestForProcessisng = (id, user_id, sharedId, validRecipientEmails, message) => {
    setTimeout(async () => {
        try {
            const sender = await getCustomerDetails(user_id);
            const fileItem = await getFileObject(id);

            if ((fileItem.status === "Fail") || (sender.status === "Fail")) {
                await file.updateOne(
                    { id: id, "shared._id": sharedId },
                    { $set: { "shared.$.status": "failed" } }
                );
                return;
            }

            const responseFromMailer = await mailer.sendFilesViaEmail([fileItem.doc], validRecipientEmails, sender.doc.email, message);

            if (responseFromMailer.state === "Failed") {
                await file.updateOne(
                    { id: id, "shared._id": sharedId },
                    { $set: { "shared.$.status": "failed" } }
                );
                return;
            }

            await runUpdates(id, sharedId, user_id, responseFromMailer);
        } catch (error) {
            logError(error, "/users/share-file", "queueRequestForProcessisng");
            try {
                await file.updateOne(
                    { id: id, "shared._id": sharedId },
                    { $set: { "shared.$.status": "failed" } }
                );
            } catch (updateError) {
                logError(updateError, "Error update mailer status", "queueRequestForProcessisng");
            }
        }
    }, 0);
};

/**
 * Controller function to handle sharing a file via email.
 *
 * @async
 * @function shareFileController
 * @param {Object} req - The request object.
 * @param {string} req.body.id - The ID of the file to share.
 * @param {string} req.body.message - The message to include in the email.
 * @param {Array.<string>} req.body.recipients - Array of recipient emails.
 * @param {string} req.body.user_id - The ID of the user sharing the file.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
module.exports.shareFileController = async (req, res) => {
    const { id, message, recipients, user_id } = req.body;
    const validRecipientEmails = Array.isArray(recipients) ? recipients.filter((recipient) => (emailregexp.test(recipient))) : [];
    const invalidRecipientEmails = Array.isArray(recipients) ? recipients.filter((recipient) => (!emailregexp.test(recipient))) : [];

    if (validRecipientEmails.length === 0) return res.status(400).json({ message: "Invalid recipient emails" })

    res.status(202).json({ message: "Request is been processed", invalidRecipientEmails });
    try {
        const updatedFile = await file.findOneAndUpdate(
            { _id: id },
            {
                $push: {
                    shared: {
                        from: user_id,
                        recipients: recipients,
                        status: "pending"
                    }
                }
            },
            { new: true, useFindAndModify: false }
        );
        const sharedObj = updatedFile.shared[updatedFile.shared.length - 1]
        const sharedId = sharedObj._id;

        queueRequestForProcessisng(id, user_id, sharedId, validRecipientEmails, message);
    } catch (error) {
        logError(error, req.url, "shareFileController")
    }
}

/**
 * Adds a file to the user's favorites list.
 *
 * @async
 * @function addToFavorites
 * @param {Object} req - The request object.
 * @param {string} req.body.file_id - The ID of the file to add to favorites.
 * @param {string} req.body.user_id - The ID of the user whose favorites list is updated.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} JSON response indicating success or failure.
 * @throws {Object} Returns a JSON object with an error message if an unexpected error occurs.
 */
module.exports.addToFavorites = async (req, res) => {
    const { file_id, user_id } = req.body;

    if (!(isValidObjectId(file_id) && isValidObjectId(user_id))) {
        return res.status(400).json({ message: "Invalid file or object ids" });
    }

    try {
        await customer.updateOne({ _id: user_id }, {
            $push: { favourites: file_id }
        });

        return res.status(200).json({ message: "success" });

    } catch (error) {
        logError(error, req.url, "addToFavorites");
        return res.status(500).json({ message: "An unexpected error occured" });
    }
}

/**
 * Adds a file to the user's downloads and updates the file's download count.
 *
 * @async
 * @function addToDownloads
 * @param {Object} req - The request object.
 * @param {string} req.body.file_id - The ID of the file to add to downloads.
 * @param {string} req.body.user_id - The ID of the user who downloaded the file.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} JSON response indicating success or failure.
 * @throws {Object} Returns a JSON object with an error message if an unexpected error occurs.
 */
module.exports.addToDownloads = async (req, res) => {
    const { file_id, user_id } = req.body;

    if (!(isValidObjectId(file_id) && isValidObjectId(user_id))) {
        return res.status(400).json({ message: "Invalid file or object ids" });
    }

    try {
        await file.updateOne({ _id: file_id }, {
            $push: { downloads: user_id }
        });

        await customer.updateOne({ _id: user_id }, {
            $push: { downloads: file_id }
        });

        return res.status(200).json({ message: "success" });

    } catch (error) {
        logError(error, req.url, "addToFavorites");
        return res.status(500).json({ message: "An unexpected error occured" });
    }
}

/**
 * Updates the user's profile picture URL in the database.
 *
 * @async
 * @function updateProfilePicture
 * @param {Object} req - The request object.
 * @param {Object} req.verifiedUser - The verified user object containing user details.
 * @param {Object} req.file - The file object containing the uploaded profile picture.
 * @param {string} req.file.filename - The filename of the uploaded profile picture.
 * @param {string} req.params.old_filename - The old filename of the current profile picture.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} Redirects to the user's profile view on success or failure.
 * @throws {Object} Returns a JSON object with an error message if an unexpected error occurs.
 */
module.exports.updateProfilePicture = async (req, res) => {
    const { id } = req.verifiedUser;
    const { filename } = req.file;
    const { old_filename } = req.params;

    if (old_filename !== "null") {
        try {
            const current_userImagePath = path.join(__dirname, "..", "AT-FS", "images", "profile_pictures", old_filename);
            if (fs.existsSync(current_userImagePath)) fs.rm(current_userImagePath, (console.error))
        } catch (error) {
            logError(error, req.url, "updateProfilePicture~ delete_current_profilePicture");
            return res.status(500).redirect(`/users/views/profile/${id}`);
        }
    }

    try {
        const profilePicURL = `/files/users/images/profilePicurl/${filename}`
        await customer.updateOne({ _id: id }, {
            $set: {
                profilePicURL: profilePicURL
            }
        });

        return res.status(200).redirect(`/users/views/profile/${id}`);
    }
    catch (error) {
        logError(error, req.url, "updateProfilePicture");
        return res.status(500).redirect(`/users/views/profile/${id}`);
    }

}

/**
 * Updates the details of a customer in the database.
 *
 * @async
 * @function updateCustomerDetails
 * @param {Object} req - The request object.
 * @param {Object} req.params - The URL parameters object.
 * @param {string} req.params.id - The ID of the customer to update.
 * @param {string} req.params.v - The version of the customer document.
 * @param {Object} req.body - The request body object.
 * @param {string} req.body.firstname - The updated first name of the customer.
 * @param {string} req.body.lastname - The updated last name of the customer.
 * @param {string} req.body.username - The updated username of the customer.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} Redirects to the updated customer's profile view on success or failure.
 * @throws {Object} Returns a rendered error page if an invalid ID or version is provided, or if an unexpected error occurs.
 */
module.exports.updateCustomerDetails = async (req, res) => {
    const { id, v } = req.params;
    const { firstname, lastname, username } = req.body;

    if (!isValidObjectId(id) || !v) {
        return res.status(400).render('error', { code: 400, message: "An error occured while processing your request" });
    }

    try {
        await customer.findOneAndUpdate({ _id: id, __v: v }, {
            $set: {
                firstName: firstname,
                lastName: lastname,
                username: username
            }
        });

        return res.status(200).redirect(`/users/views/profile/${id}`);

    } catch (error) {
        logError(error, req.url, "updateCustomerDetails");
        return res.status(500).render({ code: 500, message: "Internal Server Error" });
    }
}