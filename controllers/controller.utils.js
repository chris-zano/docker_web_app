/**
 * @module controllerUtilities
 */

const mongoose = require('mongoose');

const randomstring = require("randomstring");
const crypto = require('crypto');

/**
 * Generates a temporary ID.
 * 
 * @function generateTempId
 * @returns {string} - A UUID.
 */
const generateTempId = () => {
    return crypto.randomUUID();
}

/**
 * Generates a verification code.
 * 
 * @function generateVerificationCode
 * @returns {string} - A 6-character alphanumeric verification code.
 */
const generateVerificationCode = () => {
    return randomstring.generate({
        length: 6,
        charset: 'alphanumeric'
    });
}

/**
 * Check if the matched request route include a string
 * 
 * @function matchBaseStringToSubstring
 * @param {string} baseString - the string to match
 * @param {string} subString - the string to match
 * @returns {Boolean} - returns true if there is a match otherwise returns false  
 */
const matchBaseStringToSubstring = (baseString = "", subString = "") => {
    return baseString.includes(subString);
}


/**
 * Checks if a given string is a valid MongoDB ObjectId.
 *
 * @function isValidObjectId
 * @param {string} id - The ID to check.
 * @returns {boolean} Returns true if the ID is a valid ObjectId; false otherwise.
 */
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

module.exports = {
    generateTempId,
    generateVerificationCode,
    matchBaseStringToSubstring,
    isValidObjectId
}