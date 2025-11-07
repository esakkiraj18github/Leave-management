// Validation middleware for task creation/update
export const validateTask = (req, res, next) => {
  const { title, description, completed } = req.body;

  // Validate title
  if (req.method === 'POST' && !title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  if (title && typeof title !== 'string') {
    return res.status(400).json({ error: 'Title must be a string' });
  }

  if (title && title.trim().length === 0) {
    return res.status(400).json({ error: 'Title cannot be empty' });
  }

  // Validate description
  if (description !== undefined && typeof description !== 'string') {
    return res.status(400).json({ error: 'Description must be a string' });
  }

  // Validate completed
  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed must be a boolean' });
  }

  next();
};

