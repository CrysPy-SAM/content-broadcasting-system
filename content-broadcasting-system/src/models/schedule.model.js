const pool = require('../config/database');

const ScheduleModel = {
  /**
   * Find or create a subject slot for a teacher
   */
  findOrCreateSlot: async (subject, teacher_id) => {
    const existing = await pool.query(
      'SELECT * FROM content_slots WHERE subject = $1 AND teacher_id = $2',
      [subject.toLowerCase(), teacher_id]
    );

    if (existing.rows[0]) return existing.rows[0];

    const result = await pool.query(
      'INSERT INTO content_slots (subject, teacher_id) VALUES ($1, $2) RETURNING *',
      [subject.toLowerCase(), teacher_id]
    );
    return result.rows[0];
  },

  /**
   * Add content to schedule (upsert)
   */
  upsertSchedule: async ({ content_id, slot_id, rotation_order, duration }) => {
    const result = await pool.query(
      `INSERT INTO content_schedule (content_id, slot_id, rotation_order, duration)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (content_id, slot_id) 
       DO UPDATE SET rotation_order = $3, duration = $4
       RETURNING *`,
      [content_id, slot_id, rotation_order, duration]
    );
    return result.rows[0];
  },

  /**
   * Get next rotation order for a slot
   */
  getNextRotationOrder: async (slot_id) => {
    const result = await pool.query(
      'SELECT COALESCE(MAX(rotation_order), -1) + 1 as next_order FROM content_schedule WHERE slot_id = $1',
      [slot_id]
    );
    return result.rows[0].next_order;
  },

  /**
   * Get full schedule for a teacher's subject
   */
  getScheduleBySlot: async (slot_id) => {
    const result = await pool.query(
      `SELECT cs.*, c.title, c.subject, c.file_url, c.file_type, c.start_time, c.end_time, c.status
       FROM content_schedule cs
       JOIN content c ON cs.content_id = c.id
       WHERE cs.slot_id = $1
         AND c.status = 'approved'
         AND c.start_time IS NOT NULL
         AND c.end_time IS NOT NULL
         AND NOW() BETWEEN c.start_time AND c.end_time
       ORDER BY cs.rotation_order ASC`,
      [slot_id]
    );
    return result.rows;
  },

  /**
   * Get all slots for a teacher
   */
  getSlotsByTeacher: async (teacher_id) => {
    const result = await pool.query(
      'SELECT * FROM content_slots WHERE teacher_id = $1 ORDER BY subject',
      [teacher_id]
    );
    return result.rows;
  },
};

module.exports = ScheduleModel;
