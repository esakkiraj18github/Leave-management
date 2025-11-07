import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to verify JWT token
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth failed: No authorization header');
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'No token provided' 
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      console.log('Auth failed: Empty token');
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'No token provided' 
      });
    }

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'JWT_SECRET is not configured' 
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.log('Auth failed: User not found for id:', decoded.id);
        return res.status(401).json({ 
          error: 'Authentication failed',
          message: 'User not found' 
        });
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        console.log('Auth failed: Invalid token');
        return res.status(401).json({ 
          error: 'Invalid token',
          message: 'Token is invalid' 
        });
      }
      if (error.name === 'TokenExpiredError') {
        console.log('Auth failed: Token expired');
        return res.status(401).json({ 
          error: 'Token expired',
          message: 'Token has expired' 
        });
      }
      console.error('Auth verification error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Authentication error',
      message: error.message 
    });
  }
};

