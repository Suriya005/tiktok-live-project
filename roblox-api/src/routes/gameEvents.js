const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const gameEventController = require('../controllers/gameEventController');
const { verifyApiKey } = require('../middleware/robloxAuth');
const { asyncHandler } = require('../middleware/errorHandler');

// Validation Helper
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

// ใช้ API Key กับทุก route
router.use(verifyApiKey);

// ============================================
// Game Events CRUD Routes
// ============================================

// 1. สร้าง game event ใหม่
router.post('/',
  validate([
    body('game_id').notEmpty().withMessage('game_id is required'),
    body('event_name').notEmpty().withMessage('event_name is required'),
    body('default_delay').isInt({ min: 0 }).withMessage('default_delay must be a positive integer'),
    body('point_amount').optional().isNumeric().withMessage('point_amount must be a number'),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
    body('multi_spawn').optional().isBoolean().withMessage('multi_spawn must be a boolean'),
    body('is_animation').optional().isBoolean().withMessage('is_animation must be a boolean'),
  ]),
  asyncHandler(gameEventController.createEvent)
);

// 2. ดึง game events ทั้งหมด (support filter by game_id, is_active)
router.get('/',
  asyncHandler(gameEventController.getAllEvents)
);

// 3. ดึง game event ตาม ID
router.get('/:id',
  validate([
    param('id').isMongoId().withMessage('Invalid event ID'),
  ]),
  asyncHandler(gameEventController.getEventById)
);

// 4. อัพเดท game event
router.put('/:id',
  validate([
    param('id').isMongoId().withMessage('Invalid event ID'),
    body('game_id').optional().notEmpty(),
    body('event_name').optional().notEmpty(),
    body('default_delay').optional().isInt({ min: 0 }),
    body('point_amount').optional().isNumeric(),
    body('is_active').optional().isBoolean(),
    body('multi_spawn').optional().isBoolean(),
    body('is_animation').optional().isBoolean(),
  ]),
  asyncHandler(gameEventController.updateEvent)
);

// 5. ลบ game event
router.delete('/:id',
  validate([
    param('id').isMongoId().withMessage('Invalid event ID'),
  ]),
  asyncHandler(gameEventController.deleteEvent)
);

// 6. เปิด/ปิด game event
router.patch('/:id/toggle',
  validate([
    param('id').isMongoId().withMessage('Invalid event ID'),
    body('is_active').isBoolean().withMessage('is_active is required and must be a boolean'),
  ]),
  asyncHandler(gameEventController.toggleEvent)
);

module.exports = router;
