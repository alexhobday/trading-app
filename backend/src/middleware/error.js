export const errorHandler = (err, c) => {
  console.error('Worker Error:', err);

  return c.json({
    error: 'Internal server error',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  }, 500);
};