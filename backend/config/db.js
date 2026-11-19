const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    // Connection timeout for MongoDB Atlas cluster
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    isConnected = true;
    return true;
  } catch (error) {
    console.log('MongoDB connection failed. Using JSON local file-based database fallback.');
    isConnected = false;
    return false;
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };
