const bcrypt = require('bcryptjs');
const UserModel = require('../models/user.model');
const { generateToken } = require('../utils/jwt');

const AuthService = {
  /**
   * Login user - validates credentials and returns JWT token
   */
  login: async (email, password) => {
    const user = await UserModel.findByEmail(email);

    if (!user) {
      throw { status: 401, message: 'Invalid email or password.' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw { status: 401, message: 'Invalid email or password.' };
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  /**
   * Get current logged in user profile
   */
  getProfile: async (userId) => {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw { status: 404, message: 'User not found.' };
    }

    return user;
  },
};

module.exports = AuthService;
