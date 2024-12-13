/**
 * @file serveFiles.utils.js
 * @description Utility functions to serve various types of files over HTTP.
 */

const fs = require("fs");
const path = require("path");

const DEFAULT_PROFILE_IMAGE = path.resolve(__dirname, "..", "public", "assets", "images", "user_blank.png")

/**
 * Middleware to serve JavaScript scripts.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 * @throws {Error} 404 - If script file is not found.
 * @throws {Error} 500 - Internal server error.
 */
module.exports.serveScripts = (req, res) => {
    try {
        if (req.params.filename) {
            const scriptFilePath = path.join(__dirname, "..", "public", "js", req.params.directory, req.params.filename);

            if (!(fs.existsSync(scriptFilePath))) {
                return res.status(404);
            }

            res.type("text/javascript");
            res.set("Cache-Control", "public, max-age=86400");
            res.status(200);
            return fs.createReadStream(scriptFilePath).pipe(res);
        }
        else {
            return res.status(404);
        }
    } catch (error) {
        console.log(error);
        return res.status(500);
    }
}

/**
 * Middleware to serve CSS stylesheets.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 * @throws {Error} 404 - If stylesheet file is not found.
 * @throws {Error} 500 - Internal server error.
 */
module.exports.serveStyleSheets = (req, res) => {
    try {
        if (req.params.filename) {
            const { directory, filename } = req.params;
            const styleSheetFilePath = path.join(__dirname, "..", "public", "css", directory, filename);

            if (!(fs.existsSync(styleSheetFilePath))) {
                return res.status(404).end();
            }

            res.type("css");
            res.set("Cache-Control", "public, max-age=86400");
            res.status(200);
            return fs.createReadStream(styleSheetFilePath).pipe(res);
        }
        else {
            return res.status(404);
        }
    } catch (error) {
        console.log(error);
        return res.status(500);
    }
}

/**
 * Middleware to serve font files.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 * @throws {Error} 404 - If font file is not found.
 * @throws {Error} 500 - Internal server error.
 */
module.exports.serveTypeface = (req, res) => {
    try {
        const { filename } = req.params;
        if (filename) {
            const typefaceFilePath = path.join(__dirname, "..", "public", "assets", "fonts", filename);

            if (!(fs.existsSync(typefaceFilePath))) {
                return res.status(404);
            }

            res.type("font/ttf");
            res.set("Cache-Control", "public, max-age=86400");
            res.status(200);
            return fs.createReadStream(typefaceFilePath).pipe(res);
        }
        else {
            return res.status(404)
        }
    } catch (error) {
        console.log(error);
        return res.status(500);
    }
}

/**
 * Middleware to serve favicon.ico.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 * @throws {Error} 404 - If favicon.ico file is not found.
 * @throws {Error} 500 - Internal server error.
 */
module.exports.serveFavicon = (req, res) => {
    try {
        const faviconFilePath = path.join(__dirname, "..", "public", "assets", "icons", 'favicon.ico');

        if (!(fs.existsSync(faviconFilePath))) {
            return res.status(404)
        }

        res.set('Cache-Control', 'public, max-age=86400');
        res.type('image/x-icon');
        return fs.createReadStream(faviconFilePath).pipe(res);
    } catch (error) {
        console.log(error);
        return res.status(500);
    }
}

/**
 * Middleware to serve system images
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 * @throws {Error} 404 - If file is not found.
 * @throws {Error} 500 - Internal server error.
 */
module.exports.serveSystemImages = (req, res) => {
    try {
        const { filename } = req.params;
        if (filename) {
            const systemImagesFilePath = path.join(__dirname, "..", "public", "assets", "images", filename);

            if (!(fs.existsSync(systemImagesFilePath))) {
                return res.status(404)
            }

            res.set('Cache-Control', 'public, max-age=86400');
            res.type('png');
            return fs.createReadStream(systemImagesFilePath).pipe(res);
        }
        else {
            return res.status(404)
        }
    } catch (error) {
        console.log(error);
        return res.status(500);
    }
}

/**
 * Middleware to serve user profile pictures.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 * @throws {Error} 404 - If  file is not found.
 * @throws {Error} 500 - Internal server error.
 */
module.exports.serveUserProfilePictures = (req, res) => {
    try {
        const { filename } = req.params;
        if (filename) {
            const userImagePath = path.join(__dirname, "..", "AT-FS", "images", "profile_pictures", filename);

            if (!(fs.existsSync(userImagePath))) {
                res.type("png");
                res.status(404)
                return fs.createReadStream(DEFAULT_PROFILE_IMAGE).pipe(res);
            }

            res.set('Cache-Control', 'public, max-age=86400');
            res.type('png');
            res.status(200);
            return fs.createReadStream(userImagePath).pipe(res);
        }
        else {
            return res.status(404);
        }
    } catch (error) {
        console.log(error);
        return res.status(500);
    }
}

/**
 * Middleware to serve store images
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 * @throws {Error} 404 - If file is not found.
 * @throws {Error} 500 - Internal server error.
 */
module.exports.serveStoreImages = (req, res) => {
    try {
        const { filename } = req.params;
        if (filename) {
            const filePath = path.join(__dirname, "..", "AT-FS", "images", "store_images", filename);

            if (!(fs.existsSync(filePath))) {
                res.type("png");
                res.status(404)
                return fs.createReadStream(DEFAULT_PROFILE_IMAGE).pipe(res);
            }

            res.set('Cache-Control', 'public, max-age=86400');
            res.type('png');
            res.status(200);
            return fs.createReadStream(filePath).pipe(res);
        }
        else {
            return res.status(404);
        }
    } catch (error) {
        console.log(error);
        return res.status(500);
    }
}

/**
 * Middleware to serve PDF files.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 * @throws {Error} 404 - If PDF file is not found.
 * @throws {Error} 500 - Internal server error.
 */
module.exports.serveStorePDF = (req, res) => {
    try {
        const { filename } = req.params;
        if (filename) {
            const filePath = path.join(__dirname, "..", "AT-FS", "pdfs", "store_pdfs", filename);

            if (!(fs.existsSync(filePath))) {
                res.type("png");
                res.status(404);
                return fs.createReadStream(DEFAULT_PROFILE_IMAGE).pipe(res);
            }

            res.set('Cache-Control', 'public, max-age=86400');
            res.type('application/pdf');
            res.status(200);
            return fs.createReadStream(filePath).pipe(res);
        } else {
            return res.status(404).end();
        }
    } catch (error) {
        console.error(error);
        return res.status(500).end();
    }
};

/**
 * Middleware to serve Word document files.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 * @throws {Error} 404 - If Word document file is not found.
 * @throws {Error} 500 - Internal server error.
 */
module.exports.serveStoreWordDoc = (req, res) => {
    try {
        const { filename } = req.params;
        if (filename) {
            const filePath = path.join(__dirname, "..", "AT-FS", "docs", "store_docs", filename);

            if (!(fs.existsSync(filePath))) {
                res.type("png");
                res.status(404);
                return fs.createReadStream(DEFAULT_PROFILE_IMAGE).pipe(res);
            }

            res.set('Cache-Control', 'public, max-age=86400');
            res.type('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.status(200);
            return fs.createReadStream(filePath).pipe(res);
        } else {
            return res.status(404).end();
        }
    } catch (error) {
        console.error(error);
        return res.status(500).end();
    }
};