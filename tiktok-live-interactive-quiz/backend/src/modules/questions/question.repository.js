const { getDatabase } = require('../../config/database');
const { ObjectId } = require('mongodb');

const COLLECTION = 'questions';

const findAll = async () => {
  const db = getDatabase();
  return db.collection(COLLECTION).find({}).toArray();
};

const findById = async (id) => {
  const db = getDatabase();
  return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
};

const findByCategory = async (category) => {
  const db = getDatabase();
  return db.collection(COLLECTION).find({ category }).toArray();
};

const findByTags = async (tags) => {
  const db = getDatabase();
  return db.collection(COLLECTION).find({ tags: { $in: tags } }).toArray();
};

const findWithFilters = async (filters = {}) => {
  const db = getDatabase();
  const collection = db.collection(COLLECTION);

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
    collection.countDocuments(query),
    collection.find(query).skip(skip).limit(limit).toArray(),
  ]);

  return {
    questions,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getRandom = async (filters = {}) => {
  const db = getDatabase();
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

  const questions = await db.collection(COLLECTION).find(query).limit(1000).toArray();

  if (questions.length === 0) return null;
  return questions[Math.floor(Math.random() * questions.length)];
};

const create = async (data) => {
  const db = getDatabase();
  const doc = {
    text: data.text,
    options: data.options || [],
    answer: data.answer.toLowerCase().trim(),
    hint: data.hint || '',
    category: data.category || 'general',
    tags: data.tags || [],
    difficulty: data.difficulty || 1,
    points: data.points || 10,
    requiredCoins: data.requiredCoins || 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const result = await db.collection(COLLECTION).insertOne(doc);
  return { insertedId: result.insertedId, ...doc };
};

const updateById = async (id, updateData) => {
  const db = getDatabase();
  const { _id, createdAt, ...safeData } = updateData;
  return db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...safeData, updatedAt: new Date() } },
  );
};

const deleteById = async (id) => {
  const db = getDatabase();
  return db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
};

const getStats = async () => {
  const db = getDatabase();
  const collection = db.collection(COLLECTION);

  const [total, byCategory, avgResult, allTags] = await Promise.all([
    collection.countDocuments(),
    collection.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]).toArray(),
    collection.aggregate([{ $group: { _id: null, avg: { $avg: '$difficulty' } } }]).toArray(),
    collection.distinct('tags'),
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
  const db = getDatabase();
  const collection = db.collection(COLLECTION);

  const [categories, tags, difficulties] = await Promise.all([
    collection.distinct('category'),
    collection.distinct('tags'),
    collection.distinct('difficulty'),
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
