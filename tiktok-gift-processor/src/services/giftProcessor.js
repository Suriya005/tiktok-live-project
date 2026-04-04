const { findEventMapping } = require('../models/GiftMapping');
const { sendEventToQueue } = require('./queueService');

/**
 * ประมวลผลของขวัญจาก TikTok Live
 */
const processGift = async (giftData) => {
    const { giftId, giftName, userId, username, repeatCount, diamondCount } = giftData;

    console.log(`🎁 Gift received: ${giftName} x${repeatCount} giftId ${giftId} from @${username}`);

    // หา event จาก game_events collection
    const event = await findEventMapping(giftId, giftName, repeatCount);

    if (!event) {
        console.log(`⚠️ No mapping found for gift: ${giftName} (${giftId})`);
        return null;
    }

    console.log(`🔄 Mapping to event: ${event.event_name} (multi_spawn: ${event.multi_spawn})`);

    try {
        // ถ้า multi_spawn = false และส่งมาหลายชิ้น ให้แยกส่งทีละ 1
        if (event.multi_spawn === false && repeatCount > 1) {
            for (let i = 0; i < repeatCount; i++) {
                const eventData = {
                    userId: userId || username,
                    event_name: event.event_name,
                    amount: event.point_amount || 0,
                    delay: event.default_delay || 1,
                    quantity: 1,
                    giftName: giftName,
                    giftId: giftId,
                    diamondCount: diamondCount,
                };
                await sendEventToQueue(eventData);
                console.log(`✅ Event created (${i + 1}/${repeatCount}): ${event.event_name} (${event.point_amount} points)`);
            }
            return { success: true, count: repeatCount };
        } 
        // ถ้า multi_spawn = true หรือส่งมาแค่ 1 ชิ้น ให้ส่งรวมกัน
        else {
            const totalPoints = event.point_amount * repeatCount;
            const eventData = {
                userId: userId || username,
                event_name: event.event_name,
                amount: totalPoints || 0,
                delay: event.default_delay || 1,
                quantity: repeatCount,
                giftName: giftName,
                giftId: giftId,
                diamondCount: diamondCount,
            };
            await sendEventToQueue(eventData);
            console.log(`✅ Event created: ${event.event_name} (${totalPoints} points, quantity: ${repeatCount})`);
            return eventData;
        }
    } catch (error) {
        console.error('❌ Failed to process gift:', error.message);
        return null;
    }
}

module.exports = {
    processGift,
};
