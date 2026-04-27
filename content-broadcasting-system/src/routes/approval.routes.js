const express = require('express');
const router = express.Router();
const ApprovalController = require('../controllers/approval.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validateApproval } = require('../middlewares/validation.middleware');

// GET /approval/pending - Principal views all pending content
router.get(
  '/pending',
  authenticate,
  authorize('principal'),
  ApprovalController.getPendingContent
);

// PATCH /approval/:content_id - Principal approves or rejects
router.patch(
  '/:content_id',
  authenticate,
  authorize('principal'),
  validateApproval,
  ApprovalController.processApproval
);

module.exports = router;
