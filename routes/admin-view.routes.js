const express = require("express");
const { renderAminSigninPage, renderAdminViews } = require("../controllers/view.controller");
const usersVerifyUtils = require("../utils/users.verify.utils");
const { logError } = require("../utils/logs.utils");
const router = express.Router();

router.get("/error/:code/:url/:error", (req, res) => {
    logError(req.params.error, req.params.url, "router.get(/error/:code/:url/:error");
    res.render("error", {code: req.params.code, message: `Bad Request:: [${req.params.error}]`})
})

//admin views
router.get('/admin/signin', renderAminSigninPage);
router.get('/admin/views/:pageUrl/:id/',usersVerifyUtils.verifyAdminbyId, renderAdminViews);

module.exports = router;