export const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || 500;
  
  const errorResponse = {
    traceId: req.traceId || "system-generated",
    success: false,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: err.message || "An unexpected error occurred."
    }
  };

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};