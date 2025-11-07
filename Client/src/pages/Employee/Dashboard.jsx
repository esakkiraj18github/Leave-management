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
import { getMyLeaves } from '../../services/leaveService.js';
import { LEAVE_STATUS_LABELS } from '../../utils/constants.js';
import Loading from '../../components/Common/Loading.jsx';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { format } from 'date-fns';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await getMyLeaves();
      setLeaves(data.slice(0, 5)); // Show only recent 5
      
      // Calculate stats
      setStats({
        total: data.length,
        pending: data.filter(l => l.status === 'pending').length,
        approved: data.filter(l => l.status === 'approved').length,
        rejected: data.filter(l => l.status === 'rejected').length
      });
    } catch (error) {
      console.error('Error fetching leaves:', error);
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
        Employee Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Leaves
              </Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Pending
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Approved
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.approved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Rejected
              </Typography>
              <Typography variant="h4" color="error.main">
                {stats.rejected}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Action */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddCircleIcon />}
              onClick={() => navigate('/employee/apply-leave')}
            >
              Apply for Leave
            </Button>
          </Box>
        </Grid>

        {/* Recent Leaves */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Leave Applications
            </Typography>
            {leaves.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No leave applications yet. Click "Apply for Leave" to get started.
              </Typography>
            ) : (
              <List>
                {leaves.map((leave) => (
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
                            {format(new Date(leave.fromDate), 'MMM dd')} - {format(new Date(leave.toDate), 'MMM dd, yyyy')}
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
                            Type: {leave.leaveType} | Reason: {leave.reason}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
            {leaves.length > 0 && (
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Button onClick={() => navigate('/employee/my-leaves')}>
                  View All Leaves
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EmployeeDashboard;

