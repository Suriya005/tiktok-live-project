import axios from 'axios';

const TIKTOK_API_URL = import.meta.env.VITE_TIKTOK_API_URL || 'http://localhost:3344';

const tiktokAPI = axios.create({
  baseURL: TIKTOK_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== TikTok Connection APIs =====

export const connectToTikTok = async (username) => {
    console.log(tiktokAPI)
  const response = await tiktokAPI.post('/connect', { username });
  return response.data;
};

export const disconnectFromTikTok = async () => {
  const response = await tiktokAPI.post('/disconnect');
  return response.data;
};

export const getTikTokStatus = async () => {
  const response = await tiktokAPI.get('/status');
  return response.data;
};

export const getTikTokHealth = async () => {
  const response = await tiktokAPI.get('/');
  return response.data;
};

export default tiktokAPI;
