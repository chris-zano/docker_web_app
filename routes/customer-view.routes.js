const express = require("express");
const { renderGettinStartedPage, renderSigninPage, renderStoreForUsers, renderPasswordResetPage, renderUserViews } = require("../controllers/view.controller");
const { verifyUserbyId } = require("../utils/users.verify.utils");
const router = express.Router();

//customer views
router.get('/', renderGettinStartedPage);
router.get('/signin', renderSigninPage);
router.get('/users/views/:pageUrl/:id', verifyUserbyId, renderUserViews)
router.get('/recovery', (req, res) => res.render("accounts/forgot-password.ejs", { error: "empty" }));

module.exports = router;