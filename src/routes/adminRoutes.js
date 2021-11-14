const express = require("express")
const router = express.Router()
const {adminControllers} = require("../controllers")
const {activateAcc,deactivateAcc, getuserAcc} = adminControllers



router.patch("/:userId/:username", activateAcc)
router.delete("/:userId/:username", deactivateAcc)
router.get("/", getuserAcc)


module.exports = router