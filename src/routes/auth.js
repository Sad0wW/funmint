const express = require("express");

const { register } = require("./auth/register.js");
const { login } = require("./auth/login.js");
const { logout } = require("./auth/logout.js");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

module.exports.authRouter = router;