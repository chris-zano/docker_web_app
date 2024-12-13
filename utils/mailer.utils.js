/**
 * @file email.utils.js
 * @description This module provides utility functions for sending emails related to user verification, password resets, and file sharing.
 */

const path = require('path')
const { createEmailTemplateForVerificationCode, createEmailTemplateForPasswordResetAttempt, createEmailTemplateForPasswordResetConfirmation, createEmailTemplateForFileSharing } = require("./email_template.utils");
const { logError } = require("./logs.utils");
const { fork } = require('child_process');
const codesModel = require('../models/codes.model');
const Code = codesModel;


const EMAIL_REGEXP = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * Returns the regular expression used to validate email addresses.
 * @returns {RegExp} The regular expression for email validation.
 */
module.exports.emailRegexp = () => {
    return EMAIL_REGEXP;
}

const system_email = "niicodes.teamst0199@gmail.com";

/**
 * Sends an email using a child process.
 * @param {Object} options - The email options.
 * @param {string} options.from - The email sender.
 * @param {string|string[]} options.to - The email recipient(s).
 * @param {string} options.subject - The email subject.
 * @param {string} options.html - The email HTML content.
 * @returns {Promise<Object>} A promise that resolves to the email response.
 */
const transportMail = async (options) => {

    // fork a child process and parse the options as argument
    return new Promise((resolve, reject) => {
        const child = fork(path.join(__dirname, 'process.mailer.utils.js'))
        console.log("A new child process has been forked with pid of: ", child.pid);
        // console.log(options);

        child.send(options);

        child.on("message", (results) => {
            //kill the child
            child.kill();

            if (results.status === "success") {
                resolve(results.response);
            }
            else {
                reject(results.response);
            }
        });

        child.on("error", (error) => {
            //kill the child
            child.kill();
            reject(error);
        });
    })
}

/**
 * Sends a verification code to the specified email address.
 * @param {string} recipient_email - The recipient's email address.
 * @param {string} verificationCode - The verification code to send.
 * @param {string} tempId - The temporary ID associated with the verification code.
 * @returns {Promise<Object>} The status and result of the email operation.
 */
module.exports.sendVerificationCode = async (recipient_email, verificationCode, tempId) => {

    if (!(EMAIL_REGEXP.test(recipient_email))) {
        return {
            operationStatus: "Failed",
            message: "Invalid Email",
            accepted: []
        }
    }

    const options = {
        from: system_email,
        to: recipient_email,
        subject: "(AT-File Server): Here is your verification code!",
        html: createEmailTemplateForVerificationCode(verificationCode)
    }

    try {
        transportMail(options).then(async (response) => {
            if (response.accepted.length != 0 && response.rejected.length === 0) {
                try {
                    const new_code_entry = new Code({ recipient_email: response.accepted[0], code: verificationCode, tempId: tempId });
                    await new_code_entry.save();
                }
                catch (error) {
                    return {
                        operationStatus: "Failed",
                        message: error,
                        accepted: []
                    }
                }
            }
            else {

                return {
                    operationStatus: "Failed",
                    message: "Email address is invalid",
                    accepted: []
                }
            }
        }).catch((error) => {
            console.log(error)
            return {
                operationStatus: "Failed",
                message: error,
                accepted: []
            }
        })
    }
    catch (error) {
        logError(error, "/system/mail-verification-code", "transportMail(options:any)");
        return {
            operationStatus: "Failed",
            message: "Invalid Email",
            accepted: []
        }
    }
}

/**
 * Alerts a user of a password reset attempt.
 * @param {string} recipient_email - The recipient's email address.
 * @param {string} username - The username of the account.
 * @param {string} userId - The user ID of the account.
 * @param {boolean} admin - Indicates if the reset attempt was by an admin.
 * @returns {Promise<Object|null>} The email response or null if an error occurred.
 */
module.exports.alertUserOfPasswordResetAttempt = async (recipient_email, username, userId, admin) => {
    if (!(EMAIL_REGEXP.test(recipient_email))) {
        return {
            operationStatus: "Failed",
            message: "Invalid Email"
        }
    }

    const options = {
        from: system_email,
        to: recipient_email,
        subject: "(AT-File Server): Password Reset Attempt",
        html: createEmailTemplateForPasswordResetAttempt(recipient_email, username, userId, admin)
    }

    try {
        const response = await transportMail(options);
        return {
            messageId: response.messageId,
            recipient_email: response.accepted,
        }
    }
    catch (error) {
        logError(error, "/system/mail-verification-code", "transportMail(options:any)");
        return null;
    }
}

/**
 * Informs a user of a successful password reset.
 * @param {string} recipient_email - The recipient's email address.
 * @returns {Promise<Object|null>} The email response or null if an error occurred.
 */
module.exports.informUserOfSuccessfulPasswordReset = async (recipient_email) => {
    if (!(EMAIL_REGEXP.test(recipient_email))) {
        return {
            operationStatus: "Failed",
            message: "Invalid Email"
        }
    }

    const options = {
        from: system_email,
        to: recipient_email,
        subject: "(AT-File Server): Your Password Has Been Changed",
        html: createEmailTemplateForPasswordResetConfirmation()
    }

    try {
        const response = await transportMail(options);
        return {
            messageId: response.messageId,
            recipient_email: response.accepted,
        }
    }
    catch (error) {
        logError(error, "/system/mail-verification-code", "transportMail(options:any)");
        return null;
    }
}

/**
 * Validates if the provided file object has the required structure and values.
 * @param {Object} fileObject - The file object to validate.
 * @param {string} fileObject.filename - The name of the file.
 * @param {string} fileObject.path - The path to the file.
 * @param {string} fileObject.size - The size of the file.
 * @returns {boolean} True if the file object is valid, false otherwise.
 */
const isFileObjectValid = (fileObject = { filename: "", path: "", size: "" }) => {
    const expectedkeys = ["filename", "path", "size"];
    const objectkeys = Object.keys(fileObject);

    if (objectkeys.length !== expectedkeys.length) return false

    for (const key of expectedkeys)
        if (!(fileObject.hasOwnProperty(key))) return false;

    if (typeof fileObject.filename !== 'string' || fileObject.filename.length === 0) return false;

    if (typeof fileObject.path !== 'string' || fileObject.path.length === 0) return false;

    if (typeof fileObject.size !== 'string' || fileObject.size.length === 0) return false;

    if (path.resolve(fileObject.path) !== fileObject.path) return false

    return true;

}

/**
 * Sends files via email to the specified recipients.
 * @param {Object[]} fileObjects - The array of file objects to send.
 * @param {string[]} recipients - The email addresses of the recipients.
 * @param {string} [username="ATFS_user"] - The username of the sender.
 * @param {string} [message=""] - The message to include in the email.
 * @returns {Promise<Object>} The status and result of the email operation.
 */
module.exports.sendFilesViaEmail = async (fileObjects = [], recipients = [], username = "ATFS_user", message = "") => {
    if (!Array.isArray(fileObjects) || !Array.isArray(recipients) || fileObjects.length === 0 || recipients.length === 0) {
        return {
            state: "Failed",
            message: "[ ArgumentError ] :: Invalid arguments",
            recipients: undefined,
            rejected: undefined
        };
    }

    const validFileObjects = fileObjects.filter((obj) => isFileObjectValid(obj));
    if (validFileObjects.length === 0) {
        return {
            state: "Failed",
            message: "[ ArgumentError ] :: No valid file objects",
            recipients: undefined,
            rejected: undefined
        };
    }

    const defaultMessage = "Please find the attached files below. If you have any questions, feel free to reach out."
    const finalMessage = message.length === 0 ? defaultMessage : message;

    const options = {
        from: system_email,
        to: recipients,
        subject: "(AT-File Server): A File Has Been Shared With You",
        html: createEmailTemplateForFileSharing(username, finalMessage),
        attachments: fileObjects.map((file) => (
            {
                filename: file.filename,
                path: file.path
            }
        ))
    }

    try {
        const response = await transportMail(options);
        return {
            state: "Success",
            message: response.messageId,
            recipients: response.accepted,
            rejected: response.rejected
        }
    }
    catch (error) {
        logError(error, "/users/share-file", "sendFilesViaEmail");
        return {
            state: "Failed",
            message: "[ ServerError ] :: Unable to send email",
            recipients: undefined,
            rejected: undefined
        };
    }
}