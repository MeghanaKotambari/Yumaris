const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
			minlength: [2, "Name must be at least 2 characters"],
			maxlength: [60, "Name cannot exceed 60 characters"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			trim: true,
			lowercase: true,
			match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: [8, "Password must be at least 8 characters"],
			select: false,
		},
		role: {
			type: String,
			enum: ["admin", "user"],
			default: "user",
		},
		refreshTokenHash: {
			type: String,
			default: null,
			select: false,
		},
	},
	{ timestamps: true }
);

userSchema.pre("save", async function saveHook(next) {
	if (!this.isModified("password")) {
		return next();
	}

	this.password = await bcrypt.hash(this.password, 10);
	next();
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
	return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.setRefreshToken = async function setRefreshToken(rawToken) {
	this.refreshTokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
	await this.save();
};

userSchema.methods.matchesRefreshToken = function matchesRefreshToken(rawToken) {
	if (!this.refreshTokenHash) {
		return false;
	}

	const hashedIncoming = crypto.createHash("sha256").update(rawToken).digest("hex");
	return this.refreshTokenHash === hashedIncoming;
};

userSchema.methods.clearRefreshToken = async function clearRefreshToken() {
	this.refreshTokenHash = null;
	await this.save();
};

module.exports = mongoose.model("User", userSchema);
