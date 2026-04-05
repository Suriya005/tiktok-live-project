const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// CRUD Routes
router.post('/', questionController.createQuestion);
router.get('/', questionController.getAllQuestions);
router.get('/stats', questionController.getQuestionStats);
router.get('/random', questionController.getRandomQuestion);
router.get('/category/:category', questionController.getQuestionsByCategory);
router.get('/by-tags', questionController.getQuestionsByTags);
router.get('/:id', questionController.getQuestionById);
router.put('/:id', questionController.updateQuestion);
router.delete('/:id', questionController.deleteQuestion);

module.exports = router;
