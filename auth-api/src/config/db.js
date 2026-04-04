const { MongoClient } = require('mongodb');
const config = require('./config');

// Global MongoDB client and database instance
let client = null;
let db = null;

/**
 * Connect to MongoDB using native driver
 */
const connectDB = async () => {
  try {
    // Create MongoDB client
    client = new MongoClient(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    // Connect to MongoDB
    await client.connect();

    // Get database name from connection string or use default
    const dbName = new URL(config.mongodbUri).pathname.slice(1) || 'tiktok_auth';
    db = client.db(dbName);

    console.log(`MongoDB Connected: ${client.options.hosts[0]}`);
    console.log(`Database: ${dbName}`);

    // Create indexes for users collection
    await createIndexes();

    // Handle process termination
    process.on('SIGINT', async () => {
      await disconnectDB();
      process.exit(0);
    });

    return { client, db };
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Create database indexes
 */
const createIndexes = async () => {
  try {
    const usersCollection = db.collection('users');
    
    // Create unique index on email
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    
    // Create index on refreshTokens.expiresAt for cleanup
    await usersCollection.createIndex({ 'refreshTokens.expiresAt': 1 });
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error.message);
  }
};

/**
 * Disconnect from MongoDB
 */
const disconnectDB = async () => {
  try {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  } catch (error) {
    console.error(`Error disconnecting from MongoDB: ${error.message}`);
  }
};

/**
 * Get database instance
 */
const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

/**
 * Get MongoDB client
 */
const getClient = () => {
  if (!client) {
    throw new Error('MongoDB client not initialized. Call connectDB first.');
  }
  return client;
};

module.exports = { 
  connectDB, 
  disconnectDB, 
  getDB,
  getClient 
};
