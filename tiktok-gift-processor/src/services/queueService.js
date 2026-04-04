const axios = require('axios');
const config = require('../config/config');

const robloxAPI = axios.create({
  baseURL: config.roblox.apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': config.roblox.apiKey,
  },
});

/**
 * ส่ง event ไปยัง event_queue
 */
const sendEventToQueue = async (eventData) => {
  try {
    const payload = {
      event_name: eventData.event_name,
      amount: eventData.amount,
      delay: eventData.delay,
      quantity: eventData.quantity || 1,
    };

    console.log('📤 Sending to queue:', payload);

    const response = await axios.post(
      'http://localhost:4000/api/v1/event-queue',
      payload,
      {
        headers: {
          'X-API-Key': 'RobloxKey2025',
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('❌ Failed to send event to queue:', error.message);
    console.error('📋 Error details:', error.response?.data);
    throw error;
  }
};



module.exports = {
  sendEventToQueue,
};
