import { body, validationResult } from 'express-validator';

// Validation middleware for leave creation/update
export const validateLeave = [
  body('leaveType')
    .notEmpty()
    .withMessage('Leave type is required')
    .isIn(['sick', 'vacation', 'personal', 'other'])
    .withMessage('Invalid leave type'),
  
  body('fromDate')
    .notEmpty()
    .withMessage('From date is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        throw new Error('From date cannot be in the past');
      }
      return true;
    }),
  
  body('toDate')
    .notEmpty()
    .withMessage('To date is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value, { req }) => {
      const toDate = new Date(value);
      const fromDate = new Date(req.body.fromDate);
      if (toDate < fromDate) {
        throw new Error('To date must be after or equal to from date');
      }
      return true;
    }),
  
  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),

  // Check for validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }
    next();
  }
];

