import mongoose from 'mongoose';

// Leave Schema
const leaveSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee ID is required']
  },
  leaveType: {
    type: String,
    enum: ['sick', 'vacation', 'personal', 'other'],
    required: [true, 'Leave type is required']
  },
  fromDate: {
    type: Date,
    required: [true, 'From date is required']
  },
  toDate: {
    type: Date,
    required: [true, 'To date is required'],
    validate: {
      validator: function(value) {
        return value >= this.fromDate;
      },
      message: 'To date must be after or equal to from date'
    }
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
    minlength: [10, 'Reason must be at least 10 characters'],
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Index for better query performance
leaveSchema.index({ employeeId: 1, createdAt: -1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ leaveType: 1 });

// Create and export Leave model
const Leave = mongoose.model('Leave', leaveSchema);

export default Leave;

