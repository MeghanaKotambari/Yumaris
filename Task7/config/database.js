const mongoose = require("mongoose");

const connectDB = async () => {
	const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/yumaris";

	mongoose.connection.on("connected", () => {
		console.log("MongoDB connection successful");
	});

	mongoose.connection.on("error", (error) => {
		console.error("MongoDB connection error:", error.message);
	});

	await mongoose.connect(mongoUri);
};

module.exports = connectDB;
