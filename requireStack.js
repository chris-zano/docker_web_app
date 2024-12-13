/**
 * @file requireStack.js
 * @description This module sets up the web socket server and includes all route configurations.
 */

const setupWebSocketServer = require('./utils/socket.utils');
require('dotenv').config();

/**
 * Sets up and executes all required routes and utilities for the application.
 * @param {object} app - The Express application instance.
 * @param {object} server - The HTTP server instance.
 */
module.exports.callAndExecuteRequireStack = (app, server) => {
     const io = setupWebSocketServer(server);
     //require routes here
     const adminViewRoutes = require('./routes/admin-view.routes');
     const adminRoutes = require('./routes/admin.routes');
     const customerViewRoutes = require('./routes/customer-view.routes');
     const fileRoutes = require('./routes/files.routes');
     const signinRoutes = require("./routes/signin.routes");
     const authRoutes = require('./routes/auth.routes');
     const recoveryRoutes = require('./routes/recovery.routes');
     const userRoutes = require('./routes/user.routes');
     const searchRoutes = require('./routes/search.routes');


     //use routes here
     app.use(authRoutes);
     app.use(adminViewRoutes);
     app.use(adminRoutes);
     app.use(customerViewRoutes);
     app.use(fileRoutes);
     app.use(signinRoutes);
     app.use(recoveryRoutes);
     app.use(userRoutes);
     app.use(searchRoutes);
};

/**
 * Retrieves email authentication credentials from environment variables.
 * @returns {object} The email authentication credentials.
 */
module.exports.getEmailAuthCredentials = () => {
     const EMAIL_AUTH = {
          user: process.env.SYSTEM_EMAIL,
          pass: process.env.SYSTEM_EMAIL_PASSWORD
     };

     return EMAIL_AUTH;
};