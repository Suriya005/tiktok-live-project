const leaderboardRepository = require('./leaderboard.repository');
const { ok, okList, dataNotFound, badRequest, internalError } = require('../../utils/response');
const logger = require('../../utils/logger');

const getLeaderboard = async (req, res) => {
  try {
    const { timeFilter = 'all-time', sessionId } = req.query;
    const leaderboard = await leaderboardRepository.getLeaderboard(timeFilter, sessionId);
    return okList(res, leaderboard);
  } catch (err) {
    logger.error('[Leaderboard] getLeaderboard failed', { err: err.message });
    return internalError(res);
  }
};

const getUserStats = async (req, res) => {
  try {
    const { tiktokId } = req.params;
    const { timeFilter = 'all-time' } = req.query;
    const stats = await leaderboardRepository.getUserStats(tiktokId, timeFilter);
    if (!stats) return dataNotFound(res);
    return ok(res, stats);
  } catch (err) {
    logger.error('[Leaderboard] getUserStats failed', { err: err.message });
    return internalError(res);
  }
};

const getParticipants = async (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) return badRequest(res, 'sessionId query parameter is required');

  try {
    const participants = await leaderboardRepository.getParticipants(sessionId);
    return okList(res, participants);
  } catch (err) {
    logger.error('[Leaderboard] getParticipants failed', { err: err.message });
    return internalError(res);
  }
};

module.exports = { getLeaderboard, getUserStats, getParticipants };
