import { Alert, AlertTitle } from '@mui/material';

const ErrorMessage = ({ message, title = 'Error' }) => {
  return (
    <Alert severity="error">
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
};

export default ErrorMessage;

