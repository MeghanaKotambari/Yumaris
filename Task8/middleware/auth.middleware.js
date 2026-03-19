const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { ApiError, asyncHandler } = require("./error.middleware");

const protect = asyncHandler(async (req, _res, next) => {
	const authHeader = req.headers.authorization;
	const tokenFromHeader =
		authHeader && authHeader.startsWith("Bearer ")
			? authHeader.split(" ")[1]
			: null;

	const token = tokenFromHeader || req.cookies?.accessToken;
	if (!token) {
		throw new ApiError("Unauthorized: access token missing", 401);
	}

	let decoded;
	try {
		decoded = jwt.verify(
			token,
			process.env.JWT_ACCESS_SECRET || "dev_access_secret"
		);
	} catch (_error) {
		throw new ApiError("Unauthorized: invalid or expired access token", 401);
	}

	const user = await User.findById(decoded.id).select("-password -refreshTokenHash");
	if (!user) {
		throw new ApiError("Unauthorized: user not found", 401);
	}

	req.user = user;
	next();
});

const authorize = (...roles) => (req, _res, next) => {
	if (!req.user) {
		return next(new ApiError("Unauthorized", 401));
	}

	if (!roles.includes(req.user.role)) {
		return next(new ApiError("Forbidden: insufficient permissions", 403));
	}

	next();
};

const authorizeSelfOrAdmin = (paramName = "id") => (req, _res, next) => {
	if (!req.user) {
		return next(new ApiError("Unauthorized", 401));
	}

	if (req.user.role === "admin") {
		return next();
	}

	if (String(req.user._id) !== String(req.params[paramName])) {
		return next(new ApiError("Forbidden: insufficient permissions", 403));
	}

	return next();
};

module.exports = {
	protect,
	authorize,
	authorizeSelfOrAdmin,
};
