// Real TikTok Live Connection Service
const { WebcastPushConnection } = require('tiktok-live-connector');
const QuizService = require('./QuizService');

let tiktokConnection = null;
let liveConnection = null;
let io = null;

class TiktokService {
  static initialize(socketIo) {
    io = socketIo;
  }

  static async connectToLive(username) {
    try {
      console.log(`🔴 Connecting to TikTok Live: @${username}...`);
      
      // Create connection to TikTok live
      liveConnection = new WebcastPushConnection(username);

      // Handle connect
      liveConnection.on('connect', () => {
        console.log(`✅ Connected to TikTok Live: @${username}`);
        tiktokConnection = { isConnected: true, username };
        
        if (io) {
          io.emit('tiktok-connected', { 
            status: 'connected', 
            username,
            timestamp: new Date() 
          });
        }
      });

      // Handle disconnect
      liveConnection.on('disconnect', () => {
        console.log(`❌ Disconnected from TikTok Live: @${username}`);
        tiktokConnection = { isConnected: false, username };
        
        if (io) {
          io.emit('tiktok-disconnected', { username });
        }
      });

      // Handle error
      liveConnection.on('error', (error) => {
        console.error(`❌ TikTok Live Error: ${JSON.stringify(error)}`);
        
        if (io) {
          io.emit('tiktok-error', { error: error.message });
        }
      });

      // Handle chat messages
      liveConnection.on('chat', (data) => {
        this.handleChatMessage(data);
      });

      // Handle gifts
      liveConnection.on('gift', (data) => {
        // console.log('DEBUG: gift event triggered with data:', JSON.stringify(data, null, 2));
        this.handleGift(data);
      });

      // Also try alternative event names
      liveConnection.on('GiftMessage', (data) => {
        // console.log('DEBUG: GiftMessage event triggered with data:', JSON.stringify(data, null, 2));
        this.handleGift(data);
      });

      liveConnection.on('giftMessage', (data) => {
        // console.log('DEBUG: giftMessage event triggered with data:', JSON.stringify(data, null, 2));
        this.handleGift(data);
      });

      // Handle follows
      liveConnection.on('follow', (data) => {
        this.handleFollow(data);
      });

      // Handle likes
      // liveConnection.on('like', (data) => {
      //   console.log(`👍 Like from @${data.uniqueId}: +${data.likeCount} likes`);
      // });

      // Connect to live
      await liveConnection.connect();

      return { success: true, message: `Connected to @${username} TikTok Live` };
    } catch (error) {
      console.error('❌ TikTok Connection Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  static handleChatMessage(event) {
    const chatData = {
      tiktokId: event.uniqueId,
      nickname: event.nickname || event.uniqueId,
      message: event.comment,
      timestamp: new Date()
    };

    // console.log(`💬 Chat from @${chatData.nickname}: ${chatData.message}`);

    if (io) {
      io.emit('user-chat', chatData);
    }

    // Check if this message is an answer to current question
    this.checkChatAnswer(chatData.tiktokId, chatData.nickname, chatData.message);
  }

  static async checkChatAnswer(tiktokId, nickname, message) {
    try {
      const QuizService = require('./QuizService');
      const result = await QuizService.processAnswer(tiktokId, nickname, message.trim());

      if (result.success && result.correct) {
        console.log(`✅ CORRECT! @${nickname} answered correctly! +${result.points} points`);
        // QuizService จะ emit answer-correct event อยู่แล้ว
      } else if (result.success && !result.correct) {
        console.log(`❌ Wrong answer from @${nickname}`);
      }
    } catch (error) {
      // Silently fail - this might not be in a quiz context
    }
  }

  static async handleGift(event) {
    try {
      // console.log('DEBUG: handleGift called with full event object:');
      // console.log(JSON.stringify({
      //   giftId: event.giftId,
      //   giftName: event.giftName,
      //   diamondCount: event.diamondCount,
      //   uniqueId: event.uniqueId,
      //   nickname: event.nickname,
      //   repeatCount: event.repeatCount
      // }, null, 2));
      
      const GiftLog = require('../models/GiftLog');
      const PointsLog = require('../models/PointsLog');

      // Check if gift has required fields (use diamondCount instead of coinValue)
      if (!event.giftId || event.diamondCount === undefined) {
        console.log('DEBUG: Missing giftId or diamondCount, skipping. giftId:', event.giftId, 'diamondCount:', event.diamondCount);
        return;
      }

      const giftData = {
        tiktokId: event.uniqueId,
        nickname: event.nickname || event.uniqueId,
        giftId: event.giftId,
        giftName: event.giftName || `Gift ${event.giftId}`,
        count: event.repeatCount || 1,
        coinValue: event.diamondCount || 1, // Use diamondCount as coin value
        timestamp: new Date()
      };

      const totalCoinsFromGift = giftData.count * giftData.coinValue;

      // Log gift to console
      // console.log(`🎁 Gift Received: @${giftData.nickname} sent ${giftData.count}x ${giftData.giftName} (${totalCoinsFromGift} diamonds)`);

      // Log gift to database
      await GiftLog.logGift(
        giftData.tiktokId,
        giftData.nickname,
        giftData.giftId,
        giftData.giftName,
        giftData.count,
        giftData.coinValue
      );

      // Add points for sending gift (1 coin = 1 point)
      const sessionId = QuizService.getSessionId();
      await PointsLog.addPoints(
        giftData.tiktokId,
        giftData.nickname,
        totalCoinsFromGift,
        'gift',
        sessionId
      );
      // console.log(`⭐ Added ${totalCoinsFromGift} points to @${giftData.nickname} for sending gift`);

      // Get updated coin total for this user
      const coinStats = await GiftLog.getTotalCoins(giftData.tiktokId);

      // console.log(`💰 Total coins for @${giftData.nickname}: ${coinStats.totalCoins}`);

      if (io) {
        io.emit('user-gift', {
          ...giftData,
          totalCoins: coinStats.totalCoins
        });
      }
    } catch (error) {
      console.error('❌ Gift handling error:', error.message);
    }
  }

  static handleFollow(event) {
    const followData = {
      tiktokId: event.uniqueId,
      nickname: event.nickname || event.uniqueId,
      timestamp: new Date()
    };

    if (io) {
      io.emit('user-follow', followData);
    }
  }

  static disconnect() {
    if (liveConnection) {
      try {
        liveConnection.disconnect();
        console.log('🔌 TikTok Live connection closed');
      } catch (error) {
        console.error('Error disconnecting:', error.message);
      }
      liveConnection = null;
    }
    tiktokConnection = null;
  }

  static isConnected() {
    return tiktokConnection?.isConnected || false;
  }
}

module.exports = TiktokService;
