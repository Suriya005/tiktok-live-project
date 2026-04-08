const quizRepository = require('./quiz.repository');
const questionRepository = require('../questions/question.repository');
const logger = require('../../utils/logger');

let io = null;
let currentQuestion = null;
let currentSessionId = null;
const answeredUsers = new Set();
let questionStartTime = null;
let questionAnswered = false;

const initialize = (socketIo) => {
  io = socketIo;
};

const setSessionId = (sessionId) => {
  currentSessionId = sessionId;
};

const getSessionId = () => currentSessionId;

const getCurrentQuestion = () => currentQuestion;

const getAnsweredUsers = () => Array.from(answeredUsers);

const addAnsweredUser = (tiktokId) => answeredUsers.add(tiktokId);

const isQuestionAnswered = () => questionAnswered;

const setQuestionAnswered = (value) => {
  questionAnswered = value;
};

const startQuestion = async (questionId) => {
  const question = await questionRepository.findById(questionId);
  if (!question) return { success: false, error: 'Question not found' };

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
    answer: question.answer,
  };

  answeredUsers.clear();
  questionAnswered = false;

  if (io) {
    io.emit('question-started', { question: currentQuestion, timestamp: questionStartTime });
    io.emit('reset-hint-progress');
  }

  logger.info('[Quiz] Question started', { questionId: String(currentQuestion._id) });
  return { success: true, question: currentQuestion };
};

const processAnswer = async (tiktokId, nickname, userAnswer) => {
  if (!currentQuestion) return { success: false, error: 'No active question' };
  if (questionAnswered) return { success: false, error: 'Question already answered' };
  if (answeredUsers.has(tiktokId)) return { success: false, error: 'User already answered' };

  const result = await questionRepository.checkAnswer(currentQuestion._id, userAnswer);
  if (!result) return { success: false, error: 'Failed to check answer' };

  if (result.isCorrect) {
    questionAnswered = true;
    answeredUsers.add(tiktokId);

    await quizRepository.addPoints(tiktokId, nickname, result.points, 'answer', currentSessionId);

    if (io) {
      io.emit('answer-correct', {
        tiktokId,
        nickname,
        points: result.points,
        answer: currentQuestion.answer,
        timestamp: new Date(),
      });
      io.emit('reset-hint-progress');
    }

    logger.info('[Quiz] Correct answer', { nickname, points: result.points });
    return { success: true, correct: true, points: result.points };
  }

  if (io) {
    io.emit('answer-wrong', { tiktokId, nickname, timestamp: new Date() });
  }

  return { success: true, correct: false };
};

const checkHintCondition = async () => {
  if (!currentQuestion) return { hintUnlocked: false };

  const gifts = await quizRepository.getSessionGifts(1000, questionStartTime);
  const totalCoins = gifts.reduce((sum, g) => sum + g.totalCoins, 0);
  const { requiredCoins } = currentQuestion;

  if (totalCoins >= requiredCoins && !currentQuestion.hintUnlocked) {
    currentQuestion.hintUnlocked = true;
    const question = await questionRepository.findById(currentQuestion._id);

    if (io) {
      io.emit('hint-unlocked', {
        questionId: currentQuestion._id,
        hint: question.hint,
        totalCoins,
        requiredCoins,
        timestamp: new Date(),
      });
    }

    logger.info('[Quiz] Hint unlocked', { totalCoins, requiredCoins });
    return { hintUnlocked: true, hint: question.hint };
  }

  return {
    hintUnlocked: false,
    totalCoins,
    requiredCoins,
    progress: `${((totalCoins / requiredCoins) * 100).toFixed(2)}%`,
  };
};

const skipQuestion = async () => {
  currentQuestion = null;
  questionStartTime = null;
  answeredUsers.clear();
  questionAnswered = false;

  if (io) io.emit('question-skipped', { timestamp: new Date() });

  logger.info('[Quiz] Question skipped');
  return { success: true };
};

const setWinnerManually = async (tiktokId, nickname, sessionId) => {
  if (!currentQuestion) return { success: false, error: 'No active question' };
  if (questionAnswered) return { success: false, error: 'Question already answered' };
  if (answeredUsers.has(tiktokId)) return { success: false, error: 'User already answered' };

  const { points, answer } = currentQuestion;
  questionAnswered = true;
  answeredUsers.add(tiktokId);

  await quizRepository.addPoints(tiktokId, nickname, points, 'answer', sessionId);

  if (io) {
    io.emit('answer-correct', { tiktokId, nickname, points, answer, timestamp: new Date(), manual: true });
    io.emit('reset-hint-progress');
  }

  logger.info('[Quiz] Winner set manually', { nickname, points });
  return { success: true, data: { tiktokId, nickname, points } };
};

module.exports = {
  initialize,
  setSessionId,
  getSessionId,
  getCurrentQuestion,
  getAnsweredUsers,
  addAnsweredUser,
  isQuestionAnswered,
  setQuestionAnswered,
  startQuestion,
  processAnswer,
  checkHintCondition,
  skipQuestion,
  setWinnerManually,
};
