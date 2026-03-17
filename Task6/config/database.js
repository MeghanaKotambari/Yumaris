const mongoose = require("mongoose");

const connectDB = async (req, res) => {
  try {
    await mongoose.connect("mongodb://localhost:27017/yumaris").then(() => {
      console.log("MongoDB connection successful");
    });
  } catch (error) {
    console.log("Error in connecting", error);
  }
};

module.exports = connectDB;