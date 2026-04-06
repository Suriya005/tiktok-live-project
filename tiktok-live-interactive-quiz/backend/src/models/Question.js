const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');

class Question {
  constructor(data) {
    this.text = data.text;
    this.options = data.options || ['A', 'B', 'C', 'D'];
    this.answer = data.answer.toLowerCase().trim();
    this.hint = data.hint;
    this.category = data.category;
    this.tags = data.tags || [];
    this.difficulty = data.difficulty || 1;
    this.points = data.points || 10;
    this.requiredCoins = data.requiredCoins || 100;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  async save() {
    const db = getDB();
    const collection = db.collection('questions');
    const result = await collection.insertOne(this);
    return result;
  }

  static async findAll() {
    const db = getDB();
    const collection = db.collection('questions');
    return await collection.find({}).toArray();
  }

  static async findById(id) {
    const db = getDB();
    const collection = db.collection('questions');
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  static async findByCategory(category) {
    const db = getDB();
    const collection = db.collection('questions');
    return await collection.find({ category }).toArray();
  }

  static async updateById(id, updateData) {
    const db = getDB();
    const collection = db.collection('questions');
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    return result;
  }

  static async deleteById(id) {
    const db = getDB();
    const collection = db.collection('questions');
    return await collection.deleteOne({ _id: new ObjectId(id) });
  }

  static async findByTags(tags) {
    const db = getDB();
    const collection = db.collection('questions');
    return await collection.find({ tags: { $in: tags } }).toArray();
  }

  static async findByTag(tag) {
    const db = getDB();
    const collection = db.collection('questions');
    return await collection.find({ tags: tag }).toArray();
  }

  static async getRandomQuestion(tags = null) {
    const db = getDB();
    const collection = db.collection('questions');
    
    if (tags && tags.length > 0) {
      const questions = await collection.find({ tags: { $in: tags } }).toArray();
      return questions[Math.floor(Math.random() * questions.length)] || null;
    } else {
      const questions = await collection.find({}).toArray();
      return questions[Math.floor(Math.random() * questions.length)] || null;
    }
  }

  static async countAll() {
    const db = getDB();
    const collection = db.collection('questions');
    return await collection.countDocuments();
  }

  static async checkAnswer(questionId, userAnswer) {
    const question = await this.findById(questionId);
    if (!question) return null;
    
    const isCorrect = userAnswer.toLowerCase().trim() === question.answer;
    return {
      isCorrect,
      points: isCorrect ? question.points : 0,
      hint: isCorrect ? null : question.hint,
      requiredCoins: question.requiredCoins
    };
  }

  static async getDistinctValues() {
    const db = getDB();
    const collection = db.collection('questions');
    
    try {
      const categories = await collection.distinct('category');
      const tags = await collection.distinct('tags');
      const difficulties = await collection.distinct('difficulty');

      return {
        categories: categories.sort(),
        tags: tags.sort(),
        difficulties: difficulties.sort((a, b) => a - b)
      };
    } catch (error) {
      console.error('Error getting distinct values:', error);
      return {
        categories: [],
        tags: [],
        difficulties: []
      };
    }
  }

  static async findWithFilters(filters = {}) {
    const db = getDB();
    const collection = db.collection('questions');
    
    // Build MongoDB query
    const query = {};
    
    // Search filter (text search in question text)
    if (filters.search && filters.search.trim()) {
      query.text = { $regex: filters.search, $options: 'i' };
    }
    
    // Category filter (support multiple categories)
    if (filters.category && filters.category.length > 0) {
      query.category = { $in: filters.category };
    }
    
    // Tag filter (support multiple tags)
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }
    
    // Difficulty filter
    if (filters.difficulty !== undefined && filters.difficulty !== null && filters.difficulty !== '') {
      query.difficulty = parseInt(filters.difficulty);
    }
    
    // Pagination
    const page = Math.max(1, parseInt(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(filters.limit) || 20));
    const skip = (page - 1) * limit;
    
    try {
      // Get total count for pagination
      const total = await collection.countDocuments(query);
      
      // Get paginated results
      const questions = await collection
        .find(query)
        .skip(skip)
        .limit(limit)
        .toArray();
      
      return {
        questions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error in findWithFilters:', error);
      return {
        questions: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          pages: 0
        }
      };
    }
  }
}

module.exports = Question;
