const ApprovalService = require('../services/approval.service');
const { sendSuccess, sendError } = require('../utils/response');

const ApprovalController = {
  /**
   * PATCH /approval/:content_id  [Principal only]
   * Approve or reject content
   */
  processApproval: async (req, res) => {
    try {
      const { content_id } = req.params;
      const { action, rejection_reason } = req.body;

      const updated = await ApprovalService.processApproval(
        content_id,
        { action, rejection_reason },
        req.user.id
      );

      const message = action === 'approve'
        ? 'Content approved successfully. It will be available for broadcasting.'
        : 'Content rejected successfully.';

      return sendSuccess(res, updated, message);
    } catch (err) {
      return sendError(res, err.message || 'Approval action failed', err.status || 500);
    }
  },

  /**
   * GET /approval/pending  [Principal only]
   * Get all pending content for review
   */
  getPendingContent: async (req, res) => {
    try {
      const pending = await ApprovalService.getPendingContent();
      return sendSuccess(res, pending, `${pending.length} pending content item(s) found`);
    } catch (err) {
      return sendError(res, err.message || 'Failed to fetch pending content', err.status || 500);
    }
  },
};

module.exports = ApprovalController;
