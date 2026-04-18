const { Schema, model } = require('mongoose');

const QuestionSchema = new Schema(
  {
    text: { type: String, required: true },
    options: { type: [String], default: [] },
    answer: { type: String, required: true },
    hint: { type: String, default: '' },
    category: { type: String, default: 'general', index: true },
    tags: { type: [String], default: [], index: true },
    difficulty: { type: Number, default: 1, min: 1, max: 5 },
    points: { type: Number, default: 10 },
    requiredCoins: { type: Number, default: 100 },
  },
  { timestamps: true },
);

module.exports = model('Question', QuestionSchema);
