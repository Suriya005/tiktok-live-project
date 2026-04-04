const { WebcastPushConnection } = require('tiktok-live-connector');
const config = require('../config/config');
const { processGift } = require('./giftProcessor');

let tiktokConnection = null;
let isConnected = false;

/**
 * เชื่อมต่อกับ TikTok Live
 */
const connectToTikTokLive = async (username) => {
  let tiktokUsername = username || config.tiktok.username;
  
  // ลบ @ ออกถ้ามี
  if (tiktokUsername && tiktokUsername.startsWith('@')) {
    tiktokUsername = tiktokUsername.substring(1);
  }

  console.log(`🔌 Connecting to TikTok Live: ${tiktokUsername}`);

  const connectionOptions = {
    processInitialData: false,
    enableExtendedGiftInfo: true,
    requestPollingIntervalMs: 1000,
  };

  // เพิ่ม sessionId ถ้ามี (ช่วยลด rate limit)
  if (config.tiktok.sessionId) {
    connectionOptions.sessionId = config.tiktok.sessionId;
    console.log('🔑 Using sessionId for authentication');
  }

  tiktokConnection = new WebcastPushConnection(tiktokUsername, connectionOptions);

  // Event: Connected
  tiktokConnection.on('connected', (state) => {
    console.log('✅ Connected to TikTok Live!');
    isConnected = true;
  });

  // Event: Disconnected
  tiktokConnection.on('disconnected', () => {
    console.log('❌ Disconnected from TikTok Live');
    isConnected = false;
  });

  // Event: Gift received
  tiktokConnection.on('gift', async (data) => {
    const giftData = {
      giftId: data.giftId,
      giftName: data.giftName,
      userId: data.userId,
      username: data.uniqueId,
      repeatCount: data.repeatCount,
      diamondCount: data.diamondCount,
    };

    await processGift(giftData);
  });

  // Event: Like
  tiktokConnection.on('like', (data) => {
    console.log(`👍 ${data.uniqueId} liked (total: ${data.likeCount})`);
  });

  // Event: Share
  tiktokConnection.on('share', (data) => {
    console.log(`📤 ${data.uniqueId} shared the live`);
  });

  // Event: Comment
  tiktokConnection.on('chat', (data) => {
    console.log(`💬 ${data.uniqueId}: ${data.comment}`);
  });

  // Event: Error
  tiktokConnection.on('error', (err) => {
    console.error('❌ TikTok connection error:', err);
  });

  // Connect
  try {
    await tiktokConnection.connect();
    console.log('✅ Connection established successfully');
  } catch (error) {
    const errorMsg = error.message || error.toString();
    console.error('❌ Failed to connect:', errorMsg);
    
    // วิเคราะห์ error และแนะนำแก้ไข
    console.log('\n💡 สาเหตุที่เป็นไปได้:');
    
    if (errorMsg.includes('SIGI_STATE') || errorMsg.includes('408') || errorMsg.includes('Sign Error')) {
      console.log('   ❌ TikTok บล็อก IP หรือ username ไม่ได้ Live');
      console.log('\n🔧 วิธีแก้:');
      console.log('   1. ตรวจสอบว่า "' + tiktokUsername + '" กำลัง Live อยู่จริง');
      console.log('   2. เปลี่ยน IP (ใช้ VPN/Proxy)');
      console.log('   3. รอ 5-10 นาที แล้วลองใหม่');
      console.log('   4. ใช้ sessionId (เพิ่มใน .env):');
      console.log('      - เปิด TikTok ในบราวเซอร์');
      console.log('      - F12 > Application > Cookies > sessionid');
      console.log('      - คัดลอกค่า sessionid ใส่ใน .env: TIKTOK_SESSION_ID=xxx\n');
    }
    
    // ส่ง error ที่เรียบง่ายกลับไป
    throw new Error('TikTok Live connection failed - User may not be live or IP blocked');
  }

  return tiktokConnection;
};

/**
 * ตัดการเชื่อมต่อ
 */
const disconnectFromTikTokLive = () => {
  if (tiktokConnection) {
    tiktokConnection.disconnect();
    isConnected = false;
    console.log('🔌 Disconnected from TikTok Live');
  }
};

/**
 * ตรวจสอบสถานะการเชื่อมต่อ
 */
const getConnectionStatus = () => {
  return {
    connected: isConnected,
    username: tiktokConnection?.uniqueId || null,
  };
};

module.exports = {
  connectToTikTokLive,
  disconnectFromTikTokLive,
  getConnectionStatus,
};
