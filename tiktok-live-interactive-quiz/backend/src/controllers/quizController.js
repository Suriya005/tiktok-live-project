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
    const questions = await Question.findAll();
    res.json({ success: true, questions });
  } catch (error) {
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

    // Get current question to get points
    const currentQuestion = QuizService.getCurrentQuestion?.();
    const points = currentQuestion?.points || 10;

    // Log points to database
    await PointsLog.addPoints(tiktokId, nickname, points, 'answer', sessionId);

    // Get the quiz IO to emit answer-correct
    const { io } = require('../server');
    if (io) {
      io.emit('answer-correct', {
        tiktokId,
        nickname,
        points,
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
