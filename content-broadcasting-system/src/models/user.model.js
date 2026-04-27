const pool = require('../config/database');

const UserModel = {
  /**
   * Find user by email
   */
  findByEmail: async (email) => {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    return result.rows[0] || null;
  },

  /**
   * Find user by ID
   */
  findById: async (id) => {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Get all teachers
   */
  getAllTeachers: async () => {
    const result = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE role = 'teacher' ORDER BY name"
    );
    return result.rows;
  },
};

module.exports = UserModel;
