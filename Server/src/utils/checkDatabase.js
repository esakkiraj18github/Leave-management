import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import User from '../models/User.js';
import Leave from '../models/Leave.js';
import Task from '../models/Task.js';

// Load environment variables
dotenv.config();

// Check database collections and data
const checkDatabase = async () => {
  try {
    // Connect to database
    await connectDatabase();

    console.log('\n=== Database Check ===\n');

    // Check Users collection
    const userCount = await User.countDocuments();
    console.log(`Users Collection: ${userCount} documents`);
    if (userCount > 0) {
      const users = await User.find().select('name email role phone department');
      console.log('Users:', JSON.stringify(users, null, 2));
    } else {
      console.log('⚠️  No users found. Create users first.');
    }

    // Check Leaves collection
    const leaveCount = await Leave.countDocuments();
    console.log(`\nLeaves Collection: ${leaveCount} documents`);
    if (leaveCount > 0) {
      const leaves = await Leave.find().populate('employeeId', 'name email');
      console.log('Leaves:', JSON.stringify(leaves, null, 2));
    } else {
      console.log('⚠️  No leaves found. Apply for leave to create leaves collection.');
    }

    // Check Tasks collection
    const taskCount = await Task.countDocuments();
    console.log(`\nTasks Collection: ${taskCount} documents`);
    if (taskCount > 0) {
      const tasks = await Task.find();
      console.log('Tasks:', JSON.stringify(tasks, null, 2));
    } else {
      console.log('⚠️  No tasks found. Create tasks to create tasks collection.');
    }

    // List all collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('\n=== All Collections in Database ===');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Close database connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
};

// Run check
checkDatabase();

