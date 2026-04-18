const { Schema, model } = require('mongoose');

const PointsLogSchema = new Schema(
  {
    tiktokId: { type: String, required: true, index: true },
    nickname: { type: String, required: true },
    points: { type: Number, required: true },
    source: { type: String, enum: ['answer', 'gift'], required: true },
    sessionId: { type: String, index: true },
  },
  { timestamps: true },
);

PointsLogSchema.index({ createdAt: 1 });

module.exports = model('PointsLog', PointsLogSchema, 'points_log');
