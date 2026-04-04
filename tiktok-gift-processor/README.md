# TikTok Gift Processor

โปรเจคนี้ทำหน้าที่เชื่อมต่อกับ TikTok Live และประมวลผลของขวัญ (gifts) แล้วแปลงเป็น game events ส่งไปยัง event_queue

## Features

- 🎁 รับของขวัญจาก TikTok Live แบบ real-time
- 🎮 แปลงของขวัญเป็น game events ตาม mapping rules
- 📊 ส่ง events ไปยัง MongoDB event_queue
- 🔌 API endpoints สำหรับควบคุมการเชื่อมต่อ
- ⚙️ กำหนด gift mapping rules แบบ flexible

## Installation

```bash
cd tiktok-gift-processor
npm install
```

## Configuration

แก้ไขไฟล์ `.env`:

```env
PORT=3002
TIKTOK_USERNAME=@your_tiktok_username
MONGODB_URI=mongodb://localhost:27017/tiktok_live_auth
ROBLOX_API_URL=http://localhost:4000/api/v1
ROBLOX_API_KEY=RobloxKey2025
GAME_ID=1234
```

## Usage

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

- `GET /` - Health check
- `GET /status` - ตรวจสอบสถานะการเชื่อมต่อ
- `POST /connect` - เชื่อมต่อกับ TikTok Live
- `POST /disconnect` - ตัดการเชื่อมต่อ

## Gift Mapping

แก้ไข `src/models/GiftMapping.js` เพื่อกำหนด mapping rules:

```javascript
{
  giftId: 5655,
  giftName: 'Rose',
  eventName: 'Fireball',
  minAmount: 1,
  pointsPerGift: 10,
  delay: 1,
}
```

## Dependencies

- `tiktok-live-connector` - เชื่อมต่อ TikTok Live
- `mongodb` - Database
- `express` - Web server
- `axios` - HTTP client
- `dotenv` - Environment variables
