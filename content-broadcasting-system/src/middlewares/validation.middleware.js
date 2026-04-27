const { sendError } = require('../utils/response');

/**
 * Validate login request body
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  const errors = [];

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    errors.push('Valid email is required.');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters.');
  }

  if (errors.length > 0) {
    return sendError(res, 'Validation failed', 400, errors);
  }

  next();
};

/**
 * Validate content upload request
 */
const validateContentUpload = (req, res, next) => {
  const { title, subject, rotation_duration } = req.body;

  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Title is required.');
  }

  if (title && title.trim().length > 500) {
    errors.push('Title must not exceed 500 characters.');
  }

  if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
    errors.push('Subject is required.');
  }

  // Validate time window if provided
  const { start_time, end_time } = req.body;

  if (start_time && isNaN(Date.parse(start_time))) {
    errors.push('start_time must be a valid ISO date string.');
  }

  if (end_time && isNaN(Date.parse(end_time))) {
    errors.push('end_time must be a valid ISO date string.');
  }

  if (start_time && end_time) {
    if (new Date(start_time) >= new Date(end_time)) {
      errors.push('start_time must be before end_time.');
    }
  }

  if (start_time && !end_time) {
    errors.push('end_time is required when start_time is provided.');
  }

  if (end_time && !start_time) {
    errors.push('start_time is required when end_time is provided.');
  }

  if (rotation_duration !== undefined) {
    const dur = parseInt(rotation_duration);
    if (isNaN(dur) || dur < 1) {
      errors.push('rotation_duration must be a positive integer (minutes).');
    }
  }

  if (!req.file) {
    errors.push('File is required. Allowed formats: JPG, PNG, GIF.');
  }

  if (errors.length > 0) {
    // Clean up uploaded file if validation fails
    if (req.file) {
      const fs = require('fs');
      fs.unlink(req.file.path, () => {});
    }
    return sendError(res, 'Validation failed', 400, errors);
  }

  next();
};

/**
 * Validate approval/rejection
 */
const validateApproval = (req, res, next) => {
  const { action, rejection_reason } = req.body;
  const errors = [];

  if (!action || !['approve', 'reject'].includes(action)) {
    errors.push('action must be either "approve" or "reject".');
  }

  if (action === 'reject') {
    if (!rejection_reason || typeof rejection_reason !== 'string' || rejection_reason.trim().length === 0) {
      errors.push('rejection_reason is required when rejecting content.');
    }
  }

  if (errors.length > 0) {
    return sendError(res, 'Validation failed', 400, errors);
  }

  next();
};

module.exports = { validateLogin, validateContentUpload, validateApproval };
