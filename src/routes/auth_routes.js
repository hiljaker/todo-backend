const express = require('express');
const { signUp, verifyAccount, logIn, rememberMe, isRegistered } = require('../controllers/auth_controllers');
const { verifyVerificationToken, verifyAccessToken } = require('../helpers/token_verify');
const router = express.Router()

router.post("/signup", signUp)
router.get("/verify", verifyVerificationToken, verifyAccount)
router.post("/login", logIn)
router.get("/rememberme", verifyAccessToken, rememberMe)
router.post("/isregistered", isRegistered)

module.exports = router