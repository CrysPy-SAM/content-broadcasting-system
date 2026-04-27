const path = require('path');
const ContentModel = require('../models/content.model');
const ScheduleModel = require('../models/schedule.model');
const { uploadDir } = require('../middlewares/upload.middleware');

const ContentService = {
  /**
   * Handle content upload by teacher
   */
  uploadContent: async (file, body, teacher_id) => {
    const { title, description, subject, start_time, end_time, rotation_duration } = body;

    const normalizedSubject = subject.trim().toLowerCase();

    // Build file URL for serving
    const file_url = `/uploads/${file.filename}`;
    const file_path = file.path;
    const file_type = path.extname(file.originalname).toLowerCase().replace('.', '');
    const file_size = file.size;

    // Save content to DB
    const content = await ContentModel.create({
      title: title.trim(),
      description: description || null,
      subject: normalizedSubject,
      file_url,
      file_path,
      file_type,
      file_size,
      uploaded_by: teacher_id,
      start_time: start_time || null,
      end_time: end_time || null,
    });

    // If schedule info provided, create/update slot and schedule
    if (start_time && end_time) {
      const slot = await ScheduleModel.findOrCreateSlot(normalizedSubject, teacher_id);
      const rotation_order = await ScheduleModel.getNextRotationOrder(slot.id);
      const duration = parseInt(rotation_duration) || 5;

      await ScheduleModel.upsertSchedule({
        content_id: content.id,
        slot_id: slot.id,
        rotation_order,
        duration,
      });
    }

    return content;
  },

  /**
   * Get teacher's own content
   */
  getTeacherContent: async (teacher_id, filters = {}) => {
    return await ContentModel.findByTeacher(teacher_id, filters);
  },

  /**
   * Get all content (principal)
   */
  getAllContent: async (filters = {}) => {
    const { page = 1, limit = 20 } = filters;
    const contents = await ContentModel.findAll(filters);
    const total = await ContentModel.count(filters);

    return {
      contents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get single content by ID
   */
  getContentById: async (id) => {
    const content = await ContentModel.findById(id);
    if (!content) {
      throw { status: 404, message: 'Content not found.' };
    }
    return content;
  },
};

module.exports = ContentService;
