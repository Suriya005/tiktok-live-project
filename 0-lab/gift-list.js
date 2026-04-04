const { WebcastPushConnection } = require('tiktok-live-connector');
const fs = require('fs');

// !!! แก้ตรงนี้เป็นชื่อช่องคนไทยที่กำลัง Live อยู่ !!!
// ไม่ต้องใส่ @ ข้างหน้า
const thaiStreamerId = "swanlake011"; 

console.log(`⏳ กำลังเชื่อมต่อกับห้อง Live ของ: ${thaiStreamerId}...`);

// สร้างการเชื่อมต่อ
let tiktokLiveConnection = new WebcastPushConnection(thaiStreamerId);

// เริ่มเชื่อมต่อ
tiktokLiveConnection.connect().then(state => {
    console.info(`✅ เชื่อมต่อสำเร็จ! Room ID: ${state.roomId}`);
    console.info("⏳ กำลังดึงรายการของขวัญ (Gifts)...");

    // ดึงรายการของขวัญที่มีในห้องนี้
    tiktokLiveConnection.getAvailableGifts().then(giftList => {
        
        // แปลงข้อมูลให้อ่านง่ายและเก็บเฉพาะที่จำเป็น
        const cleanData = giftList.map(gift => {
            return {
                id: gift.id || 0,                // Gift ID
                name: gift.name || 'Unknown',    // ชื่อของขวัญ
                diamond_cost: gift.diamond_count || gift.coins || 0, // ราคา (coin)
                image_url: gift.image?.url_list?.[0] || gift.icon?.url_list?.[0] || '', // รูปภาพ (Link)
                
                // ข้อมูลเพิ่มเติม (เผื่อใช้)
                type: gift.type || 0, 
                combo: gift.combo || false
            };
        }).filter(gift => gift.id > 0); // กรองเฉพาะของขวัญที่มี ID ถูกต้อง

        // บันทึกลงไฟล์ JSON
        const fileName = 'tiktok_gifts_th.json';
        fs.writeFileSync(fileName, JSON.stringify(cleanData, null, 2));

        console.log(`---------------------------------------------------`);
        console.log(`🎉 ดึงข้อมูลเสร็จสิ้น! ได้ของขวัญทั้งหมด ${cleanData.length} ชิ้น`);
        console.log(`💾 บันทึกไฟล์เรียบร้อยที่: ${fileName}`);
        console.log(`---------------------------------------------------`);
        
        // จบการทำงาน
        process.exit(0);

    }).catch(err => {
        console.error("❌ ไม่สามารถดึงรายการของขวัญได้:", err);
        process.exit(1);
    });

}).catch(err => {
    console.error('❌ เชื่อมต่อล้มเหลว (ช่องนี้อาจจะไม่ได้ Live อยู่ หรือ IP โดนบล็อกชั่วคราว):', err);
    process.exit(1);
});