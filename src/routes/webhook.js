const express = require("express");

const { platega } = require("./webhook/platega.js");
const { crystalpay } = require("./webhook/crystalpay.js");

const router = express.Router();

router.post("/platega", platega);
router.post("/crystalpay", crystalpay);

module.exports.webhookRouter = router;