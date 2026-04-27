const pool = require('../config/database');

const ContentModel = {
  /**
   * Create new content entry
   */
  create: async ({ title, description, subject, file_url, file_path, file_type, file_size, uploaded_by, start_time, end_time }) => {
    const result = await pool.query(
      `INSERT INTO content 
        (title, description, subject, file_url, file_path, file_type, file_size, uploaded_by, status, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9, $10)
       RETURNING *`,
      [
        title.trim(),
        description ? description.trim() : null,
        subject.trim().toLowerCase(),
        file_url,
        file_path,
        file_type,
        file_size,
        uploaded_by,
        start_time || null,
        end_time || null,
      ]
    );
    return result.rows[0];
  },

  /**
   * Find content by ID
   */
  findById: async (id) => {
    const result = await pool.query(
      `SELECT c.*, 
              u.name as teacher_name, u.email as teacher_email,
              p.name as principal_name
       FROM content c
       LEFT JOIN users u ON c.uploaded_by = u.id
       LEFT JOIN users p ON c.approved_by = p.id
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Get all content (principal view - all content)
   */
  findAll: async ({ status, subject, teacher_id, page = 1, limit = 20 } = {}) => {
    let query = `
      SELECT c.*, 
             u.name as teacher_name, u.email as teacher_email,
             p.name as principal_name
      FROM content c
      LEFT JOIN users u ON c.uploaded_by = u.id
      LEFT JOIN users p ON c.approved_by = p.id
      WHERE 1=1
    `;
    const params = [];
    let paramIdx = 1;

    if (status) {
      query += ` AND c.status = $${paramIdx++}`;
      params.push(status);
    }

    if (subject) {
      query += ` AND c.subject = $${paramIdx++}`;
      params.push(subject.toLowerCase());
    }

    if (teacher_id) {
      query += ` AND c.uploaded_by = $${paramIdx++}`;
      params.push(teacher_id);
    }

    query += ` ORDER BY c.created_at DESC`;

    // Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  },

  /**
   * Get content by teacher (teacher view - their own content)
   */
  findByTeacher: async (teacher_id, { status, subject } = {}) => {
    let query = `
      SELECT c.*, 
             p.name as principal_name
      FROM content c
      LEFT JOIN users p ON c.approved_by = p.id
      WHERE c.uploaded_by = $1
    `;
    const params = [teacher_id];
    let paramIdx = 2;

    if (status) {
      query += ` AND c.status = $${paramIdx++}`;
      params.push(status);
    }

    if (subject) {
      query += ` AND c.subject = $${paramIdx++}`;
      params.push(subject.toLowerCase());
    }

    query += ` ORDER BY c.created_at DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  },

  /**
   * Update content status (approve/reject)
   */
  updateStatus: async (id, { status, rejection_reason, approved_by }) => {
  const approved_at = status === 'approved' ? new Date() : null;
  const result = await pool.query(
    `UPDATE content 
     SET status = $1, 
         rejection_reason = $2, 
         approved_by = $3,
         approved_at = $4,
         updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [status, rejection_reason || null, approved_by || null, approved_at, id]
  );
  return result.rows[0] || null;
},
  /**
   * Get approved and currently active content for a teacher
   */
  findApprovedActiveByTeacher: async (teacher_id) => {
    const result = await pool.query(
      `SELECT c.*, cs.rotation_order, cs.duration
       FROM content c
       LEFT JOIN content_slots slot ON (c.subject = slot.subject AND slot.teacher_id = c.uploaded_by)
       LEFT JOIN content_schedule cs ON (cs.content_id = c.id AND cs.slot_id = slot.id)
       WHERE c.uploaded_by = $1
         AND c.status = 'approved'
         AND c.start_time IS NOT NULL
         AND c.end_time IS NOT NULL
         AND NOW() BETWEEN c.start_time AND c.end_time
       ORDER BY c.subject, COALESCE(cs.rotation_order, 0)`,
      [teacher_id]
    );
    return result.rows;
  },

  /**
   * Count total content (for pagination)
   */
  count: async ({ status, subject, teacher_id } = {}) => {
    let query = 'SELECT COUNT(*) FROM content WHERE 1=1';
    const params = [];
    let paramIdx = 1;

    if (status) {
      query += ` AND status = $${paramIdx++}`;
      params.push(status);
    }
    if (subject) {
      query += ` AND subject = $${paramIdx++}`;
      params.push(subject.toLowerCase());
    }
    if (teacher_id) {
      query += ` AND uploaded_by = $${paramIdx++}`;
      params.push(teacher_id);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  },
};

module.exports = ContentModel;
