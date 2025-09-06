// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    success: false,
    message: err.message || 'Internal Server Error',
    statusCode: err.statusCode || 500
  };

  // Mongoose/MySQL duplicate key error
  if (err.code === 'ER_DUP_ENTRY') {
    const message = 'Duplicate field value entered';
    error = {
      success: false,
      message,
      statusCode: 400
    };
  }

  // MySQL foreign key constraint error
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    const message = 'Referenced resource not found';
    error = {
      success: false,
      message,
      statusCode: 400
    };
  }

  // MySQL syntax error
  if (err.code === 'ER_PARSE_ERROR') {
    const message = 'Database query error';
    error = {
      success: false,
      message,
      statusCode: 500
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = {
      success: false,
      message,
      statusCode: 401
    };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = {
      success: false,
      message,
      statusCode: 401
    };
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      success: false,
      message,
      statusCode: 400
    };
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    error.stack = err.stack;
  }

  res.status(error.statusCode).json(error);
};

// Handle 404 routes
const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

module.exports = {
  errorHandler,
  notFound
};