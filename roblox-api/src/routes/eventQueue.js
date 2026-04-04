const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const eventQueueController = require('../controllers/eventQueueController');
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
// Event Queue CRUD Routes
// ============================================

// getNextQueueToProcess
router.get('/next',
    asyncHandler(eventQueueController.getNextQueueToProcess)
);

// 1. เพิ่มคิวใหม่
router.post('/',
    validate([
        // body('user_id').notEmpty().withMessage('user_id is required'),
        // body('game_id').notEmpty().withMessage('game_id is required'),
        body('event_name').notEmpty().withMessage('event_name is required'),
        body('amount').isNumeric().withMessage('amount must be a number'),
        body('delay').isInt({ min: 0 }).withMessage('delay must be a positive integer'),
        body('quantity').optional().isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
    ]),
    asyncHandler(eventQueueController.createQueue)
);

// 2. เพิ่มหลายคิวพร้อมกัน
router.post('/bulk',
    validate([
        body('queues').isArray({ min: 1 }).withMessage('queues must be a non-empty array'),
    ]),
    asyncHandler(eventQueueController.createBulkQueues)
);

// 3. ดึงคิวทั้งหมด (filter ได้)
router.get('/',
    asyncHandler(eventQueueController.getAllQueues)
);

// 4. ดึงคิวที่รอดำเนินการ (PENDING)
router.get('/pending',
    asyncHandler(eventQueueController.getPendingQueues)
);

// 5. ดึงคิวถัดไปมาทำงาน (และเปลี่ยนเป็น PROCESSING)
router.get('/next',
    asyncHandler(eventQueueController.getNextQueue)
);

// 6. ดูสถิติคิว
router.get('/stats',
    asyncHandler(eventQueueController.getQueueStats)
);

// 7. ดึงคิวตาม ID
router.get('/:id',
    validate([
        param('id').isMongoId().withMessage('Invalid queue ID'),
    ]),
    asyncHandler(eventQueueController.getQueueById)
);

// 8. อัพเดทสถานะคิว
router.patch('/:id/status',
    validate([
        param('id').isMongoId().withMessage('Invalid queue ID'),
        body('status').notEmpty().withMessage('status is required'),
    ]),
    asyncHandler(eventQueueController.updateQueueStatus)
);

// 9. อัพเดทคิว
router.put('/:id',
    validate([
        param('id').isMongoId().withMessage('Invalid queue ID'),
    ]),
    asyncHandler(eventQueueController.updateQueue)
);

// 10. ลบคิว
router.delete('/:id',
    validate([
        param('id').isMongoId().withMessage('Invalid queue ID'),
    ]),
    asyncHandler(eventQueueController.deleteQueue)
);

// 11. ลบคิวที่เสร็จแล้ว/ล้มเหลว (cleanup)
router.delete('/cleanup/old',
    asyncHandler(eventQueueController.cleanupQueues)
);

module.exports = router;
