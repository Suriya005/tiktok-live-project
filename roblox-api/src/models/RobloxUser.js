const { MongoClient } = require('mongodb');
const config = require('../config/config');

// MongoDB Connection
let db = null;
let client = null;

const connectDB = async () => {
  if (db) return db;
  
  try {
    client = new MongoClient(config.mongodb.uri);
    await client.connect();
    db = client.db(config.mongodb.dbName);
    
    console.log(`✅ MongoDB connected: ${config.mongodb.dbName}`);
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

/**
 * Upsert Roblox User
 * @param {Object} userData - { userId, username }
 * @returns {Object} upsert result
 */
const upsertRobloxUser = async (userData) => {
  const database = await connectDB();
  const collection = database.collection('roblox_attribute');
  
  const { userId, username } = userData;
  
  // Upsert: ถ้ามี userId แล้วก็ update, ถ้าไม่มีก็ insert ใหม่
  const result = await collection.updateOne(
    { userId },  // ค้นหาด้วย userId
    {
      $set: {
        username,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        userId,
        createdAt: new Date(),
      }
    },
    { upsert: true }  // สร้างใหม่ถ้าไม่เจอ
  );
  
  return {
    matched: result.matchedCount,
    modified: result.modifiedCount,
    upserted: result.upsertedCount,
    upsertedId: result.upsertedId,
  };
};

/**
 * Find Roblox User by userId
 */
const findRobloxUser = async (userId) => {
  const database = await connectDB();
  const collection = database.collection('roblox_attribute');
  
  return await collection.findOne({ userId });
};

/**
 * Get all Roblox Users
 */
const getAllRobloxUsers = async () => {
  const database = await connectDB();
  const collection = database.collection('roblox_attribute');
  
  return await collection.find({}).toArray();
};

/**
 * Find user role from users collection
 * @param {string} username - Roblox username to search
 * @returns {string} role - user role or 'noob' as default
 */
const getUserRole = async (username) => {
  const database = await connectDB();
  const usersCollection = database.collection('users');
  
  // หา user ที่มี roblox_username ตรงกับ username
  const user = await usersCollection.findOne({ roblox_username: username });
  
  // ถ้าเจอให้คืน role, ถ้าไม่เจอให้คืน 'noob'
  return user?.role || 'noob';
};

/**
 * Close MongoDB connection
 */
const closeConnection = async () => {
  if (client) {
    await client.close();
    db = null;
    client = null;
    console.log('MongoDB connection closed');
  }
};

module.exports = {
  connectDB,
  upsertRobloxUser,
  findRobloxUser,
  getAllRobloxUsers,
  getUserRole,
  closeConnection,
};
