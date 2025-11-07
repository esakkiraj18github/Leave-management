import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  MenuItem,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { applyLeave } from '../../services/leaveService.js';
import { LEAVE_TYPES, LEAVE_TYPE_LABELS } from '../../utils/constants.js';
import { format } from 'date-fns';

const ApplyLeave = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      leaveType: '',
      fromDate: '',
      toDate: '',
      reason: ''
    }
  });

  const fromDate = watch('fromDate');

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate dates
      const from = new Date(data.fromDate);
      const to = new Date(data.toDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (from < today) {
        setError('From date cannot be in the past');
        setLoading(false);
        return;
      }

      if (to < from) {
        setError('To date must be after or equal to from date');
        setLoading(false);
        return;
      }

      await applyLeave(data);
      setSuccess('Leave application submitted successfully!');
      setTimeout(() => {
        navigate('/employee/my-leaves');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Apply for Leave
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="leaveType"
                control={control}
                rules={{ required: 'Leave type is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Leave Type"
                    error={!!errors.leaveType}
                    helperText={errors.leaveType?.message}
                    disabled={loading}
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
                control={control}
                rules={{ required: 'From date is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="From Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: format(new Date(), 'yyyy-MM-dd') }}
                    error={!!errors.fromDate}
                    helperText={errors.fromDate?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="toDate"
                control={control}
                rules={{
                  required: 'To date is required',
                  validate: (value) => {
                    if (fromDate && value < fromDate) {
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
                      min: fromDate || format(new Date(), 'yyyy-MM-dd')
                    }}
                    error={!!errors.toDate}
                    helperText={errors.toDate?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="reason"
                control={control}
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
                    error={!!errors.reason}
                    helperText={errors.reason?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/employee/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Submit Application'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default ApplyLeave;

