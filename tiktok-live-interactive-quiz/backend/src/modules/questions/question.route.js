const { Router } = require('express');
const questionController = require('./question.controller');

const router = Router();

// Special routes first (before :id)
router.get('/stats', questionController.getQuestionStats);
router.get('/filter-options', questionController.getFilterOptions);
router.get('/random', questionController.getRandomQuestion);
router.get('/category/:category', questionController.getQuestionsByCategory);
router.get('/by-tags', questionController.getQuestionsByTags);

router.post('/search', questionController.searchQuestions);
router.post('/random', questionController.getRandomQuestionWithFilters);

// Generic CRUD
router.post('/', questionController.createQuestion);
router.get('/', questionController.getAllQuestions);
router.get('/:id', questionController.getQuestionById);
router.put('/:id', questionController.updateQuestion);
router.delete('/:id', questionController.deleteQuestion);

module.exports = router;
