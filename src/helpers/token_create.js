const jwt = require('jsonwebtoken');

module.exports = {
    createAccessToken: (data) => {
        const key = "martabak"
        const token = jwt.sign(data, key, { expiresIn: "12h" })
        return token
    },
    createVerificationToken: (data) => {
        const key = "sate"
        const token = jwt.sign(data, key, { expiresIn: "600s" })
        return token
    }
};