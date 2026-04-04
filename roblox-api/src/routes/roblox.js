const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const robloxController = require('../controllers/robloxController');
const { verifyApiKey, verifyPlaceId, verifyRobloxUser } = require('../middleware/robloxAuth');
const { asyncHandler } = require('../middleware/errorHandler');
const { strictRateLimiter } = require('../middleware/rateLimiter');

// ============================================
// Validation Helper
// ============================================
const validate = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (!result.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: result.array(),
          },
        });
      }
    }
    next();
  };
};

// ============================================
// Global Middleware - ใช้กับทุก route
// ============================================
router.use(verifyApiKey);

// ============================================
// Routes
// ============================================

// 0. Login - บันทึกข้อมูล Roblox user และตรวจสอบ role
router.post('/login',
  asyncHandler(async (req, res) => {
    const { userId, username } = req.body;
    
    // Validate input
    if (!userId || !username) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'userId and username are required',
        },
      });
    }
    
    // Upsert to MongoDB
    console.log(`Logging in user: ${username} (ID: ${userId})`);
    const { upsertRobloxUser, getUserRole } = require('../models/RobloxUser');
    const result = await upsertRobloxUser({ userId, username });
    
    // หา role จาก users collection
    console.log(`Fetching role for user: ${username}`);
    const role = await getUserRole(username);
    console.log(`User ${username} has role: ${role}`);
    
    res.json({
      success: true,
      message: result.upserted > 0 ? 'User created' : 'User updated',
      data: {
        userId,
        username,
        role,  // role จาก users collection หรือ 'noob'
        isNewUser: result.upserted > 0,
      },
      timestamp: new Date().toISOString()
    });
  })
);

// 1. รับ event จาก Roblox (เช่น player เข้าเกม, gift ถูกส่ง)
router.post('/events', 
  verifyPlaceId,
  verifyRobloxUser,
  validate([
    body('eventType').notEmpty().withMessage('Event type is required'),
    body('data').isObject().withMessage('Event data must be an object'),
  ]),
  asyncHandler(robloxController.handleEvent)
);

// 2. เช็คสถานะการเชื่อมต่อ TikTok Live
router.get('/status/:placeId', 
  asyncHandler(robloxController.getStatus)
);

// 3. เชื่อมต่อ Roblox กับ TikTok Live
router.post('/connect',
  verifyPlaceId,
  strictRateLimiter,
  validate([
    body('tiktokUsername').notEmpty().withMessage('TikTok username is required'),
  ]),
  asyncHandler(robloxController.connectTikTok)
);

// 4. ตัดการเชื่อมต่อ TikTok Live
router.post('/disconnect',
  verifyPlaceId,
  asyncHandler(robloxController.disconnectTikTok)
);

// 5. ดึงรายการ gift ที่มีใน TikTok
router.get('/gifts',
  asyncHandler(robloxController.getGifts)
);

module.exports = router;
