/**
 * @file password.utils.js
 * @description This module provides utility functions for hashing and comparing passwords using bcrypt.
 */

const bcrypt = require('bcrypt');

/**
 * Hashes a given password using bcrypt.
 * @param {string} password - The password to hash.
 * @returns {Promise<Object>} A promise that resolves to an object containing the salt, hashed password, and any error that occurred.
 */
const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        return { salt, hashedPassword, error: null };
    } catch (error) {
        console.log(error);
        return { salt: null, hashedPassword: null, error: error }
    }
}

/**
 * Compares a given password with a hashed password using bcrypt.
 * @param {string} password - The plain text password to compare.
 * @param {string} hashedPassword - The hashed password to compare against.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the passwords match.
 */
const comparePassword = async (password, hashedPassword) => {
    try {
        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    } catch (error) {
        console.log(error);
        return false;
    }
}


module.exports = { hashPassword, comparePassword };