const { getDB } = require('../config/database');

class GiftLog {
  constructor(data) {
    this.tiktokId = data.tiktokId;
    this.nickname = data.nickname;
    this.giftId = data.giftId;
    this.giftName = data.giftName;
    this.count = data.count;
    this.coinValue = data.coinValue;
    this.totalCoins = data.count * data.coinValue;
    this.timestamp = new Date();
  }

  async save() {
    const db = getDB();
    const collection = db.collection('gift_log');
    return await collection.insertOne(this);
  }

  static async logGift(tiktokId, nickname, giftId, giftName, count, coinValue) {
    const gift = new GiftLog({
      tiktokId,
      nickname,
      giftId,
      giftName,
      count,
      coinValue
    });
    return await gift.save();
  }

  static async getTotalCoins(tiktokId) {
    const db = getDB();
    const collection = db.collection('gift_log');
    
    const result = await collection.aggregate([
      { $match: { tiktokId } },
      { $group: { 
          _id: '$tiktokId', 
          totalCoins: { $sum: '$totalCoins' },
          giftCount: { $sum: 1 }
        }
      }
    ]).toArray();

    return result.length > 0 ? result[0] : { totalCoins: 0, giftCount: 0 };
  }

  static async getGiftHistory(tiktokId, limit = 50) {
    const db = getDB();
    const collection = db.collection('gift_log');
    
    return await collection.find({ tiktokId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  static async getSessionGifts(limit = 100, questionStartTime = null) {
    const db = getDB();
    const collection = db.collection('gift_log');
    
    let matchStage = {};
    if (questionStartTime) {
      matchStage = { timestamp: { $gte: questionStartTime } };
    }
    
    return await collection.aggregate([
      { $match: matchStage },
      { $sort: { timestamp: -1 } },
      { $limit: limit },
      { $group: { 
          _id: '$tiktokId', 
          nickname: { $first: '$nickname' },
          totalCoins: { $sum: '$totalCoins' },
          giftCount: { $sum: 1 }
        }
      },
      { $sort: { totalCoins: -1 } }
    ]).toArray();
  }
}

module.exports = GiftLog;
