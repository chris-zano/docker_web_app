const express = require('express');
const { recovery_VerifyEmail, recovery_VerifyCode, recovery_SetNewPassword } = require('../controllers/recovery.controller');
const router = express.Router();

router.get('/recovery/:mode/verify-email/:email', recovery_VerifyEmail);
router.get('/recovery/verify-code', recovery_VerifyCode);
router.post('/recovery/:mode/set-password', recovery_SetNewPassword);
module.exports = router;