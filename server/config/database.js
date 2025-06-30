const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use environment variable or default to local MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mediaverse';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ MongoDB Connected!");
  } catch (err) {
    console.error("❌ MongoDB Error:", err.message);
    // Don't exit the process, just log the error
    console.log("⚠️  Running without MongoDB - some features may not work");
  }
};

module.exports = connectDB;
