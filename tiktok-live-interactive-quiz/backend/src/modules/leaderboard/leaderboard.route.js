const { Router } = require('express');
const leaderboardController = require('./leaderboard.controller');

const router = Router();

router.get('/', leaderboardController.getLeaderboard);
router.get('/participants', leaderboardController.getParticipants);
router.get('/stats/:tiktokId', leaderboardController.getUserStats);

module.exports = router;
