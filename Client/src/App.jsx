import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout/Layout.jsx';
import ProtectedRoute from './components/Layout/ProtectedRoute.jsx';

// Pages
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import EmployeeDashboard from './pages/Employee/Dashboard.jsx';
import ApplyLeave from './pages/Employee/ApplyLeave.jsx';
import MyLeaves from './pages/Employee/MyLeaves.jsx';
import AdminDashboard from './pages/Admin/Dashboard.jsx';
import LeaveApproval from './pages/Admin/LeaveApproval.jsx';

// Create Material UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Component to handle role-based routing
const RoleBasedRedirect = () => {
  const { user } = useAuth();
  
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user?.role === 'employee') {
    return <Navigate to="/employee/dashboard" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes - Employee */}
              <Route
                path="/employee/dashboard"
                element={
                  <ProtectedRoute>
                    <EmployeeDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/apply-leave"
                element={
                  <ProtectedRoute>
                    <ApplyLeave />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/my-leaves"
                element={
                  <ProtectedRoute>
                    <MyLeaves />
                  </ProtectedRoute>
                }
              />
              
              {/* Protected Routes - Admin */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/leave-approval"
                element={
                  <ProtectedRoute requireAdmin>
                    <LeaveApproval />
                  </ProtectedRoute>
                }
              />
              
              {/* Root redirect */}
              <Route path="/" element={<RoleBasedRedirect />} />
              
              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
