const EventQueue = require('../models/EventQueue');
const { AppError } = require('../middleware/errorHandler');

/**
 * CREATE - เพิ่มคิวใหม่
 */
exports.createQueue = async (req, res) => {
  console.log('Create Queue Request Body:', req.body);
  const { user_id, game_id, event_name, amount, delay, quantity } = req.body;
  
  const newQueue = await EventQueue.createEventQueue({
    user_id,
    game_id,
    event_name,
    amount,
    delay,
    quantity: quantity || 1,
  });
  
  res.status(201).json({
    success: true,
    message: 'Event queue created successfully',
    data: newQueue,
  });
};

/**
 * CREATE BULK - เพิ่มหลายคิวพร้อมกัน
 */
exports.createBulkQueues = async (req, res) => {
  const { queues } = req.body;
  
  if (!Array.isArray(queues) || queues.length === 0) {
    throw new AppError('queues must be a non-empty array', 400, 'INVALID_INPUT');
  }
  
  const result = await EventQueue.createBulkEventQueue(queues);
  
  res.status(201).json({
    success: true,
    message: `${result.insertedCount} queues created successfully`,
    data: result,
  });
};

/**
 * PROCESS - ดึงคิวล่าสุดมา 1 คิว และ insert ลงถัง event_queue_log และ response data กลับไป และลบที่ถังคิว
 */
exports.getNextQueueToProcess = async (req, res) => {
  const { game_id } = req.query;
  
  try {
    const queue = await EventQueue.getNextQueueToProcess(game_id);
    
    if (!queue) {
      return res.json({
        status: "success",
        message: 'No pending queue available',
        data: null,
      });
    }
    
    // Insert ลง event_queue_log
    const db = await EventQueue.connectDB();
    const logCollection = db.collection('event_queue_log');
    
    await logCollection.insertOne({
      ...queue,
      original_queue_id: queue._id,
      logged_at: new Date(),
    });
    
    // ลบจาก event_queue
    await EventQueue.deleteEventQueue(queue._id.toString());
    
    console.log(`Processed queue ID: ${queue._id} for game_id: ${queue.game_id}`);
    res.json({
      success: true,
      message: 'Queue processed and logged successfully',
      data: queue,
    });
  } catch (error) {
    console.error('Process queue error:', error);
    throw new AppError(error.message || 'Failed to process queue', 500, 'PROCESS_ERROR');
  }
};





