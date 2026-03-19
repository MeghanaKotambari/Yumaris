const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user.model");
const { ApiError, asyncHandler } = require("../middleware/error.middleware");

const signAccessToken = (id) =>
	jwt.sign({ id }, process.env.JWT_ACCESS_SECRET || "dev_access_secret", {
		expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
	});

const signRefreshToken = (id, tokenVersion = "v1") =>
	jwt.sign(
		{ id, tokenVersion },
		process.env.JWT_REFRESH_SECRET || "dev_refresh_secret",
		{
			expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
		}
	);

const cookieBaseOptions = {
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: "lax",
};

const setAuthCookies = (res, accessToken, refreshToken) => {
	res.cookie("accessToken", accessToken, {
		...cookieBaseOptions,
		maxAge: 15 * 60 * 1000,
	});
	res.cookie("refreshToken", refreshToken, {
		...cookieBaseOptions,
		maxAge: 7 * 24 * 60 * 60 * 1000,
	});
};

const clearAuthCookies = (res) => {
	res.cookie("accessToken", "", {
		...cookieBaseOptions,
		expires: new Date(0),
	});
	res.cookie("refreshToken", "", {
		...cookieBaseOptions,
		expires: new Date(0),
	});
};

const sanitizeUser = (user) => ({
	id: user._id,
	name: user.name,
	email: user.email,
	role: user.role,
	createdAt: user.createdAt,
	updatedAt: user.updatedAt,
});

const register = asyncHandler(async (req, res) => {
	const { name, email, password } = req.body;
	const normalizedEmail = email.toLowerCase();

	const existingUser = await User.findOne({ email: normalizedEmail });
	if (existingUser) {
		throw new ApiError("User with this email already exists", 409);
	}

	const user = await User.create({
		name: name.trim(),
		email: normalizedEmail,
		password,
		role: "user",
	});

	const accessToken = signAccessToken(user._id);
	const refreshToken = signRefreshToken(user._id);
	await user.setRefreshToken(refreshToken);

	setAuthCookies(res, accessToken, refreshToken);

	return res.status(201).json({
		success: true,
		message: "Registration successful",
		accessToken,
		user: sanitizeUser(user),
	});
});

const login = asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	const normalizedEmail = email.toLowerCase();

	const user = await User.findOne({ email: normalizedEmail }).select(
		"+password +refreshTokenHash"
	);
	if (!user) {
		throw new ApiError("Invalid credentials", 401);
	}

	const isPasswordCorrect = await user.comparePassword(password);
	if (!isPasswordCorrect) {
		throw new ApiError("Invalid credentials", 401);
	}

	const accessToken = signAccessToken(user._id);
	const refreshToken = signRefreshToken(user._id);
	await user.setRefreshToken(refreshToken);

	setAuthCookies(res, accessToken, refreshToken);

	return res.status(200).json({
		success: true,
		message: "Login successful",
		accessToken,
		user: sanitizeUser(user),
	});
});

const refreshToken = asyncHandler(async (req, res) => {
	const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;
	if (!incomingToken) {
		throw new ApiError("Refresh token is required", 401);
	}

	let decoded;
	try {
		decoded = jwt.verify(
			incomingToken,
			process.env.JWT_REFRESH_SECRET || "dev_refresh_secret"
		);
	} catch (_error) {
		throw new ApiError("Invalid or expired refresh token", 401);
	}

	const user = await User.findById(decoded.id).select("+refreshTokenHash");
	if (!user) {
		throw new ApiError("Unauthorized: user not found", 401);
	}

	if (!user.matchesRefreshToken(incomingToken)) {
		throw new ApiError("Refresh token mismatch", 401);
	}

	const newAccessToken = signAccessToken(user._id);
	const newRefreshToken = signRefreshToken(user._id, `v-${crypto.randomUUID()}`);

	await user.setRefreshToken(newRefreshToken);
	setAuthCookies(res, newAccessToken, newRefreshToken);

	return res.status(200).json({
		success: true,
		message: "Token refreshed successfully",
		accessToken: newAccessToken,
	});
});

const getMe = asyncHandler(async (req, res) => {
	return res.status(200).json({
		success: true,
		message: "Profile fetched successfully",
		user: sanitizeUser(req.user),
	});
});

const logout = asyncHandler(async (req, res) => {
	const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;
	if (incomingToken) {
		let decoded;
		try {
			decoded = jwt.verify(
				incomingToken,
				process.env.JWT_REFRESH_SECRET || "dev_refresh_secret"
			);
			const user = await User.findById(decoded.id).select("+refreshTokenHash");
			if (user && user.matchesRefreshToken(incomingToken)) {
				await user.clearRefreshToken();
			}
		} catch (_error) {
			// Ignore refresh token verification failures during logout.
		}
	}

	clearAuthCookies(res);

	return res.status(200).json({
		success: true,
		message: "Logged out successfully",
	});
});

module.exports = {
	register,
	login,
	refreshToken,
	getMe,
	logout,
};
