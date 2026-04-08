const PointsLog = require('../../models/PointsLog');

const getLeaderboard = async (timeFilter = 'all-time', sessionId = null) => {
  const now = new Date();
  let matchStage;

  if (timeFilter === 'session') {
    if (!sessionId) return [];
    matchStage = { sessionId };
  } else {
    let startDate = new Date(0);
    switch (timeFilter) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }
    matchStage = { createdAt: { $gte: startDate } };
  }

  return PointsLog.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$tiktokId',
        nickname: { $first: '$nickname' },
        totalPoints: { $sum: '$points' },
        count: { $sum: { $cond: [{ $eq: ['$source', 'answer'] }, 1, 0] } },
      },
    },
    { $sort: { totalPoints: -1 } },
    { $limit: 100 },
  ]);
};

const getUserStats = async (tiktokId, timeFilter = 'all-time') => {
  const now = new Date();
  let startDate = new Date(0);

  switch (timeFilter) {
    case 'daily':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'weekly':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      break;
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'yearly':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
  }

  const result = await PointsLog.aggregate([
    { $match: { tiktokId, createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$tiktokId',
        nickname: { $first: '$nickname' },
        totalPoints: { $sum: '$points' },
        correctAnswers: { $sum: { $cond: [{ $eq: ['$source', 'answer'] }, 1, 0] } },
        giftCount: { $sum: { $cond: [{ $eq: ['$source', 'gift'] }, 1, 0] } },
      },
    },
  ]);

  return result.length > 0 ? result[0] : null;
};

const getParticipants = (sessionId) =>
  PointsLog.aggregate([
    { $match: { sessionId } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$tiktokId',
        nickname: { $first: '$nickname' },
        lastActivity: { $first: '$createdAt' },
        totalPoints: { $sum: '$points' },
      },
    },
    { $sort: { lastActivity: -1 } },
    { $limit: 50 },
  ]);

module.exports = { getLeaderboard, getUserStats, getParticipants };
