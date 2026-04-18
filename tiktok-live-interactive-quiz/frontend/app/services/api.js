import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000
});

// Questions
export const getQuestions = async (filters = {}) => {
  // Send filters as POST body
  const payload = {
    search: filters.search || '',
    category: filters.category || [],
    tags: filters.tags || [],
    difficulty: filters.difficulty || null,
    page: filters.page || 1,
    limit: filters.limit || 20
  };
  
  const response = await api.post('/questions/search', payload);
  return response.data;
};

export const getRandomQuestion = async (filters = {}) => {
  // Get random question matching filters
  const payload = {
    search: filters.search || '',
    category: filters.category || [],
    tags: filters.tags || [],
    difficulty: filters.difficulty || null
  };
  
  const response = await api.post('/questions/random', payload);
  return response.data;
};

export const getQuestion = async (id) => {
  const response = await api.get(`/questions/${id}`);
  return response.data;
};

export const createQuestion = async (data) => {
  const response = await api.post('/questions', data);
  return response.data;
};

export const updateQuestion = async (id, data) => {
  const response = await api.put(`/questions/${id}`, data);
  return response.data;
};

export const deleteQuestion = async (id) => {
  const response = await api.delete(`/questions/${id}`);
  return response.data;
};

export const getQuestionsByCategory = async (category) => {
  const response = await api.get(`/questions/category/${category}`);
  return response.data;
};

export const getQuestionsByTags = async (tags) => {
  const tagArray = Array.isArray(tags) ? tags : [tags];
  const response = await api.get('/questions/by-tags', { 
    params: { tags: tagArray }
  });
  return response.data;
};

export const getQuestionStats = async () => {
  const response = await api.get('/questions/stats');
  return response.data;
};

// Leaderboard
export const getLeaderboard = async (timeFilter = 'all-time', sessionId = null) => {
  const params = { timeFilter };
  if (sessionId) params.sessionId = sessionId;
  const response = await api.get('/leaderboard', { params });
  return response.data;
};

// User Stats
export const getUserStats = async (tiktokId, timeFilter = 'all-time') => {
  const response = await api.get(`/leaderboard/stats/${tiktokId}`, {
    params: { timeFilter },
  });
  return response.data;
};

// Quiz Control
export const startQuestion = async (questionId) => {
  const response = await api.post('/quiz/start', { questionId });
  return response.data;
};

export const submitAnswer = async (tiktokId, nickname, answer) => {
  const response = await api.post('/quiz/answer', { 
    tiktokId, 
    nickname, 
    answer 
  });
  return response.data;
};

export const skipQuestion = async () => {
  const response = await api.post('/quiz/skip');
  return response.data;
};

export const checkHint = async () => {
  const response = await api.get('/quiz/hint');
  return response.data;
};

// Filter Options
export const getFilterOptions = async () => {
  const response = await api.get('/questions/filter-options');
  return response.data;
};

// Participants
export const getParticipants = async (sessionId) => {
  const response = await api.get('/leaderboard/participants', { params: { sessionId } });
  return response.data;
};

// Set Winner Manually
export const setWinnerManually = async (tiktokId, nickname, sessionId) => {
  const response = await api.post('/quiz/set-winner', {
    tiktokId,
    nickname,
    sessionId
  });
  return response.data;
};

export default api;
