const multer = require('multer');

/**
 * 404 handler for unmatched routes. Registered after all routes.
 */
function notFound(req, res, _next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

/**
 * Centralized error handler. Normalizes Multer upload errors (file too large,
 * invalid file type) into clean 400 responses instead of generic 500s.
 * Must be registered last, after all routes and the 404 handler.
 */
// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity (4 args)
function errorHandler(err, _req, res, _next) {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File is too large. Maximum allowed size is 20MB.'
        : `Upload error: ${err.message}`;
    return res.status(400).json({ error: message });
  }

  // fileFilter rejections are thrown as a generic Error with this message
  if (err && err.message === 'Only PDF and image files are allowed') {
    return res.status(400).json({ error: err.message });
  }

  console.error('[Unhandled Error]', err);
  return res.status(500).json({ error: 'Internal server error', details: err && err.message });
}

module.exports = { notFound, errorHandler };
