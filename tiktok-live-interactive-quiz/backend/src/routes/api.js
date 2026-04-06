const express = require('express');
const quizController = require('../controllers/quizController');

const router = express.Router();

// Questions Management
// Special routes first (before :id route)
router.post('/questions', quizController.createQuestion);
router.get('/questions/stats', quizController.getQuestionStats);
router.get('/questions/random', quizController.getRandomQuestion);
router.get('/questions/category/:category', quizController.getQuestionsByCategory);
router.get('/questions/by-tags', quizController.getQuestionsByTags);
router.get('/questions/filter-options', quizController.getFilterOptions);

// POST Search endpoint
router.post('/questions/search', quizController.searchQuestions);

// POST Random endpoint
router.post('/questions/random', quizController.getRandomQuestionWithFilters);

// Generic routes last
router.get('/questions', quizController.getAllQuestions);
router.get('/questions/:id', quizController.getQuestionById);
router.put('/questions/:id', quizController.updateQuestion);
router.delete('/questions/:id', quizController.deleteQuestion);

// Leaderboard & Stats
router.get('/leaderboard', quizController.getLeaderboard);
router.get('/stats/:tiktokId', quizController.getUserStats);
router.get('/participants', quizController.getParticipants);

// Quiz Control
router.post('/quiz/start', quizController.startQuestion);
router.post('/quiz/answer', quizController.submitAnswer);
router.post('/quiz/skip', quizController.skipQuestion);
router.post('/quiz/set-winner', quizController.setWinnerManually);
router.get('/quiz/hint', quizController.checkHint);

module.exports = router;
