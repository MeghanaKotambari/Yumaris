const express = require("express");
const { login, register } = require("../controllers/auth.controller");
const { getUser } = require("../controller/auth.controller");

const router = express.Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/getUser").get(getUser)

module.exports = router;