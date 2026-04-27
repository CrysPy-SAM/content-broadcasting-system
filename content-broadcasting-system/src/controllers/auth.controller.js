const AuthService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response');

const AuthController = {
  /**
   * POST /auth/login
   */
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return sendSuccess(res, result, 'Login successful');
    } catch (err) {
      return sendError(res, err.message || 'Login failed', err.status || 500);
    }
  },

  /**
   * GET /auth/me
   */
  getProfile: async (req, res) => {
    try {
      const user = await AuthService.getProfile(req.user.id);
      return sendSuccess(res, user, 'Profile fetched successfully');
    } catch (err) {
      return sendError(res, err.message || 'Failed to fetch profile', err.status || 500);
    }
  },
};

module.exports = AuthController;
