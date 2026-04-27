const SchedulingService = require('../services/scheduling.service');
const UserModel = require('../models/user.model');
const { sendSuccess, sendEmpty, sendError } = require('../utils/response');

const BroadcastController = {
  /**
   * GET /content/live/:teacher_id  [PUBLIC - No auth required]
   */
  getLiveContent: async (req, res) => {
    try {
      const { teacher_id } = req.params;
      const { subject } = req.query;

      // Validate teacher exists
      const teacher = await UserModel.findById(teacher_id);

      if (!teacher || teacher.role !== 'teacher') {
        return sendEmpty(res, 'No content available');
      }

      // Get currently active broadcast for this teacher
      const broadcast = await SchedulingService.getCurrentBroadcast(
        teacher_id,
        subject || null
      );

      // Edge Case: No approved/active content exists
      if (!broadcast || Object.keys(broadcast).length === 0) {
        return sendEmpty(res, 'No content available');
      }

      // Build response
      const responseData = {
        teacher: {
          id: teacher.id,
          name: teacher.name,
        },
        broadcast_time: new Date().toISOString(),
        active_content: broadcast,
      };

      // If subject filter was applied, flatten to just that subject
      if (subject && broadcast[subject.toLowerCase()]) {
        responseData.active_content = {
          [subject.toLowerCase()]: broadcast[subject.toLowerCase()],
        };
      }

      return sendSuccess(res, responseData, 'Live content fetched successfully');
    } catch (err) {
      console.error('Broadcast error:', err);
      // Return empty for any unexpected errors in public API
      return sendEmpty(res, 'No content available');
    }
  },

  /**
   * GET /content/live/:teacher_id/schedule  [PUBLIC]
   */
  getSchedulePreview: async (req, res) => {
    try {
      const { teacher_id } = req.params;

      const teacher = await UserModel.findById(teacher_id);
      if (!teacher || teacher.role !== 'teacher') {
        return sendEmpty(res, 'No content available');
      }

      const schedule = await SchedulingService.getSchedulePreview(teacher_id);

      if (!schedule || Object.keys(schedule).length === 0) {
        return sendEmpty(res, 'No scheduled content available');
      }

      return sendSuccess(
        res,
        { teacher: { id: teacher.id, name: teacher.name }, schedule },
        'Schedule fetched successfully'
      );
    } catch (err) {
      return sendEmpty(res, 'No content available');
    }
  },
};

module.exports = BroadcastController;
