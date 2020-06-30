const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  return new AppError(
    `Duplicate field value: ${value}. Please use another value!`,
    400
  );
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const handleJWTTokenError = () =>
  new AppError('Invalid Token. Please login again!!', 401);

const handleJWTExpireError = () =>
  new AppError('Your token has expired. Please login again', 401);

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // RENDER
  console.error('ERROR 🔥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send error to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    // Programming error or error which we don't know: don't disclose it to client
    // 1) Log error to console
    console.error('Error 🔥', err);
    // 2) Send generic error to client
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }

  // RENDERED WEBSITE
  // Operational, trusted error: send error to client
  // Log error to console
  console.error('Error 🔥', err);

  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }

  // Programming error or error which we don't know: don't disclose it to client
  // Send generic error to client
  return res.status(500).render('error', {
    title: 'Something went wrong!',
    msg: 'Something went wrong!',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);

    if (error.code === '11000') error = handleDuplicateFieldsDB(error);

    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    if (error.name === 'JsonWebTokenError') error = handleJWTTokenError();

    if (error.name === 'TokenExpiredError') error = handleJWTExpireError();

    sendErrorProd(error, req, res);
  }
};
