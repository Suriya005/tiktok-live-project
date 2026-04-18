const { WebcastPushConnection } = require('tiktok-live-connector');
const quizService = require('../modules/quiz/quiz.service');
const quizRepository = require('../modules/quiz/quiz.repository');
const logger = require('../utils/logger');

let io = null;
let liveConnection = null;
let connectionStatus = { isConnected: false, username: null };

const initialize = (socketIo) => {
  io = socketIo;
};

const connectToLive = async (username) => {
  try {
    logger.info('[TikTok] Connecting to live', { username });

    liveConnection = new WebcastPushConnection(username);

    liveConnection.on('connect', () => {
      connectionStatus = { isConnected: true, username };
      logger.info('[TikTok] Connected', { username });
      if (io) io.emit('tiktok-connected', { status: 'connected', username, timestamp: new Date() });
    });

    liveConnection.on('disconnect', () => {
      connectionStatus = { isConnected: false, username };
      logger.info('[TikTok] Disconnected', { username });
      if (io) io.emit('tiktok-disconnected', { username, timestamp: new Date() });
    });

    liveConnection.on('error', (error) => {
      logger.error('[TikTok] Connection error', { err: error.message });
      if (io) io.emit('tiktok-error', { error: error.message });
    });

    liveConnection.on('chat', (data) => handleChatMessage(data));
    liveConnection.on('gift', (data) => handleGift(data));
    liveConnection.on('GiftMessage', (data) => handleGift(data));
    liveConnection.on('giftMessage', (data) => handleGift(data));
    liveConnection.on('follow', (data) => handleFollow(data));

    await liveConnection.connect();

    return { success: true, message: `Connected to @${username} TikTok Live` };
  } catch (err) {
    logger.error('[TikTok] connectToLive failed', { err: err.message });
    return { success: false, error: err.message };
  }
};

const handleChatMessage = (event) => {
  const chatData = {
    tiktokId: event.uniqueId,
    nickname: event.nickname || event.uniqueId,
    message: event.comment,
    timestamp: new Date(),
  };

  if (io) io.emit('user-chat', chatData);

  checkChatAnswer(chatData.tiktokId, chatData.nickname, chatData.message);
};

const checkChatAnswer = async (tiktokId, nickname, message) => {
  try {
    const result = await quizService.processAnswer(tiktokId, nickname, message.trim());
    if (result.success && result.correct) {
      logger.info('[TikTok] Correct answer via chat', { nickname, points: result.points });
    }
  } catch (err) {
    // Silently ignore — message may not be a quiz answer
  }
};

const handleGift = async (event) => {
  try {
    if (!event.giftId || event.diamondCount === undefined) return;

    const giftData = {
      tiktokId: event.uniqueId,
      nickname: event.nickname || event.uniqueId,
      giftId: event.giftId,
      giftName: event.giftName || `Gift ${event.giftId}`,
      count: event.repeatCount || 1,
      coinValue: event.diamondCount || 1,
    };

    const totalCoinsFromGift = giftData.count * giftData.coinValue;

    await quizRepository.logGift(
      giftData.tiktokId,
      giftData.nickname,
      giftData.giftId,
      giftData.giftName,
      giftData.count,
      giftData.coinValue,
    );

    await quizRepository.addPoints(
      giftData.tiktokId,
      giftData.nickname,
      totalCoinsFromGift,
      'gift',
      quizService.getSessionId(),
    );

    const coinStats = await quizRepository.getTotalCoins(giftData.tiktokId);

    if (io) {
      io.emit('user-gift', { ...giftData, totalCoins: coinStats.totalCoins });
    }
  } catch (err) {
    logger.error('[TikTok] handleGift failed', { err: err.message });
  }
};

const handleFollow = (event) => {
  const followData = {
    tiktokId: event.uniqueId,
    nickname: event.nickname || event.uniqueId,
    timestamp: new Date(),
  };
  if (io) io.emit('user-follow', followData);
};

const disconnect = () => {
  if (liveConnection) {
    try {
      liveConnection.disconnect();
      logger.info('[TikTok] Connection closed');
    } catch (err) {
      logger.error('[TikTok] disconnect error', { err: err.message });
    }
    liveConnection = null;
  }
  connectionStatus = { isConnected: false, username: null };
};

const isConnected = () => connectionStatus.isConnected;

const getStatus = () => ({ ...connectionStatus });

module.exports = { initialize, connectToLive, disconnect, isConnected, getStatus };
