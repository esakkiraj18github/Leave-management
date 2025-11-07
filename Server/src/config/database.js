import mongoose from 'mongoose';

// Database configuration
export const dbConfig = {
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/leave_management',
};

// Database connection function
export const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(dbConfig.mongoURI, {
      // Remove deprecated options, use default settings
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    // console.log(`Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

