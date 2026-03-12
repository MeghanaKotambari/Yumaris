const { default: mongoose } = require("mongoose");

const connectDB = async (req, res) => {
  try {
    await mongoose.connect(process.env.MONGO_URI).then(() => {
      console.log("MongoDB connection successful");
    });
  } catch (error) {
    console.log("Error in connecting", error);
  }
};

module.exports = connectDB;