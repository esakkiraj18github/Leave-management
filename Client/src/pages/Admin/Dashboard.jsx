import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { useAuth } from '../../context/AuthContext.jsx';
import { getDashboardStats, getAllLeaves } from '../../services/leaveService.js';
import { LEAVE_STATUS_LABELS, LEAVE_TYPE_LABELS } from '../../utils/constants.js';
import Loading from '../../components/Common/Loading.jsx';
import ApprovalIcon from '@mui/icons-material/Approval';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalLeaves: 0,
    approvedLeaves: 0,
    pendingLeaves: 0,
    rejectedLeaves: 0
  });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, leavesData] = await Promise.all([
        getDashboardStats(),
        getAllLeaves()
      ]);
      
      setStats(statsData);
      // Get recent 5 pending leaves
      const pending = leavesData
        .filter(l => l.status === 'pending')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentLeaves(pending);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.name}!
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Employees
              </Typography>
              <Typography variant="h4">{stats.totalEmployees}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Leave Requests
              </Typography>
              <Typography variant="h4">{stats.totalLeaves}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Pending Leaves
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.pendingLeaves}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Approved Leaves
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.approvedLeaves}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Rejected Leaves
              </Typography>
              <Typography variant="h4" color="error.main">
                {stats.rejectedLeaves}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Action */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<ApprovalIcon />}
              onClick={() => navigate('/admin/leave-approval')}
            >
              Review Leave Requests
            </Button>
          </Box>
        </Grid>

        {/* Recent Pending Leaves */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Pending Leave Requests
            </Typography>
            {recentLeaves.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No pending leave requests at the moment.
              </Typography>
            ) : (
              <List>
                {recentLeaves.map((leave) => {
                  const employeeName = leave.employeeName || leave.employeeId?.name || 'Unknown Employee';
                  const employeeEmail = leave.employeeEmail || leave.employeeId?.email;
                  const leaveTypeLabel = LEAVE_TYPE_LABELS[leave.leaveType] || leave.leaveType;
                  const subtitleParts = [
                    `Type: ${leaveTypeLabel}`,
                    `Reason: ${leave.reason}`
                  ];

                  if (employeeEmail) {
                    subtitleParts.unshift(`Email: ${employeeEmail}`);
                  }

                  return (
                    <ListItem
                      key={leave._id}
                      sx={{
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">
                              {employeeName} - {format(new Date(leave.fromDate), 'MMM dd')} to {format(new Date(leave.toDate), 'MMM dd, yyyy')}
                            </Typography>
                            <Chip
                              label={LEAVE_STATUS_LABELS[leave.status]}
                              color={getStatusColor(leave.status)}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {subtitleParts.join(' | ')}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
            {recentLeaves.length > 0 && (
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Button onClick={() => navigate('/admin/leave-approval')}>
                  View All Requests
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;

