import api from './api.js';

// Mock data for development (will be removed when backend is ready)
let mockLeaves = [
  {
    _id: '1',
    employeeId: '2',
    employeeName: 'John Doe',
    leaveType: 'vacation',
    fromDate: '2024-02-15',
    toDate: '2024-02-17',
    reason: 'Family vacation',
    status: 'pending',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z'
  },
  {
    _id: '2',
    employeeId: '2',
    employeeName: 'John Doe',
    leaveType: 'sick',
    fromDate: '2024-01-20',
    toDate: '2024-01-21',
    reason: 'Fever and cold',
    status: 'approved',
    reviewedBy: '1',
    reviewedAt: '2024-01-19T14:00:00Z',
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-19T14:00:00Z'
  },
  {
    _id: '3',
    employeeId: '2',
    employeeName: 'John Doe',
    leaveType: 'personal',
    fromDate: '2024-01-10',
    toDate: '2024-01-10',
    reason: 'Personal work',
    status: 'rejected',
    reviewedBy: '1',
    reviewedAt: '2024-01-09T16:00:00Z',
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-09T16:00:00Z'
  }
];

let mockUsers = [
  { id: '2', name: 'John Doe', email: 'employee@example.com', role: 'employee' },
  { id: '3', name: 'Jane Smith', email: 'jane@example.com', role: 'employee' },
  { id: '4', name: 'Bob Johnson', email: 'bob@example.com', role: 'employee' }
];

const normalizeLeave = (leave) => {
  if (!leave) return leave;

  const employee = leave.employeeId && typeof leave.employeeId === 'object'
    ? leave.employeeId
    : null;

  const reviewer = leave.reviewedBy && typeof leave.reviewedBy === 'object'
    ? leave.reviewedBy
    : null;

  return {
    ...leave,
    employeeName: leave.employeeName || employee?.name || '',
    employeeEmail: leave.employeeEmail || employee?.email || '',
    reviewerName: leave.reviewerName || reviewer?.name || '',
    reviewerEmail: leave.reviewerEmail || reviewer?.email || ''
  };
};

// Get current user ID from localStorage
const getCurrentUserId = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.id;
};

const getCurrentUserRole = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role;
};

// Apply for leave
export const applyLeave = async (leaveData) => {
  try {
    const response = await api.post('/leaves', leaveData);
    const data = response.data;

    if (data?.leave) {
      return {
        ...data,
        leave: normalizeLeave(data.leave)
      };
    }

    return data;
  } catch (error) {
    // Mock fallback
    if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const newLeave = {
        _id: String(mockLeaves.length + 1),
        employeeId: getCurrentUserId(),
        employeeName: currentUser.name,
        employeeEmail: currentUser.email,
        ...leaveData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockLeaves.push(newLeave);
      return newLeave;
    }
    throw error;
  }
};

// Get my leaves (for employee)
export const getMyLeaves = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/leaves/my-leaves?${params}`);
    const data = Array.isArray(response.data)
      ? response.data.map(normalizeLeave)
      : [];
    return data;
  } catch (error) {
    // Mock fallback
    if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
      let filtered = mockLeaves.filter(leave => leave.employeeId === getCurrentUserId());
      
      if (filters.status) {
        filtered = filtered.filter(leave => leave.status === filters.status);
      }
      
      return filtered.map(normalizeLeave);
    }
    throw error;
  }
};

// Get all leaves (for admin)
export const getAllLeaves = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/leaves?${params}`);
    const data = Array.isArray(response.data)
      ? response.data.map(normalizeLeave)
      : [];
    return data;
  } catch (error) {
    // Mock fallback
    if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
      let filtered = [...mockLeaves];
      
      if (filters.employeeName) {
        filtered = filtered.filter(leave => 
          leave.employeeName.toLowerCase().includes(filters.employeeName.toLowerCase())
        );
      }
      
      if (filters.leaveType) {
        filtered = filtered.filter(leave => leave.leaveType === filters.leaveType);
      }
      
      if (filters.status) {
        filtered = filtered.filter(leave => leave.status === filters.status);
      }
      
      return filtered.map(normalizeLeave);
    }
    throw error;
  }
};

// Get leave by ID
export const getLeaveById = async (id) => {
  try {
    const response = await api.get(`/leaves/${id}`);
    return normalizeLeave(response.data);
  } catch (error) {
    // Mock fallback
    if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
      return normalizeLeave(mockLeaves.find(leave => leave._id === id));
    }
    throw error;
  }
};

// Update leave (only if pending)
export const updateLeave = async (id, leaveData) => {
  try {
    const response = await api.put(`/leaves/${id}`, leaveData);
    const data = response.data;
    if (data?.leave) {
      return {
        ...data,
        leave: normalizeLeave(data.leave)
      };
    }
    return data;
  } catch (error) {
    // Mock fallback
    if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
      const index = mockLeaves.findIndex(leave => leave._id === id);
      if (index !== -1 && mockLeaves[index].status === 'pending') {
        mockLeaves[index] = {
          ...mockLeaves[index],
          ...leaveData,
          updatedAt: new Date().toISOString()
        };
        return normalizeLeave(mockLeaves[index]);
      }
    }
    throw error;
  }
};

// Cancel leave
export const cancelLeave = async (id) => {
  try {
    const response = await api.patch(`/leaves/${id}/cancel`);
    const data = response.data;
    if (data?.leave) {
      return {
        ...data,
        leave: normalizeLeave(data.leave)
      };
    }
    return data;
  } catch (error) {
    // Mock fallback
    if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
      const index = mockLeaves.findIndex(leave => leave._id === id);
      if (index !== -1) {
        mockLeaves[index] = {
          ...mockLeaves[index],
          status: 'cancelled',
          updatedAt: new Date().toISOString()
        };
        return normalizeLeave(mockLeaves[index]);
      }
    }
    throw error;
  }
};

// Approve leave (admin only)
export const approveLeave = async (id) => {
  try {
    const response = await api.patch(`/leaves/${id}/approve`);
    const data = response.data;
    if (data?.leave) {
      return {
        ...data,
        leave: normalizeLeave(data.leave)
      };
    }
    return data;
  } catch (error) {
    // Mock fallback
    if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
      const index = mockLeaves.findIndex(leave => leave._id === id);
      if (index !== -1) {
        mockLeaves[index] = {
          ...mockLeaves[index],
          status: 'approved',
          reviewedBy: getCurrentUserId(),
          reviewedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return normalizeLeave(mockLeaves[index]);
      }
    }
    throw error;
  }
};

// Reject leave (admin only)
export const rejectLeave = async (id) => {
  try {
    const response = await api.patch(`/leaves/${id}/reject`);
    const data = response.data;
    if (data?.leave) {
      return {
        ...data,
        leave: normalizeLeave(data.leave)
      };
    }
    return data;
  } catch (error) {
    // Mock fallback
    if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
      const index = mockLeaves.findIndex(leave => leave._id === id);
      if (index !== -1) {
        mockLeaves[index] = {
          ...mockLeaves[index],
          status: 'rejected',
          reviewedBy: getCurrentUserId(),
          reviewedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return normalizeLeave(mockLeaves[index]);
      }
    }
    throw error;
  }
};

// Get dashboard statistics (admin only)
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/leaves/dashboard/stats');
    return response.data;
  } catch (error) {
    // Mock fallback
    if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
      const totalEmployees = mockUsers.length;
      const totalLeaves = mockLeaves.length;
      const approvedLeaves = mockLeaves.filter(l => l.status === 'approved').length;
      const pendingLeaves = mockLeaves.filter(l => l.status === 'pending').length;
      const rejectedLeaves = mockLeaves.filter(l => l.status === 'rejected').length;
      
      return {
        totalEmployees,
        totalLeaves,
        approvedLeaves,
        pendingLeaves,
        rejectedLeaves
      };
    }
    throw error;
  }
};

