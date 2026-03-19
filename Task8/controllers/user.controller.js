const User = require("../models/user.model");
const { ApiError, asyncHandler } = require("../middleware/error.middleware");

const sanitizeUser = (user) => ({
	id: user._id,
	name: user.name,
	email: user.email,
	role: user.role,
	createdAt: user.createdAt,
	updatedAt: user.updatedAt,
});

const createUser = asyncHandler(async (req, res) => {
	const { name, email, password, role } = req.body;
	const normalizedEmail = email.toLowerCase();

	const existingUser = await User.findOne({ email: normalizedEmail });
	if (existingUser) {
		throw new ApiError("User with this email already exists", 409);
	}

	const user = await User.create({
		name: name.trim(),
		email: normalizedEmail,
		password,
		role: role || "user",
	});

	return res.status(201).json({
		success: true,
		message: "User created successfully",
		user: sanitizeUser(user),
	});
});

const getUsers = asyncHandler(async (req, res) => {
	const {
		page = 1,
		limit = 10,
		search,
		role,
		sortBy = "createdAt",
		sortOrder = "desc",
	} = req.query;

	const pageNumber = Number(page);
	const limitNumber = Number(limit);
	const skip = (pageNumber - 1) * limitNumber;

	const filters = {};
	if (role) {
		filters.role = role;
	}
	if (search) {
		filters.$or = [
			{ name: { $regex: search, $options: "i" } },
			{ email: { $regex: search, $options: "i" } },
		];
	}

	const sortableFields = ["name", "email", "createdAt", "updatedAt", "role"];
	const safeSortBy = sortableFields.includes(sortBy) ? sortBy : "createdAt";
	const safeSortOrder = sortOrder === "asc" ? 1 : -1;

	const [users, total] = await Promise.all([
		User.find(filters)
			.sort({ [safeSortBy]: safeSortOrder, _id: safeSortOrder })
			.skip(skip)
			.limit(limitNumber),
		User.countDocuments(filters),
	]);

	const totalPages = Math.ceil(total / limitNumber) || 1;

	return res.status(200).json({
		success: true,
		message: "Users fetched successfully",
		data: users.map(sanitizeUser),
		pagination: {
			page: pageNumber,
			limit: limitNumber,
			total,
			totalPages,
			hasNextPage: pageNumber < totalPages,
			hasPreviousPage: pageNumber > 1,
		},
		filters: {
			role: role || null,
			search: search || null,
			sortBy: safeSortBy,
			sortOrder: safeSortOrder === 1 ? "asc" : "desc",
		},
	});
});

const getUserById = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id);
	if (!user) {
		throw new ApiError("User not found", 404);
	}

	return res.status(200).json({
		success: true,
		message: "User fetched successfully",
		user: sanitizeUser(user),
	});
});

const updateUser = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id).select("+password");
	if (!user) {
		throw new ApiError("User not found", 404);
	}

	const { name, email, password, role } = req.body;

	if (name !== undefined) {
		user.name = name.trim();
	}

	if (email !== undefined) {
		const normalizedEmail = email.toLowerCase();
		const existingUser = await User.findOne({
			email: normalizedEmail,
			_id: { $ne: user._id },
		});
		if (existingUser) {
			throw new ApiError("User with this email already exists", 409);
		}
		user.email = normalizedEmail;
	}

	if (password !== undefined) {
		user.password = password;
	}

	if (role !== undefined && req.user.role === "admin") {
		user.role = role;
	}

	await user.save();
	const safeUser = await User.findById(user._id);

	return res.status(200).json({
		success: true,
		message: "User updated successfully",
		user: sanitizeUser(safeUser),
	});
});

const deleteUser = asyncHandler(async (req, res) => {
	const user = await User.findByIdAndDelete(req.params.id);
	if (!user) {
		throw new ApiError("User not found", 404);
	}

	return res.status(200).json({
		success: true,
		message: "User deleted successfully",
	});
});

module.exports = {
	createUser,
	getUsers,
	getUserById,
	updateUser,
	deleteUser,
};
