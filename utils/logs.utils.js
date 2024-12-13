/**
 * @file logger.js
 * @description This module contains functions for logging errors and sessions, as well as utility functions for obtaining system date and time.
 */


const path = require('path');
const fs = require('fs');
const { MongooseError } = require('mongoose');


/**
 * Adds a superscript suffix to a number (e.g., 1st, 2nd, 3rd).
 * @param {number} num - The number to add a superscript to.
 * @returns {string} The number with the appropriate superscript suffix.
 */
function addSuperscript(num) {
    const j = num % 10,
        k = num % 100;
    if (j === 1 && k !== 11) {
        return num + "st";
    }
    if (j === 2 && k !== 12) {
        return num + "nd";
    }
    if (j === 3 && k !== 13) {
        return num + "rd";
    }
    return num + "th";
}


/**
 * Logs an error to the crash log file.
 * @param {Error} error - The error object to log.
 * @param {string} url - The URL where the error occurred.
 * @param {string} callFunction - The name of the function that called the logger.
 * @returns {number} Always returns 0.
 */
module.exports.logError = (error, url, callFunction) => {
    console.error(error)
    const stackTrace = error.stack;
    const errorCode = error.code || "Unknown";

    const logFilePath = path.join(__dirname, '..', 'logs', 'crash.log');
    const datestamp = this.getSystemDate();
    const timestamp = this.getSystemTime();

    const logDate = `${datestamp.day},${addSuperscript(datestamp.date)}-${datestamp.month}-${datestamp.year}`;
    const logTime = `${timestamp.hours}:${timestamp.minutes}:${timestamp.seconds}`;

    const crashLog = `${url}//:: ${logDate} at ${logTime} - CallingFunction:{${callFunction}}, Error Code: {${errorCode}}, message {${error.message}}\n Stack Trace:\n ${stackTrace}\n`;

    try { fs.appendFileSync(logFilePath, crashLog); }
    catch (error) { return console.log(error); }
    return 0;
};

/**
 * Logs a session to the session log file.
 * @param {string} username - The username of the session.
 * @param {string} ip - The IP address of the session.
 * @param {string} [status=""] - The status of the session (optional).
 */
module.exports.logSession = (username, ip, status = "") => {

    try {
        const logFilePath = path.join(__dirname, '..', 'logs', 'session.log');

        const datestamp = this.getSystemDate()
        const timestamp = this.getSystemTime()

        const logDate = `${datestamp.day},${addSuperscript(datestamp.date)}-${datestamp.month}-${datestamp.year}`;
        const logTime = `${timestamp.hours}:${timestamp.minutes}:${timestamp.seconds}`;

        const sessionLog = `${status.toUpperCase()}//:: ${logDate} at ${logTime} - Username:{${username}}, IP:= {${ip}}\n`;

        fs.appendFileSync(logFilePath, sessionLog);

    } catch (error) {
        console.error('Error logging session:', error);
    }
}


/**
 * Gets the current system date.
 * @returns {Object} An object containing the current day, date, month, and year.
 */
module.exports.getSystemDate = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const date = new Date();

    return {
        day: days[date.getDay()],
        date: date.getDate(),
        month: months[date.getMonth()],
        year: date.getFullYear()
    };
}

/**
 * Gets the current system time.
 * @returns {Object} An object containing the current hours, minutes, and seconds, each padded to two digits.
 */
module.exports.getSystemTime = () => {
    const time = new Date();

    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    return {
        hours: hours < 10 ? "0" + hours : hours,
        minutes: minutes < 10 ? "0" + minutes : minutes,
        seconds: seconds < 10 ? "0" + seconds : seconds
    }
}