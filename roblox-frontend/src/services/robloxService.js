import axios from 'axios';

const ROBLOX_API_URL = import.meta.env.VITE_ROBLOX_API_URL || 'http://localhost:4000/api/v1';
const ROBLOX_API_KEY = import.meta.env.VITE_ROBLOX_API_KEY;

// สร้าง axios instance
const robloxAPI = axios.create({
  baseURL: ROBLOX_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': ROBLOX_API_KEY,
  },
});

// ===== Game Events APIs =====

export const getAllGameEvents = async (filters = {}) => {
  const response = await robloxAPI.get('/game-events', { params: filters });
  return response.data;
};

export const getGameEventById = async (id) => {
  const response = await robloxAPI.get(`/game-events/${id}`);
  return response.data;
};

export const createGameEvent = async (eventData) => {
  const response = await robloxAPI.post('/game-events', eventData);
  return response.data;
};

export const updateGameEvent = async (id, eventData) => {
  const response = await robloxAPI.put(`/game-events/${id}`, eventData);
  return response.data;
};

export const deleteGameEvent = async (id) => {
  const response = await robloxAPI.delete(`/game-events/${id}`);
  return response.data;
};

export const toggleGameEvent = async (id, is_active) => {
  const response = await robloxAPI.patch(`/game-events/${id}/toggle`, { is_active });
  return response.data;
};

// ===== Event Queue APIs =====

export const getAllEventQueues = async (filters = {}) => {
  const response = await robloxAPI.get('/event-queue', { params: filters });
  return response.data;
};

export const getEventQueueById = async (id) => {
  const response = await robloxAPI.get(`/event-queue/${id}`);
  return response.data;
};

export const createEventQueue = async (queueData) => {
  const response = await robloxAPI.post('/event-queue', queueData);
  return response.data;
};

export const createBulkEventQueue = async (queues) => {
  const response = await robloxAPI.post('/event-queue/bulk', { queues });
  return response.data;
};

export const updateQueueStatus = async (id, status) => {
  const response = await robloxAPI.patch(`/event-queue/${id}/status`, { status });
  return response.data;
};

export const getQueueStats = async (game_id) => {
  const response = await robloxAPI.get('/event-queue/stats', { params: { game_id } });
  return response.data;
};

export const getPendingQueues = async (game_id, limit = 100) => {
  const response = await robloxAPI.get('/event-queue/pending', { params: { game_id, limit } });
  return response.data;
};

export default robloxAPI;
