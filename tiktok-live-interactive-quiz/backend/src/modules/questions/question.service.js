const questionRepository = require('./question.repository');

const getAll = async (filters) => questionRepository.findWithFilters(filters);

const getById = async (id) => questionRepository.findById(id);

const getByCategory = async (category) => questionRepository.findByCategory(category);

const getByTags = async (tags) => questionRepository.findByTags(tags);

const search = async (filters) => questionRepository.findWithFilters(filters);

const getRandom = async (filters) => questionRepository.getRandom(filters);

const create = async (data) => questionRepository.create(data);

const update = async (id, data) => questionRepository.updateById(id, data);

const remove = async (id) => questionRepository.deleteById(id);

const getStats = async () => questionRepository.getStats();

const getFilterOptions = async () => questionRepository.getDistinctValues();

const checkAnswer = async (questionId, userAnswer) =>
  questionRepository.checkAnswer(questionId, userAnswer);

module.exports = {
  getAll,
  getById,
  getByCategory,
  getByTags,
  search,
  getRandom,
  create,
  update,
  remove,
  getStats,
  getFilterOptions,
  checkAnswer,
};
