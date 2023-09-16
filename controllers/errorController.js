const AppError = require('../utils/appError');

const errorDev = (error, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack,
    });
  } else {
    console.log('erro: ', error);
    res.status(error.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: error.message,
    });
  }
};

const errorProd = (error, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (error.isOperational) {
      return res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    }

    return res.status(error.statusCode).json({
      status: 'erro',
      message: 'Something got very wrong',
    });
  }

  if (error.isOperational) {
    return res.status(error.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: error.message,
    });
  }

  return res.status(error.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 404);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid TOKEN, please log in', 401);

const handleTokenExpired = () =>
  new AppError('Token expired, please log in again!', 401);

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    errorDev(error, req, res);
  } else {
    let err = error;
    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    if (err.name === 'TokenExpiredError') err = handleTokenExpired();
    errorProd(err, req, res);
  }
  next();
};
