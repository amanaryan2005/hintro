import crypto from 'crypto';

export const traceAndLogMiddleware = (req, res, next) => {
  // Capture or generate Trace ID
  req.traceId = req.headers['x-trace-id'] || crypto.randomUUID();
  res.setHeader('x-trace-id', req.traceId);

  const start = Date.now();

  // Log on request completion
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logPayload = {
      timestamp: new Date().toISOString(),
      traceId: req.traceId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`
    };
    console.log(JSON.stringify(logPayload));
  });

  next();
};