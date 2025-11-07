import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import { useForm, Controller } from 'react-hook-form';
import { getMyLeaves, updateLeave, cancelLeave } from '../../services/leaveService.js';
import { LEAVE_STATUS, LEAVE_STATUS_LABELS, LEAVE_TYPE_LABELS } from '../../utils/constants.js';
import Loading from '../../components/Common/Loading.jsx';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext.jsx';

const MyLeaves = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    formState: { errors: editErrors },
    reset: resetEditForm,
    watch: watchEdit
  } = useForm();

  const editFromDate = watchEdit('fromDate');

  useEffect(() => {
    fetchLeaves();
  }, [filterStatus]);

  useEffect(() => {
    if (selectedLeave && editDialogOpen) {
      const formattedFromDate = selectedLeave.fromDate
        ? format(new Date(selectedLeave.fromDate), 'yyyy-MM-dd')
        : '';
      const formattedToDate = selectedLeave.toDate
        ? format(new Date(selectedLeave.toDate), 'yyyy-MM-dd')
        : '';

      resetEditForm({
        leaveType: selectedLeave.leaveType,
        fromDate: formattedFromDate,
        toDate: formattedToDate,
        reason: selectedLeave.reason
      });
    }
  }, [selectedLeave, editDialogOpen, resetEditForm]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const filters = filterStatus !== 'all' ? { status: filterStatus } : {};
      const data = await getMyLeaves(filters);
      setLeaves(data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      setError('Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (leave) => {
    if (leave.status === LEAVE_STATUS.PENDING) {
      setSelectedLeave(leave);
      setEditDialogOpen(true);
    }
  };

  const handleCancel = (leave) => {
    setSelectedLeave(leave);
    setCancelDialogOpen(true);
  };

  const confirmCancel = async () => {
    try {
      setError('');
      await cancelLeave(selectedLeave._id);
      setSuccess('Leave cancelled successfully');
      setCancelDialogOpen(false);
      setSelectedLeave(null);
      fetchLeaves();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to cancel leave');
    }
  };

  const handleEditSubmitForm = async (data) => {
    try {
      setError('');
      setEditLoading(true);
      
      // Validate dates
      const from = new Date(data.fromDate);
      const to = new Date(data.toDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (from < today) {
        setError('From date cannot be in the past');
        setEditLoading(false);
        return;
      }

      if (to < from) {
        setError('To date must be after or equal to from date');
        setEditLoading(false);
        return;
      }

      await updateLeave(selectedLeave._id, data);
      setSuccess('Leave updated successfully');
      setEditDialogOpen(false);
      setSelectedLeave(null);
      fetchLeaves();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update leave');
    } finally {
      setEditLoading(false);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Leave Applications</Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/employee/apply-leave')}
        >
          Apply for Leave
        </Button>
      </Box>

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

      <Box sx={{ mb: 2 }}>
        <TextField
          select
          label="Filter by Status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="all">All Status</MenuItem>
          {Object.entries(LEAVE_STATUS_LABELS).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Leave Type</TableCell>
              <TableCell>Employee Name</TableCell>
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
            {leaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    No leave applications found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              leaves.map((leave) => {
                const fromDate = new Date(leave.fromDate);
                const toDate = new Date(leave.toDate);
                const duration = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

                return (
                  <TableRow key={leave._id}>
                    <TableCell>{LEAVE_TYPE_LABELS[leave.leaveType]}</TableCell>
                    <TableCell>{leave.employeeName || leave.employeeId?.name || user?.name || '-'}</TableCell>
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
                        <>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(leave)}
                            title="Edit"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleCancel(leave)}
                            title="Cancel"
                          >
                            <CancelIcon />
                          </IconButton>
                        </>
                      )}
                      {leave.status === LEAVE_STATUS.APPROVED && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleCancel(leave)}
                          title="Cancel"
                        >
                          <CancelIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Leave Application</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleEditSubmit(handleEditSubmitForm)} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="leaveType"
                  control={editControl}
                  rules={{ required: 'Leave type is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Leave Type"
                      error={!!editErrors.leaveType}
                      helperText={editErrors.leaveType?.message}
                      disabled={editLoading}
                    >
                      {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="fromDate"
                  control={editControl}
                  rules={{ required: 'From date is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="From Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: format(new Date(), 'yyyy-MM-dd') }}
                      error={!!editErrors.fromDate}
                      helperText={editErrors.fromDate?.message}
                      disabled={editLoading}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="toDate"
                  control={editControl}
                  rules={{
                    required: 'To date is required',
                    validate: (value) => {
                      if (editFromDate && value < editFromDate) {
                        return 'To date must be after or equal to from date';
                      }
                      return true;
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="To Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        min: editFromDate || format(new Date(), 'yyyy-MM-dd')
                      }}
                      error={!!editErrors.toDate}
                      helperText={editErrors.toDate?.message}
                      disabled={editLoading}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="reason"
                  control={editControl}
                  rules={{
                    required: 'Reason is required',
                    minLength: {
                      value: 10,
                      message: 'Reason must be at least 10 characters'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Reason"
                      multiline
                      rows={4}
                      error={!!editErrors.reason}
                      helperText={editErrors.reason?.message}
                      disabled={editLoading}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={editLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit(handleEditSubmitForm)}
            variant="contained"
            disabled={editLoading}
          >
            {editLoading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Leave Application</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this leave application? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>No</Button>
          <Button onClick={confirmCancel} color="error" variant="contained">
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyLeaves;

