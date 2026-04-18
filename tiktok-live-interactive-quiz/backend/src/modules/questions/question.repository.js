const Question = require('../../models/Question');

const findAll = () => Question.find({}).lean();

const findById = (id) => Question.findById(id).lean();

const findByCategory = (category) => Question.find({ category }).lean();

const findByTags = (tags) => Question.find({ tags: { $in: tags } }).lean();

const findWithFilters = async (filters = {}) => {
  const query = {};

  if (filters.search && filters.search.trim()) {
    query.text = { $regex: filters.search, $options: 'i' };
  }
  if (filters.category && filters.category.length > 0) {
    query.category = { $in: filters.category };
  }
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }
  if (filters.difficulty !== undefined && filters.difficulty !== null && filters.difficulty !== '') {
    query.difficulty = parseInt(filters.difficulty);
  }

  const page = Math.max(1, parseInt(filters.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit) || 20));
  const skip = (page - 1) * limit;

  const [total, questions] = await Promise.all([
    Question.countDocuments(query),
    Question.find(query).skip(skip).limit(limit).lean(),
  ]);

  return {
    questions,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getRandom = async (filters = {}) => {
  const query = {};

  if (filters.category && filters.category.length > 0) {
    query.category = { $in: filters.category };
  }
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }
  if (filters.difficulty !== undefined && filters.difficulty !== null && filters.difficulty !== '') {
    query.difficulty = parseInt(filters.difficulty);
  }
  if (filters.search && filters.search.trim()) {
    query.text = { $regex: filters.search, $options: 'i' };
  }

  const questions = await Question.find(query).limit(1000).lean();
  if (questions.length === 0) return null;
  return questions[Math.floor(Math.random() * questions.length)];
};

const create = async (data) => {
  const doc = new Question({
    text: data.text,
    options: data.options || [],
    answer: data.answer.toLowerCase().trim(),
    hint: data.hint || '',
    category: data.category || 'general',
    tags: data.tags || [],
    difficulty: data.difficulty || 1,
    points: data.points || 10,
    requiredCoins: data.requiredCoins || 100,
  });
  return doc.save();
};

const updateById = (id, updateData) => {
  const { _id, createdAt, updatedAt, __v, ...safeData } = updateData;
  return Question.updateOne({ _id: id }, { $set: safeData });
};

const deleteById = (id) => Question.deleteOne({ _id: id });

const getStats = async () => {
  const [total, byCategory, avgResult, allTags] = await Promise.all([
    Question.countDocuments(),
    Question.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    Question.aggregate([{ $group: { _id: null, avg: { $avg: '$difficulty' } } }]),
    Question.distinct('tags'),
  ]);

  const byCategoryMap = {};
  byCategory.forEach(({ _id, count }) => {
    byCategoryMap[_id] = count;
  });

  return {
    totalQuestions: total,
    byCategory: byCategoryMap,
    allTags,
    avgDifficulty: avgResult.length > 0 ? parseFloat(avgResult[0].avg.toFixed(2)) : 0,
  };
};

const getDistinctValues = async () => {
  const [categories, tags, difficulties] = await Promise.all([
    Question.distinct('category'),
    Question.distinct('tags'),
    Question.distinct('difficulty'),
  ]);

  return {
    categories: categories.sort(),
    tags: tags.sort(),
    difficulties: difficulties.sort((a, b) => a - b),
  };
};

const checkAnswer = async (questionId, userAnswer) => {
  const question = await findById(questionId);
  if (!question) return null;

  const isCorrect = userAnswer.toLowerCase().trim() === question.answer;
  return {
    isCorrect,
    points: isCorrect ? question.points : 0,
    hint: isCorrect ? null : question.hint,
  };
};

module.exports = {
  findAll,
  findById,
  findByCategory,
  findByTags,
  findWithFilters,
  getRandom,
  create,
  updateById,
  deleteById,
  getStats,
  getDistinctValues,
  checkAnswer,
};
