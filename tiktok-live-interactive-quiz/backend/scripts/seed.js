require('dotenv').config();
const { connectDatabase, getDatabase, closeDatabase } = require('../src/config/database');

const sampleQuestions = [
  {
    text: 'What is the capital of Thailand?',
    answer: 'Bangkok',
    hint: 'It is known as "The City of Angels"',
    category: 'Geography',
    tags: ['geography', 'thailand'],
    difficulty: 1,
    points: 10,
    requiredCoins: 100,
  },
  {
    text: 'Which planet is known as the Red Planet?',
    answer: 'Mars',
    hint: 'It is named after the Roman god of war',
    category: 'Science',
    tags: ['science', 'space'],
    difficulty: 2,
    points: 15,
    requiredCoins: 150,
  },
  {
    text: 'What is the largest ocean on Earth?',
    answer: 'Pacific Ocean',
    hint: 'It covers an area larger than all other oceans combined',
    category: 'Geography',
    tags: ['geography', 'ocean'],
    difficulty: 1,
    points: 10,
    requiredCoins: 100,
  },
  {
    text: 'Who painted the Mona Lisa?',
    answer: 'Leonardo da Vinci',
    hint: 'He was an Italian Renaissance artist',
    category: 'Art',
    tags: ['art', 'history'],
    difficulty: 2,
    points: 20,
    requiredCoins: 200,
  },
  {
    text: 'What is the chemical symbol for Gold?',
    answer: 'Au',
    hint: 'It comes from the Latin word "aurum"',
    category: 'Science',
    tags: ['science', 'chemistry'],
    difficulty: 3,
    points: 15,
    requiredCoins: 150,
  },
];

const seed = async () => {
  await connectDatabase();
  const db = getDatabase();
  const collection = db.collection('questions');

  await collection.deleteMany({});
  console.log('🗑️  Cleared existing questions');

  const now = new Date();
  const docs = sampleQuestions.map((q) => ({
    ...q,
    answer: q.answer.toLowerCase().trim(),
    options: q.options || [],
    createdAt: now,
    updatedAt: now,
  }));

  await collection.insertMany(docs);
  console.log(`✅ Seeded ${docs.length} questions`);

  await closeDatabase();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed error:', err.message);
  process.exit(1);
});
