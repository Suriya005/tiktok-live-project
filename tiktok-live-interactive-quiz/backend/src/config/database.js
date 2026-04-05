const { MongoClient } = require('mongodb');

let db = null;

async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tiktok-quiz';
    const client = new MongoClient(uri);
    
    await client.connect();
    db = client.db(process.env.MONGODB_DB || 'tiktok-quiz');
    
    console.log('✅ Connected to MongoDB');
    
    // Ensure collections and indexes exist
    await initializeCollections();
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
}

async function initializeCollections() {
  try {
    // Always create collections (idempotent)
    // Create questions collection
    try {
      await db.createCollection('questions');
      console.log('✅ Created collection: questions');
    } catch (err) {
      if (err.code !== 48) throw err; // 48 = namespace already exists
    }

    await db.collection('questions').createIndex({ category: 1 });
    await db.collection('questions').createIndex({ tags: 1 });

    // Create points_log collection
    try {
      await db.createCollection('points_log');
      console.log('✅ Created collection: points_log');
    } catch (err) {
      if (err.code !== 48) throw err;
    }

    await db.collection('points_log').createIndex({ tiktokId: 1 });
    await db.collection('points_log').createIndex({ timestamp: 1 });
    await db.collection('points_log').createIndex({ sessionId: 1 });

    // Create gift_log collection
    try {
      await db.createCollection('gift_log');
      console.log('✅ Created collection: gift_log');
    } catch (err) {
      if (err.code !== 48) throw err;
    }

    await db.collection('gift_log').createIndex({ tiktokId: 1 });
    await db.collection('gift_log').createIndex({ timestamp: 1 });

    console.log('✅ All collections and indexes initialized');
  } catch (error) {
    console.error('❌ Collection initialization error:', error.message);
    throw error;
  }
}

function getDB() {
  if (!db) {
    throw new Error('Database not connected. Call connectDB first.');
  }
  return db;
}

module.exports = {
  connectDB,
  getDB
};
