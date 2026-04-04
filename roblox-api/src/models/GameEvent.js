const { MongoClient, ObjectId } = require('mongodb');
const config = require('../config/config');

// MongoDB Connection (reuse from RobloxUser)
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
 * CREATE - สร้าง game event ใหม่
 */
const createGameEvent = async (eventData) => {
  const database = await connectDB();
  const collection = database.collection('game_events');
  
  const { 
    game_id, 
    event_name, 
    default_delay, 
    is_active = true,
    multi_spawn = false,
    is_animation = false,
    point_amount = 0
  } = eventData;
  
  const newEvent = {
    game_id,
    event_name,
    default_delay: parseInt(default_delay),
    point_amount: parseFloat(point_amount),
    is_active,
    multi_spawn,
    is_animation,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const result = await collection.insertOne(newEvent);
  
  return {
    id: result.insertedId,
    ...newEvent,
  };
};

/**
 * READ - ดึง game event ทั้งหมด
 */
const getAllGameEvents = async (filters = {}) => {
  const database = await connectDB();
  const collection = database.collection('game_events');
  
  const query = {};
  
  // Filter by game_id
  if (filters.game_id) {
    query.game_id = filters.game_id;
  }
  
  // Filter by is_active
  if (filters.is_active !== undefined) {
    query.is_active = filters.is_active === 'true' || filters.is_active === true;
  }
  
  return await collection.find(query).toArray();
};

/**
 * READ - ดึง game event ตาม ID
 */
const getGameEventById = async (id) => {
  const database = await connectDB();
  const collection = database.collection('game_events');
  
  return await collection.findOne({ _id: new ObjectId(id) });
};

/**
 * READ - ดึง game event ตาม event_name
 */
const getGameEventByName = async (game_id, event_name) => {
  const database = await connectDB();
  const collection = database.collection('game_events');
  
  return await collection.findOne({ game_id, event_name });
};

/**
 * UPDATE - อัพเดท game event
 */
const updateGameEvent = async (id, updateData) => {
  const database = await connectDB();
  const collection = database.collection('game_events');
  
  const updates = { ...updateData, updatedAt: new Date() };
  
  // แปลง default_delay เป็น Int ถ้ามี
  if (updates.default_delay !== undefined) {
    updates.default_delay = parseInt(updates.default_delay);
  }
  
  // แปลง point_amount เป็น Float ถ้ามี
  if (updates.point_amount !== undefined) {
    updates.point_amount = parseFloat(updates.point_amount);
  }
  
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  );
  
  if (result.matchedCount === 0) {
    return null;
  }
  
  return await getGameEventById(id);
};

/**
 * DELETE - ลบ game event
 */
const deleteGameEvent = async (id) => {
  const database = await connectDB();
  const collection = database.collection('game_events');
  
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  
  return result.deletedCount > 0;
};

/**
 * TOGGLE - เปิด/ปิด game event
 */
const toggleGameEvent = async (id, is_active) => {
  const database = await connectDB();
  const collection = database.collection('game_events');
  
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { 
      $set: { 
        is_active,
        updatedAt: new Date()
      } 
    }
  );
  
  if (result.matchedCount === 0) {
    return null;
  }
  
  return await getGameEventById(id);
};

module.exports = {
  createGameEvent,
  getAllGameEvents,
  getGameEventById,
  getGameEventByName,
  updateGameEvent,
  deleteGameEvent,
  toggleGameEvent,
};
