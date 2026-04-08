const { getDatabase } = require('../../config/database');

const POINTS_LOG = 'points_log';
const GIFT_LOG = 'gift_log';

// --- Points Log ---

const addPoints = async (tiktokId, nickname, points, source, sessionId) => {
  const db = getDatabase();
  return db.collection(POINTS_LOG).insertOne({
    tiktokId,
    nickname,
    points,
    source,
    sessionId,
    timestamp: new Date(),
  });
};

// --- Gift Log ---

const logGift = async (tiktokId, nickname, giftId, giftName, count, coinValue) => {
  const db = getDatabase();
  return db.collection(GIFT_LOG).insertOne({
    tiktokId,
    nickname,
    giftId,
    giftName,
    count,
    coinValue,
    totalCoins: count * coinValue,
    timestamp: new Date(),
  });
};

const getTotalCoins = async (tiktokId) => {
  const db = getDatabase();
  const result = await db
    .collection(GIFT_LOG)
    .aggregate([
      { $match: { tiktokId } },
      { $group: { _id: '$tiktokId', totalCoins: { $sum: '$totalCoins' }, giftCount: { $sum: 1 } } },
    ])
    .toArray();

  return result.length > 0 ? result[0] : { totalCoins: 0, giftCount: 0 };
};

const getSessionGifts = async (limit = 1000, questionStartTime = null) => {
  const db = getDatabase();
  const matchStage = questionStartTime ? { timestamp: { $gte: questionStartTime } } : {};

  return db
    .collection(GIFT_LOG)
    .aggregate([
      { $match: matchStage },
      { $sort: { timestamp: -1 } },
      { $limit: limit },
      {
        $group: {
          _id: '$tiktokId',
          nickname: { $first: '$nickname' },
          totalCoins: { $sum: '$totalCoins' },
          giftCount: { $sum: 1 },
        },
      },
      { $sort: { totalCoins: -1 } },
    ])
    .toArray();
};

module.exports = { addPoints, logGift, getTotalCoins, getSessionGifts };
