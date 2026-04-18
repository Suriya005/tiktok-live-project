const quizService = require('./quiz.service');
const { ok, badRequest, internalError } = require('../../utils/response');
const logger = require('../../utils/logger');

const startQuestion = async (req, res) => {
  const { questionId } = req.body;
  if (!questionId) return badRequest(res, 'questionId is required');

  try {
    const result = await quizService.startQuestion(questionId);
    if (!result.success) return badRequest(res, result.error);
    return ok(res, result.question);
  } catch (err) {
    logger.error('[Quiz] startQuestion failed', { err: err.message });
    return internalError(res);
  }
};

const submitAnswer = async (req, res) => {
  const { tiktokId, answer } = req.body;
  if (!tiktokId) return badRequest(res, 'tiktokId is required');
  if (!answer) return badRequest(res, 'answer is required');

  try {
    const { nickname = tiktokId } = req.body;
    const result = await quizService.processAnswer(tiktokId, nickname, answer);
    return ok(res, result);
  } catch (err) {
    logger.error('[Quiz] submitAnswer failed', { err: err.message });
    return internalError(res);
  }
};

const skipQuestion = async (req, res) => {
  try {
    const result = await quizService.skipQuestion();
    return ok(res, result);
  } catch (err) {
    logger.error('[Quiz] skipQuestion failed', { err: err.message });
    return internalError(res);
  }
};

const checkHint = async (req, res) => {
  try {
    const result = await quizService.checkHintCondition();
    return ok(res, result);
  } catch (err) {
    logger.error('[Quiz] checkHint failed', { err: err.message });
    return internalError(res);
  }
};

const setWinnerManually = async (req, res) => {
  const { tiktokId, nickname, sessionId } = req.body;
  if (!tiktokId) return badRequest(res, 'tiktokId is required');
  if (!nickname) return badRequest(res, 'nickname is required');
  if (!sessionId) return badRequest(res, 'sessionId is required');

  try {
    const result = await quizService.setWinnerManually(tiktokId, nickname, sessionId);
    if (!result.success) return badRequest(res, result.error);
    return ok(res, result.data);
  } catch (err) {
    logger.error('[Quiz] setWinnerManually failed', { err: err.message });
    return internalError(res);
  }
};

module.exports = { startQuestion, submitAnswer, skipQuestion, checkHint, setWinnerManually };
