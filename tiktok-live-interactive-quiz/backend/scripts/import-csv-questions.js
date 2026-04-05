require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tiktok-quiz';
const MONGODB_DB = process.env.MONGODB_DB || 'tiktok-quiz';
const CSV_DIR = path.join(__dirname, 'csv-question');

// Parse CSV line - handles quoted values with commas inside
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

// Parse CSV file
function parseCSVFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const questions = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) continue;

    const question = {};
    headers.forEach((header, index) => {
      let value = values[index];
      
      // Remove surrounding quotes
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }

      // Parse specific fields
      if (header === 'options') {
        question[header] = value.split('|').map(v => v.trim());
      } else if (header === 'tags') {
        question[header] = value.split('|').map(v => v.trim());
      } else if (header === 'difficulty' || header === 'points' || header === 'requiredCoins') {
        question[header] = parseInt(value, 10);
      } else if (header === 'createdAt' || header === 'updatedAt') {
        question[header] = new Date(value);
      } else {
        question[header] = value;
      }
    });

    if (question.text) {
      questions.push(question);
    }
  }

  return questions;
}

async function importCSVQuestions() {
  let client;

  try {
    console.log('🔄 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const collection = db.collection('questions');

    console.log(`📂 Reading CSV files from: ${CSV_DIR}`);
    const files = fs.readdirSync(CSV_DIR)
      .filter(f => f.endsWith('.csv'))
      .sort();

    if (files.length === 0) {
      console.log('❌ No CSV files found!');
      return;
    }

    console.log(`📊 Found ${files.length} CSV files to import\n`);

    let totalInserted = 0;
    let totalSkipped = 0;

    for (const file of files) {
      const filePath = path.join(CSV_DIR, file);
      console.log(`📥 Processing: ${file}`);

      try {
        const questions = parseCSVFile(filePath);

        if (questions.length === 0) {
          console.log(`   ⏭️  No valid questions found (header only)\n`);
          continue;
        }

        // Insert questions
        const result = await collection.insertMany(questions);
        console.log(`   ✅ Inserted ${result.insertedIds.length} questions`);
        totalInserted += result.insertedIds.length;
      } catch (error) {
        console.error(`   ❌ Error processing file: ${error.message}`);
        totalSkipped++;
      }

      console.log('');
    }

    // Summary
    console.log('═'.repeat(50));
    console.log('📈 Import Summary:');
    console.log(`   ✅ Total Inserted: ${totalInserted}`);
    console.log(`   ⏭️  Files Skipped: ${totalSkipped}`);
    console.log('═'.repeat(50));

    // Show stats
    const totalQuestions = await collection.countDocuments();
    const categoryCounts = await collection.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    const difficultyCounts = await collection.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();

    console.log(`\n📊 Database Statistics:`);
    console.log(`   📝 Total Questions: ${totalQuestions}`);
    
    if (categoryCounts.length > 0) {
      console.log(`\n   Categories:`);
      categoryCounts.forEach(cat => {
        console.log(`      • ${cat._id}: ${cat.count} questions`);
      });
    }

    if (difficultyCounts.length > 0) {
      console.log(`\n   Difficulty Levels:`);
      difficultyCounts.forEach(diff => {
        console.log(`      • Level ${diff._id}: ${diff.count} questions`);
      });
    }

    console.log('\n✅ Import completed successfully!');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the import
importCSVQuestions();
