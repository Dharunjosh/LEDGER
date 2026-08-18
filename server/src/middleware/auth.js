import jwt from 'jsonwebtoken';

// Protects a route: requires a valid "Authorization: Bearer <token>" header.
// On success, attaches { id: <userId> } to req.user so controllers know who's asking.
export default function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Session expired or invalid. Please log in again.' });
  }
}
