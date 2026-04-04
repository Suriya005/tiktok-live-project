const { connectDB } = require('../config/db');

/**
 * หา event mapping จาก gift โดยดึงจาก game_events collection
 */
const findEventMapping = async (giftId, giftName, amount) => {
    try {
        const db = await connectDB();
        const collection = db.collection('game_events');

        // หา event ที่มี tiktok_gift_id หรือ tiktok_gift_name ตรงกัน
        const event = await collection.findOne({
            $or: [
                { tiktok_gift_id: giftId },
                { tiktok_gift_name: giftName }
            ],
            is_active: true
        });

        if (!event) {
            console.log(`⚠️ No event found for gift: ${giftName} (${giftId})`);
            return null;
        }

        // สร้าง mapping object
        // return {
        //     giftId: giftId,
        //     giftName: giftName,
        //     eventName: event.event_name,
        //     minAmount: 1,
        //     pointsPerGift: event.point_amount || 0,
        //     delay: event.default_delay || 1,
        // };
        return event
    } catch (error) {
        console.error('❌ Error finding event mapping:', error);
        return null;
    }
};

/**
 * ดึง event ทั้งหมดที่มี TikTok gift mapping
 */
const getAllGiftMappings = async () => {
    try {
        const db = await connectDB();
        const collection = db.collection('game_events');
        console.log(`querying gift mappings...`);
        console.log(
            {
                $or: [
                    { tiktok_gift_id: { $exists: true, $ne: null } },
                    { tiktok_gift_name: { $exists: true, $ne: null } }
                ],
                is_active: true
            }
        );
        const events = await collection.find({
            $or: [
                { tiktok_gift_id: { $exists: true, $ne: null } },
                { tiktok_gift_name: { $exists: true, $ne: null } }
            ],
            is_active: true
        }).toArray();
        console.log("events:", events);
        return events.map(event => ({
            giftId: event.tiktok_gift_id,
            giftName: event.tiktok_gift_name,
            eventName: event.event_name,
            pointsPerGift: event.point_amount,
            delay: event.default_delay,
        }));
    } catch (error) {
        console.error('❌ Error getting gift mappings:', error);
        return [];
    }
};

module.exports = {
    findEventMapping,
    getAllGiftMappings,
};
