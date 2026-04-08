const mongoose = require('mongoose');
const logger = require('../utils/logger');

const DB_OPTIONS = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('[Database] Missing MONGODB_URI in environment config.');

  await mongoose.connect(uri, DB_OPTIONS);
  logger.info('[Database] Connected to MongoDB', { uri });
}

async function closeDatabase() {
  await mongoose.connection.close();
  logger.info('[Database] Connection closed');
}

module.exports = { connectDatabase, closeDatabase };
