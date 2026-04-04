const { WebcastPushConnection } = require('tiktok-live-connector');
const fs = require('fs');

// !!! แก้ตรงนี้เป็นชื่อช่องคนไทยที่กำลัง Live อยู่ !!!
// ไม่ต้องใส่ @ ข้างหน้า
const thaiStreamerId = "thack28"; 

console.log(`⏳ กำลังเชื่อมต่อกับห้อง Live ของ: ${thaiStreamerId}...`);

// สร้างการเชื่อมต่อ
let tiktokLiveConnection = new WebcastPushConnection(thaiStreamerId);

// เก็บรายการของขวัญที่พบ
const giftMap = new Map();
let giftCount = 0;

// รับ gift events
tiktokLiveConnection.on('gift', (data) => {
    const giftId = data.giftId;
    
    // ถ้ายังไม่มีใน map ให้เก็บไว้
    if (!giftMap.has(giftId)) {
        const giftData = {
            id: data.giftId || 0,
            name: data.giftName || 'Unknown',
            diamond_cost: data.diamondCount || 0,
            image_url: data.giftPictureUrl || '',
            type: data.giftType || 0,
            combo: data.repeatEnd ? false : true,
            repeat_count: data.repeatCount || 1
        };
        
        giftMap.set(giftId, giftData);
        giftCount++;
        
        console.log(`📦 พบของขวัญ #${giftCount}: ${giftData.name} (ID: ${giftId}, ${giftData.diamond_cost} coins)`);
    }
});

// เริ่มเชื่อมต่อ
tiktokLiveConnection.connect().then(state => {
    console.info(`✅ เชื่อมต่อสำเร็จ! Room ID: ${state.roomId}`);
    console.info("⏳ กำลังรอรับของขวัญจาก Live... (กด Ctrl+C เพื่อหยุดและบันทึกข้อมูล)");
    console.info("💡 คนดู Live ต้องส่งของขวัญเพื่อให้เราดึงข้อมูลได้");
    console.log(`---------------------------------------------------`);
    
    // บันทึกข้อมูลทุก 30 วินาที
    setInterval(() => {
        if (giftMap.size > 0) {
            saveGifts();
        }
    }, 30000);

}).catch(err => {
    console.error('❌ เชื่อมต่อล้มเหลว (ช่องนี้อาจจะไม่ได้ Live อยู่ หรือ IP โดนบล็อกชั่วคราว):', err);
    process.exit(1);
});

// ฟังก์ชันบันทึกข้อมูล
function saveGifts() {
    const cleanData = Array.from(giftMap.values()).filter(gift => gift.id > 0);
    const fileName = 'tiktok_gifts_th.json';
    
    fs.writeFileSync(fileName, JSON.stringify(cleanData, null, 2));
    
    console.log(`💾 บันทึกอัตโนมัติ: ${cleanData.length} ชิ้น`);
}

// บันทึกเมื่อกด Ctrl+C
process.on('SIGINT', () => {
    console.log('\n---------------------------------------------------');
    console.log(`🎉 หยุดการทำงาน! ได้ของขวัญทั้งหมด ${giftMap.size} ชนิด`);
    
    if (giftMap.size > 0) {
        saveGifts();
        const fileName = 'tiktok_gifts_th.json';
        console.log(`💾 บันทึกไฟล์เรียบร้อยที่: ${fileName}`);
    }
    
    console.log(`---------------------------------------------------`);
    process.exit(0);
});