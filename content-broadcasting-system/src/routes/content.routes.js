const express = require('express');
const router = express.Router();
const ContentController = require('../controllers/content.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { handleUploadError } = require('../middlewares/upload.middleware');
const { validateContentUpload } = require('../middlewares/validation.middleware');

// POST /content/upload - Teacher uploads content
router.post(
  '/upload',
  authenticate,
  authorize('teacher'),
  handleUploadError,          // Multer file upload
  validateContentUpload,      // Validate fields after upload
  ContentController.upload
);

// GET /content/my - Teacher views their own content
router.get(
  '/my',
  authenticate,
  authorize('teacher'),
  ContentController.getMyContent
);

// GET /content - Principal views ALL content (with filters)
router.get(
  '/',
  authenticate,
  authorize('principal'),
  ContentController.getAllContent
);

// GET /content/:id - Get single content by ID (Principal or Teacher-own)
router.get(
  '/:id',
  authenticate,
  authorize('principal', 'teacher'),
  ContentController.getContentById
);

module.exports = router;
