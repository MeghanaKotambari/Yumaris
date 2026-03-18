const User = require("../model/auth.model");
const { ApiError, asyncHandler } = require("../middleware/errorMiddleware");

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError("User with this email already exists", 409);
  }

  const user = await User.create({ name: name.trim(), email, password });

  return res.status(201).json({
    success: true,
    message: "User created successfully",
    user,
  });
});

const getUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1, _id: -1 });

  return res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    count: users.length,
    users,
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
    user,
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("+password");
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const { name, email, password } = req.body;

  if (name !== undefined) {
    user.name = name.trim();
  }

  if (email !== undefined) {
    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
    if (existingUser) {
      throw new ApiError("User with this email already exists", 409);
    }
    user.email = normalizedEmail;
  }

  if (password !== undefined) {
    user.password = password;
  }

  await user.save();

  const safeUser = await User.findById(user._id);

  return res.status(200).json({
    success: true,
    message: "User updated successfully",
    user: safeUser,
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
