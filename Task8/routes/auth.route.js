const express = require("express");
const {
	register,
	login,
	refreshToken,
	getMe,
	logout,
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const {
	validateRegister,
	validateLogin,
} = require("../middleware/validate.middleware");

const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/refresh", refreshToken);
router.get("/me", protect, getMe);
router.post("/logout", logout);

module.exports = router;
