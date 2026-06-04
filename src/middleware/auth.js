import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      traceId: req.traceId,
      success: false,
      error: { code: "UNAUTHORIZED", message: "Missing or invalid authorization token" }
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({
      traceId: req.traceId,
      success: false,
      error: { code: "UNAUTHORIZED", message: "Session expired or corrupted token" }
    });
  }
};