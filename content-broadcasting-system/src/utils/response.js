/**
 * Sends a success response
 */
const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Sends an error response
 */
const sendError = (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

/**
 * Sends empty/no content response (used for broadcast edge cases)
 */
const sendEmpty = (res, message = 'No content available') => {
  return res.status(200).json({
    success: true,
    message,
    data: null,
  });
};

module.exports = { sendSuccess, sendError, sendEmpty };
