const ContentModel = require('../models/content.model');

const ApprovalService = {
  /**
   * Principal approves or rejects content
   */
  processApproval: async (content_id, { action, rejection_reason }, principal_id) => {
    // Find content
    const content = await ContentModel.findById(content_id);

    if (!content) {
      throw { status: 404, message: 'Content not found.' };
    }

    if (content.status !== 'pending') {
      throw {
        status: 400,
        message: `Content is already ${content.status}. Only pending content can be approved or rejected.`,
      };
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const updated = await ContentModel.updateStatus(content_id, {
      status: newStatus,
      rejection_reason: action === 'reject' ? rejection_reason.trim() : null,
      approved_by: action === 'approve' ? principal_id : null,
    });

    return updated;
  },

  /**
   * Get all pending content (for principal review)
   */
  getPendingContent: async () => {
    return await ContentModel.findAll({ status: 'pending' });
  },
};

module.exports = ApprovalService;
