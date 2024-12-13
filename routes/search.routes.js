const express = require("express");
const { verifyUserBySession } = require("../utils/users.verify.utils");
const { renderSearchPage, renderResultPage } = require("../controllers/search.controller");
const router = express.Router();

router.get("/global/views/search/:session/:id", verifyUserBySession, renderSearchPage);
router.get("/search/view-item/:session/:id/:file_id", verifyUserBySession, renderResultPage);

module.exports = router;