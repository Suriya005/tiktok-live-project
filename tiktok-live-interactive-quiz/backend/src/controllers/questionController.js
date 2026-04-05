const Question = require('../models/Question');

// CREATE - สร้างคำถามใหม่
const createQuestion = async (req, res) => {
  try {
    const { text, options, answer, hint, category, tags, difficulty, points, requiredCoins } = req.body;

    // Validation
    if (!text || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Question text and answer are required'
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    const newQuestion = new Question({
      text,
      options: options || ['A', 'B', 'C', 'D'],
      answer,
      hint: hint || '',
      category,
      tags: tags || [],
      difficulty: difficulty || 1,
      points: points || 10,
      requiredCoins: requiredCoins || 100
    });

    const result = await newQuestion.save();

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: {
        _id: result.insertedId,
        ...newQuestion
      }
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating question',
      error: error.message
    });
  }
};

// READ ALL - ดึงคำถามทั้งหมด
const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.findAll();
    
    res.status(200).json({
      success: true,
      data: questions,
      count: questions.length
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
      error: error.message
    });
  }
};

// READ BY ID
const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching question',
      error: error.message
    });
  }
};

// READ BY CATEGORY
const getQuestionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const questions = await Question.findByCategory(category);

    res.status(200).json({
      success: true,
      data: questions,
      count: questions.length
    });
  } catch (error) {
    console.error('Error fetching questions by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
      error: error.message
    });
  }
};

// READ BY TAGS
const getQuestionsByTags = async (req, res) => {
  try {
    const { tags } = req.query;

    if (!tags) {
      return res.status(400).json({
        success: false,
        message: 'Tags parameter is required'
      });
    }

    const tagArray = Array.isArray(tags) ? tags : [tags];
    const questions = await Question.findByTags(tagArray);

    res.status(200).json({
      success: true,
      data: questions,
      count: questions.length,
      filters: { tags: tagArray }
    });
  } catch (error) {
    console.error('Error fetching questions by tags:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
      error: error.message
    });
  }
};

// GET RANDOM QUESTION
const getRandomQuestion = async (req, res) => {
  try {
    const { tags } = req.query;
    const tagArray = tags ? (Array.isArray(tags) ? tags : [tags]) : null;

    const question = await Question.getRandomQuestion(tagArray);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'No questions available'
      });
    }

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Error fetching random question:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching random question',
      error: error.message
    });
  }
};

// UPDATE - แก้ไขคำถาม
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove _id and createdAt from updateData if present
    delete updateData._id;
    delete updateData.createdAt;

    const result = await Question.updateById(id, updateData);

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const updatedQuestion = await Question.findById(id);

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: updatedQuestion
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating question',
      error: error.message
    });
  }
};

// DELETE - ลบคำถาม
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Question.deleteById(id);

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting question',
      error: error.message
    });
  }
};

// GET STATISTICS
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

    res.status(200).json({
      success: true,
      data: {
        totalQuestions: total,
        byCategory,
        allTags: Array.from(allTags),
        avgDifficulty: (allQuestions.reduce((sum, q) => sum + (q.difficulty || 1), 0) / total).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  getQuestionsByCategory,
  getQuestionsByTags,
  getRandomQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionStats
};
