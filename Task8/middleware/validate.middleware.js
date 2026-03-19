const mongoose = require("mongoose");
const { ApiError } = require("./error.middleware");

const isEmail = (value) => /^\S+@\S+\.\S+$/.test(value);

const runValidation = (req, _res, next, rules) => {
	const errors = [];

	for (const rule of rules) {
		const message = rule(req);
		if (message) {
			errors.push(message);
		}
	}

	if (errors.length > 0) {
		return next(new ApiError("Validation failed", 400, errors));
	}

	next();
};

const validateRegister = (req, res, next) =>
	runValidation(req, res, next, [
		(body) =>
			!body.body.name || body.body.name.trim().length < 2
				? "Name must be at least 2 characters"
				: null,
		(body) =>
			!body.body.email || !isEmail(body.body.email)
				? "Valid email is required"
				: null,
		(body) =>
			!body.body.password || body.body.password.length < 8
				? "Password must be at least 8 characters"
				: null,
		(body) =>
			body.body.role !== undefined
				? "Role cannot be provided during registration"
				: null,
	]);

const validateLogin = (req, res, next) =>
	runValidation(req, res, next, [
		(body) =>
			!body.body.email || !isEmail(body.body.email)
				? "Valid email is required"
				: null,
		(body) => (!body.body.password ? "Password is required" : null),
	]);

const validateCreateUser = validateRegister;

const validateUpdateUser = (req, res, next) =>
	runValidation(req, res, next, [
		(body) => {
			const { name, email, password, role } = body.body;
			if (
				name === undefined &&
				email === undefined &&
				password === undefined &&
				role === undefined
			) {
				return "At least one field is required to update";
			}
			return null;
		},
		(body) =>
			body.body.name !== undefined && body.body.name.trim().length < 2
				? "Name must be at least 2 characters"
				: null,
		(body) =>
			body.body.email !== undefined && !isEmail(body.body.email)
				? "Email format is invalid"
				: null,
		(body) =>
			body.body.password !== undefined && body.body.password.length < 8
				? "Password must be at least 8 characters"
				: null,
		(body) =>
			body.body.role !== undefined && !["admin", "user"].includes(body.body.role)
				? "Role must be admin or user"
				: null,
		(body) =>
			body.body.role !== undefined && body.user?.role !== "admin"
				? "Only admin can update user role"
				: null,
	]);

const validateObjectId = (req, _res, next) => {
	const { id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return next(new ApiError("Invalid resource id", 400));
	}
	next();
};

const validatePagination = (req, _res, next) => {
	const { page = "1", limit = "10", role, sortBy, sortOrder } = req.query;
	const pageNumber = Number(page);
	const limitNumber = Number(limit);
	const allowedSortBy = ["name", "email", "createdAt", "updatedAt", "role"];

	const errors = [];
	if (!Number.isInteger(pageNumber) || pageNumber < 1) {
		errors.push("Query param page must be an integer >= 1");
	}
	if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 100) {
		errors.push("Query param limit must be an integer between 1 and 100");
	}
	if (role !== undefined && !["admin", "user"].includes(role)) {
		errors.push("Query param role must be admin or user");
	}
	if (sortBy !== undefined && !allowedSortBy.includes(sortBy)) {
		errors.push(
			"Query param sortBy must be one of: name, email, createdAt, updatedAt, role"
		);
	}
	if (sortOrder !== undefined && !["asc", "desc"].includes(sortOrder)) {
		errors.push("Query param sortOrder must be asc or desc");
	}

	if (errors.length > 0) {
		return next(new ApiError("Validation failed", 400, errors));
	}

	next();
};

module.exports = {
	validateRegister,
	validateLogin,
	validateCreateUser,
	validateUpdateUser,
	validateObjectId,
	validatePagination,
};
