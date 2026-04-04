const GameEvent = require('../models/GameEvent');
const { AppError } = require('../middleware/errorHandler');

/**
 * CREATE - สร้าง game event ใหม่
 */
exports.createEvent = async (req, res) => {
  const { game_id, event_name, default_delay, is_active, multi_spawn, is_animation, point_amount } = req.body;
  
  // ตรวจสอบว่ามี event_name ซ้ำในเกมเดียวกันไหม
  const existing = await GameEvent.getGameEventByName(game_id, event_name);
  if (existing) {
    throw new AppError('Event name already exists for this game', 400, 'DUPLICATE_EVENT');
  }
  
  const newEvent = await GameEvent.createGameEvent({
    game_id,
    event_name,
    default_delay,
    point_amount,
    is_active,
    multi_spawn,
    is_animation,
  });
  
  res.status(201).json({
    success: true,
    message: 'Game event created successfully',
    data: newEvent,
  });
};

/**
 * READ - ดึง game events ทั้งหมด
 */
exports.getAllEvents = async (req, res) => {
  const { game_id, is_active } = req.query;
  
  const events = await GameEvent.getAllGameEvents({ game_id, is_active });
  
  res.json({
    success: true,
    count: events.length,
    data: events,
  });
};

/**
 * READ - ดึง game event ตาม ID
 */
exports.getEventById = async (req, res) => {
  const { id } = req.params;
  
  const event = await GameEvent.getGameEventById(id);
  
  if (!event) {
    throw new AppError('Game event not found', 404, 'EVENT_NOT_FOUND');
  }
  
  res.json({
    success: true,
    data: event,
  });
};

/**
 * UPDATE - อัพเดท game event
 */
exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  const updatedEvent = await GameEvent.updateGameEvent(id, updateData);
  
  if (!updatedEvent) {
    throw new AppError('Game event not found', 404, 'EVENT_NOT_FOUND');
  }
  
  res.json({
    success: true,
    message: 'Game event updated successfully',
    data: updatedEvent,
  });
};

/**
 * DELETE - ลบ game event
 */
exports.deleteEvent = async (req, res) => {
  const { id } = req.params;
  
  const deleted = await GameEvent.deleteGameEvent(id);
  
  if (!deleted) {
    throw new AppError('Game event not found', 404, 'EVENT_NOT_FOUND');
  }
  
  res.json({
    success: true,
    message: 'Game event deleted successfully',
  });
};

/**
 * TOGGLE - เปิด/ปิด game event
 */
exports.toggleEvent = async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  
  if (typeof is_active !== 'boolean') {
    throw new AppError('is_active must be a boolean', 400, 'INVALID_INPUT');
  }
  
  const updatedEvent = await GameEvent.toggleGameEvent(id, is_active);
  
  if (!updatedEvent) {
    throw new AppError('Game event not found', 404, 'EVENT_NOT_FOUND');
  }
  
  res.json({
    success: true,
    message: `Game event ${is_active ? 'activated' : 'deactivated'} successfully`,
    data: updatedEvent,
  });
};
