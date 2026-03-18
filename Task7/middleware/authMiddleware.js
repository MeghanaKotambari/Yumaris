const jwt = require("jsonwebtoken");
const User = require("../model/auth.model");
const { ApiError, asyncHandler } = require("./errorMiddleware");

const protect = asyncHandler(async (req, _res, next) => {
	const authHeader = req.headers.authorization;
	const tokenFromHeader =
		authHeader && authHeader.startsWith("Bearer ")
			? authHeader.split(" ")[1]
			: null;

	const token = tokenFromHeader || req.cookies?.token;

	if (!token) {
		throw new ApiError("Unauthorized: token missing", 401);
	}

	let decoded;
	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_jwt_secret");
	} catch (_error) {
		throw new ApiError("Unauthorized: invalid or expired token", 401);
	}

	const user = await User.findById(decoded.id).select("-password");
	if (!user) {
		throw new ApiError("Unauthorized: user not found", 401);
	}

	req.user = user;
	next();
});

module.exports = { protect };
