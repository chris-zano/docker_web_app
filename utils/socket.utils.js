/**
 * @file socket.utils.js
 * @description Utility functions for setting up and handling Socket.IO server events.
 */

const socketIo = require('socket.io');

const { Files } = require('./db.exports.utils');
const file = Files();

/**
 * Runs a database query based on the provided search criteria.
 * @param {string} queryString - The string to search for in the database.
 * @param {string} [type=""] - The type of file to filter the search by.
 * @returns {Promise<Array>} - A promise that resolves to an array of query results.
 */
const runQuery = async (queryString, type = "") => {
    const regex = new RegExp(queryString, "i");

    // base query
    const queryObject = {
        $and: [
            { visibility: "public" },
            {
                $or: [
                    { title: { $regex: regex } },
                    { description: { $regex: regex } },
                    { originalname: { $regex: regex } }
                ]
            }
        ]
    };

    // Add the type condition if provided
    if (type !== "") {
        queryObject.$and.push({ type: type });
    }

    try {
        const queryResults = await file.find(queryObject);

        if (!queryResults) return [];

        return queryResults;
    } catch (error) {
        console.log(error);
        return []
    }
}

/**
 * Handles search input from the client and executes corresponding database queries.
 * @param {Object} input - The search input object containing category and searchInput.
 * @returns {Promise<Object>} - A promise that resolves to an object containing search results.
 */
const handleSearchInputFromClient = async (input) => {
    if (!input || Object.keys(input).length !== 2) return { data: [] };
    const { category, searchInput } = input;
    if (!category || !searchInput) return { data: [] };

    const categoryToMethodMap = {
        all: () => runQuery(searchInput),
        images: () => runQuery(searchInput, 'Image File'),
        pdf: () => runQuery(searchInput, 'PDF Document'),
        doc: () => runQuery(searchInput, 'Word Document')
    };
    const queryMethod = categoryToMethodMap[category];
    if (!queryMethod) return { data: [] };

    return { data: await queryMethod() };
}

/**
 * Sets up a WebSocket server using Socket.IO on the provided HTTP server instance.
 * @param {Object} server - The HTTP server instance to attach Socket.IO to.
 * @returns {Object} - The Socket.IO server instance.
 */
const setupWebSocketServer = (server) => {
    const io = socketIo(server);

    io.on('connection', (socket) => {
        console.log('Socket.IO client connected');

        socket.on('search', async (input) => {
            //handle search input
            const searchResults = await handleSearchInputFromClient(input);
            socket.emit("searchResults", { type: "results", results: searchResults });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    return io;
}

module.exports = setupWebSocketServer;
