require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const messageRoutes = require("./routes/messageRoutes")
const connectDB = require("./config/db");

app.use(cors());
app.use(express.json());
connectDB();

app.use("/api", messageRoutes)

app.listen(5000, () => {
  console.log("Server running on port 5000");
});