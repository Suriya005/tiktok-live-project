const { getDB } = require('../config/database');

class PointsLog {
  constructor(data) {
    this.tiktokId = data.tiktokId;
    this.nickname = data.nickname;
    this.points = data.points;
    this.source = data.source; // 'answer' or 'gift'
    this.timestamp = new Date();
    this.sessionId = data.sessionId;
  }

  async save() {
    const db = getDB();
    const collection = db.collection('points_log');
    return await collection.insertOne(this);
  }

  static async addPoints(tiktokId, nickname, points, source, sessionId) {
    const log = new PointsLog({
      tiktokId,
      nickname,
      points,
      source,
      sessionId
    });
    return await log.save();
  }

  static async getLeaderboard(timeFilter = 'all-time', sessionId = null) {
    const db = getDB();
    const collection = db.collection('points_log');
    // Calculate time range based on filter
    const now = new Date();
    let startDate = null;

    switch (timeFilter) {
      case 'session':
        // Return current session only (if sessionId provided)
        if (!sessionId) {
          console.log('⚠️ Session filter selected but no sessionId provided, returning empty');
          return [];
        }
        const sessionResult = await collection.aggregate([
          { $match: { sessionId } },
          {
            $group: {
              _id: '$tiktokId',
              nickname: { $first: '$nickname' },
              totalPoints: { $sum: '$points' },
              count: { $sum: { $cond: [{ $eq: ['$source', 'answer'] }, 1, 0] } }
            }
          },
          { $sort: { totalPoints: -1 } },
          { $limit: 100 }
        ]).toArray();
        return sessionResult;

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

      case 'all-time':
      default:
        startDate = new Date(0);
    }

    const query = startDate ? { timestamp: { $gte: startDate } } : {};

    return await collection.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$tiktokId',
          nickname: { $first: '$nickname' },
          totalPoints: { $sum: '$points' },
          count: { $sum: { $cond: [{ $eq: ['$source', 'answer'] }, 1, 0] } }
        }
      },
      { $sort: { totalPoints: -1 } },
      { $limit: 100 }
    ]).toArray();
  }

  static async getUserStats(tiktokId, timeFilter = 'all-time') {
    const db = getDB();
    const collection = db.collection('points_log');

    const now = new Date();
    let startDate = null;

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
      default:
        startDate = new Date(0);
    }

    const query = { tiktokId, timestamp: { $gte: startDate } };

    return await collection.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$tiktokId',
          nickname: { $first: '$nickname' },
          totalPoints: { $sum: '$points' },
          correctAnswers: {
            $sum: { $cond: [{ $eq: ['$source', 'answer'] }, 1, 0] }
          },
          giftCount: {
            $sum: { $cond: [{ $eq: ['$source', 'gift'] }, 1, 0] }
          }
        }
      }
    ]).toArray();
  }
}

module.exports = PointsLog;
