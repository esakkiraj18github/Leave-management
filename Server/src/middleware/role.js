// Middleware to check if user has admin role
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please authenticate first' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'Admin access required' 
    });
  }

  next();
};

