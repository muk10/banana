const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn("⚠️  MONGO_URI environment variable is not set. Please create a .env file with MONGO_URI=mongodb://localhost:27017/your-database-name");
      return;
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Database connected successfully");
  } catch (err) {
    console.error("❌ Database connection error:", err.message);
    console.error("💡 Make sure MongoDB is running. Start it with: mongod");
    console.error("💡 Or if using MongoDB Atlas, check your connection string in .env file");
    // Don't exit - allow server to start even if DB is down (for development)
    // process.exit(1);
  }
};

module.exports = connectDB;