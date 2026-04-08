const { MongoClient } = require('mongodb');
const logger = require('../utils/logger');

const DB_OPTIONS = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  writeConcern: { w: 'majority', j: true, wtimeoutMS: 5000 },
  readPreference: 'primaryPreferred',
};

let client = null;
let db = null;

async function connectDatabase() {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri || !dbName) {
    throw new Error('[Database] Missing MONGODB_URI or MONGODB_DB in environment config.');
  }

  client = new MongoClient(uri, DB_OPTIONS);
  await client.connect();
  db = client.db(dbName);

  logger.info('[Database] Connected to MongoDB', { dbName });
  await initializeCollections();

  return db;
}

async function initializeCollections() {
  const collections = ['questions', 'points_log', 'gift_log'];

  for (const name of collections) {
    try {
      await db.createCollection(name);
      logger.info(`[Database] Created collection: ${name}`);
    } catch (err) {
      if (err.code !== 48) throw err; // 48 = namespace already exists
    }
  }

  await db.collection('questions').createIndex({ category: 1 });
  await db.collection('questions').createIndex({ tags: 1 });

  await db.collection('points_log').createIndex({ tiktokId: 1 });
  await db.collection('points_log').createIndex({ timestamp: 1 });
  await db.collection('points_log').createIndex({ sessionId: 1 });

  await db.collection('gift_log').createIndex({ tiktokId: 1 });
  await db.collection('gift_log').createIndex({ timestamp: 1 });

  logger.info('[Database] All collections and indexes ready');
}

function getDatabase() {
  if (!db) throw new Error('[Database] Call connectDatabase() first.');
  return db;
}

async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    logger.info('[Database] Connection closed');
  }
}

module.exports = { connectDatabase, getDatabase, closeDatabase };
