const { MongoClient, ObjectId } = require('mongodb');
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

// Status Enum
const QueueStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
};

/**
 * CREATE - เพิ่มคิวใหม่
 */
const createEventQueue = async (queueData) => {
  const database = await connectDB();
  const collection = database.collection('event_queue');
  
  const { user_id, game_id, event_name, amount, delay, quantity } = queueData;
  
  const newQueue = {
    user_id,
    game_id,
    event_name,
    amount: parseFloat(amount),
    delay: parseInt(delay),
    quantity: parseInt(quantity || 1),
    status: QueueStatus.PENDING,
    created_at: new Date(),
    processed_at: null,
  };
  
  const result = await collection.insertOne(newQueue);
  
  return {
    id: result.insertedId,
    ...newQueue,
  };
};

/**
 * CREATE BULK - เพิ่มหลายคิวพร้อมกัน
 */
const createBulkEventQueue = async (queuesData) => {
  const database = await connectDB();
  const collection = database.collection('event_queue');
  
  const queues = queuesData.map(q => ({
    user_id: q.user_id,
    game_id: q.game_id,
    event_name: q.event_name,
    amount: parseFloat(q.amount),
    delay: parseInt(q.delay),
    quantity: parseInt(q.quantity),
    status: QueueStatus.PENDING,
    created_at: new Date(),
    processed_at: null,
  }));
  
  const result = await collection.insertMany(queues);
  
  return {
    insertedCount: result.insertedCount,
    insertedIds: result.insertedIds,
  };
};

/**
 * READ - ดึงคิวทั้งหมด
 */
const getAllEventQueues = async (filters = {}) => {
  const database = await connectDB();
  const collection = database.collection('event_queue');
  
  const query = {};
  
  if (filters.user_id) query.user_id = filters.user_id;
  if (filters.game_id) query.game_id = filters.game_id;
  if (filters.event_name) query.event_name = filters.event_name;
  if (filters.status) query.status = filters.status;
  
  return await collection
    .find(query)
    .sort({ created_at: 1 })  // เรียงตามเวลาสร้าง เก่าสุดก่อน
    .toArray();
};

/**
 * READ - ดึงคิวตาม ID
 */
const getEventQueueById = async (id) => {
  const database = await connectDB();
  const collection = database.collection('event_queue');
  
  return await collection.findOne({ _id: new ObjectId(id) });
};

/**
 * READ - ดึงคิวที่รอดำเนินการ (PENDING)
 */
const getPendingQueues = async (game_id = null, limit = 100) => {
  const database = await connectDB();
  const collection = database.collection('event_queue');
  
  const query = { status: QueueStatus.PENDING };
  if (game_id) query.game_id = game_id;
  
  return await collection
    .find(query)
    .sort({ created_at: 1 })
    .limit(limit)
    .toArray();
};

/**
 * UPDATE - อัพเดทสถานะคิว
 */
const updateQueueStatus = async (id, status) => {
  const database = await connectDB();
  const collection = database.collection('event_queue');
  
  const updates = { status };
  
  // ถ้าเป็น PROCESSING หรือ COMPLETED ให้ใส่ processed_at
  if (status === QueueStatus.PROCESSING || status === QueueStatus.COMPLETED) {
    updates.processed_at = new Date();
  }
  
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  );
  
  if (result.matchedCount === 0) {
    return null;
  }
  
  return await getEventQueueById(id);
};

/**
 * UPDATE - อัพเดทคิว (ทั่วไป)
 */
const updateEventQueue = async (id, updateData) => {
  const database = await connectDB();
  const collection = database.collection('event_queue');
  
  const updates = { ...updateData };
  
  // แปลงค่าตัวเลข
  if (updates.amount !== undefined) updates.amount = parseFloat(updates.amount);
  if (updates.delay !== undefined) updates.delay = parseInt(updates.delay);
  
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  );
  
  if (result.matchedCount === 0) {
    return null;
  }
  
  return await getEventQueueById(id);
};

/**
 * DELETE - ลบคิว
 */
const deleteEventQueue = async (id) => {
  const database = await connectDB();
  const collection = database.collection('event_queue');
  
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  
  return result.deletedCount > 0;
};

/**
 * DELETE - ลบคิวที่เสร็จแล้วหรือล้มเหลว
 */
const cleanupCompletedQueues = async (olderThanDays = 7) => {
  const database = await connectDB();
  const collection = database.collection('event_queue');
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
  
  const result = await collection.deleteMany({
    status: { $in: [QueueStatus.COMPLETED, QueueStatus.FAILED] },
    created_at: { $lt: cutoffDate },
  });
  
  return result.deletedCount;
};

/**
 * PROCESS - ดึงคิวถัดไปที่พร้อมทำงาน
 */
const getNextQueueToProcess = async (game_id = null) => {
  const database = await connectDB();
  const collection = database.collection('event_queue');
  
  const query = { status: QueueStatus.PENDING };
  if (game_id) query.game_id = game_id;
  
  // ใช้ findOneAndUpdate เพื่อป้องกันการดึงซ้ำ (atomic operation)
  const result = await collection.findOneAndUpdate(
    query,
    { 
      $set: { 
        status: QueueStatus.PROCESSING,
        processed_at: new Date(),
      } 
    },
    { 
      sort: { created_at: 1 },  // เก่าสุดก่อน
      returnDocument: 'after',
    }
  );
  
  return result;
};

/**
 * STATS - สถิติคิว
 */
const getQueueStats = async (game_id = null) => {
  const database = await connectDB();
  const collection = database.collection('event_queue');
  
  const match = game_id ? { game_id } : {};
  
  const stats = await collection.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]).toArray();
  
  const result = {
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  };
  
  stats.forEach(stat => {
    result.total += stat.count;
    result[stat._id.toLowerCase()] = stat.count;
  });
  
  return result;
};

module.exports = {
  QueueStatus,
  connectDB,
  createEventQueue,
  createBulkEventQueue,
  getAllEventQueues,
  getEventQueueById,
  getPendingQueues,
  updateQueueStatus,
  updateEventQueue,
  deleteEventQueue,
  cleanupCompletedQueues,
  getNextQueueToProcess,
  getQueueStats,
};
