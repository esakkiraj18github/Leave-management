import mongoose from 'mongoose';

// Task Schema
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    default: '',
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Create and export Task model
const Task = mongoose.model('Task', taskSchema);

export default Task;

