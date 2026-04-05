require('dotenv').config();
const { connectDB, getDB } = require('../src/config/database');
const Question = require('../src/models/Question');

const sampleQuestions = [
  {
    text: 'What is the capital of Thailand?',
    answer: 'Bangkok',
    hint: 'It is known as "The City of Angels"',
    category: 'Geography',
    points: 10,
    requiredCoins: 100
  },
  {
    text: 'Which planet is known as the Red Planet?',
    answer: 'Mars',
    hint: 'It is named after the Roman god of war',
    category: 'Science',
    points: 15,
    requiredCoins: 150
  },
  {
    text: 'What is the largest ocean on Earth?',
    answer: 'Pacific Ocean',
    hint: 'It covers an area larger than all other oceans combined',
    category: 'Geography',
    points: 10,
    requiredCoins: 100
  },
  {
    text: 'Who painted the Mona Lisa?',
    answer: 'Leonardo da Vinci',
    hint: 'He was an Italian Renaissance artist',
    category: 'Art',
    points: 20,
    requiredCoins: 200
  },
  {
    text: 'What is the chemical symbol for Gold?',
    answer: 'Au',
    hint: 'It comes from the Latin word "aurum"',
    category: 'Science',
    points: 15,
    requiredCoins: 150
  }
];

const seed = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDB();
    const db = getDB();

    // Clear existing questions
    const questionsCollection = db.collection('questions');
    await questionsCollection.deleteMany({});
    console.log('✅ Cleared existing questions');

    // Insert sample questions
    for (const questionData of sampleQuestions) {
      const question = new Question(questionData);
      const result = await question.save();
      console.log(`✅ Added: "${questionData.text}"`);
    }

    console.log(`
✅ Database seeding completed!
📊 Total questions added: ${sampleQuestions.length}
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seed();
