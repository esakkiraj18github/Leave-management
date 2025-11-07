import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  MenuItem,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Grid,
  InputAdornment
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import { getAllLeaves, approveLeave, rejectLeave } from '../../services/leaveService.js';
import { LEAVE_STATUS, LEAVE_STATUS_LABELS, LEAVE_TYPE_LABELS, LEAVE_TYPES } from '../../utils/constants.js';
import Loading from '../../components/Common/Loading.jsx';
import { format } from 'date-fns';

const LeaveApproval = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    employeeName: '',
    leaveType: 'all',
    status: 'all'
  });
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [leaves, filters]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await getAllLeaves();
      setLeaves(data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      setError('Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...leaves];

    if (filters.employeeName) {
      const searchTerm = filters.employeeName.toLowerCase();
      filtered = filtered.filter(leave => {
        const name = leave.employeeName || leave.employeeId?.name || '';
        return name.toLowerCase().includes(searchTerm);
      });
    }

    if (filters.leaveType !== 'all') {
      filtered = filtered.filter(leave => leave.leaveType === filters.leaveType);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(leave => leave.status === filters.status);
    }

    setFilteredLeaves(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApprove = (leave) => {
    setSelectedLeave(leave);
    setActionType('approve');
    setActionDialogOpen(true);
  };

  const handleReject = (leave) => {
    setSelectedLeave(leave);
    setActionType('reject');
    setActionDialogOpen(true);
  };

  const confirmAction = async () => {
    try {
      setError('');
      setSuccess('');
      
      if (actionType === 'approve') {
        await approveLeave(selectedLeave._id);
        setSuccess('Leave approved successfully');
      } else {
        await rejectLeave(selectedLeave._id);
        setSuccess('Leave rejected successfully');
      }
      
      setActionDialogOpen(false);
      fetchLeaves();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || `Failed to ${actionType} leave`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case LEAVE_STATUS.APPROVED:
        return 'success';
      case LEAVE_STATUS.REJECTED:
        return 'error';
      case LEAVE_STATUS.PENDING:
        return 'warning';
      case LEAVE_STATUS.CANCELLED:
        return 'default';
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
        Leave Approval
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Review and manage all leave applications
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search by Employee Name"
              value={filters.employeeName}
              onChange={(e) => handleFilterChange('employeeName', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Filter by Leave Type"
              value={filters.leaveType}
              onChange={(e) => handleFilterChange('leaveType', e.target.value)}
            >
              <MenuItem value="all">All Types</MenuItem>
              {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Filter by Status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              {Object.entries(LEAVE_STATUS_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Leaves Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee Name</TableCell>
              <TableCell>Leave Type</TableCell>
              <TableCell>From Date</TableCell>
              <TableCell>To Date</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Applied On</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLeaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    No leave applications found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredLeaves.map((leave) => {
                const fromDate = new Date(leave.fromDate);
                const toDate = new Date(leave.toDate);
                const duration = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

                return (
                  <TableRow key={leave._id}>
                    <TableCell>{leave.employeeName || leave.employeeId?.name || 'Unknown Employee'}</TableCell>
                    <TableCell>{LEAVE_TYPE_LABELS[leave.leaveType]}</TableCell>
                    <TableCell>{format(fromDate, 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{format(toDate, 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{duration} day(s)</TableCell>
                    <TableCell>{leave.reason}</TableCell>
                    <TableCell>
                      <Chip
                        label={LEAVE_STATUS_LABELS[leave.status]}
                        color={getStatusColor(leave.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(leave.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {leave.status === LEAVE_STATUS.PENDING && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleApprove(leave)}
                            title="Approve"
                          >
                            <CheckCircleIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleReject(leave)}
                            title="Reject"
                          >
                            <CancelIcon />
                          </IconButton>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)}>
        <DialogTitle>
          {actionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {actionType} this leave request?
          </Typography>
          {selectedLeave && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                    <strong>Employee:</strong> {selectedLeave.employeeName || selectedLeave.employeeId?.name || 'Unknown Employee'}
              </Typography>
              <Typography variant="body2">
                <strong>Leave Type:</strong> {LEAVE_TYPE_LABELS[selectedLeave.leaveType]}
              </Typography>
              <Typography variant="body2">
                <strong>Dates:</strong> {format(new Date(selectedLeave.fromDate), 'MMM dd')} - {format(new Date(selectedLeave.toDate), 'MMM dd, yyyy')}
              </Typography>
              <Typography variant="body2">
                <strong>Reason:</strong> {selectedLeave.reason}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmAction}
            color={actionType === 'approve' ? 'success' : 'error'}
            variant="contained"
          >
            {actionType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LeaveApproval;

