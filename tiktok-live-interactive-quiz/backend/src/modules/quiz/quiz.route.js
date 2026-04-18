const { Router } = require('express');
const quizController = require('./quiz.controller');

const router = Router();

router.post('/start', quizController.startQuestion);
router.post('/answer', quizController.submitAnswer);
router.post('/skip', quizController.skipQuestion);
router.post('/set-winner', quizController.setWinnerManually);
router.get('/hint', quizController.checkHint);

module.exports = router;
