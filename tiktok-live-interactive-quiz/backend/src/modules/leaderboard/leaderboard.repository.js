const { getDatabase } = require('../../config/database');

const POINTS_LOG = 'points_log';

const getLeaderboard = async (timeFilter = 'all-time', sessionId = null) => {
  const db = getDatabase();
  const collection = db.collection(POINTS_LOG);
  const now = new Date();

  if (timeFilter === 'session') {
    if (!sessionId) return [];
    return collection
      .aggregate([
        { $match: { sessionId } },
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
      ])
      .toArray();
  }

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

  return collection
    .aggregate([
      { $match: { timestamp: { $gte: startDate } } },
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
    ])
    .toArray();
};

const getUserStats = async (tiktokId, timeFilter = 'all-time') => {
  const db = getDatabase();
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

  const result = await db
    .collection(POINTS_LOG)
    .aggregate([
      { $match: { tiktokId, timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: '$tiktokId',
          nickname: { $first: '$nickname' },
          totalPoints: { $sum: '$points' },
          correctAnswers: { $sum: { $cond: [{ $eq: ['$source', 'answer'] }, 1, 0] } },
          giftCount: { $sum: { $cond: [{ $eq: ['$source', 'gift'] }, 1, 0] } },
        },
      },
    ])
    .toArray();

  return result.length > 0 ? result[0] : null;
};

const getParticipants = async (sessionId) => {
  const db = getDatabase();
  return db
    .collection(POINTS_LOG)
    .aggregate([
      { $match: { sessionId } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$tiktokId',
          nickname: { $first: '$nickname' },
          lastActivity: { $first: '$timestamp' },
          totalPoints: { $sum: '$points' },
        },
      },
      { $sort: { lastActivity: -1 } },
      { $limit: 50 },
    ])
    .toArray();
};

module.exports = { getLeaderboard, getUserStats, getParticipants };
