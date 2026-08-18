// Catches anything thrown or passed to next(err) in any route and
// turns it into a consistent JSON error response instead of crashing the server.
export function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(', ') });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: 'That email is already registered.' });
  }

  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Something went wrong on the server.' });
}
