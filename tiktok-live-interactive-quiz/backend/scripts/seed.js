require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../src/models/Question');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tiktok-quiz';

const sampleQuestions = [
  {
    text: 'What is the capital of Thailand?',
    answer: 'bangkok',
    hint: 'It is known as "The City of Angels"',
    category: 'Geography',
    tags: ['geography', 'thailand'],
    difficulty: 1,
    points: 10,
    requiredCoins: 100,
  },
  {
    text: 'Which planet is known as the Red Planet?',
    answer: 'mars',
    hint: 'It is named after the Roman god of war',
    category: 'Science',
    tags: ['science', 'space'],
    difficulty: 2,
    points: 15,
    requiredCoins: 150,
  },
  {
    text: 'What is the largest ocean on Earth?',
    answer: 'pacific ocean',
    hint: 'It covers an area larger than all other oceans combined',
    category: 'Geography',
    tags: ['geography', 'ocean'],
    difficulty: 1,
    points: 10,
    requiredCoins: 100,
  },
  {
    text: 'Who painted the Mona Lisa?',
    answer: 'leonardo da vinci',
    hint: 'He was an Italian Renaissance artist',
    category: 'Art',
    tags: ['art', 'history'],
    difficulty: 2,
    points: 20,
    requiredCoins: 200,
  },
  {
    text: 'What is the chemical symbol for Gold?',
    answer: 'au',
    hint: 'It comes from the Latin word "aurum"',
    category: 'Science',
    tags: ['science', 'chemistry'],
    difficulty: 3,
    points: 15,
    requiredCoins: 150,
  },
];

const seed = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  await Question.deleteMany({});
  console.log('🗑️  Cleared existing questions');

  await Question.insertMany(sampleQuestions);
  console.log(`✅ Seeded ${sampleQuestions.length} questions`);

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed error:', err.message);
  process.exit(1);
});
