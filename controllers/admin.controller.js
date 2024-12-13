/**
 * @module ProfileController
 */

const { Admins, Files } = require("../utils/db.exports.utils");
const { logError } = require("../utils/logs.utils");
const admin = Admins();
const file = Files()

const fs = require("fs");
const path = require("path");

/**
 * Updates the profile picture of an admin.
 * 
 * @async
 * @function updateProfilePicture
 * @param {Object} req - The request object.
 * @param {Object} req.verifiedUser - Verified user information.
 * @param {string} req.verifiedUser.id - The ID of the verified user.
 * @param {Object} req.file - The uploaded file information.
 * @param {string} req.file.filename - The new filename of the profile picture.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.old_filename - The old filename of the profile picture.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
module.exports.updateProfilePicture = async (req, res) => {
    const { id } = req.verifiedUser;
    const { filename } = req.file;
    const { old_filename } = req.params;

    if (old_filename !== "null") {
        try {
            const current_userImagePath = path.join(__dirname, "..", "AT-FS", "images", "profile_pictures", old_filename);
            if (fs.existsSync(current_userImagePath)) fs.rm(current_userImagePath, (err) => { if (err) console.error(err); });
        } catch (error) {
            logError(error, req.url, "updateProfilePicture~ delete_current_profilePicture");
            return res.status(500).redirect(`/admin/views/profile/${id}`);
        }
    }

    try {
        const profilePicURL = `/files/users/images/profilePicurl/${filename}`
        await admin.updateOne({ _id: id }, {
            $set: {
                profilePicURL: profilePicURL
            }
        });

        return res.status(200).redirect(`/admin/views/profile/${id}`);
    }
    catch (error) {
        logError(error, req.url, "updateProfilePicture");
        return res.status(500).redirect(`/admin/views/profile/${id}`);
    }

}

/**
 * Updates the username of an admin.
 * 
 * @async
 * @function updateAdminUsername
 * @param {Object} req - The request object.
 * @param {Object} req.verifiedUser - Verified user information.
 * @param {string} req.verifiedUser.id - The ID of the verified user.
 * @param {number} req.verifiedUser.v - The version number of the verified user.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.username - The new username.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
module.exports.updateAdminUsername = async (req, res) => {
    const { id, v } = req.verifiedUser;
    const { username } = req.body;

    if (!id) return res.status(403).render('error', { error: "unauthorized access", status: 403 });

    try {
        await admin.updateOne({ _id: id, __v: v }, {
            $set: {
                username: username
            },
            $inc: {
                __v: 1
            }
        })
    } catch (error) {
        logError(error, req.url, "updateAdminUsername");
        return res.status(500).redirect(`/admin/views/profile/${id}`);
    }

    return res.status(200).redirect(`/admin/views/profile/${id}`);
}

/**
 * Uploads and stores a file.
 * 
 * @async
 * @function uploadStoreFile
 * @param {Object} req - The request object.
 * @param {Object} req.file - The uploaded file information.
 * @param {string} req.file.filename - The filename of the uploaded file.
 * @param {string} req.file.originalname - The original name of the uploaded file.
 * @param {string} req.file.mimetype - The MIME type of the uploaded file.
 * @param {string} req.file.encoding - The encoding of the uploaded file.
 * @param {number} req.file.size - The size of the uploaded file.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.title - The title of the file.
 * @param {string} req.body.description - The description of the file.
 * @param {string} req.body.visibility - The visibility status of the file.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.fileType - The type of the file.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
module.exports.uploadStoreFile = async (req, res) => {
    const { filename, originalname, mimetype, encoding, size } = req.file,
        { title, description, visibility } = req.body,
        { fileType } = req.params,
        admin_id = req.verifiedUser.id,
        file_size = `${(size / (1024 * 1024)).toFixed(2)}MB`,
        filePathUrl = `/files/store/${fileType}/${filename}`;

    const matchFileTypeString = { 'image': "Image File", 'pdf': "PDF Document", 'doc': "Word Document" };
    const typeofFile = matchFileTypeString[fileType];
    if (!typeofFile) return res.status(400).redirect(`/admin/views/uploads/${admin_id}`);
    const fileObject = { admin_id, title, description, filename, originalname, mimetype, encoding, file_size, filePathUrl, type: typeofFile, visibility };

    try {
        const newFileDocument = new file(fileObject);
        await newFileDocument.save();

        return res.status(200).redirect(`/admin/views/uploads/${admin_id}`);

    } catch (error) {
        logError(error, req.url, "uploadStoreFile");
        return res.status(500).redirect(`/admin/views/uploads/${admin_id}`);
    }
}

/**
 * Updates the contents of an existing file.
 * 
 * @async
 * @function updateFileContents
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.file_id - The ID of the file to update.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.title - The new title of the file.
 * @param {string} req.body.description - The new description of the file.
 * @param {string} req.body.visibility - The new visibility status of the file.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
module.exports.updateFileContents = async (req, res) => {
    const { file_id } = req.params;
    const { title, description, visibility } = req.body;
    try {
        await file.updateOne({ _id: file_id }, {
            $set: {
                title: title,
                description: description,
                visibility: visibility
            },
            $inc: {
                __v: 1
            }
        });
    }
    catch (error) {
        logError(error, req.url, "updateFileContents");
        res.status(500).redirect(`/admin/views/dashboard/${req.verifiedUser.id}`);
    }
    return res.status(200).redirect(`/admin/views/dashboard/${req.verifiedUser.id}`)
}

const getFilePathByType = (filename = "", type = "") => {
    if (!filename || !type) return null;

    return path.join(__dirname, "..", "AT-FS", type, `store_${type}`, filename);
}

const deleteFile = async (fileId, filename) => {
    try {
        await file.deleteOne({ _id: fileId, filename: filename });
        return true
    } catch (error) {
        logError(error, "/admin/delete-file/:id/", "deleteFile");
        console.log(error);
        return false
    }
}

/**
 * Deletes a file by its ID.
 * 
 * @async
 * @function deleteOneFile
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.file_id - The ID of the file to delete.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
module.exports.deleteOneFile = async (req, res) => {
    const fid = decodeURIComponent(req.query.fid)
    const fname = decodeURIComponent(req.query.fname)
    const ftype = decodeURIComponent(req.query.ftype);

    const fileTypetofunction = { "Image File": 'images', "PDF Document": 'pdfs', "Word Document": 'docs' };
    const fPath = getFilePathByType(fname, fileTypetofunction[ftype]);

    if (!fPath) return res.status(400).json({ message: "Filename and Type must be provided" });

    try {
        let deleteFileStatus;
        if (!(fs.existsSync(fPath))) deleteFileStatus = await deleteFile(fid, fname);
        else {
            fs.rm(fPath, (err) => { if (err) console.error(err); });
            deleteFileStatus = await deleteFile(fid, fname);
        }

        if (!deleteFileStatus) return res.status(500).json({ message: "operation failed" });

        return res.status(200).json({ message: "success" });
    } catch (error) {
        logError(error, req.url, "deleteOneFile");
        return res.status(500).json({ message: "An unexpected error occured. Failed to delete" });
    }
}