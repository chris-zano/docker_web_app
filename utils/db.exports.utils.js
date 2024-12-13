/**
 * @file models.js
 * @description This module provides access to various Mongoose models used in the application.
 */

const adminsModel = require("../models/admins.model");
const codesModel = require("../models/codes.model");
const customersModel = require("../models/customers.model");
const fileModel = require("../models/files.model");

/**
 * Provides the Admins model.
 * @returns {Model} The Mongoose model for admins.
 */
const Admins = () => adminsModel;

/**
 * Provides the Customers model.
 * @returns {Model} The Mongoose model for customers.
 */
const Customers = () => customersModel;

/**
 * Provides the Codes model.
 * @returns {Model} The Mongoose model for codes.
 */
const Codes = () => codesModel;

/**
 * Provides the Files model.
 * @returns {Model} The Mongoose model for files.
 */
const Files = () => fileModel;

module.exports = { Admins, Customers, Codes, Files };
