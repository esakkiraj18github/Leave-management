import api from './api.js';

// Mock data for development (will be removed when backend is ready)
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin'
  },
  {
    id: '2',
    email: 'employee@example.com',
    password: 'employee123',
    name: 'John Doe',
    role: 'employee'
  }
];

// Mock token generator
const generateMockToken = (user) => {
  return `mock_token_${user.id}_${Date.now()}`;
};

// Login function (with mock fallback)
export const login = async (email, password) => {
  try {
    // Try real API first
    const response = await api.post('/auth/login', { email, password });
    
    // Store token and user data in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    // Fallback to mock data for frontend development
    if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
      const user = MOCK_USERS.find(
        u => u.email === email && u.password === password
      );
      
      if (user) {
        const token = generateMockToken(user);
        const userData = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          token
        };
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        return { user: userData, token };
      }
    }
    throw error;
  }
};

// Logout function
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

