const Question = require('../models/Question');
const PointsLog = require('../models/PointsLog');
const GiftLog = require('../models/GiftLog');
const QuizService = require('../services/QuizService');

// Questions Management
const createQuestion = async (req, res) => {
  try {
    const { text, options, answer, hint, category, tags, difficulty, points, requiredCoins } = req.body;

    if (!text || !answer) {
      return res.status(400).json({ error: 'Text and answer are required' });
    }

    const question = new Question({
      text,
      options: options || ['A', 'B', 'C', 'D'],
      answer,
      hint: hint || '',
      category: category || 'general',
      tags: tags || [],
      difficulty: difficulty || 1,
      points: points || 10,
      requiredCoins: requiredCoins || 100
    });

    const result = await question.save();
    if (result.insertedId) {
      console.log('New question created:', result.insertedId);
    }
    res.status(201).json({ success: true, questionId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllQuestions = async (req, res) => {
  try {
    console.log('Fetching questions with filters:', req.query.category);
    // Extract query parameters for filtering
    const filters = {
      search: req.query.search || '',
      category: req.query.category ? (Array.isArray(req.query.category) ? req.query.category : [req.query.category]) : [],
      tags: req.query.tags ? (Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags]) : [],
      difficulty: req.query.difficulty || null,
      page: req.query.page || 1,
      limit: req.query.limit || 20
    };

    // Use filtered query if any filter is provided
    const hasFilters = filters.search || filters.category.length > 0 || filters.tags.length > 0 || filters.difficulty;
    
    if (hasFilters) {
      const result = await Question.findWithFilters(filters);
      return res.json({ 
        success: true, 
        questions: result.questions,
        pagination: result.pagination,
        filters
      });
    }
    
    // If no filters, return paginated questions
    const result = await Question.findWithFilters(filters);
    res.json({ 
      success: true, 
      questions: result.questions,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const searchQuestions = async (req, res) => {
  try {
    // Extract filters from request body
    const { search, category, tags, difficulty, page, limit } = req.body;

    const filters = {
      search: search || '',
      category: category ? (Array.isArray(category) ? category : [category]) : [],
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
      difficulty: difficulty || null,
      page: page || 1,
      limit: limit || 20
    };

    // Log only active filters
    const activeFilters = {};
    if (filters.search && filters.search.trim()) activeFilters.search = filters.search;
    if (filters.category && filters.category.length > 0) activeFilters.category = filters.category;
    if (filters.tags && filters.tags.length > 0) activeFilters.tags = filters.tags;
    if (filters.difficulty !== undefined && filters.difficulty !== null) activeFilters.difficulty = filters.difficulty;
    activeFilters.page = filters.page;
    activeFilters.limit = filters.limit;

    console.log('📝 Searching questions with filters:', activeFilters);

    // Use filtered query
    const result = await Question.findWithFilters(filters);
    
    res.json({ 
      success: true, 
      questions: result.questions,
      pagination: result.pagination,
      filters: {
        search: filters.search,
        category: filters.category,
        tags: filters.tags,
        difficulty: filters.difficulty
      }
    });
  } catch (error) {
    console.error('Error searching questions:', error);
    res.status(500).json({ error: error.message });
  }
};

const getRandomQuestionWithFilters = async (req, res) => {
  try {
    // Extract filters from request body
    const { search, category, tags, difficulty } = req.body;

    const filters = {
      search: search || '',
      category: category ? (Array.isArray(category) ? category : [category]) : [],
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
      difficulty: difficulty || null,
      page: 1,
      limit: 1000  // Get up to 1000 matching questions to randomly pick from
    };

    // Log active filters
    const activeFilters = {};
    if (filters.search && filters.search.trim()) activeFilters.search = filters.search;
    if (filters.category && filters.category.length > 0) activeFilters.category = filters.category;
    if (filters.tags && filters.tags.length > 0) activeFilters.tags = filters.tags;
    if (filters.difficulty !== undefined && filters.difficulty !== null) activeFilters.difficulty = filters.difficulty;

    console.log('🎲 Getting random question with filters:', activeFilters);

    // Get matching questions
    const result = await Question.findWithFilters(filters);
    
    if (!result.questions || result.questions.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'No questions found matching the filters' 
      });
    }

    // Pick random question
    const randomQuestion = result.questions[Math.floor(Math.random() * result.questions.length)];

    res.json({ 
      success: true, 
      question: randomQuestion,
      totalMatching: result.pagination.total
    });
  } catch (error) {
    console.error('Error getting random question:', error);
    res.status(500).json({ error: error.message });
  }
};

const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ success: true, question });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const result = await Question.updateById(id, updateData);
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ success: true, message: 'Question updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Question.deleteById(id);
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getQuestionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const questions = await Question.findByCategory(category);
    res.json({ success: true, questions, count: questions.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getQuestionsByTags = async (req, res) => {
  try {
    const { tags } = req.query;

    if (!tags) {
      return res.status(400).json({ error: 'Tags parameter is required' });
    }

    const tagArray = Array.isArray(tags) ? tags : [tags];
    const questions = await Question.findByTags(tagArray);

    res.json({ 
      success: true, 
      questions, 
      count: questions.length,
      filters: { tags: tagArray }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRandomQuestion = async (req, res) => {
  try {
    const { tags } = req.query;
    const tagArray = tags ? (Array.isArray(tags) ? tags : [tags]) : null;

    const question = await Question.getRandomQuestion(tagArray);

    if (!question) {
      return res.status(404).json({ error: 'No questions available' });
    }

    res.json({ success: true, question });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getQuestionStats = async (req, res) => {
  try {
    const total = await Question.countAll();
    const allQuestions = await Question.findAll();

    // Group by category
    const byCategory = {};
    allQuestions.forEach(q => {
      byCategory[q.category] = (byCategory[q.category] || 0) + 1;
    });

    // Get all unique tags
    const allTags = new Set();
    allQuestions.forEach(q => {
      q.tags?.forEach(tag => allTags.add(tag));
    });

    res.json({ 
      success: true, 
      data: {
        totalQuestions: total,
        byCategory,
        allTags: Array.from(allTags),
        avgDifficulty: total > 0 ? (allQuestions.reduce((sum, q) => sum + (q.difficulty || 1), 0) / total).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Leaderboard & Stats
const getLeaderboard = async (req, res) => {
  try {
    const { timeFilter = 'all-time', sessionId } = req.query;
    const leaderboard = await PointsLog.getLeaderboard(timeFilter, sessionId);
    res.json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserStats = async (req, res) => {
  try {
    const { tiktokId } = req.params;
    const { timeFilter = 'all-time' } = req.query;
    
    const stats = await PointsLog.getUserStats(tiktokId, timeFilter);
    const coinStats = await GiftLog.getTotalCoins(tiktokId);

    res.json({ 
      success: true, 
      stats: stats.length > 0 ? stats[0] : null,
      coins: coinStats 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Quiz Control
const startQuestion = async (req, res) => {
  try {
    const { questionId } = req.body;
    const result = await QuizService.startQuestion(questionId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { tiktokId, nickname, answer } = req.body;

    if (!tiktokId || !answer) {
      return res.status(400).json({ error: 'tiktokId and answer are required' });
    }

    const result = await QuizService.processAnswer(tiktokId, nickname, answer);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const skipQuestion = async (req, res) => {
  try {
    const result = await QuizService.skipQuestion();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const checkHint = async (req, res) => {
  try {
    const result = await QuizService.checkHintCondition();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFilterOptions = async (req, res) => {
  try {
    const options = await Question.getDistinctValues();
    res.json({
      success: true,
      categories: options.categories,
      tags: options.tags,
      difficulties: options.difficulties
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get current session participants
const getParticipants = async (req, res) => {
  try {
    const { sessionId } = req.query;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const db = require('../config/database').getDB();
    const collection = db.collection('points_log');
    
    // Get unique participants in this session (latest 50)
    const participants = await collection.aggregate([
      { $match: { sessionId } },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: '$tiktokId',
          nickname: { $first: '$nickname' },
          lastActivity: { $first: '$timestamp' },
          totalPoints: { $sum: '$points' }
        }
      },
      { $sort: { lastActivity: -1 } },
      { $limit: 50 }
    ]).toArray();

    res.json({ success: true, participants, count: participants.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Manually set winner for current question
const setWinnerManually = async (req, res) => {
  try {
    const { tiktokId, nickname, sessionId } = req.body;
    
    if (!tiktokId || !nickname || !sessionId) {
      return res.status(400).json({ error: 'tiktokId, nickname, and sessionId are required' });
    }

    // Check if question already answered by someone
    if (QuizService.isQuestionAnswered?.()) {
      return res.status(400).json({ error: 'Question already answered by someone else' });
    }

    // Check if user already answered this question (using QuizService)
    const answeredUsers = QuizService.getAnsweredUsers?.();
    if (answeredUsers && answeredUsers.includes(tiktokId)) {
      return res.status(400).json({ error: 'User already answered this question' });
    }

    // Get current question to get points
    const currentQuestion = QuizService.getCurrentQuestion?.();
    if (!currentQuestion) {
      return res.status(400).json({ error: 'No active question' });
    }
    
    const points = currentQuestion.points || 10;

    // Mark question as answered
    QuizService.setQuestionAnswered?.(true);

    // Add user to answered set (same as processAnswer does)
    QuizService.addAnsweredUser?.(tiktokId);

    // Log points to database
    await PointsLog.addPoints(tiktokId, nickname, points, 'answer', sessionId);

    // Get the quiz IO to emit answer-correct
    const { io } = require('../server');
    if (io) {
      io.emit('answer-correct', {
        tiktokId,
        nickname,
        points,
        answer: currentQuestion.answer,
        timestamp: new Date(),
        manual: true
      });
      io.emit('reset-hint-progress');
    }

    res.json({ 
      success: true, 
      message: `✅ ${nickname} marked as correct! +${points} points`,
      data: { tiktokId, nickname, points }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createQuestion,
  getAllQuestions,
  searchQuestions,
  getRandomQuestionWithFilters,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getQuestionsByCategory,
  getQuestionsByTags,
  getRandomQuestion,
  getQuestionStats,
  getLeaderboard,
  getUserStats,
  startQuestion,
  submitAnswer,
  skipQuestion,
  checkHint,
  getFilterOptions,
  getParticipants,
  setWinnerManually
};
