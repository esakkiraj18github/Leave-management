// Leave Types
export const LEAVE_TYPES = {
  SICK: 'sick',
  VACATION: 'vacation',
  PERSONAL: 'personal',
  OTHER: 'other'
};

export const LEAVE_TYPE_LABELS = {
  [LEAVE_TYPES.SICK]: 'Sick Leave',
  [LEAVE_TYPES.VACATION]: 'Vacation',
  [LEAVE_TYPES.PERSONAL]: 'Personal',
  [LEAVE_TYPES.OTHER]: 'Other'
};

// Leave Status
export const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

export const LEAVE_STATUS_LABELS = {
  [LEAVE_STATUS.PENDING]: 'Pending',
  [LEAVE_STATUS.APPROVED]: 'Approved',
  [LEAVE_STATUS.REJECTED]: 'Rejected',
  [LEAVE_STATUS.CANCELLED]: 'Cancelled'
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee'
};

// API Base URL (will be updated when backend is ready)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

