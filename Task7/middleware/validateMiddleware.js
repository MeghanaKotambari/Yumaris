const mongoose = require("mongoose");
const { ApiError } = require("./errorMiddleware");

const isEmail = (value) => /^\S+@\S+\.\S+$/.test(value);

const validateRegister = (req, _res, next) => {
  const { name, email, password } = req.body;

  if (!name || name.trim().length < 2) {
    return next(new ApiError("Name must be at least 2 characters", 400));
  }

  if (!email || !isEmail(email)) {
    return next(new ApiError("Valid email is required", 400));
  }

  if (!password || password.length < 6) {
    return next(new ApiError("Password must be at least 6 characters", 400));
  }

  return next();
};

const validateLogin = (req, _res, next) => {
  const { email, password } = req.body;

  if (!email || !isEmail(email)) {
    return next(new ApiError("Valid email is required", 400));
  }

  if (!password) {
    return next(new ApiError("Password is required", 400));
  }

  return next();
};

const validateCreateUser = validateRegister;

const validateUpdateUser = (req, _res, next) => {
  const { name, email, password } = req.body;

  if (!name && !email && !password) {
    return next(new ApiError("At least one field is required to update", 400));
  }

  if (name !== undefined && name.trim().length < 2) {
    return next(new ApiError("Name must be at least 2 characters", 400));
  }

  if (email !== undefined && !isEmail(email)) {
    return next(new ApiError("Email format is invalid", 400));
  }

  if (password !== undefined && password.length < 6) {
    return next(new ApiError("Password must be at least 6 characters", 400));
  }

  return next();
};

const validateObjectId = (req, _res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError("Invalid resource id", 400));
  }

  return next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateUser,
  validateUpdateUser,
  validateObjectId,
};
