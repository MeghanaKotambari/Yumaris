const authModel = require("../models/auth.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

module.exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(404).json({ message: "All fields are required" });
    }

    const user = await authModel.findOne({ email });
    if (user) {
      return res.status(404).json({ message: "User already exists" });
    }

    const newuser = await authModel.create({
      name,
      email,
      password,
    });

    if (!newuser) {
      return res.status(404).json({ message: "Error in creating newuser" });
    }

    const token = await jwt.sign(
      { userId: newuser._id },
      process.env.JWT_TOKEN,
    );
    res.cookie("token", token);

    return res.status(201).json({
      message: "User registered successfully",
      success: true,
      user: newuser,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error", error: error.message });
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(404).json({ message: "All fields are required" });
    }

    const user = await authModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(404).json({ message: "Password does not match" });
    }

    const token = await jwt.sign({ userId: user._id }, process.env.JWT_TOKEN);
    res.cookie("token", token);

    return res.status(201).json({
      message: "User login successfully",
      success: true,
      user: user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error", error: error.message });
  }
};

module.exports.getUser = async (req, res) => {
  try {
    const user = await authModel.findById(req.user.userId).select("-password");
    return res
      .status(201)
      .json({ message: "User fetched successfully", success: true, user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error in fetching user", error: error.message });
  }
};
