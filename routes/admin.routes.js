const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

const { verifyAdminbyId } = require('../utils/users.verify.utils');
const { updateProfilePicture, uploadStoreFile, updateAdminUsername, updateFileContents, deleteOneFile } = require('../controllers/admin.controller');

const profilePicUploadsPath = multer({
    dest: path.join(__dirname, "..", "AT-FS", "images", "profile_pictures")
});

const storagePaths = {
    image: path.join(__dirname, "..", "AT-FS", "images", "store_images"),
    pdf: path.join(__dirname, "..", "AT-FS", "pdfs", "store_pdfs"),
    doc: path.join(__dirname, "..", "AT-FS", "docs", "store_docs")
};

const uploadMiddleware = {
    image: multer({ dest: storagePaths.image }),
    pdf: multer({ dest: storagePaths.pdf }),
    doc: multer({ dest: storagePaths.doc })
};

const dynamicMulterMiddleware = (req, res, next) => {
    const { fileType } = req.params;
    const upload = uploadMiddleware[fileType];

    if (!upload) {
        return res.status(400).send("Invalid file type");
    }

    upload.single("fileUpload")(req, res, next);
};

router.post("/admin/profile/update-component/profile-picture/:id/:old_filename/", verifyAdminbyId, profilePicUploadsPath.single("profile_picture"), updateProfilePicture);
router.post("/admin/profile/update-component/username/:id/:v", verifyAdminbyId, updateAdminUsername);
router.post("/admin/store/uploads/:visibility/:fileType/:id", verifyAdminbyId, dynamicMulterMiddleware, uploadStoreFile);

router.post("/admin/edit-file-contents/:file_id/:id", verifyAdminbyId, updateFileContents);
router.get("/admin/delete-file/:id/", verifyAdminbyId, deleteOneFile);

module.exports = router;