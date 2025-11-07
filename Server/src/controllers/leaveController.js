import Leave from '../models/Leave.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Apply for leave (Employee)
export const applyLeave = async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason } = req.body;
    const employeeId = req.user._id;

    const leaveData = {
      employeeId,
      leaveType,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      reason,
      status: 'pending'
    };

    console.log('Creating leave with data:', leaveData);

    // Create leave
    const leave = await Leave.create(leaveData);

    console.log('Leave created successfully in database:', {
      id: leave._id,
      employeeId: leave.employeeId,
      leaveType: leave.leaveType,
      fromDate: leave.fromDate,
      toDate: leave.toDate,
      reason: leave.reason,
      status: leave.status
    });

    // Populate employee details
    await leave.populate('employeeId', 'name email');

    res.status(201).json({
      message: 'Leave application submitted successfully',
      leave
    });
  } catch (error) {
    console.error('Apply leave error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        message: Object.values(error.errors)[0].message
      });
    }

    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
};

// Get my leaves (Employee)
export const getMyLeaves = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const { status } = req.query;

    // Build query
    const query = { employeeId };
    if (status && status !== 'all') {
      query.status = status;
    }

    // Get leaves
    const leaves = await Leave.find(query)
      .sort({ createdAt: -1 })
      .populate('employeeId', 'name email')
      .populate('reviewedBy', 'name email');

    res.status(200).json(leaves);
  } catch (error) {
    console.error('Get my leaves error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
};

// Get leave by ID
export const getLeaveById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid leave ID'
      });
    }

    // Find leave
    const leave = await Leave.findById(id)
      .populate('employeeId', 'name email')
      .populate('reviewedBy', 'name email');

    if (!leave) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Leave not found'
      });
    }

    // Check if user has access (employee can only see their own, admin can see all)
    if (userRole !== 'admin' && leave.employeeId._id.toString() !== userId.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view your own leaves'
      });
    }

    res.status(200).json(leave);
  } catch (error) {
    console.error('Get leave by ID error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
};

// Update leave (Employee - only if pending)
export const updateLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { leaveType, fromDate, toDate, reason } = req.body;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid leave ID'
      });
    }

    // Find leave
    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Leave not found'
      });
    }

    // Check if user owns this leave
    if (leave.employeeId.toString() !== userId.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own leaves'
      });
    }

    // Check if leave is pending
    if (leave.status !== 'pending') {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'You can only update pending leave requests'
      });
    }

    // Update leave
    if (leaveType) leave.leaveType = leaveType;
    if (fromDate) leave.fromDate = new Date(fromDate);
    if (toDate) leave.toDate = new Date(toDate);
    if (reason) leave.reason = reason;

    await leave.save();

    // Populate employee details
    await leave.populate('employeeId', 'name email');

    res.status(200).json({
      message: 'Leave updated successfully',
      leave
    });
  } catch (error) {
    console.error('Update leave error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        message: Object.values(error.errors)[0].message
      });
    }

    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
};

// Cancel leave (Employee)
export const cancelLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid leave ID'
      });
    }

    // Find leave
    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Leave not found'
      });
    }

    // Check if user owns this leave
    if (leave.employeeId.toString() !== userId.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only cancel your own leaves'
      });
    }

    // Check if leave can be cancelled (pending or approved)
    if (leave.status === 'rejected' || leave.status === 'cancelled') {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'This leave cannot be cancelled'
      });
    }

    // Update status to cancelled
    leave.status = 'cancelled';
    await leave.save();

    // Populate employee details
    await leave.populate('employeeId', 'name email');

    res.status(200).json({
      message: 'Leave cancelled successfully',
      leave
    });
  } catch (error) {
    console.error('Cancel leave error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
};

// Get all leaves (Admin)
export const getAllLeaves = async (req, res) => {
  try {
    const { employeeName, leaveType, status } = req.query;

    // Build query
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (leaveType && leaveType !== 'all') {
      query.leaveType = leaveType;
    }

    // Get all leaves with filters
    let leaves = await Leave.find(query)
      .sort({ createdAt: -1 })
      .populate('employeeId', 'name email')
      .populate('reviewedBy', 'name email');

    // Filter by employee name if provided
    if (employeeName) {
      leaves = leaves.filter(leave => {
        const name = leave.employeeId?.name || '';
        return name.toLowerCase().includes(employeeName.toLowerCase());
      });
    }

    res.status(200).json(leaves);
  } catch (error) {
    console.error('Get all leaves error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
};

// Approve leave (Admin)
export const approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid leave ID'
      });
    }

    // Find leave
    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Leave not found'
      });
    }

    // Check if leave is pending
    if (leave.status !== 'pending') {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Only pending leaves can be approved'
      });
    }

    // Update leave status
    leave.status = 'approved';
    leave.reviewedBy = adminId;
    leave.reviewedAt = new Date();
    await leave.save();

    // Populate details
    await leave.populate('employeeId', 'name email');
    await leave.populate('reviewedBy', 'name email');

    res.status(200).json({
      message: 'Leave approved successfully',
      leave
    });
  } catch (error) {
    console.error('Approve leave error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
};

// Reject leave (Admin)
export const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid leave ID'
      });
    }

    // Find leave
    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Leave not found'
      });
    }

    // Check if leave is pending
    if (leave.status !== 'pending') {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Only pending leaves can be rejected'
      });
    }

    // Update leave status
    leave.status = 'rejected';
    leave.reviewedBy = adminId;
    leave.reviewedAt = new Date();
    await leave.save();

    // Populate details
    await leave.populate('employeeId', 'name email');
    await leave.populate('reviewedBy', 'name email');

    res.status(200).json({
      message: 'Leave rejected successfully',
      leave
    });
  } catch (error) {
    console.error('Reject leave error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
};

// Get dashboard statistics (Admin)
export const getDashboardStats = async (req, res) => {
  try {
    // Get total employees
    const totalEmployees = await User.countDocuments({ role: 'employee' });

    // Get total leaves
    const totalLeaves = await Leave.countDocuments();

    // Get leaves by status
    const approvedLeaves = await Leave.countDocuments({ status: 'approved' });
    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
    const rejectedLeaves = await Leave.countDocuments({ status: 'rejected' });

    res.status(200).json({
      totalEmployees,
      totalLeaves,
      approvedLeaves,
      pendingLeaves,
      rejectedLeaves
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
};

