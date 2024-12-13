/**
 * @file process.mailer.utils.js
 * @description This script creates a child process for sending emails using nodemailer.
 */

const nodemailer = require("nodemailer");
const { getEmailAuthCredentials } = require('../requireStack');
const EMAIL_AUTH = getEmailAuthCredentials();

/**
 * Event listener for the 'message' event on the process object.
 * This event is triggered when a message is sent to the child process.
 * @param {Object} options - The mail options object containing email details.
 */
process.on('message', async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { ...EMAIL_AUTH }
        });

        const response = await transporter.sendMail(options);

        process.send({ status: "success", response: response });
    } catch (error) {
        process.send({ status: "failed", response: error })
    }
});