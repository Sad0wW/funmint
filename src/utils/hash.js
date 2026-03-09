const bcrypt = require("bcrypt");
const crypto = require("crypto");

const { env } = require("./storage.js");

module.exports.hashPassword = async (password) => {
    return bcrypt.hash(password, Number(env.SALT_ROUNDS));
}

module.exports.comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
}

module.exports.hashGoldenKey = (golden_key) =>{
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(env.GOLDENKEY_SECRET, "base64"), iv);
    const ciphertext = Buffer.concat([cipher.update(golden_key, "utf8"), cipher.final()]);

    const tag = cipher.getAuthTag();

    return [iv.toString("base64"), ciphertext.toString("base64"), tag.toString("base64"), "v1",].join(".");
};

module.exports.dehashGoldenKey = (golden_key) => {
    const [ivB64, ctB64, tagB64, version] = golden_key.split(".");

    const iv = Buffer.from(ivB64, "base64");
    const ciphertext = Buffer.from(ctB64, "base64");
    const tag = Buffer.from(tagB64, "base64");

    const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(env.GOLDENKEY_SECRET, "base64"), iv);

    decipher.setAuthTag(tag);

    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
};