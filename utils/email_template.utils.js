/**
 * @file emailTemplates.js
 * @description This module contains functions to create email templates for various purposes such as verification codes, password resets, and file sharing.
 */


/**
 * Creates an email template for a verification code.
 * @param {string} verificationCode - The verification code to be included in the email.
 * @returns {string} The HTML email template as a string.
 */
function createEmailTemplateForVerificationCode(verificationCode) {
    const emailTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background-color: #007BFF;
                    color: #ffffff;
                    padding: 10px 0;
                    text-align: center;
                }
                .content {
                    padding: 20px;
                    font-size: 16px;
                    line-height: 1.5;
                    color: #333333;
                }
                .footer {
                    text-align: center;
                    padding: 10px;
                    font-size: 12px;
                    color: #777777;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${verificationCode}</h1>
                </div>
                <div class="content">
                    <p><bold>${verificationCode}</bold> is your AT-File Server verification code</p>
                </div>
                <div class="footer">
                    <p>&copy; 2024 AT-File Server. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
    return emailTemplate;
}


/**
 * Creates an email template for a password reset attempt.
 * @param {string} recipient_email - The email of the recipient.
 * @param {string} username - The username of the recipient.
 * @param {string} userId - The user ID of the recipient.
 * @param {boolean} admin - Indicates if the recipient is an admin.
 * @returns {string} The HTML email template as a string.
 */
function createEmailTemplateForPasswordResetAttempt(recipient_email, username, userId, admin) {
    const emailTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Password Reset</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border: 1px solid #dddddd;
                border-radius: 5px;
                overflow: hidden;
            }
            .header {
                background-color: #007bff;
                color: #ffffff;
                padding: 20px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
            }
            .content {
                padding: 20px;
            }
            .content p {
                font-size: 16px;
                line-height: 1.6;
                color: #333333;
            }
            .button {
                display: block;
                width: 200px;
                margin: 20px auto;
                padding: 10px;
                background-color: #007bff;
                color: #ffffff;
                text-align: center;
                text-decoration: none;
                border-radius: 5px;
            }
            .footer {
                background-color: #f4f4f4;
                color: #999999;
                padding: 10px;
                text-align: center;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Password Reset Request</h1>
            </div>
            <div class="content">
                <p>Hello ${username},</p>
                <p>We received a request to reset your password for yout AT File Server account with email ${recipient_email}</p>
                <p>Click the button below to reset it.</p>
                <a href="https://at-file-server.onrender.com/sessions/reset-user-password/${encodeURIComponent(admin)}/${encodeURIComponent(userId)}" class="button" >Reset Password</a>
                <p>If you did not request a password reset, please ignore this email or contact support if you have any questions.</p>
                <p>Thank you,<br>AT-File Server</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 AT File Server. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
`;

    return emailTemplate
}


/**
 * Creates an email template for password reset confirmation.
 * @returns {string} The HTML email template as a string.
 */
function createEmailTemplateForPasswordResetConfirmation () {
    const emailTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset Confirmation</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border: 1px solid #dddddd;
                    border-radius: 4px;
                }
                .header {
                    text-align: center;
                    padding: 10px 0;
                }
                .header img {
                    width: 100px;
                }
                .content {
                    padding: 20px;
                    text-align: center;
                }
                .content h1 {
                    color: #333333;
                }
                .content p {
                    color: #666666;
                    line-height: 1.6;
                }
                .footer {
                    text-align: center;
                    padding: 10px 0;
                    font-size: 12px;
                    color: #999999;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    margin: 20px 0;
                    background-color: #28a745;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 5px;
                }
                .button:hover {
                    background-color: #218838;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="https://at-file-server.onrender.com/files/favicon" alt="Our Logo">
                </div>
                <div class="content">
                    <h1>Password Reset Successful</h1>
                    <p>Hello,</p>
                    <p>Your password has been successfully reset. If you did not request this change, please contact our support team immediately.</p>
                    <a href="https://at-file-server.onrender.com/signin" class="button">Login to Your Account</a>
                </div>
                <div class="footer">
                    <p>If you have any questions, feel free to <a href="https://at-file-server.onrender.com/contact">Contact Us</a>.</p>
                    <p>&copy; 2024 AT File Server. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return emailTemplate
}

/**
 * Creates an email template for file sharing.
 * @param {string} username - The username of the sender.
 * @param {string} message - The custom message to be included in the email.
 * @returns {string} The HTML email template as a string.
 */
function createEmailTemplateForFileSharing(username, message) {
    const emailTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>File Sharing</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
                color: #333;
            }
            .container {
                max-width: 600px;
                margin: 50px auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                border-bottom: 1px solid #dddddd;
                padding-bottom: 20px;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                color: #007bff;
            }
            .message-body {
                margin: 20px 0;
                font-size: 16px;
                line-height: 1.6;
            }
            .attachments {
                margin: 20px 0;
            }
            .attachments ul {
                list-style-type: none;
                padding: 0;
            }
            .attachments li {
                background-color: #f9f9f9;
                margin: 5px 0;
                padding: 10px;
                border: 1px solid #dddddd;
                border-radius: 4px;
            }
            .footer {
                text-align: center;
                font-size: 14px;
                color: #777777;
                border-top: 1px solid #dddddd;
                padding-top: 10px;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${username} from AT-FS</h1>
            </div>
            <div class="message-body">
                <p>Hello,</p>
                <p>Message: <span id="customMessage">${message}</span></p>
            </div>
            <div class="footer">
                <p>&copy; 2024 AT-FS. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return emailTemplate;
}

module.exports = { createEmailTemplateForVerificationCode, createEmailTemplateForPasswordResetAttempt, createEmailTemplateForPasswordResetConfirmation, createEmailTemplateForFileSharing }
