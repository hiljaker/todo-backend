const express = require('express');
const { signUp, verify } = require('../controllers/auth_controllers');
const { verifyVerificationToken } = require('../helpers/token_verify');
const router = express.Router()

router.post("/signup", signUp)
router.get("/verify", verifyVerificationToken, verify)

module.exports = router