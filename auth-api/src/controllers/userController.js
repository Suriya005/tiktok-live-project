const User = require('../models/User');
const { asyncHandler } = require('../utils/errors');

/**
 * @route   GET /api/v1/me
 * @desc    Get current user profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  // userDocument is attached by attachUser middleware
  const user = req.userDocument;

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        isGoogleUser: user.isGoogleUser ? true : false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
  });
});

/**
 * @route   PUT /api/v1/me
 * @desc    Update current user profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.sub;
  const { name } = req.body;

  // Update user
  const updatedUser = await User.updateById(userId, { name });

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    },
  });
});

module.exports = {
  getProfile,
  updateProfile,
};
