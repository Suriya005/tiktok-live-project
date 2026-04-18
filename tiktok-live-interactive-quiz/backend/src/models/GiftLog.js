const { Schema, model } = require('mongoose');

const GiftLogSchema = new Schema(
  {
    tiktokId: { type: String, required: true, index: true },
    nickname: { type: String, required: true },
    giftId: { type: Number, required: true },
    giftName: { type: String, required: true },
    count: { type: Number, required: true },
    coinValue: { type: Number, required: true },
    totalCoins: { type: Number, required: true },
  },
  { timestamps: true },
);

GiftLogSchema.index({ createdAt: 1 });

module.exports = model('GiftLog', GiftLogSchema, 'gift_log');
