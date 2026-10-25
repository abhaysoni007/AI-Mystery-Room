import { sendError } from '../utils/response.js';

export function errorHandler(err, req, res, next) {
  if (err.name === 'ZodError') {
    const fields = {};
    for (const issue of err.issues) {
      const path = issue.path.join('.');
      fields[path] = issue.message;
    }
    return sendError(res, {
      code: 'VALIDATION_ERROR',
      message: 'The supplied input is invalid',
      statusCode: 400,
      fields,
    });
  }

  return sendError(res, {
    code: err.code || 'INTERNAL_ERROR',
    message: err.message || 'An unexpected error occurred',
    statusCode: err.statusCode || 500,
  });
}

export function notFoundHandler(req, res) {
  return sendError(res, {
    code: 'NOT_FOUND',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    statusCode: 404,
  });
}
