const express = require("express");
const { verifyEmail, verifyCode, loginHandler, setNewPasswordAndCreateUser } = require("../controllers/signin.controller");
const router = express.Router();

//signin routes
router.post('/:user/login', loginHandler);
router.post('/:user/signup/initiate', verifyEmail);
router.post('/:user/signup/verify-code', verifyCode);
router.post('/:user/signup/set-password', setNewPasswordAndCreateUser);

module.exports = router;