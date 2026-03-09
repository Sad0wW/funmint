const express = require("express");

const { toggle } = require("./settings/toggle.js");
const { answer } = require("./settings/answer.js");
const { review } = require("./settings/review.js");
const { reduction } = require("./settings/reduction.js");
const { goldenKey } = require("./settings/goldenKey.js");

const router = express.Router();

router.post("/toggle", toggle);
router.post("/answer", answer);
router.post("/review", review);
router.post("/reduction", reduction);
router.post("/goldenKey", goldenKey);

module.exports.settingsRouter = router;