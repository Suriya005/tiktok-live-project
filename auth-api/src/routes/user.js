const express = require('express');
const userController = require('../controllers/userController');
const { verifyAccessToken, attachUser, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', verifyAccessToken, attachUser, userController.getProfile);
router.put('/me', verifyAccessToken, attachUser, userController.updateProfile);

module.exports = router;

