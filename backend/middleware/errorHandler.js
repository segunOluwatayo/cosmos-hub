/**
 * Global Express error handler.
 * What this does is it handles NASA API errors, network errors, and general server errors.
 */
const errorHandler = (err, req, res, _next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);

  // NASA API / Axios response error
  if (err.response) {
    const status = err.response.status;
    const nasaMessage =
      err.response.data?.error?.message ||
      err.response.data?.msg ||
      'Failed to fetch data from NASA API';

    return res.status(status).json({
      error: 'NASA API Error',
      message: nasaMessage,
      status,
    });
  }

  // Network / timeout error (no response received)
  if (err.request) {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Unable to reach NASA API. Please try again shortly.',
    });
  }

  // Validation or app-level error with explicit status
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.name || 'Request Error',
      message: err.message,
    });
  }

  // Fallback: unexpected server error
  res.status(500).json({
    error: 'Internal Server Error',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'An unexpected error occurred. Please try again.',
  });
};

module.exports = errorHandler;