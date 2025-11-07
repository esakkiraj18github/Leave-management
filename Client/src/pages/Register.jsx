import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
  InputAdornment,
  IconButton,
  Grid
} from '@mui/material';
import { User, Mail, Lock, Phone, Building2, Eye, EyeOff, Shield } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import api from '../services/api.js';

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'employee', // Default to employee, but user can select admin
      phone: '',
      department: ''
    }
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Remove confirmPassword from data before sending
      const { confirmPassword, ...registerData } = data;
      
      const response = await api.post('/auth/register', registerData);
      
      setSuccess('Registration successful! Redirecting to login...');
      
      // Redirect to login after 1.5 seconds
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md" sx={{ py: 2, height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%' }}>
        <Paper elevation={3} sx={{ padding: 2.5, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom sx={{ mb: 0.5 }}>
            Leave Management System
          </Typography>
          <Typography component="h2" variant="subtitle2" align="center" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
            Create Account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 1.5 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={1.5}>
              {/* Row 1: Name and Email */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="name"
                  control={control}
                  rules={{
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label="Full Name"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <User size={18} />
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: 'Please enter a valid email address'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label="Email Address"
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Mail size={18} />
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Row 2: Password and Confirm Password */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock size={18} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              disabled={loading}
                              size="small"
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="confirmPassword"
                  control={control}
                  rules={{
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match'
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock size={18} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle confirm password visibility"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                              disabled={loading}
                              size="small"
                            >
                              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Row 3: Phone Number and Department (Optional) */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="phone"
                  control={control}
                  rules={{
                    pattern: {
                      value: /^[0-9+\-\s()]+$/,
                      message: 'Please enter a valid phone number'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label="Phone Number (Optional)"
                      type="tel"
                      placeholder="Enter your phone number"
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone size={18} />
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label="Department (Optional)"
                      placeholder="Enter your department"
                      error={!!errors.department}
                      helperText={errors.department?.message}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Building2 size={18} />
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Row 4: Role Selection */}
              <Grid item xs={12}>
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: 'Role is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      size="small"
                      label="Role"
                      error={!!errors.role}
                      helperText={errors.role?.message}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Shield size={18} />
                          </InputAdornment>
                        )
                      }}
                    >
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="employee">Employee</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 0.5, mb: 0.5 }}
                  disabled={loading}
                  size="small"
                >
                  {loading ? <CircularProgress size={20} /> : 'Register'}
                </Button>
              </Grid>

              {/* Login Link */}
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>
                      Sign In
                    </Link>
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Demo Credentials */}
          <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2" gutterBottom sx={{ fontSize: '0.8rem', mb: 0.5 }}>
              <strong>Demo Credentials (Will be stored in database):</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.25 }}>
              <strong>Admin:</strong> admin@example.com / admin123
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              <strong>Employee:</strong> employee@example.com / employee123
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;

