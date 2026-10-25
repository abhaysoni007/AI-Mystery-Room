export function sendSuccess(res, { data = null, message = 'Request completed successfully', meta = undefined, statusCode = 200 } = {}) {
  const payload = {
    success: true,
    data,
    message,
  };
  if (meta !== undefined) {
    payload.meta = meta;
  }
  return res.status(statusCode).json(payload);
}

export function sendError(res, { code = 'INTERNAL_ERROR', message = 'An unexpected error occurred', statusCode = 500, fields = undefined, requestId = undefined } = {}) {
  const errorObj = {
    code,
    message,
  };
  if (fields !== undefined) {
    errorObj.fields = fields;
  }
  if (requestId !== undefined) {
    errorObj.requestId = requestId;
  }
  return res.status(statusCode).json({
    success: false,
    error: errorObj,
  });
}
