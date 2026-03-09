const crypto = require("crypto");

const { env } = require("../../../utils/storage.js");

module.exports.validSigCrystalPay = (id, sig) => {
    const computedHash = crypto.createHash("sha1").update(`${id}:${env.CRYSTALPAY_AUTH_SALT}`).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(sig));
};