const crypto = require('crypto');

module.exports = (word) => {
    let hashing = crypto
        .createHmac("sha256", "pablo")
        .update(word)
        .digest("hex")
    return hashing
};