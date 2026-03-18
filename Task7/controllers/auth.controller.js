const jwt = require("jsonwebtoken");
const User = require("../model/auth.model");
const { ApiError, asyncHandler } = require("../middleware/errorMiddleware");

const generateToken = (id) =>
	jwt.sign({ id }, process.env.JWT_SECRET || "dev_jwt_secret", {
		expiresIn: process.env.JWT_EXPIRES_IN || "1d",
	});

const setAuthCookie = (res, token) => {
	res.cookie("token", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 24 * 60 * 60 * 1000,
	});
};

const register = asyncHandler(async (req, res) => {
	const { name, email, password } = req.body;

	const existingUser = await User.findOne({ email: email.toLowerCase() });
	if (existingUser) {
		throw new ApiError("User with this email already exists", 409);
	}

	const user = await User.create({ name: name.trim(), email, password });
	const token = generateToken(user._id);
	setAuthCookie(res, token);

	return res.status(201).json({
		success: true,
		message: "Registration successful",
		token,
		user: {
			id: user._id,
			name: user.name,
			email: user.email,
			createdAt: user.createdAt,
		},
	});
});

const login = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
	if (!user) {
		throw new ApiError("Invalid credentials", 401);
	}

	const isPasswordCorrect = await user.comparePassword(password);
	if (!isPasswordCorrect) {
		throw new ApiError("Invalid credentials", 401);
	}

	const token = generateToken(user._id);
	setAuthCookie(res, token);

	return res.status(200).json({
		success: true,
		message: "Login successful",
		token,
		user: {
			id: user._id,
			name: user.name,
			email: user.email,
			createdAt: user.createdAt,
		},
	});
});

const getMe = asyncHandler(async (req, res) => {
	return res.status(200).json({
		success: true,
		message: "Profile fetched successfully",
		user: req.user,
	});
});

const logout = asyncHandler(async (_req, res) => {
	res.cookie("token", "", {
		httpOnly: true,
		expires: new Date(0),
	});

	return res.status(200).json({ success: true, message: "Logged out successfully" });
});

module.exports = {
	register,
	login,
	getMe,
	logout,
};
