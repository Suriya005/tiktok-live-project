const Question = require('../models/Question');
const PointsLog = require('../models/PointsLog');
const GiftLog = require('../models/GiftLog');

let io = null;
let currentQuestion = null;
let currentSessionId = null;
let answeredUsers = new Set();
let questionStartTime = null;
let questionAnswered = false;

class QuizService {
  static initialize(socketIo) {
    io = socketIo;
  }

  static setSessionId(sessionId) {
    currentSessionId = sessionId;
  }

  static getSessionId() {
    return currentSessionId;
  }

  static async startQuestion(questionId) {
    try {
      const question = await Question.findById(questionId);
      if (!question) {
        throw new Error('Question not found');
      }

      questionStartTime = new Date();

      currentQuestion = {
        _id: question._id,
        text: question.text,
        category: question.category,
        points: question.points,
        requiredCoins: question.requiredCoins,
        options: question.options,
        difficulty: question.difficulty,
        hint: question.hint,
        answer: question.answer
      };

      answeredUsers.clear();
      questionAnswered = false;

      if (io) {
        io.emit('question-started', {
          question: currentQuestion,
          timestamp: questionStartTime
        });
        // Reset hint progress
        io.emit('reset-hint-progress');
      }

      return { success: true, question: currentQuestion };
    } catch (error) {
      console.error('❌ Start question error:', error.message);
      return { success: false, error: error.message };
    }
  }

  static async processAnswer(tiktokId, nickname, userAnswer) {
    try {
      if (!currentQuestion) {
        return { success: false, error: 'No active question' };
      }

      // Check if question already answered by someone
      if (questionAnswered) {
        return { success: false, error: 'Question already answered by someone else' };
      }

      // Check if user already answered
      if (answeredUsers.has(tiktokId)) {
        return { success: false, error: 'User already answered' };
      }

      console.log(`🔍 Checking answer from @${nickname}: "${userAnswer}"`);
      const result = await Question.checkAnswer(currentQuestion._id, userAnswer);
      console.log(`📝 Answer result: isCorrect=${result.isCorrect}, answer="${userAnswer}"`);

      if (result.isCorrect) {
        // Mark question as answered
        questionAnswered = true;

        // Mark user as answered
        answeredUsers.add(tiktokId);

        // Log points to database
        await PointsLog.addPoints(
          tiktokId,
          nickname,
          result.points,
          'answer',
          currentSessionId
        );

        if (io) {
          console.log(`✅ EMITTING answer-correct for @${nickname}`);
          io.emit('answer-correct', {
            tiktokId,
            nickname,
            points: result.points,
            answer: currentQuestion.answer,
            timestamp: new Date()
          });
          // Reset hint progress
          io.emit('reset-hint-progress');
        }

        return { 
          success: true, 
          correct: true, 
          points: result.points 
        };
      } else {
        // Wrong answer
        if (io) {
          io.emit('answer-wrong', {
            tiktokId,
            nickname,
            timestamp: new Date()
          });
        }

        return { 
          success: true, 
          correct: false,
          hint: result.hint 
        };
      }
    } catch (error) {
      console.error('❌ Process answer error:', error.message);
      return { success: false, error: error.message };
    }
  }

  static async checkHintCondition() {
    try {
      if (!currentQuestion) {
        return { hintUnlocked: false };
      }

      const requiredCoins = currentQuestion.requiredCoins;
      
      // Get all gifts from current question only (since questionStartTime)
      const gifts = await GiftLog.getSessionGifts(1000, questionStartTime);
      
      // Calculate total coins for current question
      const totalCoins = gifts.reduce((sum, g) => sum + g.totalCoins, 0);

      if (totalCoins >= requiredCoins && !currentQuestion.hintUnlocked) {
        currentQuestion.hintUnlocked = true;
        const question = await Question.findById(currentQuestion._id);
        
        if (io) {
          io.emit('hint-unlocked', {
            questionId: currentQuestion._id,
            hint: question.hint,
            totalCoins,
            requiredCoins,
            timestamp: new Date()
          });
        }

        return { hintUnlocked: true, hint: question.hint };
      }

      return { 
        hintUnlocked: false, 
        totalCoins,
        requiredCoins,
        progress: (totalCoins / requiredCoins * 100).toFixed(2) + '%'
      };
    } catch (error) {
      console.error('❌ Hint condition error:', error.message);
      return { success: false, error: error.message };
    }
  }

  static async skipQuestion() {
    try {
      currentQuestion = null;
      questionStartTime = null;
      answeredUsers.clear();
      questionAnswered = false;

      if (io) {
        io.emit('question-skipped', { timestamp: new Date() });
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Skip question error:', error.message);
      return { success: false, error: error.message };
    }
  }

  static getCurrentQuestion() {
    return currentQuestion;
  }

  static getAnsweredUsers() {
    return Array.from(answeredUsers);
  }

  static addAnsweredUser(tiktokId) {
    answeredUsers.add(tiktokId);
  }

  static isQuestionAnswered() {
    return questionAnswered;
  }

  static setQuestionAnswered(answered) {
    questionAnswered = answered;
  }
}

module.exports = QuizService;
