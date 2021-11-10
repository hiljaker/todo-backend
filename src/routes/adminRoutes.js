const express = require("express")
const router = express.Router()
const {adminControllers} = require("../controllers")
const {activateAcc,deactivateAcc} = adminControllers



router.delete("/:userId/:username", activateAcc)
router.patch("/:userId/:username", deactivateAcc)


module.exports = router