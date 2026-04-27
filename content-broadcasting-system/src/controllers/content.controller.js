const ContentService = require('../services/content.service');
const { sendSuccess, sendError } = require('../utils/response');
const fs = require('fs');

const ContentController = {
  /**
   * POST /content/upload  [Teacher only]
   */
  upload: async (req, res) => {
    try {
      if (!req.file) {
        return sendError(res, 'File is required.', 400);
      }

      const content = await ContentService.uploadContent(req.file, req.body, req.user.id);
      return sendSuccess(res, content, 'Content uploaded successfully. Awaiting principal approval.', 201);
    } catch (err) {
      // Clean up uploaded file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlink(req.file.path, () => {});
      }
      return sendError(res, err.message || 'Upload failed', err.status || 500);
    }
  },

  /**
   * GET /content/my  [Teacher only]
   */
  getMyContent: async (req, res) => {
    try {
      const { status, subject } = req.query;
      const content = await ContentService.getTeacherContent(req.user.id, { status, subject });
      return sendSuccess(res, content, 'Content fetched successfully');
    } catch (err) {
      return sendError(res, err.message || 'Failed to fetch content', err.status || 500);
    }
  },

  /**
   * GET /content  [Principal only]
   */
  getAllContent: async (req, res) => {
    try {
      const { status, subject, teacher_id, page, limit } = req.query;
      const result = await ContentService.getAllContent({ status, subject, teacher_id, page, limit });
      return sendSuccess(res, result, 'Content fetched successfully');
    } catch (err) {
      return sendError(res, err.message || 'Failed to fetch content', err.status || 500);
    }
  },

  /**
   * GET /content/:id  [Principal or Teacher (own)]
   */
  getContentById: async (req, res) => {
    try {
      const content = await ContentService.getContentById(req.params.id);

      // Teachers can only see their own content
      if (req.user.role === 'teacher' && content.uploaded_by !== req.user.id) {
        return sendError(res, 'Access denied. You can only view your own content.', 403);
      }

      return sendSuccess(res, content, 'Content fetched successfully');
    } catch (err) {
      return sendError(res, err.message || 'Failed to fetch content', err.status || 500);
    }
  },
};

module.exports = ContentController;
