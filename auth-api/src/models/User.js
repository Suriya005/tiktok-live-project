const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const config = require('../config/config');
const { getDB } = require('../config/db');

// ============================================================================
// USER COLLECTION CLASS
// ============================================================================

class User {
  /**
   * Get users collection
   */
  static getCollection() {
    return getDB().collection('users');
  }

  // ==========================================================================
  // CRUD OPERATIONS
  // ==========================================================================

  /**
   * Create a new user
   * @param {Object} userData - User data (email, password, name, role)
   * @returns {Object} Created user
   */
  static async create(userData) {
    const { email, password, name, role = 'user', googleId, avatar, isGoogleUser = false } = userData;

    // Validate required fields (password is optional for Google OAuth)
    if (!email || !name) {
      throw new Error('Email and name are required');
    }

    // If not Google OAuth, password is required
    if (!googleId && !password) {
      throw new Error('Password is required for non-OAuth registration');
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email');
    }

    // Validate password length (only if password is provided)
    if (password && password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Validate name length
    if (name.length < 2 || name.length > 50) {
      throw new Error('Name must be between 2 and 50 characters');
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(config.bcrypt.saltRounds);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Prepare user document
    const userDoc = {
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name: name.trim(),
      role: role,
      isGoogleUser: isGoogleUser,
      googleId: googleId || null,
      avatar: avatar || null,
      refreshTokens: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert user
    const result = await this.getCollection().insertOne(userDoc);

    // Return user without password
    const { password: _, ...userWithoutPassword } = userDoc;
    return {
      _id: result.insertedId,
      ...userWithoutPassword,
    };
  }

  /**
   * Find user by ID
   * @param {String|ObjectId} userId - User ID
   * @param {Object} options - Query options
   * @returns {Object|null} User document
   */
  static async findById(userId, options = {}) {
    const { includePassword = false } = options;

    const projection = includePassword ? {} : { password: 0 };
    
    return await this.getCollection().findOne(
      { _id: new ObjectId(userId) },
      { projection }
    );
  }

  /**
   * Find user by email
   * @param {String} email - User email
   * @param {Object} options - Query options
   * @returns {Object|null} User document
   */
  static async findOne(query, options = {}) {
    const { includePassword = false } = options;

    const projection = includePassword ? {} : { password: 0 };
    
    return await this.getCollection().findOne(query, { projection });
  }

  /**
   * Update user by ID
   * @param {String|ObjectId} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated user
   */
  static async updateById(userId, updateData) {
    const { password, email, ...allowedUpdates } = updateData;

    const updates = {
      ...allowedUpdates,
      updatedAt: new Date(),
    };

    const result = await this.getCollection().findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updates },
      { returnDocument: 'after', projection: { password: 0 } }
    );

    return result;
  }

  // ==========================================================================
  // PASSWORD METHODS
  // ==========================================================================

  /**
   * Compare password
   * @param {String} candidatePassword - Password to compare
   * @param {String} hashedPassword - Hashed password from database
   * @returns {Boolean} True if password matches
   */
  static async comparePassword(candidatePassword, hashedPassword) {
    try {
      return await bcrypt.compare(candidatePassword, hashedPassword);
    } catch (error) {
      throw new Error('Password comparison failed');
    }
  }

  // ==========================================================================
  // REFRESH TOKEN METHODS
  // ==========================================================================

  /**
   * Add refresh token to user
   * @param {String|ObjectId} userId - User ID
   * @param {String} token - Hashed refresh token
   * @param {Number} expiresIn - Expiry in milliseconds
   * @returns {Object} Update result
   */
  static async addRefreshToken(userId, token, expiresIn) {
    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + expiresIn);

    const refreshToken = {
      token,
      createdAt: new Date(),
      expiresAt,
    };

    // Add token and keep only last 5 tokens
    const result = await this.getCollection().updateOne(
      { _id: new ObjectId(userId) },
      { 
        $push: { 
          refreshTokens: {
            $each: [refreshToken],
            $slice: -5 // Keep only last 5 tokens
          }
        },
        $set: { updatedAt: new Date() }
      }
    );

    return result;
  }

  /**
   * Remove refresh token from user
   * @param {String|ObjectId} userId - User ID
   * @param {String} token - Hashed refresh token
   * @returns {Object} Update result
   */
  static async removeRefreshToken(userId, token) {
    const result = await this.getCollection().updateOne(
      { _id: new ObjectId(userId) },
      { 
        $pull: { refreshTokens: { token } },
        $set: { updatedAt: new Date() }
      }
    );

    return result;
  }

  /**
   * Check if user has valid refresh token
   * @param {Object} user - User document
   * @param {String} token - Hashed refresh token
   * @returns {Boolean} True if token is valid
   */
  static hasValidRefreshToken(user, token) {
    if (!user.refreshTokens || user.refreshTokens.length === 0) {
      return false;
    }

    const refreshToken = user.refreshTokens.find((rt) => rt.token === token);
    
    if (!refreshToken) {
      return false;
    }

    // Check if token is expired
    if (new Date() > new Date(refreshToken.expiresAt)) {
      return false;
    }

    return true;
  }

  /**
   * Clean expired tokens for all users (cron job)
   * @returns {Object} Update result
   */
  static async cleanExpiredTokens() {
    const now = new Date();
    
    const result = await this.getCollection().updateMany(
      { 'refreshTokens.expiresAt': { $lt: now } },
      { 
        $pull: { refreshTokens: { expiresAt: { $lt: now } } },
        $set: { updatedAt: new Date() }
      }
    );

    return result;
  }
}

module.exports = User;
