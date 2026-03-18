const express = require("express");
const { register, login, getMe, logout } = require("../controllers/auth.controller");
const { protect } = require("../middleware/authMiddleware");
const { validateRegister, validateLogin } = require("../middleware/validateMiddleware");

const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", protect, getMe);
router.post("/logout", logout);

module.exports = router;
