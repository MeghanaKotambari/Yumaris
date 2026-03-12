const cookieParser = require("cookie-parser");
const express = require("express");
require("dotenv").config();
const cors= require ("cors");
const connectDB = require("./config/database");
const authroutes=require("./routes/auth.routes");


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const corsOption = {
  origin: "http://localhost:5173",
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  credentials: true,
};
app.use(cors(corsOption));

app.use("/api/auth",authroutes);




app.listen(3000, () => {
  connectDB();
  console.log("Server is running");
});