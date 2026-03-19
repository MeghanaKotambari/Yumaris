class ApiError extends Error {
	constructor(message, statusCode = 500, details = null) {
		super(message);
		this.statusCode = statusCode;
		this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
		this.details = details;
		Error.captureStackTrace(this, this.constructor);
	}
}

const asyncHandler = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};

const notFound = (req, _res, next) => {
	next(new ApiError(`Route not found: ${req.originalUrl}`, 404));
};

const errorHandler = (err, _req, res, _next) => {
	const statusCode = err.statusCode || 500;

	if (err.name === "ValidationError") {
		const details = Object.values(err.errors).map((value) => value.message);
		return res.status(400).json({
			success: false,
			message: "Validation failed",
			details,
		});
	}

	if (err.name === "CastError") {
		return res.status(400).json({
			success: false,
			message: "Invalid resource id",
		});
	}

	if (err.code === 11000) {
		return res.status(409).json({
			success: false,
			message: "Duplicate field value entered",
		});
	}

	return res.status(statusCode).json({
		success: false,
		message: err.message || "Internal server error",
		details: err.details || undefined,
		stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
	});
};

module.exports = {
	ApiError,
	asyncHandler,
	notFound,
	errorHandler,
};
