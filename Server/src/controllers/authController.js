import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { body, validationResult } from 'express-validator';

// Generate JWT Token
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not configured. Please set JWT_SECRET in .env file');
  }
  
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Email and password are required'
      });
    }

    // Find user by email (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove password from user object
    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role // Role from database
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
};

// Register new user (anyone can register with any role)
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, department } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Name, email, and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please enter a valid email address'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Password must be at least 6 characters'
      });
    }

    // Validate role
    if (role && role !== 'admin' && role !== 'employee') {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid role. Role must be either "admin" or "employee"'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'User with this email already exists'
      });
    }

    // Create user with all data (phone and department are optional)
    const userData = {
      name,
      email,
      password,
      role: role || 'employee',
      phone: phone || '',
      department: department || ''
    };

    console.log('Creating user with data:', { ...userData, password: '***' });

    const user = await User.create(userData);

    console.log('User created successfully in database:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      department: user.department
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    
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

