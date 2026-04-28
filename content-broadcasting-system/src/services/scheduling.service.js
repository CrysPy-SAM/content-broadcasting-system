const pool = require('../config/database');
const ScheduleModel = require('../models/schedule.model');

const SchedulingService = {
  /**
   * CORE SCHEDULING LOGIC
   */
  getCurrentBroadcast: async (teacher_id, subject_filter = null) => {
    // Step 1: Fetch teacher's active content with schedule info
    const slots = await ScheduleModel.getSlotsByTeacher(teacher_id);

    if (!slots || slots.length === 0) {
      return null;
    }

    const now = new Date();
    const activeContentBySubject = {};

    // Step 2: For each subject slot, determine active content
    for (const slot of slots) {
      // Skip if subject filter doesn't match
      if (subject_filter && slot.subject !== subject_filter.toLowerCase()) {
        continue;
      }

      const scheduleItems = await ScheduleModel.getScheduleBySlot(slot.id);

      if (!scheduleItems || scheduleItems.length === 0) {
        // No active scheduled content for this subject
        continue;
      }

      // Step 3: Calculate rotation
      const activeContent = SchedulingService._getActiveContentFromSchedule(scheduleItems, now);

      if (activeContent) {
        activeContentBySubject[slot.subject] = activeContent;
      }
    }

    return Object.keys(activeContentBySubject).length > 0 ? activeContentBySubject : null;
  },

  /**
   * Internal: Determines which content is currently active based on rotation logic
   * 
   * @param {Array} scheduleItems - sorted by rotation_order, each has { duration, content_id, file_url, title, ... }
   * @param {Date} now - current time
   * @returns {Object|null} - the currently active content item
   */
  _getActiveContentFromSchedule: (scheduleItems, now) => {
    if (!scheduleItems || scheduleItems.length === 0) return null;

    // Calculate total cycle duration in milliseconds
    const totalCycleMs = scheduleItems.reduce((sum, item) => {
      return sum + (parseInt(item.duration) || 5) * 60 * 1000;
    }, 0);

    if (totalCycleMs === 0) return null;

    // This makes rotation deterministic and globally consistent
    const epochMs = now.getTime();
    const positionInCycleMs = epochMs % totalCycleMs;

    // Walk through items to find which one covers the current position
    let accumulated = 0;
    for (const item of scheduleItems) {
      const itemDurationMs = (parseInt(item.duration) || 5) * 60 * 1000;
      accumulated += itemDurationMs;

      if (positionInCycleMs < accumulated) {
        // This is the currently active content
        return {
          id: item.content_id,
          title: item.title,
          subject: item.subject,
          file_url: item.file_url,
          file_type: item.file_type,
          rotation_order: item.rotation_order,
          duration_minutes: item.duration,
          scheduled_until: new Date(now.getTime() + (accumulated - positionInCycleMs)),
          active_window: {
            start: item.start_time,
            end: item.end_time,
          },
        };
      }
    }

    // Fallback: return first item (shouldn't reach here)
    const first = scheduleItems[0];
    return {
      id: first.content_id,
      title: first.title,
      subject: first.subject,
      file_url: first.file_url,
      file_type: first.file_type,
      rotation_order: first.rotation_order,
      duration_minutes: first.duration,
      active_window: {
        start: first.start_time,
        end: first.end_time,
      },
    };
  },

  /**
   * Get full rotation schedule preview for a teacher (for debugging/admin)
   */
  getSchedulePreview: async (teacher_id) => {
    const slots = await ScheduleModel.getSlotsByTeacher(teacher_id);
    const preview = {};

    for (const slot of slots) {
      const items = await ScheduleModel.getScheduleBySlot(slot.id);
      if (items.length > 0) {
        preview[slot.subject] = items.map((item) => ({
          content_id: item.content_id,
          title: item.title,
          rotation_order: item.rotation_order,
          duration_minutes: item.duration,
          active_window: { start: item.start_time, end: item.end_time },
        }));
      }
    }

    return preview;
  },
};

module.exports = SchedulingService;
