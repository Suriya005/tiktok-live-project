const PointsLog = require('../../models/PointsLog');
const GiftLog = require('../../models/GiftLog');

// --- Points Log ---

const addPoints = (tiktokId, nickname, points, source, sessionId) =>
  PointsLog.create({ tiktokId, nickname, points, source, sessionId });

// --- Gift Log ---

const logGift = (tiktokId, nickname, giftId, giftName, count, coinValue) =>
  GiftLog.create({ tiktokId, nickname, giftId, giftName, count, coinValue, totalCoins: count * coinValue });

const getTotalCoins = async (tiktokId) => {
  const result = await GiftLog.aggregate([
    { $match: { tiktokId } },
    { $group: { _id: '$tiktokId', totalCoins: { $sum: '$totalCoins' }, giftCount: { $sum: 1 } } },
  ]);
  return result.length > 0 ? result[0] : { totalCoins: 0, giftCount: 0 };
};

const getSessionGifts = (limit = 1000, questionStartTime = null) => {
  const matchStage = questionStartTime ? { createdAt: { $gte: questionStartTime } } : {};

  return GiftLog.aggregate([
    { $match: matchStage },
    { $sort: { createdAt: -1 } },
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
  ]);
};

module.exports = { addPoints, logGift, getTotalCoins, getSessionGifts };
