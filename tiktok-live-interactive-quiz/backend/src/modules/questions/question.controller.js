const questionService = require('./question.service');
const { ok, okList, created, dataNotFound, badRequest, internalError } = require('../../utils/response');
const logger = require('../../utils/logger');

const createQuestion = async (req, res) => {
  const { text, answer } = req.body;
  if (!text) return badRequest(res, 'text is required');
  if (!answer) return badRequest(res, 'answer is required');

  try {
    const question = await questionService.create(req.body);
    return created(res, question);
  } catch (err) {
    logger.error('[Question] createQuestion failed', { err: err.message });
    return internalError(res);
  }
};

const getAllQuestions = async (req, res) => {
  try {
    const filters = {
      search: req.query.search || '',
      category: req.query.category
        ? Array.isArray(req.query.category)
          ? req.query.category
          : [req.query.category]
        : [],
      tags: req.query.tags
        ? Array.isArray(req.query.tags)
          ? req.query.tags
          : [req.query.tags]
        : [],
      difficulty: req.query.difficulty || null,
      page: req.query.page || 1,
      limit: req.query.limit || 20,
    };

    const result = await questionService.getAll(filters);
    return okList(res, result.questions, result.pagination);
  } catch (err) {
    logger.error('[Question] getAllQuestions failed', { err: err.message });
    return internalError(res);
  }
};

const searchQuestions = async (req, res) => {
  try {
    const filters = {
      search: req.body.search || '',
      category: req.body.category
        ? Array.isArray(req.body.category)
          ? req.body.category
          : [req.body.category]
        : [],
      tags: req.body.tags
        ? Array.isArray(req.body.tags)
          ? req.body.tags
          : [req.body.tags]
        : [],
      difficulty: req.body.difficulty || null,
      page: req.body.page || 1,
      limit: req.body.limit || 20,
    };

    const result = await questionService.search(filters);
    return okList(res, result.questions, result.pagination);
  } catch (err) {
    logger.error('[Question] searchQuestions failed', { err: err.message });
    return internalError(res);
  }
};

const getRandomQuestion = async (req, res) => {
  try {
    const { tags } = req.query;
    const tagArray = tags ? (Array.isArray(tags) ? tags : [tags]) : [];
    const question = await questionService.getRandom({ tags: tagArray });
    if (!question) return dataNotFound(res);
    return ok(res, question);
  } catch (err) {
    logger.error('[Question] getRandomQuestion failed', { err: err.message });
    return internalError(res);
  }
};

const getRandomQuestionWithFilters = async (req, res) => {
  try {
    const filters = {
      search: req.body.search || '',
      category: req.body.category
        ? Array.isArray(req.body.category)
          ? req.body.category
          : [req.body.category]
        : [],
      tags: req.body.tags
        ? Array.isArray(req.body.tags)
          ? req.body.tags
          : [req.body.tags]
        : [],
      difficulty: req.body.difficulty || null,
    };

    const question = await questionService.getRandom(filters);
    if (!question) return dataNotFound(res);
    return ok(res, question);
  } catch (err) {
    logger.error('[Question] getRandomQuestionWithFilters failed', { err: err.message });
    return internalError(res);
  }
};

const getQuestionById = async (req, res) => {
  try {
    const question = await questionService.getById(req.params.id);
    if (!question) return dataNotFound(res);
    return ok(res, question);
  } catch (err) {
    logger.error('[Question] getQuestionById failed', { err: err.message });
    return internalError(res);
  }
};

const updateQuestion = async (req, res) => {
  try {
    const result = await questionService.update(req.params.id, req.body);
    if (result.matchedCount === 0) return dataNotFound(res);
    return ok(res);
  } catch (err) {
    logger.error('[Question] updateQuestion failed', { err: err.message });
    return internalError(res);
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const result = await questionService.remove(req.params.id);
    if (result.deletedCount === 0) return dataNotFound(res);
    return ok(res);
  } catch (err) {
    logger.error('[Question] deleteQuestion failed', { err: err.message });
    return internalError(res);
  }
};

const getQuestionsByCategory = async (req, res) => {
  try {
    const questions = await questionService.getByCategory(req.params.category);
    return okList(res, questions);
  } catch (err) {
    logger.error('[Question] getQuestionsByCategory failed', { err: err.message });
    return internalError(res);
  }
};

const getQuestionsByTags = async (req, res) => {
  const { tags } = req.query;
  if (!tags) return badRequest(res, 'tags query parameter is required');

  try {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    const questions = await questionService.getByTags(tagArray);
    return okList(res, questions);
  } catch (err) {
    logger.error('[Question] getQuestionsByTags failed', { err: err.message });
    return internalError(res);
  }
};

const getQuestionStats = async (req, res) => {
  try {
    const stats = await questionService.getStats();
    return ok(res, stats);
  } catch (err) {
    logger.error('[Question] getQuestionStats failed', { err: err.message });
    return internalError(res);
  }
};

const getFilterOptions = async (req, res) => {
  try {
    const options = await questionService.getFilterOptions();
    return ok(res, options);
  } catch (err) {
    logger.error('[Question] getFilterOptions failed', { err: err.message });
    return internalError(res);
  }
};

module.exports = {
  createQuestion,
  getAllQuestions,
  searchQuestions,
  getRandomQuestion,
  getRandomQuestionWithFilters,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getQuestionsByCategory,
  getQuestionsByTags,
  getQuestionStats,
  getFilterOptions,
};
