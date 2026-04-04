const { MongoClient } = require('mongodb');
const config = require('../config/config');

let db = null;
let client = null;

const connectDB = async () => {
  if (db) return db;
  
  try {
    client = new MongoClient(config.mongodb.uri);
    await client.connect();
    db = client.db();
    
    console.log('✅ MongoDB connected');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

module.exports = { connectDB };
